import type {DraftOrder} from '@snm/types/draft-order';

/**
 * In-memory draft store for development.
 *
 * In production this will be replaced with a persistent store
 * (SQLite via DATABASE_URL or a managed database). The interface
 * is intentionally minimal so swapping is trivial.
 */
const drafts = new Map<string, DraftOrder>();

export const draftStore = {
  get(id: string): DraftOrder | undefined {
    return drafts.get(id);
  },

  set(order: DraftOrder): void {
    drafts.set(order.id, order);
  },

  delete(id: string): boolean {
    return drafts.delete(id);
  },
};
