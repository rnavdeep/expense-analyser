// Money is always cents-precision. Plain `n * 100 / 100` rounding avoids the
// floating-point drift (10.1 + 0.2 = 10.299999999999999) that otherwise leaks
// into displayed/settled/stored amounts.
export function roundToCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}
