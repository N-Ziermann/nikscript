function getAssertionError(
  variable: Variable | Variable[],
  expectedType: string
) {
  return new Error(
    `A value that should have been of type ${expectedType} was actually of type ${typeof variable}`
  );
}

export function assertIsNumber(variable: Variable | Variable[]): number {
  if (typeof variable === 'number') {
    return variable;
  }
  throw getAssertionError(variable, 'number');
}

export function assertIsNumberOrString(
  variable: Variable | Variable[]
): number | string {
  if (typeof variable === 'number') {
    return variable;
  }
  if (typeof variable === 'string') {
    return variable;
  }
  throw getAssertionError(variable, 'number or string');
}
