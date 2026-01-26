import { z } from 'zod';
import {
  PersonSchema,
  ProjectSchema,
  CompanySchema,
  TermSchema,
  IgnoredTermSchema,
} from './schemas';

// Inferred types from schemas
export type Person = z.infer<typeof PersonSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type Term = z.infer<typeof TermSchema>;
export type IgnoredTerm = z.infer<typeof IgnoredTermSchema>;

// Union type
export type RedaksjonEntity = Person | Project | Company | Term | IgnoredTerm;

// Entity type literal
export type RedaksjonEntityType = 'person' | 'project' | 'company' | 'term' | 'ignored';

// Type-to-directory mapping (for backwards compatibility)
export const TYPE_TO_DIRECTORY: Record<RedaksjonEntityType, string> = {
  person: 'people',
  project: 'projects',
  company: 'companies',
  term: 'terms',
  ignored: 'ignored',
};

// Directory-to-type mapping
export const DIRECTORY_TO_TYPE: Record<string, RedaksjonEntityType> = {
  people: 'person',
  projects: 'project',
  companies: 'company',
  terms: 'term',
  ignored: 'ignored',
};
