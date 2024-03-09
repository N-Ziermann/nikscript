export function parser(
  tokens: Token[],
  index: number,
  type: ExpressionVariant,
  returnsymbol: SpecialCharacter
): ParserResultWithIndex {
  const result: Expression[] = [];
  let token = tokens[index];
  while (token.content !== returnsymbol) {
    if (isForLoopComparison(type, token)) {
      break;
    } else if (isEndOfOperation(type, token)) {
      break;
    } else if (token.variant === 'STATEMENT') {
      const statement_type = token.content;
      const cond = parser(tokens, index + 2, 'CONDITION', '{');
      const ifTrue = parser(tokens, cond.index + 1, 'IF_TRUE', '}');
      index = ifTrue.index;
      let ifFalse: ReturnType<typeof parser> | undefined = undefined;
      if (tokens[ifTrue.index + 1].content === 'else') {
        ifFalse = parser(tokens, ifTrue.index + 2, 'IF_FALSE', '}');
        index = ifFalse.index;
      }
      result.push({
        type: 'STATEMENT',
        content: {
          type: statement_type,
          statement: {
            condition: cond.result,
            trueCase: ifTrue.result,
            falseCase: ifFalse?.result,
          },
        },
      });
    } else if (
      tokens[index + 1].variant === 'OPERATOR' &&
      type !== 'OPERATION'
    ) {
      const data = parser(tokens, index, 'OPERATION', ';');
      result.push({ type: 'OPERATION', content: data.result });
      index = data.index - 1;
    } else if (token.variant === 'OPERATOR' && type !== 'OPERATION') {
      // for foo() + value
      const operationStart: Expression[] = [result.pop()!];
      const tmp = operationStart.concat({ type: 'OPERATION', content: '+' });
      const data = parser(tokens, index + 1, 'OPERATION', ';');
      result.push({ type: 'OPERATION', content: tmp.concat(data.result) });
      index = data.index - 1;
    } else if (
      token.variant === 'NUMBER' ||
      token.variant === 'STRING' ||
      token.variant === 'OPERATOR' ||
      token.content === '=' ||
      token.content === '<' ||
      token.content === '>'
    ) {
      result.push({ type: token.variant, content: token.content });
    } else if (token.variant === 'NAME') {
      if (token.content === 'var') {
        const data = parser(tokens, index + 1, 'ASSIGNMENT', ';');
        result.push({ type: 'ASSIGNMENT', content: data.result });
        index = data.index - 1;
      } else if (token.content === 'return') {
        const data = parser(tokens, index + 1, 'ASSIGNMENT', ';');
        result.push({ type: 'RETURN', content: data.result });
        index = data.index - 1;
      } else if (token.content === 'func') {
        const funcName = tokens[index + 1].content;
        const inputVars = parser(tokens, index + 3, 'INPUT', '{');
        index = inputVars.index;
        const funcContent = parser(tokens, index + 1, 'INPUT', '}');
        index = funcContent.index;
        result.push({
          type: 'FUNCTION',
          content: {
            name: funcName,
            definition: {
              input: inputVars,
              code: funcContent,
            },
          },
        });
      } else if (
        tokens[index + 1].content === '=' &&
        type !== 'ASSIGNMENT' &&
        type !== 'COMPARISON'
      ) {
        if (tokens[index + 2].content === '=') {
          if (type === 'CONDITION') {
            result.push({ type: token.variant, content: token.content });
          } else {
            const data = parser(tokens, index, 'COMPARISON', ')');
            result.push({ type: 'COMPARISON', content: data.result });
            index = data.index;
          }
        } else {
          const data = parser(tokens, index, 'ASSIGNMENT', ';');
          result.push({ type: 'ASSIGNMENT', content: data.result });
          index = data.index - 1;
        }
      } else if (tokens[index + 1].content === '(') {
        const data = parser(tokens, index + 2, 'CALL', ')');
        // todo: tuple!
        result.push({ type: 'CALL', content: [token.content, data.result] });
        index = data.index;
      } else {
        result.push({ type: token.variant, content: token.content });
      }
    } else if (token.content === '(') {
      const data = parser(tokens, index + 1, 'BRACKET', ')');
      result.push({ type: 'BRACKET', content: data.result });
      index = data.index;
    }

    index += 1;
    token = tokens[index];
  }
  return { result, index };
}

function isEndOfOperation(type: ExpressionVariant, token: Token): boolean {
  return (
    type === 'OPERATION' &&
    (token.content === ')' ||
      token.content === '=' ||
      token.content === '<' ||
      token.content === '>' ||
      token.content === ',')
  );
}

function isForLoopComparison(type: ExpressionVariant, token: Token): boolean {
  // "<" and ">" have a unique syntax as part of an assignment in for-loops
  return (
    type === 'ASSIGNMENT' && (token.content === '<' || token.content === '>')
  );
}
