import type {DraftEvent} from '@snm/types/draft-order';
import type {EventSink} from '../types';

export class KlaviyoSink implements EventSink {
  constructor(private readonly apiKey: string) {}

  async send(event: DraftEvent): Promise<void> {
    if (!this.apiKey) return;

    const payload = {
      data: {
        type: 'event',
        attributes: {
          properties: event.payload ?? {},
          metric: {
            data: {
              type: 'metric',
              attributes: {
                name: `SNM ${event.type}`
              }
            }
          },
          time: event.createdAt,
          value: 1,
          unique_id: `${event.draftOrderId}:${event.type}:${event.createdAt}`
        }
      }
    };

    await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Klaviyo-API-Key ${this.apiKey}`,
        revision: '2024-10-15'
      },
      body: JSON.stringify(payload)
    });
  }
}
