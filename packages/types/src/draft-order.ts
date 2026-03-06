export type DraftStatus =
  | 'anonymous_draft'
  | 'identified_draft'
  | 'verified_draft'
  | 'checkout_ready'
  | 'submitted_order'
  | 'in_review'
  | 'in_production'
  | 'shipped';

export type ContainerType = 'aluminum_tin' | 'bamboo_container' | 'wooden_box';

export interface DraftOrder {
  id: string;
  status: DraftStatus;
  email?: string;
  emailVerifiedAt?: string;
  shopifyCustomerId?: string;
  containerType?: ContainerType;
  engravingText?: string;
  designHelpRequested: boolean;
  designHelpNotes?: string;
  subtotalCents: number;
  currency: 'USD';
  createdAt: string;
  updatedAt: string;
}

export type DraftEventType =
  | 'draft_created'
  | 'draft_autosaved'
  | 'email_captured'
  | 'email_verified'
  | 'design_asset_uploaded'
  | 'design_validated'
  | 'recipient_file_uploaded'
  | 'recipient_rows_validated'
  | 'draft_marked_checkout_ready'
  | 'checkout_completed'
  | 'design_help_requested'
  | 'order_approved'
  | 'order_production_started'
  | 'order_shipped';

export interface DraftEvent<T = Record<string, unknown>> {
  draftOrderId: string;
  type: DraftEventType;
  actorType: 'customer' | 'system' | 'admin';
  actorId?: string;
  payload?: T;
  createdAt: string;
}
