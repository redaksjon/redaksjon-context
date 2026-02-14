import { describe, it, expect } from 'vitest';
import {
    EntityContentItemSchema,
    EntityContentSchema,
    createUrlContent,
    createTextContent,
    createMarkdownContent,
    createCodeContent,
    createDocumentContent,
} from '../src/schemas/content';

describe('EntityContentItemSchema', () => {
    it('accepts valid content item with all fields', () => {
        const result = EntityContentItemSchema.safeParse({
            type: 'url',
            title: 'Company Website',
            content: 'https://example.com',
            mimeType: 'text/uri-list',
            source: 'Manual entry',
            timestamp: '2026-01-15T10:00:00Z',
            notes: 'Main website',
            metadata: { verified: true },
        });
        expect(result.success).toBe(true);
    });

    it('accepts minimal content item', () => {
        const result = EntityContentItemSchema.safeParse({
            type: 'text',
            content: 'Some text',
        });
        expect(result.success).toBe(true);
    });

    it('rejects content item without type', () => {
        const result = EntityContentItemSchema.safeParse({
            content: 'Some text',
        });
        expect(result.success).toBe(false);
    });

    it('rejects content item without content', () => {
        const result = EntityContentItemSchema.safeParse({
            type: 'text',
        });
        expect(result.success).toBe(false);
    });

    it('accepts valid datetime timestamp', () => {
        const result = EntityContentItemSchema.safeParse({
            type: 'text',
            content: 'test',
            timestamp: '2026-02-14T12:00:00Z',
        });
        expect(result.success).toBe(true);
    });

    it('rejects invalid datetime timestamp', () => {
        const result = EntityContentItemSchema.safeParse({
            type: 'text',
            content: 'test',
            timestamp: 'not-a-date',
        });
        expect(result.success).toBe(false);
    });
});

describe('EntityContentSchema', () => {
    it('accepts array of content items', () => {
        const result = EntityContentSchema.safeParse([
            { type: 'url', content: 'https://example.com' },
            { type: 'text', content: 'Description' },
        ]);
        expect(result.success).toBe(true);
    });

    it('accepts empty array', () => {
        const result = EntityContentSchema.safeParse([]);
        expect(result.success).toBe(true);
    });

    it('accepts undefined', () => {
        const result = EntityContentSchema.safeParse(undefined);
        expect(result.success).toBe(true);
    });

    it('rejects invalid content items in array', () => {
        const result = EntityContentSchema.safeParse([
            { type: 'url' }, // missing content
        ]);
        expect(result.success).toBe(false);
    });
});

