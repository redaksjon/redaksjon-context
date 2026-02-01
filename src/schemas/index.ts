export * from './person';
export * from './project';
export * from './company';
export * from './term';
export * from './ignored';
export * from './relationships';
export * from './content';

import { PersonSchema } from './person';
import { ProjectSchema } from './project';
import { CompanySchema } from './company';
import { TermSchema } from './term';
import { IgnoredTermSchema } from './ignored';

/**
 * All redaksjon schemas for use with overcontext.
 * 
 * Usage:
 * ```typescript
 * import { redaksjonSchemas } from '@redaksjon/context';
 * import { discoverOvercontext } from '@utilarium/overcontext';
 * 
 * const ctx = await discoverOvercontext({
 *   schemas: redaksjonSchemas,
 *   pluralNames: redaksjonPluralNames,
 * });
 * ```
 */
export const redaksjonSchemas = {
    person: PersonSchema,
    project: ProjectSchema,
    company: CompanySchema,
    term: TermSchema,
    ignored: IgnoredTermSchema,
};

/**
 * Plural names for directory mapping.
 */
export const redaksjonPluralNames = {
    person: 'people',
    company: 'companies',
    term: 'terms',
    ignored: 'ignored',
    project: 'projects',
};
