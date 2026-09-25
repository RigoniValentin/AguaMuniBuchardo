import { formatMinorAsARS } from '@/shared/money';

interface ProductPriceProps {
  basePriceMinor: number;
}

export function ProductPrice({ basePriceMinor }: ProductPriceProps) {
  return <strong>{formatMinorAsARS(basePriceMinor)}</strong>;
}
