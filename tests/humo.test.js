import { describe, test, expect } from '@jest/globals';

describe('prueba de humo', () => {
  test('Jest ejecuta módulos ESM', () => {
    expect(1 + 1).toBe(2);
  });
});
