# Entity Relationships in Redaksjon Context

## Overview

All Redaksjon entities now support a unified relationship system using URIs as coordinates. This allows you to create typed, bidirectional relationships between any entities (people, companies, terms, projects).

## URI Format

Relationships use URIs in the format:
```
redaksjon://{type}/{id}
```

Examples:
- `redaksjon://person/pete_wagner`
- `redaksjon://company/acme-corp`
- `redaksjon://term/kubernetes`
- `redaksjon://project/protokoll`

## Schema

### EntityRelationship

```typescript
{
  uri: string;           // redaksjon://{type}/{id}
  relationship: string;  // Freeform relationship type
  notes?: string;        // Optional notes
  metadata?: Record<string, unknown>; // Optional metadata
}
```

### Relationships Field

All entities now have an optional `relationships` array:

```typescript
relationships?: EntityRelationship[];
```

## Examples

### Person → Company Relationship

```yaml
# people/pete_wagner.yaml
id: pete_wagner
name: Pete Wagner
type: person
firstName: Pete
lastName: Wagner
role: Engineering Manager
relationships:
  - uri: redaksjon://company/acme-corp
    relationship: works_at
    notes: Started in 2020
    metadata:
      start_date: "2020-01-15"
      department: "Engineering"
```

### Company → Person Relationships

```yaml
# companies/acme-corp.yaml
id: acme-corp
name: Acme Corporation
type: company
fullName: Acme Corporation, Inc.
industry: Technology
relationships:
  - uri: redaksjon://person/pete_wagner
    relationship: employs
    notes: Engineering Manager
  - uri: redaksjon://person/jane_smith
    relationship: employs
    notes: CTO
```

### Term → Project Relationship

```yaml
# terms/kubernetes.yaml
id: kubernetes
name: Kubernetes
type: term
expansion: Kubernetes Container Orchestration
domain: DevOps
relationships:
  - uri: redaksjon://project/cloud-migration
    relationship: used_in
    notes: Primary orchestration platform
  - uri: redaksjon://person/pete_wagner
    relationship: expert
    notes: Pete is our K8s expert
```

### Project → Multiple Entity Types

```yaml
# projects/cloud-migration.yaml
id: cloud-migration
name: Cloud Migration Project
type: project
description: Migrate infrastructure to cloud
relationships:
  - uri: redaksjon://person/pete_wagner
    relationship: managed_by
  - uri: redaksjon://company/aws
    relationship: vendor
  - uri: redaksjon://term/kubernetes
    relationship: uses_technology
  - uri: redaksjon://project/modernization
    relationship: part_of
    notes: This is a sub-project
```

## Relationship Types

Relationship types are freeform strings. Common examples:

### Person Relationships
- `works_at` - Person works at company
- `manages` - Person manages another person
- `reports_to` - Person reports to another person
- `collaborates_with` - Person collaborates with another person
- `expert_in` - Person is expert in a term/technology

### Company Relationships
- `employs` - Company employs person
- `partner_with` - Company partners with another company
- `vendor_for` - Company is vendor for project
- `subsidiary_of` - Company is subsidiary of another company

### Project Relationships
- `managed_by` - Project managed by person
- `part_of` - Project is part of another project
- `depends_on` - Project depends on another project
- `uses_technology` - Project uses a term/technology
- `funded_by` - Project funded by company

### Term Relationships
- `used_in` - Term used in project
- `related_to` - Term related to another term
- `synonym_of` - Term is synonym of another term
- `expert` - Person is expert in term

## Helper Functions

### TypeScript/JavaScript

```typescript
import { 
  createEntityUri, 
  parseEntityUri, 
  createRelationship 
} from '@redaksjon/context';

// Create a URI
const uri = createEntityUri('person', 'pete_wagner');
// => "redaksjon://person/pete_wagner"

// Parse a URI
const parsed = parseEntityUri('redaksjon://person/pete_wagner');
// => { type: 'person', id: 'pete_wagner' }

// Create a relationship
const rel = createRelationship(
  'company',
  'acme-corp',
  'works_at',
  'Started in 2020',
  { start_date: '2020-01-15' }
);
// => {
//   uri: 'redaksjon://company/acme-corp',
//   relationship: 'works_at',
//   notes: 'Started in 2020',
//   metadata: { start_date: '2020-01-15' }
// }
```

## Migration from Legacy Fields

### Person.company → relationships

**Before:**
```yaml
id: pete_wagner
name: Pete Wagner
type: person
company: acme-corp  # DEPRECATED
```

**After:**
```yaml
id: pete_wagner
name: Pete Wagner
type: person
relationships:
  - uri: redaksjon://company/acme-corp
    relationship: works_at
```

### Term.projects → relationships

**Before:**
```yaml
id: kubernetes
name: Kubernetes
type: term
projects:  # DEPRECATED
  - cloud-migration
  - modernization
```

**After:**
```yaml
id: kubernetes
name: Kubernetes
type: term
relationships:
  - uri: redaksjon://project/cloud-migration
    relationship: used_in
  - uri: redaksjon://project/modernization
    relationship: used_in
```

### Project.classification.associated_people → relationships

**Before:**
```yaml
id: cloud-migration
name: Cloud Migration
type: project
classification:
  associated_people:  # DEPRECATED
    - pete_wagner
    - jane_smith
```

**After:**
```yaml
id: cloud-migration
name: Cloud Migration
type: project
relationships:
  - uri: redaksjon://person/pete_wagner
    relationship: team_member
  - uri: redaksjon://person/jane_smith
    relationship: team_member
```

## Querying Relationships

### Find all companies a person works at

```typescript
const person = await context.get('person', 'pete_wagner');
const companies = person.relationships
  ?.filter(r => r.relationship === 'works_at')
  .map(r => parseEntityUri(r.uri))
  .filter(p => p?.type === 'company');
```

### Find all people in a project

```typescript
const project = await context.get('project', 'cloud-migration');
const teamMembers = project.relationships
  ?.filter(r => r.relationship === 'team_member')
  .map(r => parseEntityUri(r.uri))
  .filter(p => p?.type === 'person');
```

### Find all technologies used in a project

```typescript
const project = await context.get('project', 'cloud-migration');
const technologies = project.relationships
  ?.filter(r => r.relationship === 'uses_technology')
  .map(r => parseEntityUri(r.uri))
  .filter(p => p?.type === 'term');
```

## Benefits

1. **Unified System** - Same relationship structure across all entity types
2. **Type Safety** - URIs provide clear entity references
3. **Bidirectional** - Can query relationships from either direction
4. **Flexible** - Freeform relationship types for any use case
5. **Metadata** - Can attach notes and metadata to relationships
6. **Namespace Aware** - URIs work with Overcontext namespaces

## Future Enhancements

Potential future features:

1. **Bidirectional Sync** - Automatically create inverse relationships
2. **Relationship Validation** - Validate that referenced entities exist
3. **Relationship Queries** - Built-in query helpers for common patterns
4. **Relationship Visualization** - Graph visualization of entity relationships
5. **Relationship History** - Track when relationships were created/modified

## Summary

- ✅ All entities now support `relationships` field
- ✅ Relationships use URIs: `redaksjon://{type}/{id}`
- ✅ Freeform relationship types for flexibility
- ✅ Optional notes and metadata on each relationship
- ✅ Helper functions for creating and parsing URIs
- ✅ Backward compatible with legacy fields (deprecated)
