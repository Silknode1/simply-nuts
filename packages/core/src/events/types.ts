import type {DraftEvent} from '@snm/types/draft-order';

export interface EventSink {
  send(event: DraftEvent): Promise<void>;
}
