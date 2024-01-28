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

import { parser } from './parser';

let functions: any = {}; // seperate from vars because it doesnt have a local scope
let vars: any = {};
let functionStack: {
  functionName: string;
  arguments: Record<string, any>;
  returnValue: any;
}[] = [];

function lexer(code: string): Token[] {
  let tokens: Token[] = [];
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
      tokens.push([char as SpecialCharacter, '']);
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

function interpreter(
  expressions: Expression[]
): any[] | number | string | boolean | undefined {
  let index = 0;

  while (index < expressions.length) {
    const expr = expressions[index];

    if (functionStack.length > 0) {
      if (functionStack[functionStack.length - 1].returnValue != undefined) {
        break;
      }
    }

    if (expr.type == 'number') {
      return parseFloat(expr.content);
    } else if (expr.type == 'string') {
      return expr.content;
    } else if (expr.type == 'name') {
      if (functionStack.length == 0) return vars[expr.content];
      else
        return functionStack[functionStack.length - 1].arguments[expr.content];
    } else if (expr.type == 'assignment') {
      const valueToAssign = interpreter([expr.content[2]]);
      if (functionStack.length == 0) {
        vars[expr.content[0].content] = valueToAssign;
      } else {
        functionStack[functionStack.length - 1].arguments[
          expr.content[0].content
        ] = valueToAssign;
      }
    } else if (expr.type == 'call') {
      const content = expr.content;

      if (content[0] + '()' in functions) {
        // functioncall for selvedefined function

        const functionContent = functions[content[0] + '()'];
        const argsNeeded = functionContent[0][1].result as Expression[];
        const argsGiven = content[1] as Expression[];

        if (argsGiven.length == argsNeeded.length) {
          const tempFunctionStack: typeof functionStack = []; // used so that no values get mixed up in for loop below (values would be taken from newest function in stack)

          tempFunctionStack.push({
            functionName: content[0] + '()',
            arguments: {},
            returnValue: undefined,
          });

          for (let i = 0; i < argsGiven.length; i++) {
            tempFunctionStack[tempFunctionStack.length - 1].arguments[
              argsNeeded[i].content
            ] = interpreter([argsGiven[i]]); // save function input arguments as variables
          }
          functionStack.push(tempFunctionStack[0]);
          interpreter(functionContent[1][1].result);
          const returnValue = functionStack.pop()?.returnValue;
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
            return (interpreter(content[1]) as any[]).length;

          default:
            console.log('function "' + content[0] + '" is undefined');
        }
      }
    } else if (expr.type == 'operation') {
      const content = expr.content as Expression[];
      let resultValue = interpreter([content[0]]) as number;

      // TODO: in this case the + operator is in the "old" notation (["operator", "+"])
      for (let i = 1; i < content.length; i += 2) {
        switch (content[i].content) {
          case '+':
            resultValue += interpreter([content[i + 1]]) as number;
            break;
          case '-':
            resultValue -= interpreter([content[i + 1]]) as number;
            break;
          case '*':
            resultValue *= interpreter([content[i + 1]]) as number;
            break;
          case '/':
            resultValue /= interpreter([content[i + 1]]) as number;
            break;
          case '%':
            resultValue =
              resultValue % (interpreter([content[i + 1]]) as number);
            break;
        }
      }
      return resultValue;
    } else if (expr.type == 'statement') {
      switch (expr.content[0]) {
        case 'if':
          if (
            interpreter([
              { type: 'comparison', content: expr.content[1][0][1] },
            ])
          ) {
            interpreter(expr.content[1][1][1]); // ifTrue
          } else {
            if (expr.content[1][2][1] != undefined) {
              interpreter(expr.content[1][2][1]); // ifFalse
            }
          }
          break;

        case 'while':
          while (
            interpreter([
              { type: 'comparison', content: expr.content[1][0][1] },
            ])
          ) {
            interpreter(expr.content[1][1][1]);
          }

        case 'for':
          const condition = expr.content[1][0][1] as Expression[];
          const loopVarExpr = condition[0].content[0] as Expression;
          const startValue = interpreter([condition[0].content[2]]);
          const limit = interpreter([condition[2]]) as number;
          const loopCode = expr.content[1][1][1];

          if (condition[1].type == '<') {
            if (functionStack.length == 0) {
              // not inside a function
              for (
                vars[loopVarExpr.content] = startValue;
                vars[loopVarExpr.content] < limit;
                vars[loopVarExpr.content]++
              ) {
                interpreter(loopCode);
              }
            } else {
              for (
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr.content
                ] = startValue;
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr.content
                ] < limit;
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr.content
                ]++
              ) {
                interpreter(loopCode);
              }
            }
          } else if (condition[1].type == '>') {
            if (functionStack.length == 0) {
              // not inside a function
              for (
                vars[loopVarExpr.content] = startValue;
                vars[loopVarExpr.content] > limit;
                vars[loopVarExpr.content] -= 1
              ) {
                interpreter(loopCode);
              }
            } else {
              for (
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr.content
                ] = startValue;
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr.content
                ] > limit;
                functionStack[functionStack.length - 1].arguments[
                  loopVarExpr.content
                ]--
              ) {
                interpreter(loopCode);
              }
            }
          }
      }
    } else if (expr.type == 'condition' || expr.type == 'comparison') {
      const content = expr.content as Expression[];

      switch (
        content[1].type // type of comparison
      ) {
        case '=':
          if (interpreter([content[0]]) == interpreter([content[3]])) {
            return true;
          } else {
            return false;
          }

        case '<':
          if (
            (interpreter([content[0]]) as number) <
            (interpreter([content[2]]) as number)
          ) {
            return true;
          } else {
            return false;
          }

        case '>':
          if (
            (interpreter([content[0]]) as number) >
            (interpreter([content[2]]) as number)
          ) {
            return true;
          } else {
            return false;
          }
      }
    } else if (expr.type == 'bracket') {
      return interpreter(expr.content);
    } else if (expr.type == 'function') {
      // store defined function
      const content = expr.content;
      const functionname = content[0] + '()';
      const functiondata = content[1];

      functions[functionname] = functiondata;
    } else if (expr.type == 'return') {
      functionStack[functionStack.length - 1].returnValue = interpreter(
        expr.content
      );
      break;
    }

    index += 1;
  }
}

export function interpret(code: string): void {
  const tokens = lexer(code);
  const expressions = parser(tokens, 0, 'code', 'END');
  interpreter(expressions.result);
}
