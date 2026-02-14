import { describe, it, expect } from 'vitest';
import {
    EntityRelationshipSchema,
    RelationshipsSchema,
    createEntityUri,
    parseEntityUri,
    createRelationship,
} from '../src/schemas/relationships';

describe('EntityRelationshipSchema', () => {
    it('accepts valid relationship with all fields', () => {
        const result = EntityRelationshipSchema.safeParse({
            uri: 'redaksjon://person/john-doe',
            relationship: 'works_at',
            notes: 'Senior engineer',
            metadata: { since: '2020-01-01' },
        });
        expect(result.success).toBe(true);
    });

    it('accepts minimal relationship', () => {
        const result = EntityRelationshipSchema.safeParse({
            uri: 'redaksjon://company/acme',
            relationship: 'related_to',
        });
        expect(result.success).toBe(true);
    });

    it('accepts various entity types in URI', () => {
        const types = ['person', 'company', 'project', 'term'];
        types.forEach(type => {
            const result = EntityRelationshipSchema.safeParse({
                uri: `redaksjon://${type}/test-id`,
                relationship: 'test',
            });
            expect(result.success).toBe(true);
        });
    });

    it('accepts IDs with dots, underscores, and hyphens', () => {
        const ids = ['test-id', 'test_id', 'test.id', 'test-123', 'Test_ID.v2'];
        ids.forEach(id => {
            const result = EntityRelationshipSchema.safeParse({
                uri: `redaksjon://person/${id}`,
                relationship: 'test',
            });
            expect(result.success).toBe(true);
        });
    });

    it('rejects URI without redaksjon:// prefix', () => {
        const result = EntityRelationshipSchema.safeParse({
            uri: 'person/john-doe',
            relationship: 'test',
        });
        expect(result.success).toBe(false);
    });

    it('rejects URI with uppercase type', () => {
        const result = EntityRelationshipSchema.safeParse({
            uri: 'redaksjon://Person/john-doe',
            relationship: 'test',
        });
        expect(result.success).toBe(false);
    });

    it('rejects URI with invalid characters in ID', () => {
        const result = EntityRelationshipSchema.safeParse({
            uri: 'redaksjon://person/john doe',
            relationship: 'test',
        });
        expect(result.success).toBe(false);
    });

    it('rejects URI with missing type', () => {
        const result = EntityRelationshipSchema.safeParse({
            uri: 'redaksjon:///john-doe',
            relationship: 'test',
        });
        expect(result.success).toBe(false);
    });

    it('rejects URI with missing ID', () => {
        const result = EntityRelationshipSchema.safeParse({
            uri: 'redaksjon://person/',
            relationship: 'test',
        });
        expect(result.success).toBe(false);
    });

    it('rejects relationship without URI', () => {
        const result = EntityRelationshipSchema.safeParse({
            relationship: 'test',
        });
        expect(result.success).toBe(false);
    });

    it('rejects relationship without relationship field', () => {
        const result = EntityRelationshipSchema.safeParse({
            uri: 'redaksjon://person/john',
        });
        expect(result.success).toBe(false);
    });
});

describe('RelationshipsSchema', () => {
    it('accepts array of relationships', () => {
        const result = RelationshipsSchema.safeParse([
            { uri: 'redaksjon://person/john', relationship: 'works_at' },
            { uri: 'redaksjon://project/protokoll', relationship: 'contributes_to' },
        ]);
        expect(result.success).toBe(true);
    });

    it('accepts empty array', () => {
        const result = RelationshipsSchema.safeParse([]);
        expect(result.success).toBe(true);
    });

    it('accepts undefined', () => {
        const result = RelationshipsSchema.safeParse(undefined);
        expect(result.success).toBe(true);
    });

    it('rejects invalid relationships in array', () => {
        const result = RelationshipsSchema.safeParse([
            { uri: 'invalid-uri', relationship: 'test' },
        ]);
        expect(result.success).toBe(false);
    });
});

describe('createEntityUri', () => {
    it('creates valid URI for person', () => {
        const uri = createEntityUri('person', 'john-doe');
        expect(uri).toBe('redaksjon://person/john-doe');
    });

    it('creates valid URI for company', () => {
        const uri = createEntityUri('company', 'acme-corp');
        expect(uri).toBe('redaksjon://company/acme-corp');
    });

    it('creates valid URI for project', () => {
        const uri = createEntityUri('project', 'my-project');
        expect(uri).toBe('redaksjon://project/my-project');
    });

    it('creates valid URI for term', () => {
        const uri = createEntityUri('term', 'kubernetes');
        expect(uri).toBe('redaksjon://term/kubernetes');
    });

    it('handles IDs with special characters', () => {
        const uri = createEntityUri('person', 'john_doe.v2');
        expect(uri).toBe('redaksjon://person/john_doe.v2');
    });

    it('creates URIs that validate against schema', () => {
        const uri = createEntityUri('person', 'test-id');
        const result = EntityRelationshipSchema.safeParse({
            uri,
            relationship: 'test',
        });
        expect(result.success).toBe(true);
    });
});

