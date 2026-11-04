import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCardNumber, formatExpiry, validLuhn, validateDemoPayment } from '../src/utils/demoPayment.js';

const now = new Date(2026, 9, 27);
const valid = { name: 'Demo User', cardNumber: '4242 4242 4242 4242', expiry: '12/29', cvv: '123' };

test('Test-only payment accepts test number, rejects real cards', () => {
  assert.equal(validateDemoPayment(valid, now), '');
  assert.equal(validLuhn(valid.cardNumber), true);
  assert.match(validateDemoPayment({ ...valid, cardNumber: '5555 5555 5555 4444' }, now), /4242/);
});

test('Name and expiry checks', () => {
  assert.match(validateDemoPayment({ ...valid, name: '' }, now), /name/i);
  assert.match(validateDemoPayment({ ...valid, expiry: '09/26' }, now), /future/i);
  assert.match(validateDemoPayment({ ...valid, expiry: '13/29' }, now), /future/i);
  assert.match(validateDemoPayment({ ...valid, expiry: '1229' }, now), /MM\/YY/i);
});

test('CVV checks and formatting', () => {
  assert.match(validateDemoPayment({ ...valid, cvv: 'xx' }, now), /3- or 4-digit/);
  assert.equal(formatCardNumber('4242424242424242'), '4242 4242 4242 4242');
  assert.equal(formatExpiry('1230'), '12/30');
});
