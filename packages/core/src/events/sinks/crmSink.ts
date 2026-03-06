import type {DraftEvent} from '@snm/types/draft-order';
import type {EventSink} from '../types';

export class CrmSink implements EventSink {
  constructor(private readonly webhookUrl: string) {}

  async send(event: DraftEvent): Promise<void> {
    if (!this.webhookUrl) return;

    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(event)
    });
  }
}
