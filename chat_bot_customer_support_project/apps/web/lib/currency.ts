export function convertFromCentsToDollars(cents: number): number {
  const dollars = cents / 100;
  return dollars;
}

export function convertFromCentsToDecimillicents(cents: number): number {
  const decimillicents = cents * 10000;
  return Math.round(decimillicents);
}

export function convertFromDecimillicentsToUSD(amount: number): string {
  const cents = amount / 10000;
  const dollars = cents / 100;
  return dollars.toFixed(2);
}

export function convertFromDecimillicentsToCents(
  decimillicents: number
): number {
  const cents = decimillicents / 10000;
  return Math.round(cents);
}

export function convertFromUSDToDecimillicents(dollars: number): number {
  const cent = dollars * 100;
  const decimillicents = cent * 10000;
  return Math.round(decimillicents);
}
