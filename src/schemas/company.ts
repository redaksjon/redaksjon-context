import { z } from 'zod';
import { BaseEntitySchema } from '@theunwalked/overcontext';

/**
 * Company entity - organizations referenced in notes.
 */
export const CompanySchema = BaseEntitySchema.extend({
  type: z.literal('company'),
  
  fullName: z.string().optional(),
  industry: z.string().optional(),
  sounds_like: z.array(z.string()).optional(),
});
