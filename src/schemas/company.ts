import { z } from 'zod';
import { BaseEntitySchema } from '@utilarium/overcontext';
import { RelationshipsSchema } from './relationships';
import { EntityContentSchema } from './content';

/**
 * Company entity - organizations referenced in notes.
 */
export const CompanySchema = BaseEntitySchema.merge(z.object({
    type: z.literal('company'),
  
    fullName: z.string().optional(),
    industry: z.string().optional(),
    sounds_like: z.array(z.string()).optional(),
    relationships: RelationshipsSchema,          // Relationships to other entities
    content: EntityContentSchema,                // Attached content (URLs, text, documents)
}));
