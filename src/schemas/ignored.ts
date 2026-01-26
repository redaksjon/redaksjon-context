import { z } from 'zod';
import { BaseEntitySchema } from '@theunwalked/overcontext';

/**
 * Ignored term - phrases the user doesn't want to be prompted about.
 */
export const IgnoredTermSchema = BaseEntitySchema.extend({
  type: z.literal('ignored'),
  
  reason: z.string().optional(),
  ignoredAt: z.string().optional(),  // ISO date string
});
