import { describe, expect, it } from 'vitest';
import { decryptString, encryptString } from './utils';
import crypto from 'crypto';

describe('encrypt and decrypt string', () => {
  it('encrypts and decrypts string correctly', () => {
    const string = crypto.randomBytes(16).toString('hex');

    const encryptedString = encryptString(string);
    const decryptedString = decryptString(encryptedString);

    expect(string).toEqual(decryptedString);
  });
});
