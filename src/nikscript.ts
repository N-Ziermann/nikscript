/**
 * todo:
 * replace all "as number" etc. with assertions from assertions.ts
 * publish build result to npm (using gh actions)
 * also allow running it using npx by passing the filename of the executable as a parameter
 * eslint
 * variable naming
 * remove all any's
 * use union types instead of string everywhere
 * only use 'let' where required
 * create functions to make the code more self-explainatory
 * no tuples (for example: a token should look like this: {type: TokenVariant, value: string} and not [TokenVariant, string])
 */

import { interpreter } from './interpreter';
import { lexer } from './lexer';
import { parser } from './parser';

export function interpret(code: string): void {
  const tokens = lexer(code);
  const expressions = parser(tokens, 0, 'CODE', 'END');
  interpreter(expressions.result);
}
