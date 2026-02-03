import { z } from 'zod';

/**
 * Entity Relationship
 * 
 * Represents a typed relationship between entities using URIs as coordinates.
 * URIs follow the pattern: redaksjon://{type}/{id}
 * 
 * Examples:
 *   - redaksjon://person/pete_wagner
 *   - redaksjon://company/acme-corp
 *   - redaksjon://term/kubernetes
 *   - redaksjon://project/protokoll
 */
export const EntityRelationshipSchema = z.object({
    /**
     * The URI of the related entity
     * Format: redaksjon://{type}/{id}
     */
    uri: z.string().regex(
        /^redaksjon:\/\/[a-z]+\/[a-zA-Z0-9._-]+$/,
        { message: 'URI must be in format: redaksjon://{type}/{id}' }
    ),
    
    /**
     * The type of relationship (freeform)
     * Examples: "works_at", "manages", "related_to", "depends_on", "part_of"
     */
    relationship: z.string(),
    
    /**
     * Optional notes about this relationship
     */
    notes: z.string().optional(),
    
    /**
     * Optional metadata
     */
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type EntityRelationship = z.infer<typeof EntityRelationshipSchema>;

/**
 * Relationships field for all entities
 * Array of typed relationships to other entities
 */
export const RelationshipsSchema = z.array(EntityRelationshipSchema).optional();

/**
 * Helper function to create a relationship URI
 */
export function createEntityUri(type: string, id: string): string {
    return `redaksjon://${type}/${id}`;
}

/**
 * Helper function to parse a relationship URI
 */
export function parseEntityUri(uri: string): { type: string; id: string } | null {
    const match = uri.match(/^redaksjon:\/\/([a-z]+)\/([a-zA-Z0-9._-]+)$/);
    if (!match) return null;
    return {
        type: match[1],
        id: match[2],
    };
}

/**
 * Helper function to create a relationship
 */
export function createRelationship(
    targetType: string,
    targetId: string,
    relationship: string,
    notes?: string,
    metadata?: Record<string, unknown>
): EntityRelationship {
    return {
        uri: createEntityUri(targetType, targetId),
        relationship,
        notes,
        metadata,
    };
}
