import Ajv from 'ajv';
import type { UISpec, UINode } from '../types';
export const allowedComponents = new Set(['Stack','Row','Grid','Text','Heading','Markdown','Card','Badge','Metric','Divider','Button','Input','TextArea','Select','Checkbox','Radio','Slider','Form','Table','Alert','Progress','RecordSelector','StepProgress','BarChart','KeyValue','Spacer','EmailInput','PasswordInput','PhoneInput','UrlInput','NumberInput','DateInput','TimeInput','DateTimeInput','ColorInput','RangeInput','Switch','MultiSelect','RatingInput','SearchBox','QuantityStepper','SegmentedSelect','FieldGroup','AddressForm','Panel','Section','Surface','Center','Wrap','Toolbar','SplitPane','ScrollArea','Separator','Expandable','TabView','CarouselView','Subtitle','Caption','LabelText','Quote','CodeSnippet','TagList','Avatar','StatPair','LinkText','DefinitionList','DataList','ComparisonTable','StatusList','Timeline','ActivityFeed','RecordCard','RecordTable','RecordLookup','Pagination','EmptyState','LoadingState','Notification','Checklist','ApprovalCard','ProductCard','ProductGrid','PriceSummary','CartSummary','Stepper','FileCard']);
const schema = {type:'object',additionalProperties:false,required:['version','type','root'],properties:{version:{const:'1.0'},type:{const:'ui'},data:{type:'object'},root:{$ref:'#/$defs/node'}},$defs:{node:{type:'object',additionalProperties:false,required:['type'],properties:{id:{type:'string',maxLength:128},type:{type:'string'},props:{type:'object'},children:{type:'array',maxItems:150,items:{$ref:'#/$defs/node'}},action:{type:'object',additionalProperties:false,required:['type','name'],properties:{type:{enum:['AGENT_TURN','LOCAL','NAVIGATE']},name:{type:'string',maxLength:100},collect:{type:'array',items:{type:'string'}},payload:{type:'object',additionalProperties:{type:['string','number','boolean','null']}}}}}}}} as const;
const ajv = new Ajv({allErrors:true});
const validate = ajv.compile(schema);
export function validateSpec(value: unknown): asserts value is UISpec {
  if (!validate(value)) throw new Error('Invalid UI schema: '+ajv.errorsText(validate.errors));
  const spec=value as UISpec;
  let count=0;
  function walk(node: UINode, depth: number): void {
    if (++count>300 || depth>12) throw new Error('UI exceeds complexity limits');
    if (!allowedComponents.has(node.type)) throw new Error('Unsupported component: '+node.type);
    for (const child of node.children??[]) walk(child,depth+1);
  }
  walk(spec.root,0);
}
