export const tradeColors: { [key: string]: string } = {
  'vinyl-wrap': 'text-trade-vinyl-wrap bg-trade-vinyl-wrap/20',
  'window-tint': 'text-trade-window-tint bg-trade-window-tint/20',
  ppf: 'text-trade-ppf bg-trade-ppf/20',
  'ceramic-coating': 'text-trade-ceramic-coating bg-trade-ceramic-coating/20',
  'auto-detailing': 'text-trade-auto-detailing bg-trade-auto-detailing/20',
  'paint-correction': 'text-trade-paint-correction bg-trade-paint-correction/20',
};

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'gig', label: 'Gig' },
];

export const TRADES = [
  { value: 'vinyl-wrap', label: 'Vinyl Wrap' },
  { value: 'window-tint', label: 'Window Tint' },
  { value: 'ppf', label: 'PPF' },
  { value: 'ceramic-coating', label: 'Ceramic Coating' },
  { value: 'auto-detailing', label: 'Auto Detailing' },
  { value: 'paint-correction', label: 'Paint Correction' },
];

export function tradeLabel(value: string): string {
  const mapped = TRADES.find((trade) => trade.value === value)?.label;
  if (mapped) return mapped;

  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
