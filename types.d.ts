type Variable = number | string | boolean | undefined;

// TODO: Expression[] are basically still tuples

type Expression =
  | {
      type: Exclude<
        ExpressionVariant,
        'RETURN' | 'FUNCTION' | 'CALL' | 'OPERATION'
      >;
      content: any;
    }
  | {
      type: 'OPERATION';
      content: Expression[];
    }
  | {
      type: 'FUNCTION';
      content: {
        name: string;
        definition: {
          input: ParserResultWithIndex<Extract<Expression, { type: 'INPUT' }>>;
          code: ParserResultWithIndex<Extract<Expression, { type: 'CODE' }>>;
        };
      };
    }
  | {
      type: 'CALL';
      content: {
        functionName: string;
        parameters: Expression[];
      };
    }
  | {
      type: 'RETURN';
      content: Expression[];
    }
  | {
      type: Exclude<TokenVariant, 'STATEMENT'>;
      content: string;
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

type StatementVariant = 'if' | 'else' | 'for' | 'while';
type OperatorVariant = '+' | '-' | '/' | '*' | '%';

type Token =
  | { variant: 'STATEMENT'; content: StatementVariant }
  | { variant: 'OPERATOR'; content: OperatorVariant }
  | {
      variant: Exclude<TokenVariant, 'STATEMENT' | 'OPERATOR'>;
      content: string;
    };

type ParserResultWithIndex<ResultType = Expression[]> = {
  result: ResultType;
  index: number;
};

type FunctionDescriptor = {
  input: ParserResultWithIndex;
  code: ParserResultWithIndex;
};
