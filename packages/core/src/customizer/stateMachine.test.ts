import {describe, it, expect, beforeEach} from 'vitest';
import {reduceDraft} from './stateMachine';
import type {DraftOrder} from '@snm/types/draft-order';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeOrder(overrides: Partial<DraftOrder> = {}): DraftOrder {
  return {
    id: 'order-1',
    status: 'anonymous_draft',
    designHelpRequested: false,
    subtotalCents: 0,
    currency: 'USD',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  };
}

// ---------------------------------------------------------------------------
// CREATE_DRAFT
// ---------------------------------------------------------------------------

describe('CREATE_DRAFT', () => {
  it('returns the order unchanged', () => {
    const order = makeOrder();
    const result = reduceDraft(order, {type: 'CREATE_DRAFT'});
    expect(result).toBe(order); // exact same reference
  });

  it('does not mutate or change any fields', () => {
    const order = makeOrder({email: 'test@example.com', subtotalCents: 500});
    const result = reduceDraft(order, {type: 'CREATE_DRAFT'});
    expect(result).toEqual(order);
  });
});

// ---------------------------------------------------------------------------
// CAPTURE_EMAIL  anonymous_draft → identified_draft
// ---------------------------------------------------------------------------

describe('CAPTURE_EMAIL', () => {
  it('transitions anonymous_draft to identified_draft', () => {
    const order = makeOrder();
    const result = reduceDraft(order, {type: 'CAPTURE_EMAIL', email: 'buyer@example.com'});
    expect(result.status).toBe('identified_draft');
  });

  it('sets the email field', () => {
    const order = makeOrder();
    const result = reduceDraft(order, {type: 'CAPTURE_EMAIL', email: 'buyer@example.com'});
    expect(result.email).toBe('buyer@example.com');
  });

  it('sets updatedAt', () => {
    const before = new Date().toISOString();
    const order = makeOrder({updatedAt: '2024-01-01T00:00:00.000Z'});
    const result = reduceDraft(order, {type: 'CAPTURE_EMAIL', email: 'buyer@example.com'});
    expect(result.updatedAt >= before).toBe(true);
  });

  it('preserves all other fields', () => {
    const order = makeOrder({subtotalCents: 1500, containerType: 'wooden_box'});
    const result = reduceDraft(order, {type: 'CAPTURE_EMAIL', email: 'buyer@example.com'});
    expect(result.subtotalCents).toBe(1500);
    expect(result.containerType).toBe('wooden_box');
    expect(result.id).toBe('order-1');
  });

  it('throws when transitioning from a disallowed state (e.g. shipped)', () => {
    const order = makeOrder({
      status: 'shipped',
      email: 'old@example.com',
      emailVerifiedAt: '2024-01-01T00:00:00.000Z'
    });
    expect(() =>
      reduceDraft(order, {type: 'CAPTURE_EMAIL', email: 'buyer@example.com'})
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// VERIFY_EMAIL  identified_draft → verified_draft
// ---------------------------------------------------------------------------

describe('VERIFY_EMAIL', () => {
  it('transitions identified_draft to verified_draft', () => {
    const order = makeOrder({status: 'identified_draft', email: 'buyer@example.com'});
    const result = reduceDraft(order, {
      type: 'VERIFY_EMAIL',
      verifiedAtISO: '2024-06-01T10:00:00.000Z'
    });
    expect(result.status).toBe('verified_draft');
  });

  it('sets emailVerifiedAt to the provided ISO string', () => {
    const order = makeOrder({status: 'identified_draft', email: 'buyer@example.com'});
    const result = reduceDraft(order, {
      type: 'VERIFY_EMAIL',
      verifiedAtISO: '2024-06-01T10:00:00.000Z'
    });
    expect(result.emailVerifiedAt).toBe('2024-06-01T10:00:00.000Z');
  });

  it('sets updatedAt', () => {
    const before = new Date().toISOString();
    const order = makeOrder({status: 'identified_draft', email: 'buyer@example.com'});
    const result = reduceDraft(order, {
      type: 'VERIFY_EMAIL',
      verifiedAtISO: '2024-06-01T10:00:00.000Z'
    });
    expect(result.updatedAt >= before).toBe(true);
  });

  it('preserves email across the transition', () => {
    const order = makeOrder({status: 'identified_draft', email: 'buyer@example.com'});
    const result = reduceDraft(order, {
      type: 'VERIFY_EMAIL',
      verifiedAtISO: '2024-06-01T10:00:00.000Z'
    });
    expect(result.email).toBe('buyer@example.com');
  });

  it('throws when called from anonymous_draft (not yet identified)', () => {
    const order = makeOrder({status: 'anonymous_draft'});
    expect(() =>
      reduceDraft(order, {type: 'VERIFY_EMAIL', verifiedAtISO: '2024-06-01T10:00:00.000Z'})
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// MARK_CHECKOUT_READY  verified_draft → checkout_ready
// ---------------------------------------------------------------------------

describe('MARK_CHECKOUT_READY', () => {
  it('transitions verified_draft to checkout_ready when emailVerifiedAt is set', () => {
    const order = makeOrder({
      status: 'verified_draft',
      email: 'buyer@example.com',
      emailVerifiedAt: '2024-06-01T10:00:00.000Z'
    });
    const result = reduceDraft(order, {type: 'MARK_CHECKOUT_READY'});
    expect(result.status).toBe('checkout_ready');
  });

  it('throws if emailVerifiedAt is missing', () => {
    const order = makeOrder({
      status: 'verified_draft',
      email: 'buyer@example.com'
      // no emailVerifiedAt
    });
    expect(() => reduceDraft(order, {type: 'MARK_CHECKOUT_READY'})).toThrowError(
      'Email verification required before checkout_ready'
    );
  });

  it('sets updatedAt', () => {
    const before = new Date().toISOString();
    const order = makeOrder({
      status: 'verified_draft',
      email: 'buyer@example.com',
      emailVerifiedAt: '2024-06-01T10:00:00.000Z'
    });
    const result = reduceDraft(order, {type: 'MARK_CHECKOUT_READY'});
    expect(result.updatedAt >= before).toBe(true);
  });

  it('throws when transitioning from anonymous_draft (invalid transition + missing emailVerifiedAt)', () => {
    const order = makeOrder({status: 'anonymous_draft'});
    expect(() => reduceDraft(order, {type: 'MARK_CHECKOUT_READY'})).toThrow();
  });

  it('throws when transitioning from identified_draft (invalid transition even with emailVerifiedAt)', () => {
    // emailVerifiedAt is set but the wrong state — the transition guard fires first
    // OR the business guard fires first depending on implementation order.
    // Either way it must throw.
    const order = makeOrder({
      status: 'identified_draft',
      email: 'buyer@example.com',
      emailVerifiedAt: '2024-06-01T10:00:00.000Z'
    });
    expect(() => reduceDraft(order, {type: 'MARK_CHECKOUT_READY'})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// CHECKOUT_COMPLETED  checkout_ready → submitted_order
// ---------------------------------------------------------------------------

describe('CHECKOUT_COMPLETED', () => {
  it('transitions checkout_ready to submitted_order', () => {
    const order = makeOrder({
      status: 'checkout_ready',
      email: 'buyer@example.com',
      emailVerifiedAt: '2024-06-01T10:00:00.000Z'
    });
    const result = reduceDraft(order, {type: 'CHECKOUT_COMPLETED'});
    expect(result.status).toBe('submitted_order');
  });

  it('sets updatedAt', () => {
    const before = new Date().toISOString();
    const order = makeOrder({
      status: 'checkout_ready',
      email: 'buyer@example.com',
      emailVerifiedAt: '2024-06-01T10:00:00.000Z'
    });
    const result = reduceDraft(order, {type: 'CHECKOUT_COMPLETED'});
    expect(result.updatedAt >= before).toBe(true);
  });

  it('throws when called from anonymous_draft', () => {
    const order = makeOrder();
    expect(() => reduceDraft(order, {type: 'CHECKOUT_COMPLETED'})).toThrow();
  });

  it('throws when called from verified_draft (skips checkout_ready)', () => {
    const order = makeOrder({
      status: 'verified_draft',
      emailVerifiedAt: '2024-06-01T10:00:00.000Z'
    });
    expect(() => reduceDraft(order, {type: 'CHECKOUT_COMPLETED'})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// REQUEST_DESIGN_HELP  submitted_order → in_review
// ---------------------------------------------------------------------------

describe('REQUEST_DESIGN_HELP', () => {
  it('transitions submitted_order to in_review', () => {
    const order = makeOrder({status: 'submitted_order'});
    const result = reduceDraft(order, {type: 'REQUEST_DESIGN_HELP'});
    expect(result.status).toBe('in_review');
  });

  it('sets designHelpRequested to true', () => {
    const order = makeOrder({status: 'submitted_order'});
    const result = reduceDraft(order, {type: 'REQUEST_DESIGN_HELP'});
    expect(result.designHelpRequested).toBe(true);
  });

  it('sets designHelpNotes when notes are provided', () => {
    const order = makeOrder({status: 'submitted_order'});
    const result = reduceDraft(order, {
      type: 'REQUEST_DESIGN_HELP',
      notes: 'Please use our brand font.'
    });
    expect(result.designHelpNotes).toBe('Please use our brand font.');
  });

  it('designHelpNotes is undefined when no notes provided', () => {
    const order = makeOrder({status: 'submitted_order'});
    const result = reduceDraft(order, {type: 'REQUEST_DESIGN_HELP'});
    expect(result.designHelpNotes).toBeUndefined();
  });

  it('sets updatedAt', () => {
    const before = new Date().toISOString();
    const order = makeOrder({status: 'submitted_order'});
    const result = reduceDraft(order, {type: 'REQUEST_DESIGN_HELP'});
    expect(result.updatedAt >= before).toBe(true);
  });

  it('throws when called from anonymous_draft (invalid transition)', () => {
    const order = makeOrder();
    expect(() => reduceDraft(order, {type: 'REQUEST_DESIGN_HELP'})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// APPROVE_ORDER  submitted_order → in_production  (or in_review → in_production)
// ---------------------------------------------------------------------------

describe('APPROVE_ORDER', () => {
  it('transitions submitted_order directly to in_production', () => {
    const order = makeOrder({status: 'submitted_order'});
    const result = reduceDraft(order, {type: 'APPROVE_ORDER'});
    expect(result.status).toBe('in_production');
  });

  it('transitions in_review to in_production', () => {
    const order = makeOrder({status: 'in_review'});
    const result = reduceDraft(order, {type: 'APPROVE_ORDER'});
    expect(result.status).toBe('in_production');
  });

  it('sets updatedAt', () => {
    const before = new Date().toISOString();
    const order = makeOrder({status: 'submitted_order'});
    const result = reduceDraft(order, {type: 'APPROVE_ORDER'});
    expect(result.updatedAt >= before).toBe(true);
  });

  it('throws when called from anonymous_draft', () => {
    const order = makeOrder();
    expect(() => reduceDraft(order, {type: 'APPROVE_ORDER'})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// START_PRODUCTION  submitted_order → in_production  (or in_review → in_production)
// ---------------------------------------------------------------------------

describe('START_PRODUCTION', () => {
  it('transitions submitted_order to in_production', () => {
    const order = makeOrder({status: 'submitted_order'});
    const result = reduceDraft(order, {type: 'START_PRODUCTION'});
    expect(result.status).toBe('in_production');
  });

  it('transitions in_review to in_production', () => {
    const order = makeOrder({status: 'in_review'});
    const result = reduceDraft(order, {type: 'START_PRODUCTION'});
    expect(result.status).toBe('in_production');
  });

  it('sets updatedAt', () => {
    const before = new Date().toISOString();
    const order = makeOrder({status: 'in_review'});
    const result = reduceDraft(order, {type: 'START_PRODUCTION'});
    expect(result.updatedAt >= before).toBe(true);
  });

  it('throws when called from shipped (terminal state)', () => {
    const order = makeOrder({status: 'shipped'});
    expect(() => reduceDraft(order, {type: 'START_PRODUCTION'})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// SHIP_ORDER  in_production → shipped
// ---------------------------------------------------------------------------

describe('SHIP_ORDER', () => {
  it('transitions in_production to shipped', () => {
    const order = makeOrder({status: 'in_production'});
    const result = reduceDraft(order, {type: 'SHIP_ORDER'});
    expect(result.status).toBe('shipped');
  });

  it('sets updatedAt', () => {
    const before = new Date().toISOString();
    const order = makeOrder({status: 'in_production'});
    const result = reduceDraft(order, {type: 'SHIP_ORDER'});
    expect(result.updatedAt >= before).toBe(true);
  });

  it('preserves all other fields at the final state', () => {
    const order = makeOrder({
      status: 'in_production',
      email: 'buyer@example.com',
      emailVerifiedAt: '2024-06-01T10:00:00.000Z',
      subtotalCents: 3999,
      containerType: 'wooden_box',
      designHelpRequested: true,
      designHelpNotes: 'Use gold engraving'
    });
    const result = reduceDraft(order, {type: 'SHIP_ORDER'});
    expect(result.email).toBe('buyer@example.com');
    expect(result.emailVerifiedAt).toBe('2024-06-01T10:00:00.000Z');
    expect(result.subtotalCents).toBe(3999);
    expect(result.containerType).toBe('wooden_box');
    expect(result.designHelpRequested).toBe(true);
    expect(result.designHelpNotes).toBe('Use gold engraving');
  });

  it('throws when called from anonymous_draft (invalid — skipping many states)', () => {
    const order = makeOrder();
    expect(() => reduceDraft(order, {type: 'SHIP_ORDER'})).toThrowError(
      'Invalid transition: anonymous_draft -> shipped'
    );
  });

  it('throws when called from submitted_order (must go through in_production)', () => {
    const order = makeOrder({status: 'submitted_order'});
    expect(() => reduceDraft(order, {type: 'SHIP_ORDER'})).toThrow();
  });

  it('throws when called from shipped again (terminal state)', () => {
    const order = makeOrder({status: 'shipped'});
    expect(() => reduceDraft(order, {type: 'SHIP_ORDER'})).toThrowError(
      'Invalid transition: shipped -> shipped'
    );
  });
});

// ---------------------------------------------------------------------------
// Full happy-path lifecycle
// ---------------------------------------------------------------------------

describe('Full order lifecycle', () => {
  it('walks through all states from anonymous_draft to shipped', () => {
    let order = makeOrder();

    // Step 1: capture email
    order = reduceDraft(order, {type: 'CAPTURE_EMAIL', email: 'corp@example.com'});
    expect(order.status).toBe('identified_draft');

    // Step 2: verify email
    order = reduceDraft(order, {
      type: 'VERIFY_EMAIL',
      verifiedAtISO: '2024-06-01T10:00:00.000Z'
    });
    expect(order.status).toBe('verified_draft');

    // Step 3: mark checkout ready
    order = reduceDraft(order, {type: 'MARK_CHECKOUT_READY'});
    expect(order.status).toBe('checkout_ready');

    // Step 4: checkout completed
    order = reduceDraft(order, {type: 'CHECKOUT_COMPLETED'});
    expect(order.status).toBe('submitted_order');

    // Step 5: request design help (goes to in_review)
    order = reduceDraft(order, {
      type: 'REQUEST_DESIGN_HELP',
      notes: 'Please engrave logo in gold'
    });
    expect(order.status).toBe('in_review');

    // Step 6: start production
    order = reduceDraft(order, {type: 'START_PRODUCTION'});
    expect(order.status).toBe('in_production');

    // Step 7: ship
    order = reduceDraft(order, {type: 'SHIP_ORDER'});
    expect(order.status).toBe('shipped');

    // Final state assertions — all accumulated fields intact
    expect(order.email).toBe('corp@example.com');
    expect(order.emailVerifiedAt).toBe('2024-06-01T10:00:00.000Z');
    expect(order.designHelpRequested).toBe(true);
    expect(order.designHelpNotes).toBe('Please engrave logo in gold');
  });

  it('walks the fast-track path: skipping in_review via APPROVE_ORDER', () => {
    let order = makeOrder();

    order = reduceDraft(order, {type: 'CAPTURE_EMAIL', email: 'corp@example.com'});
    order = reduceDraft(order, {
      type: 'VERIFY_EMAIL',
      verifiedAtISO: '2024-06-01T10:00:00.000Z'
    });
    order = reduceDraft(order, {type: 'MARK_CHECKOUT_READY'});
    order = reduceDraft(order, {type: 'CHECKOUT_COMPLETED'});
    order = reduceDraft(order, {type: 'APPROVE_ORDER'});
    expect(order.status).toBe('in_production');

    order = reduceDraft(order, {type: 'SHIP_ORDER'});
    expect(order.status).toBe('shipped');
  });
});

// ---------------------------------------------------------------------------
// Invalid transition matrix — selected critical cross-state jumps
// ---------------------------------------------------------------------------

describe('Invalid transitions', () => {
  const invalidPairs: Array<{from: Partial<DraftOrder>; label: string}> = [
    {from: {status: 'anonymous_draft'}, label: 'anonymous_draft → shipped via SHIP_ORDER'},
    {from: {status: 'anonymous_draft'}, label: 'anonymous_draft → in_production via APPROVE_ORDER'},
    {from: {status: 'checkout_ready'}, label: 'checkout_ready → identified_draft via CAPTURE_EMAIL'}
  ];

  it('anonymous_draft cannot jump directly to shipped', () => {
    const order = makeOrder({status: 'anonymous_draft'});
    expect(() => reduceDraft(order, {type: 'SHIP_ORDER'})).toThrow();
  });

  it('anonymous_draft cannot jump directly to in_production', () => {
    const order = makeOrder({status: 'anonymous_draft'});
    expect(() => reduceDraft(order, {type: 'APPROVE_ORDER'})).toThrow();
  });

  it('shipped is a terminal state — no further transitions possible', () => {
    const order = makeOrder({status: 'shipped'});
    expect(() => reduceDraft(order, {type: 'CHECKOUT_COMPLETED'})).toThrow();
    expect(() => reduceDraft(order, {type: 'APPROVE_ORDER'})).toThrow();
    expect(() => reduceDraft(order, {type: 'START_PRODUCTION'})).toThrow();
    expect(() => reduceDraft(order, {type: 'SHIP_ORDER'})).toThrow();
  });

  it('in_production cannot go back to submitted_order', () => {
    const order = makeOrder({status: 'in_production'});
    expect(() => reduceDraft(order, {type: 'CHECKOUT_COMPLETED'})).toThrow();
  });

  it('verified_draft cannot skip checkout_ready and go directly to submitted_order', () => {
    const order = makeOrder({
      status: 'verified_draft',
      emailVerifiedAt: '2024-06-01T10:00:00.000Z'
    });
    expect(() => reduceDraft(order, {type: 'CHECKOUT_COMPLETED'})).toThrow();
  });

  it('error message contains the transition info', () => {
    const order = makeOrder({status: 'shipped'});
    expect(() => reduceDraft(order, {type: 'SHIP_ORDER'})).toThrowError(
      /Invalid transition: shipped -> shipped/
    );
  });
});
