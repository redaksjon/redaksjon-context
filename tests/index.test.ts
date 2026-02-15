import { describe, it, expect } from 'vitest';
import * as redaksjonContext from '../src/index';

describe('Package exports', () => {
    it('exports all schemas', () => {
        expect(redaksjonContext.PersonSchema).toBeDefined();
        expect(redaksjonContext.ProjectSchema).toBeDefined();
        expect(redaksjonContext.CompanySchema).toBeDefined();
        expect(redaksjonContext.TermSchema).toBeDefined();
        expect(redaksjonContext.IgnoredTermSchema).toBeDefined();
    });

    it('exports content schemas and helpers', () => {
        expect(redaksjonContext.EntityContentItemSchema).toBeDefined();
        expect(redaksjonContext.EntityContentSchema).toBeDefined();
        expect(redaksjonContext.createUrlContent).toBeDefined();
        expect(redaksjonContext.createTextContent).toBeDefined();
        expect(redaksjonContext.createMarkdownContent).toBeDefined();
        expect(redaksjonContext.createCodeContent).toBeDefined();
        expect(redaksjonContext.createDocumentContent).toBeDefined();
    });

    it('exports relationship schemas and helpers', () => {
        expect(redaksjonContext.EntityRelationshipSchema).toBeDefined();
        expect(redaksjonContext.RelationshipsSchema).toBeDefined();
        expect(redaksjonContext.createEntityUri).toBeDefined();
        expect(redaksjonContext.parseEntityUri).toBeDefined();
        expect(redaksjonContext.createRelationship).toBeDefined();
    });

    it('exports type mappings', () => {
        expect(redaksjonContext.TYPE_TO_DIRECTORY).toBeDefined();
        expect(redaksjonContext.DIRECTORY_TO_TYPE).toBeDefined();
    });
});
