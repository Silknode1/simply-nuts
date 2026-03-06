import type {DraftEvent} from '@snm/types/draft-order';
import type {EventSink} from './types';

export class EventDispatcher {
  constructor(private readonly sinks: EventSink[]) {}

  async dispatch(event: DraftEvent): Promise<void> {
    await Promise.all(this.sinks.map((sink) => sink.send(event)));
  }
}
