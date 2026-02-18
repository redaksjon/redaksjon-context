import { z } from 'zod';
import { BaseEntitySchema } from '@utilarium/overcontext';
import { RelationshipsSchema } from './relationships';
import { EntityContentSchema } from './content';

/**
 * Term entity - domain-specific terminology and acronyms.
 */
export const TermSchema = BaseEntitySchema.merge(z.object({
    type: z.literal('term'),
    slug: z.string().optional(),  // Human-readable identifier
  
    expansion: z.string().optional(),           // Full form if acronym
    domain: z.string().optional(),              // E.g., "engineering", "finance"
    sounds_like: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),   // DEPRECATED: Use relationships instead
    description: z.string().optional(),
    topics: z.array(z.string()).optional(),
    relationships: RelationshipsSchema,          // Relationships to other entities
    content: EntityContentSchema,                // Attached content (URLs, text, documents)
}));
