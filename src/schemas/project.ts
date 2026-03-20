import { z } from 'zod';
import { BaseEntitySchema } from '@utilarium/overcontext';
import { RelationshipsSchema } from './relationships';
import { EntityContentSchema } from './content';

/**
 * Project classification signals.
 */
export const ProjectClassificationSchema = z.object({
    context_type: z.enum(['work', 'personal', 'mixed']),
    associated_people: z.array(z.string()).optional(),    // DEPRECATED: Use relationships instead
    associated_companies: z.array(z.string()).optional(), // DEPRECATED: Use relationships instead
    topics: z.array(z.string()).optional(),
    explicit_phrases: z.array(z.string()).optional(),
});

/**
 * Project routing configuration.
 */
export const ProjectRoutingSchema = z.object({
    destination: z.string().optional(),
    structure: z.enum(['none', 'year', 'month', 'day']),
    filename_options: z.array(z.enum(['date', 'time', 'subject'])),
    auto_tags: z.array(z.string()).optional(),
});

/**
 * Project entity - work contexts that affect routing and understanding.
 */
export const ProjectSchema = BaseEntitySchema.merge(z.object({
    type: z.literal('project'),
    slug: z.string().optional(),  // Human-readable identifier
  
    description: z.string().optional(),
    /** Related web links (e.g. org homepage, repo, docs). */
    urls: z.array(z.string()).optional(),
    classification: ProjectClassificationSchema,
    routing: ProjectRoutingSchema,
    sounds_like: z.array(z.string()).optional(),
    relationships: RelationshipsSchema,                // Unified relationships
    content: EntityContentSchema,                      // Attached content (URLs, text, documents)
    active: z.boolean().optional(),
}));
