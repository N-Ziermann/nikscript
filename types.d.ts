type Expression = { type: ExpressionVariant | TokenVariant; content: any };

type SpecialCharacter =
  | '<'
  | '>'
  | '('
  | ')'
  | '='
  | ','
  | '{'
  | '}'
  | ';'
  | 'END';

type TokenVariant =
  | 'number'
  | 'string'
  | 'operator'
  | 'statement'
  | 'name'
  | 'END'
  | 'CHARACTER';

type ExpressionVariant =
  | 'ifTrue'
  | 'ifFalse'
  | 'operation'
  | 'code'
  | 'assignment'
  | 'condition'
  | 'input'
  | 'bracket'
  | 'call'
  | 'comparison'
  | 'return'
  | 'function';

type Token = { variant: TokenVariant; content: string };

type ParserResultWithIndex = {
  result: Expression[];
  index: number;
};

type FunctionDescriptor = {
  input: ParserResultWithIndex;
  content: ParserResultWithIndex;
};
