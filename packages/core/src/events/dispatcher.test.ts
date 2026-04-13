import {describe, it, expect, vi} from 'vitest';
import {EventDispatcher} from './dispatcher';
import type {DraftEvent} from '@snm/types/draft-order';
import type {EventSink} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEvent(overrides: Partial<DraftEvent> = {}): DraftEvent {
  return {
    draftOrderId: 'order-abc',
    type: 'draft_created',
    actorType: 'customer',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

function makeSink(impl?: Partial<EventSink>): EventSink {
  return {
    send: vi.fn().mockResolvedValue(undefined),
    ...impl
  };
}

// ---------------------------------------------------------------------------
// dispatch() calls send() on all registered sinks
// ---------------------------------------------------------------------------

describe('EventDispatcher.dispatch', () => {
  it('calls send() on a single registered sink', async () => {
    const sink = makeSink();
    const dispatcher = new EventDispatcher([sink]);
    const event = makeEvent();

    await dispatcher.dispatch(event);

    expect(sink.send).toHaveBeenCalledTimes(1);
    expect(sink.send).toHaveBeenCalledWith(event);
  });

  it('calls send() on every registered sink when multiple sinks are present', async () => {
    const sink1 = makeSink();
    const sink2 = makeSink();
    const sink3 = makeSink();
    const dispatcher = new EventDispatcher([sink1, sink2, sink3]);
    const event = makeEvent();

    await dispatcher.dispatch(event);

    expect(sink1.send).toHaveBeenCalledOnce();
    expect(sink2.send).toHaveBeenCalledOnce();
    expect(sink3.send).toHaveBeenCalledOnce();
  });

  it('passes the exact event object to each sink', async () => {
    const sink1 = makeSink();
    const sink2 = makeSink();
    const dispatcher = new EventDispatcher([sink1, sink2]);
    const event = makeEvent({
      draftOrderId: 'order-xyz',
      type: 'email_captured',
      actorType: 'system',
      actorId: 'sys-1',
      payload: {email: 'buyer@example.com'}
    });

    await dispatcher.dispatch(event);

    expect(sink1.send).toHaveBeenCalledWith(event);
    expect(sink2.send).toHaveBeenCalledWith(event);
  });

  // -------------------------------------------------------------------------
  // Event shape matches DraftEvent type
  // -------------------------------------------------------------------------

  it('works with every DraftEventType value', async () => {
    const eventTypes: DraftEvent['type'][] = [
      'draft_created',
      'draft_autosaved',
      'email_captured',
      'email_verified',
      'design_asset_uploaded',
      'design_validated',
      'recipient_file_uploaded',
      'recipient_rows_validated',
      'draft_marked_checkout_ready',
      'checkout_completed',
      'design_help_requested',
      'order_approved',
      'order_production_started',
      'order_shipped'
    ];

    for (const type of eventTypes) {
      const sink = makeSink();
      const dispatcher = new EventDispatcher([sink]);
      const event = makeEvent({type});
      await dispatcher.dispatch(event);
      expect(sink.send).toHaveBeenCalledWith(event);
    }
  });

  it('passes events with optional actorId correctly', async () => {
    const sink = makeSink();
    const dispatcher = new EventDispatcher([sink]);

    const eventWithActor = makeEvent({actorType: 'admin', actorId: 'admin-007'});
    await dispatcher.dispatch(eventWithActor);
    expect(sink.send).toHaveBeenCalledWith(eventWithActor);
  });

  it('passes events with payload correctly', async () => {
    const sink = makeSink();
    const dispatcher = new EventDispatcher([sink]);
    const event = makeEvent({
      type: 'email_captured',
      payload: {email: 'buyer@example.com', source: 'customizer'}
    });

    await dispatcher.dispatch(event);
    expect(sink.send).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {email: 'buyer@example.com', source: 'customizer'}
      })
    );
  });

  // -------------------------------------------------------------------------
  // One sink throwing doesn't prevent other sinks from receiving
  // -------------------------------------------------------------------------

  it('still calls remaining sinks even if one sink throws', async () => {
    const failingSink: EventSink = {
      send: vi.fn().mockRejectedValue(new Error('Klaviyo is down'))
    };
    const workingSink1 = makeSink();
    const workingSink2 = makeSink();
    const dispatcher = new EventDispatcher([workingSink1, failingSink, workingSink2]);
    const event = makeEvent();

    // Promise.all rejects when any promise rejects — the dispatcher throws
    await expect(dispatcher.dispatch(event)).rejects.toThrow('Klaviyo is down');

    // But all sinks were started — working sinks received the event
    expect(workingSink1.send).toHaveBeenCalledWith(event);
    expect(failingSink.send).toHaveBeenCalledWith(event);
    expect(workingSink2.send).toHaveBeenCalledWith(event);
  });

  it('resolves successfully when all sinks succeed', async () => {
    const sink1 = makeSink();
    const sink2 = makeSink();
    const dispatcher = new EventDispatcher([sink1, sink2]);

    await expect(dispatcher.dispatch(makeEvent())).resolves.toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Empty sinks array works without error
  // -------------------------------------------------------------------------

  it('resolves without error when no sinks are registered', async () => {
    const dispatcher = new EventDispatcher([]);
    await expect(dispatcher.dispatch(makeEvent())).resolves.toBeUndefined();
  });

  it('dispatching multiple events to empty sinks never throws', async () => {
    const dispatcher = new EventDispatcher([]);
    const events = [
      makeEvent({type: 'draft_created'}),
      makeEvent({type: 'email_captured'}),
      makeEvent({type: 'email_verified'})
    ];

    for (const event of events) {
      await expect(dispatcher.dispatch(event)).resolves.toBeUndefined();
    }
  });

  // -------------------------------------------------------------------------
  // Promise.all fan-out behavior — all sinks fire concurrently
  // -------------------------------------------------------------------------

  it('dispatches to all sinks concurrently (Promise.all behavior)', async () => {
    const callOrder: number[] = [];

    const slowSink: EventSink = {
      send: vi.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              callOrder.push(1);
              resolve();
            }, 10);
          })
      )
    };

    const fastSink: EventSink = {
      send: vi.fn().mockImplementation(() => {
        callOrder.push(2);
        return Promise.resolve();
      })
    };

    const dispatcher = new EventDispatcher([slowSink, fastSink]);
    await dispatcher.dispatch(makeEvent());

    // Both were called (order: fast resolves first, slow resolves after)
    expect(slowSink.send).toHaveBeenCalledOnce();
    expect(fastSink.send).toHaveBeenCalledOnce();
    // Both registered calls, fast one completes first
    expect(callOrder).toEqual([2, 1]);
  });
});
