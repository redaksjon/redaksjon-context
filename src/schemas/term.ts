import { z } from 'zod';
import { BaseEntitySchema } from '@theunwalked/overcontext';

/**
 * Term entity - domain-specific terminology and acronyms.
 */
export const TermSchema = BaseEntitySchema.extend({
  type: z.literal('term'),
  
  expansion: z.string().optional(),           // Full form if acronym
  domain: z.string().optional(),              // E.g., "engineering", "finance"
  sounds_like: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),   // Associated project IDs
  description: z.string().optional(),
  topics: z.array(z.string()).optional(),
});