describe('createUrlContent', () => {
    it('creates URL content with all fields', () => {
        const content = createUrlContent(
            'https://example.com',
            'Example Site',
            'Company website',
            'Primary URL'
        );
        
        expect(content.type).toBe('url');
        expect(content.content).toBe('https://example.com');
        expect(content.title).toBe('Example Site');
        expect(content.mimeType).toBe('text/uri-list');
        expect(content.source).toBe('Company website');
        expect(content.notes).toBe('Primary URL');
        expect(content.timestamp).toBeDefined();
        expect(new Date(content.timestamp!).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('creates URL content with minimal fields', () => {
        const content = createUrlContent('https://example.com');
        
        expect(content.type).toBe('url');
        expect(content.content).toBe('https://example.com');
        expect(content.title).toBe('Website');
        expect(content.mimeType).toBe('text/uri-list');
        expect(content.source).toBeUndefined();
        expect(content.notes).toBeUndefined();
        expect(content.timestamp).toBeDefined();
    });

    it('validates against schema', () => {
        const content = createUrlContent('https://example.com', 'Test');
        const result = EntityContentItemSchema.safeParse(content);
        expect(result.success).toBe(true);
    });
});

describe('createTextContent', () => {
    it('creates text content with all fields', () => {
        const content = createTextContent(
            'This is a description',
            'Bio',
            'LinkedIn',
            'Extracted from profile'
        );
        
        expect(content.type).toBe('text');
        expect(content.content).toBe('This is a description');
        expect(content.title).toBe('Bio');
        expect(content.mimeType).toBe('text/plain');
        expect(content.source).toBe('LinkedIn');
        expect(content.notes).toBe('Extracted from profile');
        expect(content.timestamp).toBeDefined();
    });

    it('creates text content with minimal fields', () => {
        const content = createTextContent('Some text');
        
        expect(content.type).toBe('text');
        expect(content.content).toBe('Some text');
        expect(content.title).toBe('Description');
        expect(content.mimeType).toBe('text/plain');
        expect(content.timestamp).toBeDefined();
    });

    it('validates against schema', () => {
        const content = createTextContent('Test content');
        const result = EntityContentItemSchema.safeParse(content);
        expect(result.success).toBe(true);
    });
});

describe('createMarkdownContent', () => {
    it('creates markdown content with all fields', () => {
        const markdown = '# Heading\n\nContent here';
        const content = createMarkdownContent(
            markdown,
            'README',
            'GitHub',
            'Project documentation'
        );
        
        expect(content.type).toBe('markdown');
        expect(content.content).toBe(markdown);
        expect(content.title).toBe('README');
        expect(content.mimeType).toBe('text/markdown');
        expect(content.source).toBe('GitHub');
        expect(content.notes).toBe('Project documentation');
        expect(content.timestamp).toBeDefined();
    });

    it('creates markdown content with minimal fields', () => {
        const content = createMarkdownContent('# Title');
        
        expect(content.type).toBe('markdown');
        expect(content.content).toBe('# Title');
        expect(content.title).toBe('Document');
        expect(content.mimeType).toBe('text/markdown');
        expect(content.timestamp).toBeDefined();
    });

    it('validates against schema', () => {
        const content = createMarkdownContent('**bold**');
        const result = EntityContentItemSchema.safeParse(content);
        expect(result.success).toBe(true);
    });
});

describe('createCodeContent', () => {
    it('creates code content with all fields', () => {
        const code = 'console.log("hello");';
        const content = createCodeContent(
            code,
            'javascript',
            'Example',
            'Documentation',
            'Code snippet from docs'
        );
        
        expect(content.type).toBe('code');
        expect(content.content).toBe(code);
        expect(content.title).toBe('Example');
        expect(content.mimeType).toBe('text/x-javascript');
        expect(content.source).toBe('Documentation');
        expect(content.notes).toBe('Code snippet from docs');
        expect(content.metadata).toEqual({ language: 'javascript' });
        expect(content.timestamp).toBeDefined();
    });

    it('creates code content with minimal fields', () => {
        const content = createCodeContent('print("hello")', 'python');
        
        expect(content.type).toBe('code');
        expect(content.content).toBe('print("hello")');
        expect(content.title).toBe('python code');
        expect(content.mimeType).toBe('text/x-python');
        expect(content.metadata).toEqual({ language: 'python' });
        expect(content.timestamp).toBeDefined();
    });

    it('validates against schema', () => {
        const content = createCodeContent('fn main() {}', 'rust');
        const result = EntityContentItemSchema.safeParse(content);
        expect(result.success).toBe(true);
    });

    it('handles different languages', () => {
        const languages = ['typescript', 'go', 'java', 'ruby'];
        languages.forEach(lang => {
            const content = createCodeContent('code', lang);
            expect(content.mimeType).toBe(`text/x-${lang}`);
            expect(content.metadata?.language).toBe(lang);
        });
    });
});

describe('createDocumentContent', () => {
    it('creates document content with all fields', () => {
        const content = createDocumentContent(
            '/path/to/doc.pdf',
            'Whitepaper',
            'application/pdf',
            'Technical documentation'
        );
        
        expect(content.type).toBe('document');
        expect(content.content).toBe('/path/to/doc.pdf');
        expect(content.title).toBe('Whitepaper');
        expect(content.mimeType).toBe('application/pdf');
        expect(content.notes).toBe('Technical documentation');
        expect(content.timestamp).toBeDefined();
    });

    it('creates document content with minimal fields', () => {
        const content = createDocumentContent('/path/to/file');
        
        expect(content.type).toBe('document');
        expect(content.content).toBe('/path/to/file');
        expect(content.title).toBe('Document');
        expect(content.mimeType).toBe('application/octet-stream');
        expect(content.timestamp).toBeDefined();
    });

    it('validates against schema', () => {
        const content = createDocumentContent('/doc.txt', 'Text', 'text/plain');
        const result = EntityContentItemSchema.safeParse(content);
        expect(result.success).toBe(true);
    });

    it('handles different mime types', () => {
        const types = [
            ['doc.pdf', 'application/pdf'],
            ['doc.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            ['doc.txt', 'text/plain'],
        ];
        
        types.forEach(([path, mimeType]) => {
            const content = createDocumentContent(path, 'Doc', mimeType);
            expect(content.mimeType).toBe(mimeType);
        });
    });
});
