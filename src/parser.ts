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
    } else if (token.variant === 'statement') {
      const statement_type = token.content;
      const cond = parser(tokens, index + 2, 'condition', '{');
      const ifTrue = parser(tokens, cond.index + 1, 'ifTrue', '}');
      index = ifTrue.index;
      let ifFalse: ReturnType<typeof parser> | undefined = undefined;
      if (tokens[ifTrue.index + 1].content === 'else') {
        ifFalse = parser(tokens, ifTrue.index + 2, 'ifFalse', '}');
        index = ifFalse.index;
      }
      result.push({
        type: 'statement',
        content: [
          statement_type,
          [
            ['condition', cond.result],
            ['ifTrue', ifTrue.result],
            ['ifFalse', ifFalse?.result],
          ],
        ],
      });
    } else if (
      tokens[index + 1].variant === 'operator' &&
      type !== 'operation'
    ) {
      let data = parser(tokens, index, 'operation', ';');
      result.push({ type: 'operation', content: data.result });
      index = data.index - 1;
    } else if (token.variant === 'operator' && type !== 'operation') {
      // for foo() + value
      const operationStart: Expression[] = [result.pop()!];
      const tmp = operationStart.concat({ type: 'operation', content: '+' });
      let data = parser(tokens, index + 1, 'operation', ';');
      result.push({ type: 'operation', content: tmp.concat(data.result) });
      index = data.index - 1;
    } else if (
      token.variant === 'number' ||
      token.variant === 'string' ||
      token.variant === 'operator' ||
      token.content === '=' ||
      token.content === '<' ||
      token.content === '>'
    ) {
      // TODO: make results be (Express|Token)[] ?
      result.push({ type: token.variant, content: token.content });
    } else if (token.variant === 'name') {
      if (token.content === 'var') {
        let data = parser(tokens, index + 1, 'assignment', ';');
        result.push({ type: 'assignment', content: data.result });
        index = data.index - 1;
      } else if (token.content === 'return') {
        let data = parser(tokens, index + 1, 'assignment', ';');
        result.push({ type: 'return', content: data.result });
        index = data.index - 1;
      } else if (token.content === 'func') {
        const funcName = tokens[index + 1].content;
        const inputVars = parser(tokens, index + 3, 'input', '{');
        index = inputVars.index;
        const funcContent = parser(tokens, index + 1, 'input', '}');
        index = funcContent.index;
        result.push({
          type: 'function',
          content: [
            funcName,
            [
              ['input', inputVars],
              ['content', funcContent],
            ],
          ],
        });
      } else if (
        tokens[index + 1].content === '=' &&
        type !== 'assignment' &&
        type !== 'comparison'
      ) {
        if (tokens[index + 2].content === '=') {
          if (type === 'condition') {
            result.push({ type: token.variant, content: token.content });
          } else {
            let data = parser(tokens, index, 'comparison', ')');
            result.push({ type: 'comparison', content: data.result });
            index = data.index;
          }
        } else {
          let data = parser(tokens, index, 'assignment', ';');
          result.push({ type: 'assignment', content: data.result });
          index = data.index - 1;
        }
      } else if (tokens[index + 1].content === '(') {
        let data = parser(tokens, index + 2, 'call', ')');
        result.push({ type: 'call', content: [token.content, data.result] });
        index = data.index;
      } else {
        // TODO
        result.push({ type: token.variant, content: token.content });
      }
    } else if (token.content === '(') {
      let data = parser(tokens, index + 1, 'bracket', ')');
      result.push({ type: 'bracket', content: data.result });
      index = data.index;
    }

    index += 1;
    token = tokens[index];
  }
  return { result, index };
}

function isEndOfOperation(type: ExpressionVariant, token: Token): boolean {
  return (
    type === 'operation' &&
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
    type === 'assignment' && (token.content === '<' || token.content === '>')
  );
}
