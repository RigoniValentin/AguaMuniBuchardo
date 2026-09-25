import { Badge } from '@/components/Badge/Badge';
import { PRODUCT_TYPE_LABEL, PRODUCT_TYPE_TONE, type ProductType } from '../types/products.types';

interface ProductTypeBadgeProps {
  value: ProductType;
}

export function ProductTypeBadge({ value }: ProductTypeBadgeProps) {
  return <Badge tone={PRODUCT_TYPE_TONE[value]}>{PRODUCT_TYPE_LABEL[value]}</Badge>;
}
