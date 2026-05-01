const DEFAULT_MARGIN_PERCENT = parseMarginPercent(process.env.DEFAULT_PRODUCT_MARGIN_PERCENT) ?? 10

function parseMarginPercent(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

export function getDefaultMarginPercent(): number {
  return DEFAULT_MARGIN_PERCENT
}

export function getMarginMultiplier(): number {
  return 1 + DEFAULT_MARGIN_PERCENT / 100
}

export function resolveMarginPercent(): number {
  return DEFAULT_MARGIN_PERCENT
}

export function roundUpToThousands(amount: number): number {
  return Math.ceil(amount / 1000) * 1000
}

export function buildStoredPricing(basePrice: number) {
  return {
    basePrice,
    price: roundUpToThousands(basePrice * getMarginMultiplier()),
  }
}
