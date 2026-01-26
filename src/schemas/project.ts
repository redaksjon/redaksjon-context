import { z } from 'zod';
import { BaseEntitySchema } from '@theunwalked/overcontext';

/**
 * Project classification signals.
 */
export const ProjectClassificationSchema = z.object({
  context_type: z.enum(['work', 'personal', 'mixed']),
  associated_people: z.array(z.string()).optional(),
  associated_companies: z.array(z.string()).optional(),
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
 * Project relationships.
 */
export const ProjectRelationshipsSchema = z.object({
  parent: z.string().optional(),
  children: z.array(z.string()).optional(),
  siblings: z.array(z.string()).optional(),
  dependsOn: z.array(z.string()).optional(),
  relatedTerms: z.array(z.string()).optional(),
}).optional();

/**
 * Project entity - work contexts that affect routing and understanding.
 */
export const ProjectSchema = BaseEntitySchema.extend({
  type: z.literal('project'),
  
  description: z.string().optional(),
  classification: ProjectClassificationSchema,
  routing: ProjectRoutingSchema,
  sounds_like: z.array(z.string()).optional(),
  relationships: ProjectRelationshipsSchema,
  active: z.boolean().optional(),
});
