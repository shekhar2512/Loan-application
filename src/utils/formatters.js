// Format numeric string to Indian number system (e.g. 10,50,000)
export function formatIndianCurrency(num) {
  if (!num && num !== 0) return '';
  const numStr = String(num).replace(/[^0-9]/g, '');
  if (!numStr) return '';

  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  if (otherNumbers !== '') {
    return `${otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`;
  }
  return lastThree;
}

// Convert numbers into words (e.g. 50,00,000 -> "₹ 50 Lakh")
export function formatInWords(num) {
  const n = Number(String(num).replace(/[^0-9]/g, ''));
  if (!n) return null;
  if (n >= 10000000) {
    const cr = (n / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹ ${cr} Crore`;
  }
  if (n >= 100000) {
    const lk = (n / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹ ${lk} Lakh`;
  }
  if (n >= 1000) {
    const th = (n / 1000).toFixed(2).replace(/\.00$/, '');
    return `₹ ${th} Thousand`;
  }
  return `₹ ${n}`;
}

// Mask sensitive values: keeps only the last 4 characters visible (Section B4.4)
export function maskSensitiveValue(val, maskType = 'aadhaar') {
  if (!val) return '';
  const clean = String(val).trim();
  const len = clean.length;
  if (len <= 4) return clean;

  if (maskType === 'aadhaar') {
    const visible = clean.slice(-4);
    return `•••• •••• ${visible}`;
  }

  // PAN format
  const visible = clean.slice(-4);
  const hiddenCount = len - 4;
  return `${'•'.repeat(hiddenCount)}${visible}`;
}