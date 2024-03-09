let functions: Record<string, FunctionDescriptor> = {}; // uses seperate from vars because it doesnt have a local scope
let functionStack: {
  functionName: string;
  arguments: Record<string, any>;
  returnValue: any;
}[] = [];
let vars: Record<string, ReturnType<typeof interpreter>> = {};

export function interpreter(
  expressions: Expression[]
): any[] | number | string | boolean | undefined {
  let index = 0;

  while (index < expressions.length) {
    const expr = expressions[index];

    if (functionStack.length > 0) {
      if (functionStack[functionStack.length - 1].returnValue !== undefined) {
        break;
      }
    }

    if (expr.type === 'NUMBER') {
      return parseFloat(expr.content);
    } else if (expr.type === 'STRING') {
      return expr.content;
    } else if (expr.type === 'NAME') {
      if (functionStack.length === 0) return vars[expr.content];
      else
        return functionStack[functionStack.length - 1].arguments[expr.content];
    } else if (expr.type === 'ASSIGNMENT') {
      const valueToAssign = interpreter([expr.content[2]]);
      if (functionStack.length === 0) {
        vars[expr.content[0].content] = valueToAssign;
      } else {
        functionStack[functionStack.length - 1].arguments[
          expr.content[0].content
        ] = valueToAssign;
      }
    } else if (expr.type === 'CALL') {
      const content = expr.content;

      if (content[0] + '()' in functions) {
        // functioncall for selvedefined function

        const functionContent = functions[content[0] + '()'];
        const argsNeeded = functionContent.input.result as Expression[];
        const argsGiven = content[1] as Expression[];

        if (argsGiven.length === argsNeeded.length) {
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
          interpreter(functionContent.content.result);
          const returnValue = functionStack.pop()?.returnValue;
          if (returnValue !== undefined) return returnValue;
        } else {
          console.log(
            `${content[0]} takes ${argsNeeded.length} arguments but ${argsGiven.length} were given!`
          );
        }
      } else {
        // check if predefinded function
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
    } else if (expr.type === 'OPERATION') {
      const content = expr.content as Expression[];
      let resultValue = interpreter([content[0]]) as number;

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
    } else if (expr.type === 'STATEMENT') {
      switch (expr.content.type) {
        case 'if':
          if (
            interpreter([
              { type: 'COMPARISON', content: expr.content.statement.condition },
            ])
          ) {
            interpreter(expr.content.statement.trueCase);
          } else {
            if (expr.content.statement.falseCase !== undefined) {
              interpreter(expr.content.statement.falseCase);
            }
          }
          break;

        case 'while':
          while (
            interpreter([
              { type: 'COMPARISON', content: expr.content.statement.condition },
            ])
          ) {
            interpreter(expr.content.statement.trueCase);
          }

        case 'for':
          const condition = expr.content.statement.condition; //as Expression[];
          const loopVarExpr = condition[0].content[0]; //as Expression;
          const startValue = interpreter([condition[0].content[2]]);
          const limit = interpreter([condition[2]]) as number;
          const loopCode = expr.content.statement.trueCase;

          if (
            condition[1].type === 'CHARACTER' &&
            condition[1].content === '<'
          ) {
            if (functionStack.length === 0) {
              // not inside a function
              for (
                vars[loopVarExpr.content] = startValue;
                (vars[loopVarExpr.content] as any as number) < limit;
                (vars[loopVarExpr.content] as any as number)++
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
          } else if (
            condition[1].type === 'CHARACTER' &&
            condition[1].content === '>'
          ) {
            if (functionStack.length === 0) {
              // not inside a function
              for (
                vars[loopVarExpr.content] = startValue;
                (vars[loopVarExpr.content] as any as number) > limit;
                (vars[loopVarExpr.content] as any as number) -= 1
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
    } else if (expr.type === 'CONDITION' || expr.type === 'COMPARISON') {
      const content = expr.content as Expression[];

      switch (
        content[1].content // type of comparison
      ) {
        case '=':
          if (interpreter([content[0]]) === interpreter([content[3]])) {
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
    } else if (expr.type === 'BRACKET') {
      return interpreter(expr.content);
    } else if (expr.type === 'FUNCTION') {
      // store defined function
      const content = expr.content;
      const functionname = content[0] + '()';
      const functiondata = content[1];

      // TODO: already build this correctly inside the parser, so that it doesnt need to be converted here
      functions[functionname] = {
        input: functiondata[0][1],
        content: functiondata[1][1],
      } as FunctionDescriptor;
    } else if (expr.type === 'RETURN') {
      functionStack[functionStack.length - 1].returnValue = interpreter(
        expr.content
      );
      break;
    }

    index += 1;
  }
}
