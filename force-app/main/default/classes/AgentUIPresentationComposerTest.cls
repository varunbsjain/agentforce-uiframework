@IsTest
private class AgentUIPresentationComposerTest {
    private class ComposerMock implements HttpCalloutMock {
        private String jsonBody;
        public ComposerMock(String output) { jsonBody=output; }
        public HTTPResponse respond(HTTPRequest request) {
            System.assertEquals('POST', request.getMethod());
            System.assert(request.getEndpoint().startsWith('callout:AgentUI_Composer'));
            HttpResponse response=new HttpResponse();
            response.setStatusCode(200);
            response.setHeader('Content-Type','application/json');
            response.setBody(JSON.serialize(new Map<String,Object>{
                'choices'=>new List<Object>{new Map<String,Object>{
                    'message'=>new Map<String,Object>{'content'=>jsonBody}
                }}
            }));
            return response;
        }
    }
    @IsTest static void interactiveSelectAndSubmitAccepted() {
        String responseText='Choose customer type:\n1. New Mobility Customer\n2. Existing Mobility Customer';
        Map<String,Object> spec=new Map<String,Object>{
            'version'=>'1.0','type'=>'ui','root'=>new Map<String,Object>{
                'type'=>'Stack','children'=>new List<Object>{
                    new Map<String,Object>{
                        'type'=>'Select','id'=>'customerType','props'=>new Map<String,Object>{
                            'label'=>'Customer type','options'=>new List<Object>{
                                new Map<String,Object>{'label'=>'New Mobility Customer','value'=>'1'},
                                new Map<String,Object>{'label'=>'Existing Mobility Customer','value'=>'2'}
                            }
                        }
                    },
                    new Map<String,Object>{
                        'type'=>'Button','props'=>new Map<String,Object>{'label'=>'Continue'},
                        'action'=>new Map<String,Object>{'type'=>'AGENT_TURN','name'=>'submitResponse',
                            'collect'=>new List<Object>{'customerType'}}
                    }
                }
            }
        };
        AgentUIComposer.validate(spec,'interactive',responseText);
        Test.setMock(HttpCalloutMock.class,new ComposerMock(JSON.serialize(spec)));
        Test.startTest();
        Map<String,Object> actual=AgentUIComposer.compose(
            new AgentUI_Config__mdt(Composer_Enabled__c=true), responseText,'interactive');
        Test.stopTest();
        System.assertNotEquals(null,actual);
    }
    @IsTest static void ungroundedOptionAndArbitraryActionAreRejected() {
        String text='Choose a device:\n1. Apple\n2. Samsung';
        Map<String,Object> bad=new Map<String,Object>{
            'version'=>'1.0','type'=>'ui','root'=>new Map<String,Object>{
                'type'=>'Select','id'=>'device','props'=>new Map<String,Object>{
                    'label'=>'Device','options'=>new List<Object>{
                        new Map<String,Object>{'label'=>'Imaginary Device','value'=>'none'}
                    }
                }
            }
        };
        Boolean rejected=false;
        try {AgentUIComposer.validate(bad,'interactive',text);}
        catch(AgentUIComposer.UIException e){rejected=true;}
        System.assert(rejected);
        Map<String,Object> unsafe=new Map<String,Object>{
            'version'=>'1.0','type'=>'ui','root'=>new Map<String,Object>{
                'type'=>'Button','action'=>new Map<String,Object>{
                    'type'=>'AGENT_TURN','name'=>'deleteRecord','collect'=>new List<Object>{'device'}
                }
            }
        };
        rejected=false;
        try {AgentUIComposer.validate(unsafe,'interactive',text);}
        catch(AgentUIComposer.UIException e){rejected=true;}
        System.assert(rejected);
    }
    @IsTest static void invalidModelOutputFallsBackToOriginalText() {
        Test.setMock(HttpCalloutMock.class,new ComposerMock('{"type":"script","version":"1.0"}'));
        String plain='Status: Approved. Credit and policy checks are complete.';
        Test.startTest();
        Map<String,Object> result=AgentUIComposer.compose(
            new AgentUI_Config__mdt(Composer_Enabled__c=true),plain,'enhanced');
        Test.stopTest();
        System.assertEquals(null,result);
    }
}
