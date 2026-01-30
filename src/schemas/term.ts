import { z } from 'zod';
import { BaseEntitySchema } from '@utilarium/overcontext';

/**
 * Term entity - domain-specific terminology and acronyms.
 */
export const TermSchema = BaseEntitySchema.merge(z.object({
    type: z.literal('term'),
  
    expansion: z.string().optional(),           // Full form if acronym
    domain: z.string().optional(),              // E.g., "engineering", "finance"
    sounds_like: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),   // Associated project IDs
    description: z.string().optional(),
    topics: z.array(z.string()).optional(),
}));
