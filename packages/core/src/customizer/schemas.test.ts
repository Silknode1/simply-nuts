import {describe, it, expect} from 'vitest';
import {
  draftCreateSchema,
  draftPatchSchema,
  emailCaptureSchema,
  emailVerifySchema,
  recipientUploadSchema,
  recipientValidateSchema,
  markCheckoutReadySchema
} from './schemas';

// ---------------------------------------------------------------------------
// draftCreateSchema
// ---------------------------------------------------------------------------

describe('draftCreateSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(() => draftCreateSchema.parse({})).not.toThrow();
  });

  it('accepts all valid containerType values', () => {
    const validTypes = ['aluminum_tin', 'bamboo_container', 'wooden_box'] as const;
    for (const containerType of validTypes) {
      expect(() => draftCreateSchema.parse({containerType})).not.toThrow();
    }
  });

  it('rejects an invalid containerType', () => {
    const result = draftCreateSchema.safeParse({containerType: 'cardboard_box'});
    expect(result.success).toBe(false);
  });

  it('parsed result has no containerType when not provided', () => {
    const result = draftCreateSchema.parse({});
    expect(result.containerType).toBeUndefined();
  });

  it('parsed result preserves the containerType when provided', () => {
    const result = draftCreateSchema.parse({containerType: 'wooden_box'});
    expect(result.containerType).toBe('wooden_box');
  });
});

// ---------------------------------------------------------------------------
// draftPatchSchema
// ---------------------------------------------------------------------------

