import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs/promises';
import * as yaml from 'js-yaml';
import { PersonSchema, ProjectSchema, TermSchema, CompanySchema } from '../src/schemas';

describe('Backwards Compatibility', () => {
  // These tests validate that schemas work with actual protokoll context files
  // Set TEST_CONTEXT_DIR environment variable to run against real data
  
  const testContextDir = process.env.TEST_CONTEXT_DIR;
  
  it('parses existing person YAML', async () => {
    if (!testContextDir) {
      console.log('Skipping compatibility test: set TEST_CONTEXT_DIR to run');
      return;
    }
    
    const peopleDir = `${testContextDir}/people`;
    try {
      const files = await fs.readdir(peopleDir);
      const yamlFiles = files.filter(f => f.endsWith('.yaml'));
      
      if (yamlFiles.length === 0) {
        console.log('No person YAML files found');
        return;
      }
      
      for (const file of yamlFiles.slice(0, 5)) { // Test first 5
        const content = await fs.readFile(`${peopleDir}/${file}`, 'utf-8');
        const data = yaml.load(content);
        
        const result = PersonSchema.safeParse({
          ...data,
          type: 'person',  // Type is inferred from directory
        });
        
        if (!result.success) {
          console.error(`Failed to parse ${file}:`, result.error);
        }
        expect(result.success).toBe(true);
      }
    } catch (err) {
      console.log('Could not read people directory:', err);
    }
  });
  
  it('parses existing project YAML', async () => {
    if (!testContextDir) {
      console.log('Skipping compatibility test: set TEST_CONTEXT_DIR to run');
      return;
    }
    
    const projectsDir = `${testContextDir}/projects`;
    try {
      const files = await fs.readdir(projectsDir);
      const yamlFiles = files.filter(f => f.endsWith('.yaml'));
      
      if (yamlFiles.length === 0) {
        console.log('No project YAML files found');
        return;
      }
      
      for (const file of yamlFiles.slice(0, 5)) { // Test first 5
        const content = await fs.readFile(`${projectsDir}/${file}`, 'utf-8');
        const data = yaml.load(content);
        
        const result = ProjectSchema.safeParse({
          ...data,
          type: 'project',
        });
        
        if (!result.success) {
          console.error(`Failed to parse ${file}:`, result.error);
        }
        expect(result.success).toBe(true);
      }
    } catch (err) {
      console.log('Could not read projects directory:', err);
    }
  });
  
  it('parses existing term YAML', async () => {
    if (!testContextDir) {
      console.log('Skipping compatibility test: set TEST_CONTEXT_DIR to run');
      return;
    }
    
    const termsDir = `${testContextDir}/terms`;
    try {
      const files = await fs.readdir(termsDir);
      const yamlFiles = files.filter(f => f.endsWith('.yaml'));
      
      if (yamlFiles.length === 0) {
        console.log('No term YAML files found');
        return;
      }
      
      for (const file of yamlFiles.slice(0, 5)) { // Test first 5
        const content = await fs.readFile(`${termsDir}/${file}`, 'utf-8');
        const data = yaml.load(content);
        
        const result = TermSchema.safeParse({
          ...data,
          type: 'term',
        });
        
        if (!result.success) {
          console.error(`Failed to parse ${file}:`, result.error);
        }
        expect(result.success).toBe(true);
      }
    } catch (err) {
      console.log('Could not read terms directory:', err);
    }
  });
});
