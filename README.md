# @redaksjon/context

Shared context schemas for redaksjon tools (protokoll, kronologi, and future tools).

## Overview

This package provides Zod schemas for redaksjon entity types that are used across multiple tools in the redaksjon ecosystem. It integrates with [@theunwalked/overcontext](https://github.com/theunwalked/utilarium/tree/main/overcontext) for schema-driven context management.

## Installation

```bash
npm install @redaksjon/context @theunwalked/overcontext
```

## Usage

### With Overcontext

```typescript
import { redaksjonSchemas, redaksjonPluralNames } from '@redaksjon/context';
import { discoverOvercontext } from '@theunwalked/overcontext';

// Discover context with redaksjon schemas
const ctx = await discoverOvercontext({
  schemas: redaksjonSchemas,
  pluralNames: redaksjonPluralNames,
  contextDirName: '.protokoll',
});

// Type-safe operations
const person = await ctx.get('person', 'john-doe');
const allProjects = await ctx.getAll('project');
```

### Direct Schema Usage

```typescript
import { PersonSchema, ProjectSchema } from '@redaksjon/context';

// Validate data
const person = PersonSchema.parse({
  id: 'john',
  name: 'John Doe',
  type: 'person',
  company: 'acme-corp',
});
```

## Entity Types

### Person

Named individuals mentioned in transcripts or notes.

```typescript
interface Person {
  id: string;
  name: string;
  type: 'person';
  firstName?: string;
  lastName?: string;
  company?: string;              // Company ID reference
  role?: string;                 // e.g., "Manager", "Developer"
  sounds_like?: string[];        // Common mishearings
  context?: string;              // How user knows them
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
}
```

### Project

Work contexts that affect routing and understanding.

```typescript
interface Project {
  id: string;
  name: string;
  type: 'project';
  description?: string;
  classification: {
    context_type: 'work' | 'personal' | 'mixed';
    associated_people?: string[];
    associated_companies?: string[];
    topics?: string[];
    explicit_phrases?: string[];
  };
  routing: {
    destination?: string;
    structure: 'none' | 'year' | 'month' | 'day';
    filename_options: Array<'date' | 'time' | 'subject'>;
    auto_tags?: string[];
  };
  sounds_like?: string[];
  relationships?: {
    parent?: string;
    children?: string[];
    siblings?: string[];
    dependsOn?: string[];
    relatedTerms?: string[];
  };
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
}
```

### Company

Organizations referenced in notes.

```typescript
interface Company {
  id: string;
  name: string;
  type: 'company';
  fullName?: string;
  industry?: string;
  sounds_like?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
}
```

### Term

Domain-specific terminology and acronyms.

```typescript
interface Term {
  id: string;
  name: string;
  type: 'term';
  expansion?: string;           // Full form if acronym
  domain?: string;              // E.g., "engineering", "finance"
  sounds_like?: string[];
  projects?: string[];          // Associated project IDs
  description?: string;
  topics?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
}
```

### IgnoredTerm

Phrases to skip during processing.

```typescript
interface IgnoredTerm {
  id: string;
  name: string;
  type: 'ignored';
  reason?: string;
  ignoredAt?: string;           // ISO date string
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
}
```

## Directory Mapping

The package includes mappings between entity types and their storage directories:

```typescript
import { TYPE_TO_DIRECTORY, DIRECTORY_TO_TYPE } from '@redaksjon/context';

TYPE_TO_DIRECTORY.person;    // 'people'
TYPE_TO_DIRECTORY.company;   // 'companies'

DIRECTORY_TO_TYPE.people;    // 'person'
DIRECTORY_TO_TYPE.companies; // 'company'
```

## Integration with Redaksjon Tools

### Protokoll

Protokoll uses these schemas for managing context entities:

```typescript
import { create } from './overcontext/adapter';

const storage = create();
await storage.load(['.protokoll/context']);

const person = storage.get('person', 'john');
```

### Kronologi

Kronologi uses these schemas for reading shared context:

```typescript
import { initializeContext, lookupPerson } from './context';

await initializeContext();
const person = await lookupPerson('john');
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm run test

# Lint
npm run lint
```

## License

Apache-2.0
