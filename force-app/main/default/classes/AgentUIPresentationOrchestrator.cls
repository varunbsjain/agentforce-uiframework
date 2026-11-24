/**
 * Presentation decisions are deliberately separate from Agentforce business logic.
 * The agent returns text; this class chooses whether an additional UI would help.
 * No classification decision is treated as authorization for a business action.
 */
public with sharing class AgentUIPresentationOrchestrator {
    public enum Mode { CONVERSATION, ENHANCED, INTERACTIVE, DEFER }
    public class Decision {
        public Mode mode;
        public String reason;
        public Decision(Mode selected, String rationale) {
            mode = selected;
            reason = rationale;
        }
    }

    @TestVisible
    private static Boolean anyOf(String text, List<String> markers) {
        for (String token : markers) if (text.contains(token)) return true;
        return false;
    }
    @TestVisible
    private static Boolean containsNumberedOptions(String text) {
        // At least two numbered alternatives, including lines such as "1. Apple".
        return Pattern.compile('(?m)^\\s*1[\\.\\)]\\s+.+$').matcher(text).find()
            && Pattern.compile('(?m)^\\s*2[\\.\\)]\\s+.+$').matcher(text).find();
    }

    public static Decision decide(String original) {
        String raw = String.isBlank(original) ? '' : original.trim();
        String lowered = raw.toLowerCase();
        if (raw == '') return new Decision(Mode.CONVERSATION, 'empty');
        if (raw.length() < 170 && (lowered.startsWith('hello') || lowered.startsWith('hi ')
            || lowered.startsWith('thanks') || lowered.startsWith('thank you')
            || lowered.startsWith('you are welcome') || lowered.startsWith('got it!'))) {
            // A greeting followed by a real question should not be dropped.
            if (!anyOf(lowered, new List<String>{'which ', 'please provide', 'select ', 'choose ', 'options:'})) {
                return new Decision(Mode.CONVERSATION, 'brief acknowledgment');
            }
        }
        Boolean choiceList = containsNumberedOptions(raw);
        Boolean inputRequest = anyOf(lowered, new List<String>{
            'please provide', 'please enter', 'which one', 'which would you',
            'choose one', 'choose a ', 'which contact', 'which device', 'select the ',
            'what would you like to name', 'please reply with'
        });
        Boolean explicitChoices = choiceList || anyOf(lowered, new List<String>{
            'option 1', 'option 2', 'new or existing', 'yes or no', '(y/n)',
            'apple, samsung', '256 gb', '512 gb', 'email and', 'name and'
        });
        Boolean asksQuestion = lowered.contains('?');
        Boolean asksMultipleFields = inputRequest && anyOf(lowered, new List<String>{
            ' and the ', ' and ', 'both answers', 'provide your selections', 'the following'
        });
        if (choiceList || (inputRequest && (explicitChoices || asksMultipleFields))) {
            return new Decision(Mode.INTERACTIVE, 'explicit choices or fields');
        }
        if (inputRequest && asksQuestion && !explicitChoices) {
            // A single open-ended question usually works better as chat text.
            return new Decision(Mode.CONVERSATION, 'natural language question');
        }
        if (anyOf(lowered, new List<String>{
            '|---', '| ---', 'approved', 'completed successfully', 'cart review',
            'pricing options', 'duplicate agreement', 'blocked', 'error:',
            'contract status', 'in progress', 'verification', 'waived', 'total monthly'
        })) {
            return new Decision(Mode.ENHANCED, 'structured or high-value status');
        }
        return new Decision(Mode.CONVERSATION, 'text is sufficient');
    }

    public static Map<String,Object> present(AgentUI_Config__mdt config, String agentText) {
        Decision selection = decide(agentText);
        Map<String,Object> output = new Map<String,Object>{
            'mode' => String.valueOf(selection.mode).toLowerCase(),
            'reason' => selection.reason,
            'ui' => null
        };
        if (selection.mode == Mode.CONVERSATION || selection.mode == Mode.DEFER) return output;
        if (config == null || !config.Composer_Enabled__c) return output;

        // Only the UI Composer sees the agent response. Failure returns original text.
        Map<String,Object> ui = AgentUIComposer.compose(config, agentText, String.valueOf(selection.mode).toLowerCase());
        if (ui == null) return output;
        output.put('ui', ui);
        return output;
    }
}
