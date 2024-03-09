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
  | 'NUMBER'
  | 'STRING'
  | 'OPERATOR'
  | 'STATEMENT'
  | 'NAME'
  | 'CHARACTER'
  | 'END';

type ExpressionVariant =
  | 'IF_TRUE'
  | 'IF_FALSE'
  | 'OPERATION'
  | 'CODE'
  | 'ASSIGNMENT'
  | 'CONDITION'
  | 'INPUT'
  | 'BRACKET'
  | 'CALL'
  | 'COMPARISON'
  | 'RETURN'
  | 'FUNCTION';

type Token = { variant: TokenVariant; content: string };

type ParserResultWithIndex = {
  result: Expression[];
  index: number;
};

type FunctionDescriptor = {
  input: ParserResultWithIndex;
  content: ParserResultWithIndex;
};
