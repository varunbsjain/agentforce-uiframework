@IsTest
private class AgentUIComposerTest {
    @IsTest static void parsesTextAndRejectsActions() {
        System.assertEquals('Text', AgentUIComposer.textSpec('Hello').get('root') instanceof Map<String,Object> ?
            ((Map<String,Object>)AgentUIComposer.textSpec('Hello').get('root')).get('type') : '');
        Map<String,Object> valid = new Map<String,Object>{
            'version'=>'1.0','type'=>'ui',
            'root'=>new Map<String,Object>{'type'=>'Text','props'=>new Map<String,Object>{'text'=>'Hello'}}
        };
        AgentUIComposer.validate(valid);
        ((Map<String,Object>)valid.get('root')).put('action',new Map<String,Object>{'name'=>'Delete'});
        Boolean rejected = false;
        try { AgentUIComposer.validate(valid); } catch (AgentUIComposer.UIException error) { rejected = true; }
        System.assert(rejected, 'Actions must be rejected from LLM output');
    }
    @IsTest static void extractsAgentResponse() {
        System.assertEquals('Hello', AgentUIChatGateway.extractText(new Map<String,Object>{'response'=>'Hello'}));
        System.assertEquals('Hello', AgentUIChatGateway.extractText(new Map<String,Object>{
            'agentResponse'=>'{"value":{"message":"Hello"}}'
        }));
    }
}
