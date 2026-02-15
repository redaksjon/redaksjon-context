import { describe, it, expect } from 'vitest';
import {
    TYPE_TO_DIRECTORY,
    DIRECTORY_TO_TYPE,
    type RedaksjonEntityType,
} from '../src/types';

describe('TYPE_TO_DIRECTORY', () => {
    it('maps person to people', () => {
        expect(TYPE_TO_DIRECTORY.person).toBe('people');
    });

    it('maps project to projects', () => {
        expect(TYPE_TO_DIRECTORY.project).toBe('projects');
    });

    it('maps company to companies', () => {
        expect(TYPE_TO_DIRECTORY.company).toBe('companies');
    });

    it('maps term to terms', () => {
        expect(TYPE_TO_DIRECTORY.term).toBe('terms');
    });

    it('maps ignored to ignored', () => {
        expect(TYPE_TO_DIRECTORY.ignored).toBe('ignored');
    });

    it('has all entity types', () => {
        const expectedTypes: RedaksjonEntityType[] = ['person', 'project', 'company', 'term', 'ignored'];
        const actualTypes = Object.keys(TYPE_TO_DIRECTORY);
        expect(actualTypes.sort()).toEqual(expectedTypes.sort());
    });

    it('has no duplicate directory values', () => {
        const directories = Object.values(TYPE_TO_DIRECTORY);
        const uniqueDirectories = new Set(directories);
        expect(directories.length).toBe(uniqueDirectories.size);
    });
});

describe('DIRECTORY_TO_TYPE', () => {
    it('maps people to person', () => {
        expect(DIRECTORY_TO_TYPE.people).toBe('person');
    });

    it('maps projects to project', () => {
        expect(DIRECTORY_TO_TYPE.projects).toBe('project');
    });

    it('maps companies to company', () => {
        expect(DIRECTORY_TO_TYPE.companies).toBe('company');
    });

    it('maps terms to term', () => {
        expect(DIRECTORY_TO_TYPE.terms).toBe('term');
    });

    it('maps ignored to ignored', () => {
        expect(DIRECTORY_TO_TYPE.ignored).toBe('ignored');
    });

    it('has all directory names', () => {
        const expectedDirs = ['people', 'projects', 'companies', 'terms', 'ignored'];
        const actualDirs = Object.keys(DIRECTORY_TO_TYPE);
        expect(actualDirs.sort()).toEqual(expectedDirs.sort());
    });

    it('has no duplicate type values', () => {
        const types = Object.values(DIRECTORY_TO_TYPE);
        const uniqueTypes = new Set(types);
        expect(types.length).toBe(uniqueTypes.size);
    });
});

describe('Bidirectional mapping', () => {
    it('TYPE_TO_DIRECTORY and DIRECTORY_TO_TYPE are inverses', () => {
        // For each type -> directory mapping
        Object.entries(TYPE_TO_DIRECTORY).forEach(([type, directory]) => {
            // The reverse mapping should exist
            expect(DIRECTORY_TO_TYPE[directory]).toBe(type);
        });

        // For each directory -> type mapping
        Object.entries(DIRECTORY_TO_TYPE).forEach(([directory, type]) => {
            // The reverse mapping should exist
            expect(TYPE_TO_DIRECTORY[type as RedaksjonEntityType]).toBe(directory);
        });
    });

    it('round-trips correctly', () => {
        const types: RedaksjonEntityType[] = ['person', 'project', 'company', 'term', 'ignored'];
        
        types.forEach(type => {
            const directory = TYPE_TO_DIRECTORY[type];
            const roundTrippedType = DIRECTORY_TO_TYPE[directory];
            expect(roundTrippedType).toBe(type);
        });
    });

    it('has same number of entries in both mappings', () => {
        expect(Object.keys(TYPE_TO_DIRECTORY).length).toBe(Object.keys(DIRECTORY_TO_TYPE).length);
    });
});

describe('Backwards compatibility', () => {
    it('maintains expected directory structure', () => {
        // These are the expected directory names for backwards compatibility
        const expectedStructure = {
            person: 'people',
            project: 'projects',
            company: 'companies',
            term: 'terms',
            ignored: 'ignored',
        };

        expect(TYPE_TO_DIRECTORY).toEqual(expectedStructure);
    });

    it('supports legacy directory lookups', () => {
        // Ensure we can look up types from directory names (legacy use case)
        expect(DIRECTORY_TO_TYPE['people']).toBe('person');
        expect(DIRECTORY_TO_TYPE['projects']).toBe('project');
        expect(DIRECTORY_TO_TYPE['companies']).toBe('company');
        expect(DIRECTORY_TO_TYPE['terms']).toBe('term');
    });
});
