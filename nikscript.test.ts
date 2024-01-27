import { interpret } from './nikscript.ts';

let logSpy: jest.SpyInstance | undefined = undefined;

beforeEach(() => {
  jest.clearAllMocks();
  logSpy = jest.spyOn(console, 'log');
});

it('should print a string', () => {
  const code = 'print("1", "2");';
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual(['1']);
});

it('should print a computed value', () => {
  const code = 'print(3 + 8);';
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([11]);
});

it('should do multiple statements one after the other', () => {
  const code = 'print(1); print(2);';
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([1, 2]);
});

it('should print each value in a for loop', () => {
  const code = 'for(i=1<4){print(i);}';
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([1, 2, 3]);
});

it('should print each fizzbuzz value from 1 to 100', () => {
  const code =
    'for(i=1<101){tmp = "";if(i%3==0){tmp = tmp + "Fizz";}if(i%5==0){tmp = tmp + "Buzz";}if(tmp==""){tmp=i;}print(tmp);}';
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual(fizzbuzz(100));
});

it('should recursively calulate the fibonacci value at position x (5)', () => {
  const code = `
    func fibonacci(n){
      if (n == 0){
          return 0;
      }
      if (n == 1){
          return 1;
      }
      return fibonacci(n-1) + fibonacci(n-2);
    }
    print(fibonacci(8));`;
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([21]);
});

function fizzbuzz(maxValue: number) {
  const result: (string | number)[] = [];
  for (let i = 1; i <= maxValue; i++) {
    if (i % 15 === 0) result.push('FizzBuzz');
    else if (i % 3 === 0) result.push('Fizz');
    else if (i % 5 === 0) result.push('Buzz');
    else result.push(i);
  }
  return result;
}
