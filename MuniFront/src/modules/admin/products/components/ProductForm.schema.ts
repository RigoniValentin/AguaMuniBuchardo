import { z } from 'zod';

export const productFormSchema = z.object({
  code: z
    .string()
    .min(1, 'El código es obligatorio')
    .max(40, 'Máximo 40 caracteres')
    .regex(/^[A-Za-z0-9_\-\s.]+$/, 'Solo letras, números y guion bajo'),
  name: z.string().min(1, 'El nombre es obligatorio').max(120, 'Máximo 120 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  productType: z.enum(['WATER_REFILL', 'CONTAINER', 'DISPENSER', 'OTHER']),
  basePriceArs: z
    .string()
    .min(1, 'El precio es obligatorio')
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v.trim()), 'Precio inválido'),
  tracksStock: z.boolean(),
  active: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
