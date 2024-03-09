type Variable = number | string | boolean | undefined;

type Expression =
  | {
      type: Exclude<ExpressionVariant | TokenVariant, 'STATEMENT'>;
      content: any;
    }
  | {
      type: 'STATEMENT';
      content: {
        type: Statement_Variant;
        statement: {
          condition: Expression[];
          trueCase: Expression[];
          falseCase?: Expression[];
        };
      };
    };

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

type Statement_Variant = 'if' | 'else' | 'for' | 'while';

type Token =
  | { variant: 'STATEMENT'; content: Statement_Variant }
  | { variant: Exclude<TokenVariant, 'STATEMENT'>; content: string };

type ParserResultWithIndex = {
  result: Expression[];
  index: number;
};

type FunctionDescriptor = {
  input: ParserResultWithIndex;
  content: ParserResultWithIndex;
};
