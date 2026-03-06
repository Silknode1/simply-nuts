import type {DraftEvent} from '@snm/types/draft-order';
import type {EventSink} from '../types';

export class ConsoleSink implements EventSink {
  async send(event: DraftEvent): Promise<void> {
    console.log('[event]', JSON.stringify(event));
  }
}
