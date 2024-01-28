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

it('should ignore comments string', () => {
  const code = `
  # print("1", "2");
  print(3);`;
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([3]);
});

it('should print a computed value', () => {
  const code = 'print(3 + 8);';
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([11]);
});

it('should print a variable', () => {
  const code = 'var i = 0; print(i);';
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([0]);
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

it('should handle positive if statements', () => {
  interpret('if(1==1){print("r");}else{print("f");}');
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual(['r']);
});

it('should handle negative if statements', () => {
  interpret('if(1==2){print("r");}else{print("f");}');
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual(['f']);
});

it('should print each fizzbuzz value from 1 to 100', () => {
  const code =
    'for(i=1<101){tmp = "";if(i%3==0){tmp = tmp + "Fizz";}if(i%5==0){tmp = tmp + "Buzz";}if(tmp==""){tmp=i;}print(tmp);}';
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual(fizzbuzz(100));
});

// TODO: these didn't even work before the refactor...
it.skip('should handle while-loops', () => {
  interpret('var i = 0; while(i<5){print(i); i = i+1;}');
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([0, 1, 2, 3, 4]);
});

it('should print the returnvalue of a function', () => {
  const code = `
    func foo(){
      return 42;
    }
    print(foo());`;
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([42]);
});

it('should print a function parameter', () => {
  const code = `
    func printMe(n){
      print(n);
    }
    printMe(42);`;
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([42]);
});

it('should do math operations in the correct order', () => {
  const code = 'print ("-1 * 2 -- 1 = " + (-1*2--1));';
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([
    '-1 * 2 -- 1 = -1',
  ]);
});

it('should recursively calulate the fibonacci value at position 3', () => {
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
    print(fibonacci(3));`;
  interpret(code);
  expect(logSpy?.mock.calls.map((args) => args[0])).toEqual([2]);
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
