import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {DraftOrder, ContainerType} from '@snm/types/draft-order';
import {reduceDraft, type Action} from '@snm/core';

interface DraftStoreState {
  draft: DraftOrder | null;
  createDraft: () => void;
  dispatch: (action: Action) => void;
  updateContainer: (container: ContainerType) => void;
  updateEngravingText: (text: string) => void;
  reset: () => void;
}

export const useDraftStore = create<DraftStoreState>()(
  persist(
    (set, get) => ({
      draft: null,

      createDraft: () => {
        const now = new Date().toISOString();
        set({
          draft: {
            id: `draft_${Date.now()}`,
            status: 'anonymous_draft',
            designHelpRequested: false,
            subtotalCents: 0,
            currency: 'USD',
            createdAt: now,
            updatedAt: now
          }
        });
      },

      dispatch: (action: Action) => {
        const {draft} = get();
        if (!draft) return;
        try {
          set({draft: reduceDraft(draft, action)});
        } catch (e) {
          console.warn('[draft] Invalid transition:', e);
        }
      },

      updateContainer: (container: ContainerType) => {
        const {draft} = get();
        if (!draft) return;
        set({draft: {...draft, containerType: container, updatedAt: new Date().toISOString()}});
      },

      updateEngravingText: (text: string) => {
        const {draft} = get();
        if (!draft) return;
        set({draft: {...draft, engravingText: text, updatedAt: new Date().toISOString()}});
      },

      reset: () => set({draft: null})
    }),
    {name: 'snm-draft'}
  )
);
