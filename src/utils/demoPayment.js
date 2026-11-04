// D1 demonstration only. This validates TEST card input on the client.
// No card number, expiry or CVV is sent to the server or persisted anywhere.
export function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function validLuhn(value) {
  const digits = String(value).replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let doubleNext = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let num = Number(digits[i]);
    if (doubleNext) { num *= 2; if (num > 9) num -= 9; }
    sum += num;
    doubleNext = !doubleNext;
  }
  return sum % 10 === 0;
}

export function validateDemoPayment({ name, cardNumber, expiry, cvv }, now = new Date()) {
  const trimmedName = name.trim();
  if (!/^[\p{L}][\p{L} .'-]{1,79}$/u.test(trimmedName)) {
    return 'Enter the full name printed on your demonstration card.';
  }
  if (String(cardNumber).replace(/\s/g, '') !== '4242424242424242' || !validLuhn(cardNumber)) {
    return 'For this demo, use only 4242 4242 4242 4242. Never enter a real card number.';
  }
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return 'Enter the expiry date in MM/YY format.';
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth) || year > currentYear + 15) {
    return 'Enter a valid future expiry date.';
  }
  if (!/^\d{3,4}$/.test(cvv)) return 'Enter a 3- or 4-digit demonstration CVV.';
  return '';
}
