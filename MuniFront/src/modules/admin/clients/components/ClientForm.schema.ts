import { z } from 'zod';

const trimmedRequired = (max: number, message: string) =>
  z.string().min(1, message).max(max, `Máximo ${max} caracteres`);

const trimmedOptional = (max: number) =>
  z.string().max(max, `Máximo ${max} caracteres`).optional().or(z.literal(''));

const addressSchema = z.object({
  street: trimmedRequired(120, 'La calle es obligatoria'),
  number: trimmedRequired(20, 'La altura es obligatoria'),
  floor: trimmedOptional(10),
  apartment: trimmedOptional(10),
  neighborhood: trimmedOptional(80),
  locality: trimmedRequired(80, 'La localidad es obligatoria'),
  postalCode: trimmedOptional(20),
  references: trimmedOptional(240),
});

export const clientFormSchema = z.object({
  firstName: trimmedRequired(80, 'El nombre es obligatorio'),
  lastName: trimmedRequired(80, 'El apellido es obligatorio'),
  documentType: z.enum(['DNI', 'CUIT', 'CUIL', 'OTHER']).optional(),
  documentNumber: trimmedOptional(32),
  phone: trimmedOptional(40),
  email: z
    .string()
    .max(160, 'Máximo 160 caracteres')
    .refine(
      (v) => v.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'Email inválido',
    )
    .optional()
    .or(z.literal('')),
  clientType: z.enum(['LOCAL', 'JUBILADO', 'NO_LOCAL', 'AYUDA_SOCIAL']),
  address: addressSchema,
  zona: trimmedOptional(32),
  notes: z.string().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
  active: z.boolean(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
