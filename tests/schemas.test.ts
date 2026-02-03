import { describe, it, expect } from 'vitest';
import {
  PersonSchema,
  ProjectSchema,
  CompanySchema,
  TermSchema,
  IgnoredTermSchema,
} from '../src/schemas';

describe('PersonSchema', () => {
  it('accepts valid person', () => {
    const result = PersonSchema.safeParse({
      id: 'john-doe',
      name: 'John Doe',
      type: 'person',
      company: 'acme-corp',
      sounds_like: ['john doe', 'jon doe'],
    });
    expect(result.success).toBe(true);
  });
  
  it('accepts minimal person', () => {
    const result = PersonSchema.safeParse({
      id: 'jane',
      name: 'Jane',
      type: 'person',
    });
    expect(result.success).toBe(true);
  });
  
  it('rejects wrong type', () => {
    const result = PersonSchema.safeParse({
      id: 'john',
      name: 'John',
      type: 'project',
    });
    expect(result.success).toBe(false);
  });
});

describe('ProjectSchema', () => {
  it('accepts valid project', () => {
    const result = ProjectSchema.safeParse({
      id: 'my-project',
      name: 'My Project',
      type: 'project',
      classification: {
        context_type: 'work',
        topics: ['typescript', 'nodejs'],
      },
      routing: {
        structure: 'month',
        filename_options: ['date', 'subject'],
      },
    });
    expect(result.success).toBe(true);
  });
  
  it('requires classification and routing', () => {
    const result = ProjectSchema.safeParse({
      id: 'minimal',
      name: 'Minimal',
      type: 'project',
    });
    expect(result.success).toBe(false);
  });
  
  it('accepts project with relationships', () => {
    const result = ProjectSchema.safeParse({
      id: 'child-project',
      name: 'Child Project',
      type: 'project',
      classification: {
        context_type: 'work',
      },
      routing: {
        structure: 'none',
        filename_options: ['date'],
      },
      relationships: [
        {
          uri: 'redaksjon://project/parent-project',
          relationship: 'parent',
        },
        {
          uri: 'redaksjon://project/sibling-1',
          relationship: 'sibling',
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe('TermSchema', () => {
  it('accepts valid term', () => {
    const result = TermSchema.safeParse({
      id: 'api',
      name: 'API',
      type: 'term',
      expansion: 'Application Programming Interface',
      domain: 'engineering',
    });
    expect(result.success).toBe(true);
  });
  
  it('accepts term with projects', () => {
    const result = TermSchema.safeParse({
      id: 'kubernetes',
      name: 'Kubernetes',
      type: 'term',
      projects: ['devops-project'],
      topics: ['containers', 'orchestration'],
    });
    expect(result.success).toBe(true);
  });
});

describe('CompanySchema', () => {
  it('accepts valid company', () => {
    const result = CompanySchema.safeParse({
      id: 'acme',
      name: 'ACME Corp',
      type: 'company',
      fullName: 'ACME Corporation',
      industry: 'Technology',
    });
    expect(result.success).toBe(true);
  });
  
  it('accepts minimal company', () => {
    const result = CompanySchema.safeParse({
      id: 'acme',
      name: 'ACME',
      type: 'company',
    });
    expect(result.success).toBe(true);
  });
});

describe('IgnoredTermSchema', () => {
  it('accepts valid ignored term', () => {
    const result = IgnoredTermSchema.safeParse({
      id: 'um',
      name: 'um',
      type: 'ignored',
      reason: 'Filler word',
    });
    expect(result.success).toBe(true);
  });
  
  it('accepts ignored term with date', () => {
    const result = IgnoredTermSchema.safeParse({
      id: 'uh',
      name: 'uh',
      type: 'ignored',
      reason: 'Filler word',
      ignoredAt: '2026-01-26T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });
});
