export function lexer(code: string): Token[] {
  let tokens: Token[] = [];
  let index = -1;

  let lastTokenized = ' '; // stores last accepted tokenvalue in case something (like negative numbers) depend on it

  while (index < code.length - 1) {
    index += 1;
    let char = code[index];

    if (char === ' ' || char === '\n') {
      continue;
    } else if (char === ';') {
      tokens.push({ variant: 'CHARACTER', content: char });
    } else if (char === '#') {
      //comments
      while (char !== '\n') {
        index += 1;
        char = code[index];
      }
    } else if (
      char.match(/[0-9]/) ||
      (char === '-' &&
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
      tokens.push({ variant: 'number', content: numberAsString });
      index -= 1; //prevent loosing data
      lastTokenized = code[index];
    } else if (
      char === '+' ||
      char === '-' ||
      char === '/' ||
      char === '*' ||
      char === '%'
    ) {
      // TODO: operator etc should be union and UPPERCASE!
      tokens.push({ variant: 'operator', content: char });
      lastTokenized = char;
    } else if (char === '"') {
      let stringContent = '';
      index += 1;
      char = code[index];

      while (char !== '"') {
        stringContent += char;
        index += 1;
        char = code[index];
      }

      tokens.push({ variant: 'string', content: stringContent });
      lastTokenized = 'string';
    } else if (char.match(/[\<\>\(\)\{\}\[\],=]/)) {
      tokens.push({ variant: 'CHARACTER', content: char });
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

      if (
        term === 'if' ||
        term === 'else' ||
        term === 'for' ||
        term === 'while'
      ) {
        tokens.push({ variant: 'statement', content: term });
      } else {
        tokens.push({ variant: 'name', content: term });
      }
      index -= 1; //prevent loosing data
      lastTokenized = 'name';
    }
  }
  tokens.push({ variant: 'END', content: 'END' });
  return tokens;
}
