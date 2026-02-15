import { describe, it, expect } from 'vitest';
import {
    isTermAssociatedWithProject,
    addProjectToTerm,
    removeProjectFromTerm,
    isParentProject,
    isChildProject,
    areSiblingProjects,
    getProjectRelationshipDistance,
} from '../src/helpers';
import type { Term, Project } from '../src/types';

describe('helpers', () => {
    describe('isTermAssociatedWithProject', () => {
        it('returns true when term has the project in projects array', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
                projects: ['devops', 'cloud-infra'],
            };
            expect(isTermAssociatedWithProject(term, 'devops')).toBe(true);
        });

        it('returns false when term does not have the project', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
                projects: ['devops'],
            };
            expect(isTermAssociatedWithProject(term, 'cloud-infra')).toBe(false);
        });

        it('returns false when term has no projects array', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
            };
            expect(isTermAssociatedWithProject(term, 'devops')).toBe(false);
        });

        it('returns false when projects array is empty', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
                projects: [],
            };
            expect(isTermAssociatedWithProject(term, 'devops')).toBe(false);
        });
    });

    describe('addProjectToTerm', () => {
        it('adds a project to term with no existing projects', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
            };
            const result = addProjectToTerm(term, 'devops');
            expect(result.projects).toEqual(['devops']);
            expect(result.updatedAt).toBeInstanceOf(Date);
        });

        it('adds a project to term with existing projects', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
                projects: ['cloud-infra'],
            };
            const result = addProjectToTerm(term, 'devops');
            expect(result.projects).toEqual(['cloud-infra', 'devops']);
        });

        it('does not add duplicate project', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
                projects: ['devops'],
            };
            const result = addProjectToTerm(term, 'devops');
            expect(result.projects).toEqual(['devops']);
            expect(result).toBe(term); // Returns same object
        });

        it('preserves other term properties', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
                description: 'Container orchestration',
                projects: [],
            };
            const result = addProjectToTerm(term, 'devops');
            expect(result.description).toBe('Container orchestration');
            expect(result.id).toBe('kubernetes');
        });
    });

    describe('removeProjectFromTerm', () => {
        it('removes a project from term', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
                projects: ['devops', 'cloud-infra'],
            };
            const result = removeProjectFromTerm(term, 'devops');
            expect(result.projects).toEqual(['cloud-infra']);
            expect(result.updatedAt).toBeInstanceOf(Date);
        });

        it('handles removing non-existent project', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
                projects: ['devops'],
            };
            const result = removeProjectFromTerm(term, 'cloud-infra');
            expect(result.projects).toEqual(['devops']);
        });

        it('handles term with no projects array', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
            };
            const result = removeProjectFromTerm(term, 'devops');
            expect(result.projects).toEqual([]);
        });

        it('removes last project leaving empty array', () => {
            const term: Term = {
                id: 'kubernetes',
                name: 'Kubernetes',
                type: 'term',
                projects: ['devops'],
            };
            const result = removeProjectFromTerm(term, 'devops');
            expect(result.projects).toEqual([]);
        });
    });

    describe('isParentProject', () => {
        it('returns true when projectA is parent of projectB (parent relationship)', () => {
            const projectA: Project = {
                id: 'parent-project',
                name: 'Parent Project',
                type: 'project',
            };
            const projectB: Project = {
                id: 'child-project',
                name: 'Child Project',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/parent-project',
                        relationship: 'parent',
                    },
                ],
            };
            expect(isParentProject(projectA, projectB)).toBe(true);
        });

        it('returns true when projectA is parent of projectB (child_of relationship)', () => {
            const projectA: Project = {
                id: 'parent-project',
                name: 'Parent Project',
                type: 'project',
            };
            const projectB: Project = {
                id: 'child-project',
                name: 'Child Project',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/parent-project',
                        relationship: 'child_of',
                    },
                ],
            };
            expect(isParentProject(projectA, projectB)).toBe(true);
        });

        it('returns true when projectA is parent of projectB (part_of relationship)', () => {
            const projectA: Project = {
                id: 'parent-project',
                name: 'Parent Project',
                type: 'project',
            };
            const projectB: Project = {
                id: 'child-project',
                name: 'Child Project',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/parent-project',
                        relationship: 'part_of',
                    },
                ],
            };
            expect(isParentProject(projectA, projectB)).toBe(true);
        });

        it('returns false when projectA is not parent of projectB', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/other-project',
                        relationship: 'parent',
                    },
                ],
            };
            expect(isParentProject(projectA, projectB)).toBe(false);
        });

        it('returns false when projectB has no relationships', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
            };
            expect(isParentProject(projectA, projectB)).toBe(false);
        });
    });

    describe('isChildProject', () => {
        it('returns true when projectA is child of projectB', () => {
            const projectA: Project = {
                id: 'child-project',
                name: 'Child Project',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/parent-project',
                        relationship: 'parent',
                    },
                ],
            };
            const projectB: Project = {
                id: 'parent-project',
                name: 'Parent Project',
                type: 'project',
            };
            expect(isChildProject(projectA, projectB)).toBe(true);
        });

        it('returns false when projectA is not child of projectB', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/other-project',
                        relationship: 'parent',
                    },
                ],
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
            };
            expect(isChildProject(projectA, projectB)).toBe(false);
        });

        it('returns false when projectA has no relationships', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
            };
            expect(isChildProject(projectA, projectB)).toBe(false);
        });
    });

    describe('areSiblingProjects', () => {
        it('returns true when projectA has sibling relationship to projectB', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/project-b',
                        relationship: 'sibling',
                    },
                ],
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
            };
            expect(areSiblingProjects(projectA, projectB)).toBe(true);
        });

        it('returns true when projectB has sibling relationship to projectA', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/project-a',
                        relationship: 'sibling',
                    },
                ],
            };
            expect(areSiblingProjects(projectA, projectB)).toBe(true);
        });

        it('returns false when projects are not siblings', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
            };
            expect(areSiblingProjects(projectA, projectB)).toBe(false);
        });

        it('returns false when sibling relationship points to different project', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/project-c',
                        relationship: 'sibling',
                    },
                ],
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
            };
            expect(areSiblingProjects(projectA, projectB)).toBe(false);
        });
    });

    describe('getProjectRelationshipDistance', () => {
        it('returns 0 for same project', () => {
            const project: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
            };
            expect(getProjectRelationshipDistance(project, project)).toBe(0);
        });

        it('returns 1 for parent-child relationship', () => {
            const parent: Project = {
                id: 'parent',
                name: 'Parent',
                type: 'project',
            };
            const child: Project = {
                id: 'child',
                name: 'Child',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/parent',
                        relationship: 'parent',
                    },
                ],
            };
            expect(getProjectRelationshipDistance(parent, child)).toBe(1);
            expect(getProjectRelationshipDistance(child, parent)).toBe(1);
        });

        it('returns 2 for sibling relationship', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/project-b',
                        relationship: 'sibling',
                    },
                ],
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
            };
            expect(getProjectRelationshipDistance(projectA, projectB)).toBe(2);
        });

        it('returns 2 for projects sharing same parent', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/parent',
                        relationship: 'parent',
                    },
                ],
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/parent',
                        relationship: 'parent',
                    },
                ],
            };
            expect(getProjectRelationshipDistance(projectA, projectB)).toBe(2);
        });

        it('returns -1 for unrelated projects', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
            };
            expect(getProjectRelationshipDistance(projectA, projectB)).toBe(-1);
        });

        it('returns -1 for projects with different parents', () => {
            const projectA: Project = {
                id: 'project-a',
                name: 'Project A',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/parent-a',
                        relationship: 'parent',
                    },
                ],
            };
            const projectB: Project = {
                id: 'project-b',
                name: 'Project B',
                type: 'project',
                relationships: [
                    {
                        uri: 'redaksjon://project/parent-b',
                        relationship: 'parent',
                    },
                ],
            };
            expect(getProjectRelationshipDistance(projectA, projectB)).toBe(-1);
        });
    });
});
