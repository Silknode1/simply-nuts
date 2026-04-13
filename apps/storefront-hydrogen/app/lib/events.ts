import {EventDispatcher, ConsoleSink} from '@snm/core';

/**
 * Shared event dispatcher instance for the Hydrogen app.
 *
 * In production, add KlaviyoSink and CrmSink here,
 * configured from environment variables.
 */
export const dispatcher = new EventDispatcher([new ConsoleSink()]);
