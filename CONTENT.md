# Entity Content in Redaksjon Context

## Overview

All Redaksjon entities now support attaching structured content items. This allows you to associate URLs, text, documents, and other information with entities for later reference.

## Use Cases

- **Company Website**: Attach the company's website URL
- **Project Documentation**: Add project descriptions, requirements, or specs
- **Person Bio**: Include LinkedIn profile, bio, or contact info
- **Term Definitions**: Link to external documentation or definitions
- **Code Snippets**: Attach relevant code examples
- **Reference Documents**: Link to files or external resources

## Schema

### EntityContentItem

```typescript
{
  type: string;           // Content type: url, text, markdown, html, document, image, video, code
  title?: string;         // Title or label
  content: string;        // The actual content (URL, text, markdown, etc.)
  mimeType?: string;      // MIME type (text/plain, text/markdown, etc.)
  source?: string;        // Source or origin
  timestamp?: string;     // ISO 8601 datetime
  notes?: string;         // Optional notes
  metadata?: Record<string, unknown>; // Optional metadata
}
```

### Content Field

All entities have an optional `content` array:

```typescript
content?: EntityContentItem[];
```

## Examples

### Company with Website URL

```yaml
# companies/wagner-custom-skis.yaml
id: wagner-custom-skis
name: Wagner Custom Skis
type: company
fullName: Wagner Custom Skis, Inc.
industry: Manufacturing
content:
  - type: url
    title: Company Website
    content: https://wagnercustomskis.com
    mimeType: text/uri-list
    source: Manual entry
    timestamp: "2024-01-31T20:00:00Z"
    notes: Official company website
  
  - type: text
    title: Company Description
    content: |
      Wagner Custom Skis is a boutique ski manufacturer based in Telluride, 
      Colorado. They specialize in handcrafted, custom skis tailored to 
      individual skiers' preferences and skiing style.
    mimeType: text/plain
    source: Company website
    timestamp: "2024-01-31T20:05:00Z"
```

### Project with Documentation

```yaml
# projects/cloud-migration.yaml
id: cloud-migration
name: Cloud Migration Project
type: project
description: Migrate infrastructure to AWS
content:
  - type: markdown
    title: Project Requirements
    content: |
      # Cloud Migration Requirements
      
      ## Goals
      - Migrate all services to AWS
      - Reduce infrastructure costs by 30%
      - Improve reliability and uptime
      
      ## Timeline
      - Q1: Planning and architecture
      - Q2: Migration execution
      - Q3: Optimization and monitoring
    mimeType: text/markdown
    source: Project kickoff meeting
    timestamp: "2024-01-15T10:00:00Z"
  
  - type: url
    title: AWS Architecture Diagram
    content: https://example.com/diagrams/aws-architecture.png
    mimeType: image/png
    source: Architecture team
```

### Person with LinkedIn Profile

```yaml
# people/pete_wagner.yaml
id: pete_wagner
name: Pete Wagner
type: person
firstName: Pete
lastName: Wagner
role: Founder & CEO
content:
  - type: url
    title: LinkedIn Profile
    content: https://linkedin.com/in/petewagner
    mimeType: text/uri-list
    source: Manual entry
  
  - type: text
    title: Bio
    content: |
      Pete Wagner founded Wagner Custom Skis in 2005 after 15 years 
      of experience in ski manufacturing. He's known for innovative 
      designs and commitment to sustainability.
    mimeType: text/plain
    source: Company website
```

### Term with External Documentation

```yaml
# terms/kubernetes.yaml
id: kubernetes
name: Kubernetes
type: term
expansion: Kubernetes Container Orchestration
domain: DevOps
content:
  - type: url
    title: Official Documentation
    content: https://kubernetes.io/docs/
    mimeType: text/uri-list
    source: Official website
  
  - type: markdown
    title: Quick Reference
    content: |
      # Kubernetes Quick Reference
      
      ## Key Concepts
      - **Pod**: Smallest deployable unit
      - **Service**: Network endpoint for pods
      - **Deployment**: Manages pod replicas
      - **Namespace**: Virtual cluster
    mimeType: text/markdown
    source: Internal wiki
  
  - type: code
    title: Example Deployment
    content: |
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: nginx-deployment
      spec:
        replicas: 3
        selector:
          matchLabels:
            app: nginx
        template:
          metadata:
            labels:
              app: nginx
          spec:
            containers:
            - name: nginx
              image: nginx:1.14.2
              ports:
              - containerPort: 80
    mimeType: text/x-yaml
    source: Kubernetes docs
    metadata:
      language: yaml
```

## Content Types

### Common Types

| Type | Description | Example Content |
|------|-------------|-----------------|
| `url` | Web URL | `https://example.com` |
| `text` | Plain text | Multi-line text description |
| `markdown` | Markdown document | `# Heading\n\nContent...` |
| `html` | HTML content | `<h1>Title</h1><p>Content</p>` |
| `code` | Code snippet | Source code with language metadata |
| `document` | File reference | Path to file or document ID |
| `image` | Image URL/reference | URL or file path |
| `video` | Video URL/reference | URL or file path |
| `audio` | Audio URL/reference | URL or file path |
| `json` | JSON data | Structured JSON |
| `yaml` | YAML data | Structured YAML |

