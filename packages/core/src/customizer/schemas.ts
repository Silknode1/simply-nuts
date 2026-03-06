import {z} from 'zod';

const containerType = z.enum(['aluminum_tin', 'bamboo_container', 'wooden_box']);

export const draftCreateSchema = z.object({
  containerType: containerType.optional()
});

export const draftPatchSchema = z.object({
  containerType: containerType.optional(),
  engravingText: z.string().max(120).optional(),
  designHelpRequested: z.boolean().optional(),
  designHelpNotes: z.string().max(2000).optional(),
  subtotalCents: z.number().int().min(0).optional()
});

export const emailCaptureSchema = z.object({
  email: z.email()
});

export const emailVerifySchema = z.object({
  token: z.string().min(6)
});

export const recipientUploadSchema = z.object({
  fileType: z.enum(['csv', 'xlsx', 'google_sheet']),
  sourceUrl: z.url()
});

export const recipientValidateSchema = z.object({
  mapping: z.record(z.string(), z.string()).default({})
});

export const markCheckoutReadySchema = z.object({
  confirmNoPendingValidation: z.literal(true)
});
