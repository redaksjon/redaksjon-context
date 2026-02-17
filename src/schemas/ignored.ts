import { z } from 'zod';
import { BaseEntitySchema } from '@utilarium/overcontext';

/**
 * Ignored term - phrases the user doesn't want to be prompted about.
 */
export const IgnoredTermSchema = BaseEntitySchema.merge(z.object({
    type: z.literal('ignored'),
    slug: z.string().optional(),  // Human-readable identifier
  
    reason: z.string().optional(),
    ignoredAt: z.string().optional(),  // ISO date string
}));
