@IsTest
private class AgentUIPresentationOrchestratorTest {
    @IsTest static void handlesSimpleConversationWithoutComposition() {
        System.assertEquals('CONVERSATION', String.valueOf(AgentUIPresentationOrchestrator.decide('Hello! How can I help?').mode));
        System.assertEquals('CONVERSATION', String.valueOf(AgentUIPresentationOrchestrator.decide('Thanks for letting me know.').mode));
        System.assertEquals('CONVERSATION', String.valueOf(AgentUIPresentationOrchestrator.decide('I found some plans. Which one would you like?').mode));
        Map<String,Object> result=AgentUIPresentationOrchestrator.present(null,'Hello!');
        System.assertEquals('conversation',result.get('mode'));
        System.assertEquals(null,result.get('ui'));
    }
    @IsTest static void recognizesFieldsOptionsAndEnrichedStatuses() {
        String listResponse='Is the eligibility verification for:\n1. New Mobility Customer\n2. Existing Mobility Customer';
        System.assertEquals('INTERACTIVE',String.valueOf(AgentUIPresentationOrchestrator.decide(listResponse).mode));
        String formResponse='Please provide the Opportunity Name and the Quote Name for this quote.';
        System.assertEquals('INTERACTIVE',String.valueOf(AgentUIPresentationOrchestrator.decide(formResponse).mode));
        System.assertEquals('ENHANCED',String.valueOf(AgentUIPresentationOrchestrator.decide('Credit Check: Approved, Policy Evaluation: Completed successfully.').mode));
        System.assertEquals('ENHANCED',String.valueOf(AgentUIPresentationOrchestrator.decide('eSign Blocked — Duplicate Agreement.').mode));
    }
    @IsTest static void composerDisabledPreservesOriginalTextOnly() {
        AgentUI_Config__mdt configuration = new AgentUI_Config__mdt(Composer_Enabled__c=false);
        Map<String,Object> result=AgentUIPresentationOrchestrator.present(configuration,'Which customer?\n1. New\n2. Existing');
        System.assertEquals('interactive',result.get('mode'));
        System.assertEquals(null,result.get('ui'));
    }
}