describe('draftPatchSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(() => draftPatchSchema.parse({})).not.toThrow();
  });

  it('accepts a fully populated patch', () => {
    const patch = {
      containerType: 'aluminum_tin',
      engravingText: 'Happy Holidays!',
      designHelpRequested: true,
      designHelpNotes: 'Use our corporate font.',
      subtotalCents: 4999
    };
    const result = draftPatchSchema.parse(patch);
    expect(result.containerType).toBe('aluminum_tin');
    expect(result.engravingText).toBe('Happy Holidays!');
    expect(result.designHelpRequested).toBe(true);
    expect(result.designHelpNotes).toBe('Use our corporate font.');
    expect(result.subtotalCents).toBe(4999);
  });

  it('rejects engravingText exceeding 120 characters', () => {
    const tooLong = 'A'.repeat(121);
    const result = draftPatchSchema.safeParse({engravingText: tooLong});
    expect(result.success).toBe(false);
  });

  it('accepts engravingText at exactly 120 characters', () => {
    const exactly120 = 'A'.repeat(120);
    expect(() => draftPatchSchema.parse({engravingText: exactly120})).not.toThrow();
  });

  it('accepts engravingText as empty string', () => {
    expect(() => draftPatchSchema.parse({engravingText: ''})).not.toThrow();
  });

  it('rejects designHelpNotes exceeding 2000 characters', () => {
    const tooLong = 'B'.repeat(2001);
    const result = draftPatchSchema.safeParse({designHelpNotes: tooLong});
    expect(result.success).toBe(false);
  });

  it('accepts designHelpNotes at exactly 2000 characters', () => {
    const exactly2000 = 'B'.repeat(2000);
    expect(() => draftPatchSchema.parse({designHelpNotes: exactly2000})).not.toThrow();
  });

  it('rejects subtotalCents that is negative', () => {
    const result = draftPatchSchema.safeParse({subtotalCents: -1});
    expect(result.success).toBe(false);
  });

  it('accepts subtotalCents of zero', () => {
    const result = draftPatchSchema.parse({subtotalCents: 0});
    expect(result.subtotalCents).toBe(0);
  });

  it('rejects subtotalCents that is a float', () => {
    const result = draftPatchSchema.safeParse({subtotalCents: 19.99});
    expect(result.success).toBe(false);
  });

  it('rejects an invalid containerType', () => {
    const result = draftPatchSchema.safeParse({containerType: 'paper_bag'});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// emailCaptureSchema
// ---------------------------------------------------------------------------

describe('emailCaptureSchema', () => {
  it('accepts a valid email address', () => {
    const result = emailCaptureSchema.parse({email: 'buyer@example.com'});
    expect(result.email).toBe('buyer@example.com');
  });

  it('accepts a valid email with a subdomain', () => {
    expect(() =>
      emailCaptureSchema.parse({email: 'corp@mail.company.org'})
    ).not.toThrow();
  });

  it('rejects a plain string that is not an email', () => {
    const result = emailCaptureSchema.safeParse({email: 'not-an-email'});
    expect(result.success).toBe(false);
  });

  it('rejects an email missing the domain', () => {
    const result = emailCaptureSchema.safeParse({email: 'buyer@'});
    expect(result.success).toBe(false);
  });

  it('rejects an empty string', () => {
    const result = emailCaptureSchema.safeParse({email: ''});
    expect(result.success).toBe(false);
  });

  it('rejects when the email field is missing entirely', () => {
    const result = emailCaptureSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// emailVerifySchema
// ---------------------------------------------------------------------------

describe('emailVerifySchema', () => {
  it('accepts a token of exactly 6 characters', () => {
    const result = emailVerifySchema.parse({token: '123456'});
    expect(result.token).toBe('123456');
  });

  it('accepts a longer alphanumeric token', () => {
    expect(() => emailVerifySchema.parse({token: 'ABC123XYZ'})).not.toThrow();
  });

  it('rejects a token shorter than 6 characters', () => {
    const result = emailVerifySchema.safeParse({token: '12345'});
    expect(result.success).toBe(false);
  });

  it('rejects an empty string token', () => {
    const result = emailVerifySchema.safeParse({token: ''});
    expect(result.success).toBe(false);
  });

  it('rejects when token field is missing', () => {
    const result = emailVerifySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// recipientUploadSchema
// ---------------------------------------------------------------------------

describe('recipientUploadSchema', () => {
  it('accepts a valid csv upload', () => {
    const result = recipientUploadSchema.parse({
      fileType: 'csv',
      sourceUrl: 'https://storage.example.com/recipients.csv'
    });
    expect(result.fileType).toBe('csv');
    expect(result.sourceUrl).toBe('https://storage.example.com/recipients.csv');
  });

  it('accepts all valid fileType values', () => {
    const types = ['csv', 'xlsx', 'google_sheet'] as const;
    for (const fileType of types) {
      expect(() =>
        recipientUploadSchema.parse({
          fileType,
          sourceUrl: 'https://example.com/file'
        })
      ).not.toThrow();
    }
  });

  it('rejects an invalid fileType', () => {
    const result = recipientUploadSchema.safeParse({
      fileType: 'pdf',
      sourceUrl: 'https://example.com/file.pdf'
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-URL sourceUrl', () => {
    const result = recipientUploadSchema.safeParse({
      fileType: 'csv',
      sourceUrl: 'not-a-url'
    });
    expect(result.success).toBe(false);
  });

  it('rejects when sourceUrl field is missing', () => {
    const result = recipientUploadSchema.safeParse({fileType: 'csv'});
    expect(result.success).toBe(false);
  });

  it('rejects when fileType field is missing', () => {
    const result = recipientUploadSchema.safeParse({
      sourceUrl: 'https://example.com/file.csv'
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// recipientValidateSchema
// ---------------------------------------------------------------------------

describe('recipientValidateSchema', () => {
  it('accepts an empty mapping (defaults to {})', () => {
    const result = recipientValidateSchema.parse({});
    expect(result.mapping).toEqual({});
  });

  it('accepts a mapping with string-to-string entries', () => {
    const result = recipientValidateSchema.parse({
      mapping: {name: 'Full Name', email: 'Email Address'}
    });
    expect(result.mapping).toEqual({name: 'Full Name', email: 'Email Address'});
  });

  it('defaults mapping to {} when not provided', () => {
    const result = recipientValidateSchema.parse({});
    expect(result.mapping).toEqual({});
  });

  it('rejects mapping when values are not strings', () => {
    const result = recipientValidateSchema.safeParse({
      mapping: {name: 42}
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// markCheckoutReadySchema
// ---------------------------------------------------------------------------

describe('markCheckoutReadySchema', () => {
  it('accepts confirmNoPendingValidation: true', () => {
    const result = markCheckoutReadySchema.parse({confirmNoPendingValidation: true});
    expect(result.confirmNoPendingValidation).toBe(true);
  });

  it('rejects confirmNoPendingValidation: false (must be literal true)', () => {
    const result = markCheckoutReadySchema.safeParse({confirmNoPendingValidation: false});
    expect(result.success).toBe(false);
  });

  it('rejects when confirmNoPendingValidation is missing', () => {
    const result = markCheckoutReadySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects when confirmNoPendingValidation is a string "true"', () => {
    const result = markCheckoutReadySchema.safeParse({confirmNoPendingValidation: 'true'});
    expect(result.success).toBe(false);
  });
});
