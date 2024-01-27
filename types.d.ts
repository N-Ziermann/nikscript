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
  | SpecialCharacter
  | 'number'
  | 'string'
  | 'operator'
  | 'statement'
  | 'name'
  | 'END';

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
  | 'comparison';

type Token = [TokenVariant, string];
