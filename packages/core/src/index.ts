// Browser-safe exports — no Node.js built-ins here
export * from './commerce/types';
export * from './commerce/mockAdapter';
export * from './commerce/shopifyAdapter';
export * from './customizer/schemas';
export * from './customizer/stateMachine';
export * from './events/types';
export * from './events/dispatcher';
export * from './events/sinks/consoleSink';
export * from './events/sinks/klaviyoSink';
export * from './events/sinks/crmSink';

// Database exports live in @snm/core/server — see server.ts
