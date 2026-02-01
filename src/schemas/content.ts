import { z } from 'zod';

/**
 * Entity Content Item
 * 
 * Represents structured content attached to an entity.
 * Can be URLs, text snippets, documents, or any other information.
 * 
 * Examples:
 *   - Company website URL
 *   - Project description document
 *   - Person's bio
 *   - Term definition from external source
 */
export const EntityContentItemSchema = z.object({
    /**
     * Type of content
     * Common types: url, text, markdown, html, document, image, video, code
     */
    type: z.string(),
    
    /**
     * Title or label for this content
     */
    title: z.string().optional(),
    
    /**
     * The actual content
     * - For URLs: the URL string
     * - For text: the text content
     * - For documents: could be markdown, HTML, or plain text
     * - For references: could be a file path or external reference
     */
    content: z.string(),
    
    /**
     * MIME type (optional)
     * Examples: text/plain, text/markdown, text/html, application/pdf
     */
    mimeType: z.string().optional(),
    
    /**
     * Source or origin of this content
     * Examples: "Company website", "LinkedIn profile", "Manual entry"
     */
    source: z.string().optional(),
    
    /**
     * When this content was added or last updated
     */
    timestamp: z.string().datetime().optional(),
    
    /**
     * Optional notes about this content
     */
    notes: z.string().optional(),
    
    /**
     * Optional metadata
     */
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type EntityContentItem = z.infer<typeof EntityContentItemSchema>;

/**
 * Content array for entities
 * Array of content items attached to an entity
 */
export const EntityContentSchema = z.array(EntityContentItemSchema).optional();

/**
 * Helper function to create a URL content item
 */
export function createUrlContent(
    url: string,
    title?: string,
    source?: string,
    notes?: string
): EntityContentItem {
    return {
        type: 'url',
        title: title || 'Website',
        content: url,
        mimeType: 'text/uri-list',
        source,
        timestamp: new Date().toISOString(),
        notes,
    };
}

/**
 * Helper function to create a text content item
 */
export function createTextContent(
    text: string,
    title?: string,
    source?: string,
    notes?: string
): EntityContentItem {
    return {
        type: 'text',
        title: title || 'Description',
        content: text,
        mimeType: 'text/plain',
        source,
        timestamp: new Date().toISOString(),
        notes,
    };
}

/**
 * Helper function to create a markdown content item
 */
export function createMarkdownContent(
    markdown: string,
    title?: string,
    source?: string,
    notes?: string
): EntityContentItem {
    return {
        type: 'markdown',
        title: title || 'Document',
        content: markdown,
        mimeType: 'text/markdown',
        source,
        timestamp: new Date().toISOString(),
        notes,
    };
}

/**
 * Helper function to create a code snippet content item
 */
export function createCodeContent(
    code: string,
    language: string,
    title?: string,
    source?: string,
    notes?: string
): EntityContentItem {
    return {
        type: 'code',
        title: title || `${language} code`,
        content: code,
        mimeType: `text/x-${language}`,
        source,
        timestamp: new Date().toISOString(),
        notes,
        metadata: { language },
    };
}

/**
 * Helper function to create a document reference content item
 */
export function createDocumentContent(
    path: string,
    title?: string,
    mimeType?: string,
    notes?: string
): EntityContentItem {
    return {
        type: 'document',
        title: title || 'Document',
        content: path,
        mimeType: mimeType || 'application/octet-stream',
        timestamp: new Date().toISOString(),
        notes,
    };
}
