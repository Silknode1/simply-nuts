import type {DraftOrder} from '@snm/types/draft-order';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function createDraft(): Promise<DraftOrder> {
  await delay(300);
  const now = new Date().toISOString();
  return {
    id: `draft_${Date.now()}`,
    status: 'anonymous_draft',
    designHelpRequested: false,
    subtotalCents: 0,
    currency: 'USD',
    createdAt: now,
    updatedAt: now
  };
}

export async function fetchDraft(id: string): Promise<DraftOrder | null> {
  await delay(200);
  const stored = localStorage.getItem('snm-draft');
  if (!stored) return null;
  const parsed = JSON.parse(stored);
  return parsed?.state?.draft?.id === id ? parsed.state.draft : null;
}

export async function autosaveDraft(_draft: DraftOrder): Promise<{ok: boolean}> {
  await delay(150);
  return {ok: true};
}

export async function captureEmail(draftId: string, email: string): Promise<{sent: boolean}> {
  await delay(400);
  console.log(`[mock] Verification email sent to ${email} for draft ${draftId}`);
  return {sent: true};
}

export async function uploadDesignAsset(_draftId: string, file: File): Promise<{warnings: string[]}> {
  await delay(600);
  const warnings: string[] = [];
  if (file.size > 5_000_000) warnings.push('File exceeds 5MB — may affect print quality');
  if (!file.type.includes('svg') && !file.type.includes('png')) warnings.push('Recommended formats: SVG or PNG');
  return {warnings};
}

export async function uploadRecipients(
  _draftId: string,
  _file: File
): Promise<{rowCount: number; invalidRows: number}> {
  await delay(800);
  return {rowCount: Math.floor(Math.random() * 50) + 12, invalidRows: Math.floor(Math.random() * 3)};
}

export async function submitDraft(_draftId: string): Promise<{orderRef: string}> {
  await delay(500);
  return {orderRef: `SNM-${Date.now().toString(36).toUpperCase()}`};
}
