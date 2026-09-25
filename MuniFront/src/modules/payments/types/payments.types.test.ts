import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  PAYMENT_METHOD_LABEL,
  PAYMENT_ALLOWED_MIME,
  isPaymentAllowedMime,
  PAYMENT_RECEIPT_MAX_BYTES,
} from '@/modules/payments/types/payments.types';

describe('payments.types — display helpers', () => {
  it('formats bytes consistently', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.00 MB');
  });

  it('exposes all four statuses with stable labels', () => {
    expect(PAYMENT_STATUS_LABEL.PENDING).toBe('Pendiente');
    expect(PAYMENT_STATUS_LABEL.APPROVED).toBe('Aprobado');
    expect(PAYMENT_STATUS_LABEL.REJECTED).toBe('Rechazado');
    expect(PAYMENT_STATUS_LABEL.REVERSED).toBe('Revertido');
  });

  it('exposes payment method labels', () => {
    expect(PAYMENT_METHOD_LABEL.BANK_TRANSFER).toBe('Transferencia bancaria');
    expect(PAYMENT_METHOD_LABEL.BANK_DEPOSIT).toBe('Depósito bancario');
    expect(PAYMENT_METHOD_LABEL.OTHER).toBe('Otro');
  });

  it('tones match the status badges', () => {
    expect(PAYMENT_STATUS_TONE.PENDING).toBe('warning');
    expect(PAYMENT_STATUS_TONE.APPROVED).toBe('success');
    expect(PAYMENT_STATUS_TONE.REJECTED).toBe('danger');
    expect(PAYMENT_STATUS_TONE.REVERSED).toBe('neutral');
  });

  it('validates allowed MIME types', () => {
    expect(isPaymentAllowedMime('image/jpeg')).toBe(true);
    expect(isPaymentAllowedMime('image/png')).toBe(true);
    expect(isPaymentAllowedMime('image/webp')).toBe(true);
    expect(isPaymentAllowedMime('application/pdf')).toBe(true);
    expect(isPaymentAllowedMime('image/svg+xml')).toBe(false);
    expect(isPaymentAllowedMime('text/html')).toBe(false);
  });

  it('exposes the 4 MIME types', () => {
    expect(PAYMENT_ALLOWED_MIME).toEqual([
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]);
  });

  it('exposes the 8MB max receipt size', () => {
    expect(PAYMENT_RECEIPT_MAX_BYTES).toBe(8 * 1024 * 1024);
  });
});