### Custom Types

You can use any string as a type. Examples:
- `linkedin-profile`
- `github-repo`
- `api-endpoint`
- `database-schema`
- `meeting-notes`

## Helper Functions

### TypeScript/JavaScript

```typescript
import { 
  createUrlContent,
  createTextContent,
  createMarkdownContent,
  createCodeContent,
  createDocumentContent
} from '@redaksjon/context';

// Create a URL content item
const websiteContent = createUrlContent(
  'https://wagnercustomskis.com',
  'Company Website',
  'Manual entry',
  'Official website'
);

// Create a text content item
const descContent = createTextContent(
  'Wagner Custom Skis is a boutique manufacturer...',
  'Company Description',
  'Company website'
);

// Create a markdown content item
const docsContent = createMarkdownContent(
  '# Project Requirements\n\n## Goals\n- Goal 1\n- Goal 2',
  'Requirements',
  'Project kickoff'
);

// Create a code content item
const codeContent = createCodeContent(
  'const hello = "world";',
  'javascript',
  'Example Code',
  'Documentation'
);

// Create a document reference
const docContent = createDocumentContent(
  '/path/to/document.pdf',
  'Project Proposal',
  'application/pdf'
);
```

### Adding Content to an Entity

```typescript
import { Company } from '@redaksjon/context';

const company: Company = {
  id: 'wagner-custom-skis',
  name: 'Wagner Custom Skis',
  type: 'company',
  fullName: 'Wagner Custom Skis, Inc.',
  industry: 'Manufacturing',
  content: [
    createUrlContent(
      'https://wagnercustomskis.com',
      'Company Website'
    ),
    createTextContent(
      'Boutique ski manufacturer...',
      'Description'
    )
  ]
};
```

## Querying Content

### Find all URLs for an entity

```typescript
const urls = entity.content
  ?.filter(c => c.type === 'url')
  .map(c => ({ title: c.title, url: c.content }));
```

### Find content by title

```typescript
const website = entity.content
  ?.find(c => c.title === 'Company Website');
```

### Find all documentation

```typescript
const docs = entity.content
  ?.filter(c => c.type === 'markdown' || c.type === 'html');
```

### Get content by MIME type

```typescript
const images = entity.content
  ?.filter(c => c.mimeType?.startsWith('image/'));
```

## Best Practices

### 1. Use Descriptive Titles

```yaml
# Good
- type: url
  title: Company Website
  content: https://example.com

# Bad
- type: url
  title: URL
  content: https://example.com
```

### 2. Include Source Information

```yaml
- type: text
  title: Company Description
  content: "..."
  source: Company website  # Where did this come from?
```

### 3. Add Timestamps

```yaml
- type: url
  title: LinkedIn Profile
  content: https://linkedin.com/in/user
  timestamp: "2024-01-31T20:00:00Z"  # When was this added?
```

### 4. Use Appropriate MIME Types

```yaml
- type: markdown
  content: "# Title\n\nContent"
  mimeType: text/markdown  # Helps tools understand format

- type: code
  content: "const x = 1;"
  mimeType: text/x-javascript
  metadata:
    language: javascript
```

### 5. Keep Content Focused

Don't put entire documents in YAML. For large content:
- Use `document` type with file reference
- Store large content separately
- Link to external resources

```yaml
# Good - reference to external document
- type: document
  title: Full Project Specification
  content: /path/to/spec.pdf
  mimeType: application/pdf

# Bad - huge content inline
- type: text
  content: |
    [10,000 lines of text...]
```

## Integration with MCP

Content items can be exposed via MCP resources:

```typescript
// Example: Expose entity content as MCP resources
{
  uri: "redaksjon://company/wagner-custom-skis/content/website",
  name: "Wagner Custom Skis - Company Website",
  mimeType: "text/uri-list",
  description: "Official company website"
}
```

## Migration

If you have existing entities with ad-hoc fields for URLs or descriptions, migrate them to the `content` array:

### Before

```yaml
id: acme-corp
name: Acme Corp
type: company
website: https://acme.com  # Ad-hoc field
description: "..."  # Ad-hoc field
```

### After

```yaml
id: acme-corp
name: Acme Corp
type: company
content:
  - type: url
    title: Company Website
    content: https://acme.com
  - type: text
    title: Description
    content: "..."
```

## Future Enhancements

Potential future features:

1. **Content Validation** - Validate URLs, check file existence
2. **Content Extraction** - Auto-extract content from URLs
3. **Content Search** - Full-text search across content
4. **Content Versioning** - Track changes to content over time
5. **Content Sync** - Auto-update content from external sources
6. **Content Preview** - Generate previews/thumbnails
7. **Content Embedding** - Store embeddings for semantic search

## Summary

- ✅ All entities support `content` field
- ✅ Structured content items with type, title, content, metadata
- ✅ Helper functions for common content types
- ✅ Flexible schema supports any content type
- ✅ Timestamps and source tracking
- ✅ Works with existing entity structure
- ✅ Ready for MCP resource integration
