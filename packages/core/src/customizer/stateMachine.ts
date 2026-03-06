import type {DraftOrder, DraftStatus} from '@snm/types/draft-order';

export type Action =
  | {type: 'CREATE_DRAFT'}
  | {type: 'CAPTURE_EMAIL'; email: string}
  | {type: 'VERIFY_EMAIL'; verifiedAtISO: string}
  | {type: 'MARK_CHECKOUT_READY'}
  | {type: 'CHECKOUT_COMPLETED'}
  | {type: 'REQUEST_DESIGN_HELP'; notes?: string}
  | {type: 'APPROVE_ORDER'}
  | {type: 'START_PRODUCTION'}
  | {type: 'SHIP_ORDER'};

const allowed: Record<DraftStatus, DraftStatus[]> = {
  anonymous_draft: ['identified_draft'],
  identified_draft: ['anonymous_draft', 'verified_draft'],
  verified_draft: ['checkout_ready'],
  checkout_ready: ['submitted_order'],
  submitted_order: ['in_review', 'in_production'],
  in_review: ['in_production'],
  in_production: ['shipped'],
  shipped: []
};

function transition(current: DraftStatus, next: DraftStatus): DraftStatus {
  if (!allowed[current].includes(next)) {
    throw new Error(`Invalid transition: ${current} -> ${next}`);
  }
  return next;
}

export function reduceDraft(order: DraftOrder, action: Action): DraftOrder {
  switch (action.type) {
    case 'CREATE_DRAFT': {
      return order;
    }
    case 'CAPTURE_EMAIL': {
      return {
        ...order,
        email: action.email,
        status: transition(order.status, 'identified_draft'),
        updatedAt: new Date().toISOString()
      };
    }
    case 'VERIFY_EMAIL': {
      return {
        ...order,
        emailVerifiedAt: action.verifiedAtISO,
        status: transition(order.status, 'verified_draft'),
        updatedAt: new Date().toISOString()
      };
    }
    case 'MARK_CHECKOUT_READY': {
      if (!order.emailVerifiedAt) {
        throw new Error('Email verification required before checkout_ready');
      }
      return {
        ...order,
        status: transition(order.status, 'checkout_ready'),
        updatedAt: new Date().toISOString()
      };
    }
    case 'CHECKOUT_COMPLETED': {
      return {
        ...order,
        status: transition(order.status, 'submitted_order'),
        updatedAt: new Date().toISOString()
      };
    }
    case 'REQUEST_DESIGN_HELP': {
      return {
        ...order,
        designHelpRequested: true,
        designHelpNotes: action.notes,
        status: transition(order.status, 'in_review'),
        updatedAt: new Date().toISOString()
      };
    }
    case 'APPROVE_ORDER':
    case 'START_PRODUCTION': {
      return {
        ...order,
        status: transition(order.status, 'in_production'),
        updatedAt: new Date().toISOString()
      };
    }
    case 'SHIP_ORDER': {
      return {
        ...order,
        status: transition(order.status, 'shipped'),
        updatedAt: new Date().toISOString()
      };
    }
    default: {
      return order;
    }
  }
}
