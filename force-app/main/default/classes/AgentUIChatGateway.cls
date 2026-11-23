@RestResource(urlMapping='/agentui/v1/chat')
global with sharing class AgentUIChatGateway {
    @HttpPost
    global static void postMessage() {
        RestResponse response = RestContext.response;
        response.addHeader('Content-Type', 'application/json');
        try {
            if (!FeatureManagement.checkPermission('AgentUI_Use')) {
                response.statusCode = 403;
                response.responseBody = Blob.valueOf('{"error":"Not authorized for AgentUI"}');
                return;
            }
            String rawRequest = RestContext.request.requestBody == null ? '' : RestContext.request.requestBody.toString();
            if (rawRequest.length() > 16000) {
                response.statusCode = 413;
                response.responseBody = Blob.valueOf('{"error":"Payload too large"}');
                return;
            }
            Map<String,Object> requestData = (Map<String,Object>)JSON.deserializeUntyped(rawRequest);
            if (requestData == null) throw new AgentUIException('Invalid request');
            String localSession = (String)requestData.get('sessionId');
            if (String.isBlank(localSession) || localSession.length() > 128) throw new AgentUIException('Invalid sessionId');
            String message = (String)requestData.get('message');
            Object interaction = requestData.get('interaction');
            if (interaction != null) {
                Map<String,Object> event = (Map<String,Object>)interaction;
                Map<String,Object> action = (Map<String,Object>)event.get('action');
                if (action == null || action.get('type') != 'AGENT_TURN') throw new AgentUIException('Invalid interaction');
                String name = (String)action.get('name');
                if (String.isBlank(name) || name.length() > 100) throw new AgentUIException('Invalid action name');
                // Interaction data is treated as untrusted user text, not as a direct Salesforce mutation.
                message = 'User interface submission: ' + JSON.serialize(new Map<String,Object>{
                    'action' => name,
                    'values' => event.get('values')
                });
            }
            if (String.isBlank(message) || message.length() > 12000) throw new AgentUIException('Invalid message');
            AgentUI_Config__mdt config = AgentUI_Config__mdt.getInstance('Default');
            if (config == null || String.isBlank(config.Agent_API_Name__c)) {
                response.statusCode = 503;
                response.responseBody = Blob.valueOf('{"error":"Configure the default AgentUI agent in Custom Metadata first"}');
                return;
            }

            // Server-side session persistence is scoped to the authenticated Salesforce user.
            Id currentUserId = UserInfo.getUserId();
            String sessionKey = EncodingUtil.convertToHex(Crypto.generateDigest('SHA-256', Blob.valueOf(String.valueOf(currentUserId) + ':' + localSession)));
            List<AgentUI_Session__c> existingSessions = [SELECT Id, Agent_Session_Id__c FROM AgentUI_Session__c WHERE Session_Key__c = :sessionKey AND OwnerId = :currentUserId LIMIT 1 FOR UPDATE];
            AgentUI_Session__c savedSession = existingSessions.isEmpty() ? new AgentUI_Session__c(Session_Key__c = sessionKey) : existingSessions[0];

            // Version 1.0.0 uses userMessage and a text agentResponse. Agent API name must be set by an administrator.
            Invocable.Action invocation = Invocable.Action.createCustomAction(
                'generateAiAgentResponse', null, config.Agent_API_Name__c, '1.0.0'
            );
            invocation.setInvocationParameter('userMessage', message);
            // Never accept an Agentforce session identifier from untrusted browser input.
            String agentSession = savedSession.Agent_Session_Id__c;
            if (!String.isBlank(agentSession)) invocation.setInvocationParameter('sessionId', agentSession);
            List<Invocable.Action.Result> results = invocation.invoke();
            if (results.isEmpty() || !results[0].isSuccess()) {
                response.statusCode = 502;
                response.responseBody = Blob.valueOf('{"error":"Agentforce invocation failed"}');
                return;
            }
            Map<String,Object> output = results[0].getOutputParameters();
            String text = extractText(output);
            String newAgentSession = output.containsKey('sessionId') && output.get('sessionId') != null
                ? String.valueOf(output.get('sessionId')) : agentSession;
            // Compose BEFORE DML: an optional composer uses an HTTP callout, which Apex
            // cannot perform after an uncommitted insert/update in the same transaction.
            Map<String,Object> ui = AgentUIComposer.compose(config, text);
            if (!String.isBlank(newAgentSession)) {
                savedSession.Agent_Session_Id__c = newAgentSession;
                upsert savedSession Session_Key__c;
            }
            Map<String,Object> reply = new Map<String,Object>{
                'sessionId' => localSession,
                'message' => new Map<String,Object>{
                    'id' => String.valueOf(Datetime.now().getTime()),
                    'role' => 'assistant',
                    'timestamp' => Datetime.now().getTime(),
                    'text' => text,
                    'ui' => ui
                }
            };
            response.statusCode = 200;
            response.responseBody = Blob.valueOf(JSON.serialize(reply));
        } catch (Exception ex) {
            response.statusCode = 400;
            response.responseBody = Blob.valueOf('{"error":"AgentUI request could not be processed"}');
            System.debug(LoggingLevel.ERROR, ex.getMessage());
        }
    }
    @TestVisible
    private static String extractText(Map<String,Object> output) {
        Object source = output.get('response');
        if (source == null) source = output.get('agentResponse');
        if (source == null) return 'No agent response was returned.';
        if (!(source instanceof String)) return JSON.serialize(source);
        String raw = (String)source;
        try {
            Map<String,Object> parsed = (Map<String,Object>)JSON.deserializeUntyped(raw);
            if (parsed == null) return raw;
            Object value = parsed.get('value');
            if (value instanceof Map<String,Object>) {
                Map<String,Object> detail = (Map<String,Object>)value;
                if (detail.get('message') != null) return String.valueOf(detail.get('message'));
            }
            Object msg = parsed.get('message');
            if (msg instanceof String) return (String)msg;
            if (msg instanceof Map<String,Object>) {
                Map<String,Object> wrapped = (Map<String,Object>)msg;
                if (wrapped.get('value') != null) return String.valueOf(wrapped.get('value'));
            }
        } catch (Exception ignore) { }
        return raw;
    }
    public class AgentUIException extends Exception {}
}
