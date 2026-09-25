import { z } from 'zod';

const trimmedRequired = (max: number, message: string) =>
  z.string().min(1, message).max(max, `Máximo ${max} caracteres`);

export const pricingRuleFormSchema = z
  .object({
    name: trimmedRequired(120, 'El nombre es obligatorio'),
    clientType: z.enum(['LOCAL', 'JUBILADO', 'NO_LOCAL', 'AYUDA_SOCIAL']),
    scope: z.enum(['ALL_PRODUCTS', 'PRODUCT_TYPE', 'PRODUCT']),
    productType: z.enum(['WATER_REFILL', 'CONTAINER', 'DISPENSER', 'OTHER']).optional(),
    productId: z.string().optional(),
    adjustmentValue: z
      .number({ invalid_type_error: 'El ajuste debe ser un número' })
      .int('El ajuste debe ser un entero')
      .min(-100, 'El ajuste mínimo es -100%')
      .max(1000, 'El ajuste máximo es 1000%'),
    priority: z.number().int().min(-10000).max(10000).default(0),
    active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.scope === 'ALL_PRODUCTS') {
      if (data.productType !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['productType'],
          message: 'Debe estar vacío cuando el alcance es todos los productos',
        });
      }
      if (data.productId !== undefined && data.productId !== '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['productId'],
          message: 'Debe estar vacío cuando el alcance es todos los productos',
        });
      }
    }
    if (data.scope === 'PRODUCT_TYPE') {
      if (!data.productType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['productType'],
          message: 'Requerido cuando el alcance es por tipo',
        });
      }
      if (data.productId !== undefined && data.productId !== '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['productId'],
          message: 'Debe estar vacío cuando el alcance es por tipo',
        });
      }
    }
    if (data.scope === 'PRODUCT') {
      if (!data.productId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['productId'],
          message: 'Requerido cuando el alcance es por producto',
        });
      }
      if (data.productType !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['productType'],
          message: 'Debe estar vacío cuando el alcance es por producto',
        });
      }
    }
  });

export type PricingRuleFormValues = z.infer<typeof pricingRuleFormSchema>;
