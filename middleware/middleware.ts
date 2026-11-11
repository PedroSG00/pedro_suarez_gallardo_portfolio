/**
 * Legacy entry point — kept so the middleware unit test (T6) can continue to
 * import a `middleware` export. Next.js 16 only loads the root `proxy.ts`.
 */

export { proxy as middleware, config } from '../proxy';
