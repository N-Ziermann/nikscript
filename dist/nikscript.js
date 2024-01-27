/**
 * todo:
 * find more elegant alternative to using "as number" everywhere (generics?)
 * publish build result to npm (using gh actions)
 * also allow running it using npx by passing the filename of the executable as a parameter
 * eslint
 * variable naming
 * split 3 steps into 3 files?
 * remove all any's
 * use union types instead of string everywhere
 * no == or != always === and !==
 * only let if required
 * create functions to make the code more selfexplainatory
 * no tuples (for example: a token should look like this: {type: TokenVariant, value: string})
 */
let functions = {}; // seperate from vars because it doesnt have a local scope
let vars = {};
let functionStack = [];
function lexer(code) {
  let tokens = [];
  let index = -1;
  let lastTokenized = ' '; // stores last accepted tokenvalue in case something (like negative numbers) depend on it
  while (index < code.length - 1) {
    index += 1;
    let char = code[index];
    if (char == ' ' || char == '\n') {
      continue;
    } else if (char == ';') {
      // TODO: ["CHARACTER", char]
      tokens.push([char, '']);
    } else if (char == '#') {
      //comments
      while (char != '\n') {
        index += 1;
        char = code[index];
      }
    } else if (
      char.match(/[0-9]/) ||
      (char == '-' &&
        code[index + 1].match(/[0-9]/) &&
        lastTokenized.match(/[\n (+-/*%=]/))
    ) {
      // "||" necessary to prevent mixups between x-1 and print(-1)
      let numberAsString = char;
      index += 1;
      char = code[index];
      while (char.match(/[0-9\.]/)) {
        numberAsString += char;
        index += 1;
        char = code[index];
      }
      tokens.push(['number', numberAsString]);
      index -= 1; //prevent loosing data
      lastTokenized = code[index];
    } else if (
      char == '+' ||
      char == '-' ||
      char == '/' ||
      char == '*' ||
      char == '%'
    ) {
      // TODO: operator etc should be union and UPPERCASE!
      tokens.push(['operator', char]);
      lastTokenized = char;
    } else if (char == '"') {
      let stringContent = '';
      index += 1;
      char = code[index];
      while (char != '"') {
        stringContent += char;
        index += 1;
        char = code[index];
      }
      tokens.push(['string', stringContent]);
      lastTokenized = 'string';
    } else if (char.match(/[\<\>\(\)\{\}\[\],=]/)) {
      tokens.push([char, '']);
      lastTokenized = char;
    }
    if (char.match(/[a-zA-Z]/)) {
      let term = char;
      index += 1;
      char = code[index];
      while (char.match(/[a-zA-Z0-9_]/)) {
        term += char;
        index += 1;
        char = code[index];
      }
      if (term == 'if' || term == 'else' || term == 'for' || term == 'while') {
        tokens.push(['statement', term]);
      } else {
        tokens.push(['name', term]);
      }
      index -= 1; //prevent loosing data
      lastTokenized = 'name';
    }
  }
  tokens.push(['END', 'END']);
  return tokens;
}
function parser(tokens, index, type, returnsymbol) {
  const result = [];
  let token = tokens[index];
  while (token[0] != returnsymbol) {
    if (type == 'assignment' && (token[0] == '<' || token[0] == '>')) {
      // treat "<"" & ">" differently when in an assignment (happens in for loops)
      break;
    } else if (
      type == 'operation' &&
      (token[0] == ')' ||
        token[0] == '=' ||
        token[0] == '<' ||
        token[0] == '>' ||
        token[0] == ',')
    ) {
      //special case because multiple things end operations
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
      const operationStart = [result.pop()];
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
  console.log([result, index]);
  return [result, index];
}
function interpreter(exprs) {
  var _a;
  let index = 0;
  while (index < exprs.length) {
    const expr = exprs[index];
    if (functionStack.length > 0) {
      if (functionStack[functionStack.length - 1].returnValue != undefined) {
        break;
      }
    }
    if (expr[0] == 'number') {
      return parseFloat(expr[1]);
    } else if (expr[0] == 'string') {
      return expr[1];
    } else if (expr[0] == 'name') {
      if (functionStack.length == 0) return vars[expr[1]];
      else return functionStack[functionStack.length - 1].arguments[expr[1]];
    } else if (expr[0] == 'assignment') {
      const c = interpreter([expr[1][2]]);
      if (functionStack.length == 0) vars[expr[1][0][1]] = c;
      else functionStack[functionStack.length - 1].arguments[expr[1][0][1]] = c;
    } else if (expr[0] == 'call') {
      const content = expr[1];
      if (content[0] + '()' in functions) {
        // functioncall for selvedefined function
        const functionContent = functions[content[0] + '()'];
        const argsNeeded = functionContent[0][1][0];
        const argsGiven = content[1];
        if (argsGiven.length == argsNeeded.length) {
          const tempFunctionStack = []; // used so that no values get mixed up in for loop below (values would be taken from newest function in stack)
          tempFunctionStack.push({
            functionName: content[0] + '()',
            arguments: {},
            returnValue: undefined,
          });
          for (let i = 0; i < argsGiven.length; i++) {
            tempFunctionStack[tempFunctionStack.length - 1].arguments[
              argsNeeded[i][1]
            ] = interpreter([argsGiven[i]]); // save function input arguments as variables
          }
          functionStack.push(tempFunctionStack[0]);
          interpreter(functionContent[1][1][0]);
          const returnValue =
            (_a = functionStack.pop()) === null || _a === void 0
              ? void 0
              : _a.returnValue;
          if (returnValue != undefined) return returnValue;
        } else {
          // TODO: use `${}`
          console.log(
            content[0] +
              ' takes ' +
              argsNeeded.length +
              ' arguments but ' +
              argsGiven.length +
              ' were given!'
          );
        }
      } else {
        //predefinded function?
        switch (content[0]) {
          case 'print':
            console.log(interpreter(content[1]));
            break;
          case 'len':
            return interpreter(content[1]).length;
          default:
            console.log('function "' + content[0] + '" undefined');
        }
      }
    } else if (expr[0] == 'operation') {
      const content = expr[1];
      let res = interpreter([content[0]]);
      for (let i = 1; i < content.length; i += 2) {
        switch (content[i][1]) {
          case '+':
            res += interpreter([content[i + 1]]);
            break;
          case '-':
            res -= interpreter([content[i + 1]]);
            break;
          case '*':
            res *= interpreter([content[i + 1]]);
            break;
          case '/':
            res /= interpreter([content[i + 1]]);
            break;
          case '%':
            res = res % interpreter([content[i + 1]]);
            break;
        }
      }
      return res;
    } else if (expr[0] == 'statement') {
      switch (expr[1][0]) {
        case 'if':
          if (interpreter([expr[1][1][0]])) {
            // condition
            interpreter(expr[1][1][1][1]); // ifTrue
          } else {
            if (expr[1][1][2][1] != undefined) {
              interpreter(expr[1][1][2][1]); // ifFalse
            }
          }
          break;
        case 'while':
          while (interpreter([expr[1][1][0]])) {
            interpreter(expr[1][1][1][1]);
          }
        case 'for':
          const condition = expr[1][1][0][1];
          const loopVarExpr = condition[0][1][0];
          const startValue = interpreter([condition[0][1][2]]);
          const limit = interpreter([condition[2]]);
          const loopCode = expr[1][1][1][1];
          if (condition[1][0] == '<') {
            if (functionStack.length == 0) {
              // not inside a function
              for (
                vars[loopVarExpr[1]] = startValue;
                vars[loopVarExpr[1]] < limit;
                vars[loopVarExpr[1]]++
              ) {
                interpreter(loopCode);
              }
            } else {
              for (
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr[1]
                ] = startValue;
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr[1]
                ] < limit;
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr[1]
                ]++
              ) {
                interpreter(loopCode);
              }
            }
          } else if (condition[1][0] == '>') {
            if (functionStack.length == 0) {
              // not inside a function
              for (
                vars[loopVarExpr[1]] = startValue;
                vars[loopVarExpr[1]] > limit;
                vars[loopVarExpr[1]]--
              ) {
                interpreter(loopCode);
              }
            } else {
              for (
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr[1]
                ] = startValue;
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr[1]
                ] > limit;
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr[1]
                ]--
              ) {
                interpreter(loopCode);
              }
            }
          }
      }
    } else if (expr[0] == 'condition' || expr[0] == 'comparison') {
      const content = expr[1];
      switch (
        content[1][0] // type of comparison
      ) {
        case '=':
          if (interpreter([content[0]]) == interpreter([content[3]])) {
            return true;
          } else {
            return false;
          }
        case '<':
          if (interpreter([content[0]]) < interpreter([content[2]])) {
            return true;
          } else {
            return false;
          }
        case '>':
          if (interpreter([content[0]]) > interpreter([content[2]])) {
            return true;
          } else {
            return false;
          }
      }
    } else if (expr[0] == 'bracket') {
      return interpreter(expr[1]);
    } else if (expr[0] == 'function') {
      // store defined function
      const content = expr[1];
      const functionname = content[0] + '()';
      const functiondata = content[1];
      functions[functionname] = functiondata;
    } else if (expr[0] == 'return') {
      functionStack[functionStack.length - 1].returnValue = interpreter(
        expr[1]
      );
      break;
    }
    index += 1;
  }
}
export function interpret(code) {
  interpreter(parser(lexer(code), 0, 'code', 'END')[0]);
}
