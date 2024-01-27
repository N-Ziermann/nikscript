export function parser(
  tokens: Token[],
  index: number,
  type: ExpressionVariant,
  returnsymbol: SpecialCharacter
): any {
  const result = [];
  let token = tokens[index];
  while (token[0] != returnsymbol) {
    if (isForLoopComparison(type, token)) {
      break;
    } else if (isEndOfOperation(type, token)) {
      break;
    } else if (token[0] == 'statement') {
      const statement_type = token[1];
      const cond = parser(tokens, index + 2, 'condition', '{');
      const ifTrue = parser(tokens, cond[1] + 1, 'ifTrue', '}');
      index = ifTrue[1];
      let ifFalse = [];
      if (tokens[ifTrue[1] + 1][1] == 'else') {
        ifFalse = parser(tokens, ifTrue[1] + 2, 'ifFalse', '}');
        index = ifFalse[1];
      }
      result.push([
        'statement',
        [
          statement_type,
          [
            ['condition', cond[0]],
            ['ifTrue', ifTrue[0]],
            ['ifFalse', ifFalse[0]],
          ],
        ],
      ]);
    } else if (tokens[index + 1][0] == 'operator' && type != 'operation') {
      let data = parser(tokens, index, 'operation', ';');
      result.push(['operation', data[0]]);
      index = data[1] - 1;
    } else if (token[0] == 'operator' && type != 'operation') {
      // for foo() + value
      const operationStart: any[] = [result.pop()];
      const tmp = operationStart.concat([['operator', '+']]);
      let data = parser(tokens, index + 1, 'operation', ';');
      result.push(['operation', tmp.concat(data[0])]);
      index = data[1] - 1;
    } else if (
      token[0] == 'number' ||
      token[0] == 'string' ||
      token[0] == 'operator' ||
      token[0] == '=' ||
      token[0] == '<' ||
      token[0] == '>'
    ) {
      result.push(token);
    } else if (token[0] == 'name') {
      if (token[1] == 'var') {
        let data = parser(tokens, index + 1, 'assignment', ';');
        result.push(['assignment', data[0]]);
        index = data[1] - 1;
      } else if (token[1] == 'return') {
        let data = parser(tokens, index + 1, 'assignment', ';');
        result.push(['return', data[0]]);
        index = data[1] - 1;
      } else if (token[1] == 'func') {
        const funcName = tokens[index + 1][1];
        const inputVars = parser(tokens, index + 3, 'input', '{');
        index = inputVars[1];
        const funcContent = parser(tokens, index + 1, 'input', '}');
        index = funcContent[1];
        result.push([
          'function',
          [
            funcName,
            [
              ['input', inputVars],
              ['content', funcContent],
            ],
          ],
        ]);
      } else if (
        tokens[index + 1][0] == '=' &&
        type != 'assignment' &&
        type != 'comparison'
      ) {
        if (tokens[index + 2][0] == '=') {
          if (type == 'condition') {
            result.push(token);
          } else {
            let data = parser(tokens, index, 'comparison', ')');
            result.push(['comparison', data[0]]);
            index = data[1];
          }
        } else {
          let data = parser(tokens, index, 'assignment', ';');
          result.push(['assignment', data[0]]);
          index = data[1] - 1;
        }
      } else if (tokens[index + 1][0] == '(') {
        let data = parser(tokens, index + 2, 'call', ')');
        result.push(['call', [token[1], data[0]]]);
        index = data[1];
      } else {
        result.push(token);
      }
    } else if (token[0] == '(') {
      let data = parser(tokens, index + 1, 'bracket', ')');
      result.push(['bracket', data[0]]);
      index = data[1];
    }

    index += 1;
    token = tokens[index];
  }
  // TODO: no tuples!
  return [result, index];
}

function isEndOfOperation(type: ExpressionVariant, token: Token): boolean {
  return (
    type == 'operation' &&
    (token[0] == ')' ||
      token[0] == '=' ||
      token[0] == '<' ||
      token[0] == '>' ||
      token[0] == ',')
  );
}

function isForLoopComparison(type: ExpressionVariant, token: Token): boolean {
  // "<" and ">" have a unique syntax as part of an assignment in for-loops
  return type == 'assignment' && (token[0] == '<' || token[0] == '>');
}
