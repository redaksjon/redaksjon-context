import { z } from 'zod';
import { PersonSchema, ProjectSchema, CompanySchema, TermSchema, IgnoredTermSchema } from './schemas';
export type Person = z.infer<typeof PersonSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type Term = z.infer<typeof TermSchema>;
export type IgnoredTerm = z.infer<typeof IgnoredTermSchema>;
export type RedaksjonEntity = Person | Project | Company | Term | IgnoredTerm;
export type RedaksjonEntityType = 'person' | 'project' | 'company' | 'term' | 'ignored';
export declare const TYPE_TO_DIRECTORY: Record<RedaksjonEntityType, string>;
export declare const DIRECTORY_TO_TYPE: Record<string, RedaksjonEntityType>;
//# sourceMappingURL=types.d.ts.map