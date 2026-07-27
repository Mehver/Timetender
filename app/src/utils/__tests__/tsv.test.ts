import { describe, expect, it } from 'vitest';
import { parseTsv, toTsv } from '../tsv';

describe('tsv utils', () => {
  it('round-trips a matrix', () => {
    const rows = [
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ];
    expect(parseTsv(toTsv(rows))).toEqual(rows);
  });

  it('flattens tabs and newlines inside cells', () => {
    expect(toTsv([['a\tb', 'c\nd']])).toBe('a b\tc d');
  });

  it('parses excel-style trailing newline', () => {
    expect(parseTsv('a\tb\n1\t2\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('handles CRLF', () => {
    expect(parseTsv('a\tb\r\n1\t2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});
