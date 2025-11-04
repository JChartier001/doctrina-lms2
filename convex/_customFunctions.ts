import { customCtx, customMutation } from 'convex-helpers/server/customFunctions';

import { mutation as rawMutation } from './_generated/server';
import { triggers } from './triggers';

/**
 * Custom mutation wrapper that enables database triggers
 * Use this instead of raw mutation from _generated/server
 *
 * This wrapper integrates the triggers system (convex-helpers) so that
 * all ctx.db operations automatically fire registered triggers.
 *
 * @example
 * import { mutation } from './_customFunctions';
 *
 * export const myMutation = mutation({
 *   args: { ... },
 *   handler: async (ctx, args) => {
 *     // Triggers automatically fire when using ctx.db operations
 *   }
 * });
 *
 * @see convex/triggers.ts - Trigger registration
 */
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
