import { z } from 'zod';
import { BaseEntitySchema } from '@utilarium/overcontext';
import { RelationshipsSchema } from './relationships';
import { EntityContentSchema } from './content';

/**
 * Person entity - named individuals the user frequently mentions.
 */
export const PersonSchema = BaseEntitySchema.merge(z.object({
    type: z.literal('person'),
  
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    company: z.string().optional(),              // DEPRECATED: Use relationships instead
    role: z.string().optional(),                 // e.g., "Manager", "Developer"
    sounds_like: z.array(z.string()).optional(), // Common mishearings
    context: z.string().optional(),              // How user knows them
    relationships: RelationshipsSchema,          // Relationships to other entities
    content: EntityContentSchema,                // Attached content (URLs, text, documents)
}));