describe('parseEntityUri', () => {
    it('parses valid person URI', () => {
        const result = parseEntityUri('redaksjon://person/john-doe');
        expect(result).toEqual({ type: 'person', id: 'john-doe' });
    });

    it('parses valid company URI', () => {
        const result = parseEntityUri('redaksjon://company/acme-corp');
        expect(result).toEqual({ type: 'company', id: 'acme-corp' });
    });

    it('parses valid project URI', () => {
        const result = parseEntityUri('redaksjon://project/protokoll');
        expect(result).toEqual({ type: 'project', id: 'protokoll' });
    });

    it('parses valid term URI', () => {
        const result = parseEntityUri('redaksjon://term/kubernetes');
        expect(result).toEqual({ type: 'term', id: 'kubernetes' });
    });

    it('parses URI with special characters in ID', () => {
        const result = parseEntityUri('redaksjon://person/john_doe.v2-final');
        expect(result).toEqual({ type: 'person', id: 'john_doe.v2-final' });
    });

    it('returns null for invalid URI format', () => {
        const result = parseEntityUri('person/john-doe');
        expect(result).toBeNull();
    });

    it('returns null for URI without redaksjon:// prefix', () => {
        const result = parseEntityUri('http://person/john-doe');
        expect(result).toBeNull();
    });

    it('returns null for URI with uppercase type', () => {
        const result = parseEntityUri('redaksjon://Person/john-doe');
        expect(result).toBeNull();
    });

    it('returns null for URI with invalid characters', () => {
        const result = parseEntityUri('redaksjon://person/john doe');
        expect(result).toBeNull();
    });

    it('returns null for URI with missing type', () => {
        const result = parseEntityUri('redaksjon:///john-doe');
        expect(result).toBeNull();
    });

    it('returns null for URI with missing ID', () => {
        const result = parseEntityUri('redaksjon://person/');
        expect(result).toBeNull();
    });

    it('round-trips with createEntityUri', () => {
        const type = 'project';
        const id = 'test-project';
        const uri = createEntityUri(type, id);
        const parsed = parseEntityUri(uri);
        expect(parsed).toEqual({ type, id });
    });
});

describe('createRelationship', () => {
    it('creates relationship with all fields', () => {
        const rel = createRelationship(
            'company',
            'acme-corp',
            'works_at',
            'Senior engineer since 2020',
            { department: 'Engineering', role: 'Senior' }
        );
        
        expect(rel.uri).toBe('redaksjon://company/acme-corp');
        expect(rel.relationship).toBe('works_at');
        expect(rel.notes).toBe('Senior engineer since 2020');
        expect(rel.metadata).toEqual({ department: 'Engineering', role: 'Senior' });
    });

    it('creates relationship with minimal fields', () => {
        const rel = createRelationship('person', 'john-doe', 'manages');
        
        expect(rel.uri).toBe('redaksjon://person/john-doe');
        expect(rel.relationship).toBe('manages');
        expect(rel.notes).toBeUndefined();
        expect(rel.metadata).toBeUndefined();
    });

    it('validates against schema', () => {
        const rel = createRelationship('project', 'protokoll', 'contributes_to');
        const result = EntityRelationshipSchema.safeParse(rel);
        expect(result.success).toBe(true);
    });

    it('creates relationships for different entity types', () => {
        const types = [
            ['person', 'john'],
            ['company', 'acme'],
            ['project', 'test'],
            ['term', 'api'],
        ];
        
        types.forEach(([type, id]) => {
            const rel = createRelationship(type, id, 'related_to');
            expect(rel.uri).toBe(`redaksjon://${type}/${id}`);
            const result = EntityRelationshipSchema.safeParse(rel);
            expect(result.success).toBe(true);
        });
    });

    it('handles complex metadata', () => {
        const metadata = {
            startDate: '2020-01-01',
            endDate: '2023-12-31',
            verified: true,
            confidence: 0.95,
            tags: ['primary', 'active'],
        };
        const rel = createRelationship('company', 'acme', 'employed_at', 'Past employment', metadata);
        expect(rel.metadata).toEqual(metadata);
    });
});
