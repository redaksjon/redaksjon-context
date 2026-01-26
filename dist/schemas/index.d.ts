export * from './person';
export * from './project';
export * from './company';
export * from './term';
export * from './ignored';
/**
 * All redaksjon schemas for use with overcontext.
 *
 * Usage:
 * ```typescript
 * import { redaksjonSchemas } from '@redaksjon/context';
 * import { discoverOvercontext } from '@theunwalked/overcontext';
 *
 * const ctx = await discoverOvercontext({
 *   schemas: redaksjonSchemas,
 *   pluralNames: redaksjonPluralNames,
 * });
 * ```
 */
export declare const redaksjonSchemas: {
    person: import("zod").ZodObject<{
        id: import("zod").ZodString;
        name: import("zod").ZodString;
        notes: import("zod").ZodOptional<import("zod").ZodString>;
        createdAt: import("zod").ZodOptional<import("zod").ZodDate>;
        updatedAt: import("zod").ZodOptional<import("zod").ZodDate>;
        createdBy: import("zod").ZodOptional<import("zod").ZodString>;
        namespace: import("zod").ZodOptional<import("zod").ZodString>;
        source: import("zod").ZodOptional<import("zod").ZodString>;
    } & {
        type: import("zod").ZodLiteral<"person">;
        firstName: import("zod").ZodOptional<import("zod").ZodString>;
        lastName: import("zod").ZodOptional<import("zod").ZodString>;
        company: import("zod").ZodOptional<import("zod").ZodString>;
        role: import("zod").ZodOptional<import("zod").ZodString>;
        sounds_like: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
        context: import("zod").ZodOptional<import("zod").ZodString>;
    }, "strip", import("zod").ZodTypeAny, {
        type: "person";
        id: string;
        name: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        company?: string | undefined;
        role?: string | undefined;
        sounds_like?: string[] | undefined;
        context?: string | undefined;
        notes?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        createdBy?: string | undefined;
        namespace?: string | undefined;
        source?: string | undefined;
    }, {
        type: "person";
        id: string;
        name: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        company?: string | undefined;
        role?: string | undefined;
        sounds_like?: string[] | undefined;
        context?: string | undefined;
        notes?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        createdBy?: string | undefined;
        namespace?: string | undefined;
        source?: string | undefined;
    }>;
    project: import("zod").ZodObject<{
        id: import("zod").ZodString;
        name: import("zod").ZodString;
        notes: import("zod").ZodOptional<import("zod").ZodString>;
        createdAt: import("zod").ZodOptional<import("zod").ZodDate>;
        updatedAt: import("zod").ZodOptional<import("zod").ZodDate>;
        createdBy: import("zod").ZodOptional<import("zod").ZodString>;
        namespace: import("zod").ZodOptional<import("zod").ZodString>;
        source: import("zod").ZodOptional<import("zod").ZodString>;
    } & {
        type: import("zod").ZodLiteral<"project">;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        classification: import("zod").ZodObject<{
            context_type: import("zod").ZodEnum<["work", "personal", "mixed"]>;
            associated_people: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            associated_companies: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            topics: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            explicit_phrases: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
        }, "strip", import("zod").ZodTypeAny, {
            context_type: "work" | "personal" | "mixed";
            associated_people?: string[] | undefined;
            associated_companies?: string[] | undefined;
            topics?: string[] | undefined;
            explicit_phrases?: string[] | undefined;
        }, {
            context_type: "work" | "personal" | "mixed";
            associated_people?: string[] | undefined;
            associated_companies?: string[] | undefined;
            topics?: string[] | undefined;
            explicit_phrases?: string[] | undefined;
        }>;
        routing: import("zod").ZodObject<{
            destination: import("zod").ZodOptional<import("zod").ZodString>;
            structure: import("zod").ZodEnum<["none", "year", "month", "day"]>;
            filename_options: import("zod").ZodArray<import("zod").ZodEnum<["date", "time", "subject"]>, "many">;
            auto_tags: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
        }, "strip", import("zod").ZodTypeAny, {
            structure: "none" | "year" | "month" | "day";
            filename_options: ("date" | "time" | "subject")[];
            destination?: string | undefined;
            auto_tags?: string[] | undefined;
        }, {
            structure: "none" | "year" | "month" | "day";
            filename_options: ("date" | "time" | "subject")[];
            destination?: string | undefined;
            auto_tags?: string[] | undefined;
        }>;
        sounds_like: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
        relationships: import("zod").ZodOptional<import("zod").ZodObject<{
            parent: import("zod").ZodOptional<import("zod").ZodString>;
            children: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            siblings: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            dependsOn: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            relatedTerms: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
        }, "strip", import("zod").ZodTypeAny, {
            parent?: string | undefined;
            children?: string[] | undefined;
            siblings?: string[] | undefined;
            dependsOn?: string[] | undefined;
            relatedTerms?: string[] | undefined;
        }, {
            parent?: string | undefined;
            children?: string[] | undefined;
            siblings?: string[] | undefined;
            dependsOn?: string[] | undefined;
            relatedTerms?: string[] | undefined;
        }>>;
        active: import("zod").ZodOptional<import("zod").ZodBoolean>;
    }, "strip", import("zod").ZodTypeAny, {
        type: "project";
        id: string;
        name: string;
        classification: {
            context_type: "work" | "personal" | "mixed";
            associated_people?: string[] | undefined;
            associated_companies?: string[] | undefined;
            topics?: string[] | undefined;
            explicit_phrases?: string[] | undefined;
        };
        routing: {
            structure: "none" | "year" | "month" | "day";
            filename_options: ("date" | "time" | "subject")[];
            destination?: string | undefined;
            auto_tags?: string[] | undefined;
        };
        sounds_like?: string[] | undefined;
        notes?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        createdBy?: string | undefined;
        namespace?: string | undefined;
        source?: string | undefined;
        description?: string | undefined;
        relationships?: {
            parent?: string | undefined;
            children?: string[] | undefined;
            siblings?: string[] | undefined;
            dependsOn?: string[] | undefined;
            relatedTerms?: string[] | undefined;
        } | undefined;
        active?: boolean | undefined;
    }, {
        type: "project";
        id: string;
        name: string;
        classification: {
            context_type: "work" | "personal" | "mixed";
            associated_people?: string[] | undefined;
            associated_companies?: string[] | undefined;
            topics?: string[] | undefined;
            explicit_phrases?: string[] | undefined;
        };
        routing: {
            structure: "none" | "year" | "month" | "day";
            filename_options: ("date" | "time" | "subject")[];
            destination?: string | undefined;
            auto_tags?: string[] | undefined;
        };
        sounds_like?: string[] | undefined;
        notes?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        createdBy?: string | undefined;
        namespace?: string | undefined;
        source?: string | undefined;
        description?: string | undefined;
        relationships?: {
            parent?: string | undefined;
            children?: string[] | undefined;
            siblings?: string[] | undefined;
            dependsOn?: string[] | undefined;
            relatedTerms?: string[] | undefined;
        } | undefined;
        active?: boolean | undefined;
    }>;
    company: import("zod").ZodObject<{
        id: import("zod").ZodString;
        name: import("zod").ZodString;
        notes: import("zod").ZodOptional<import("zod").ZodString>;
        createdAt: import("zod").ZodOptional<import("zod").ZodDate>;
        updatedAt: import("zod").ZodOptional<import("zod").ZodDate>;
        createdBy: import("zod").ZodOptional<import("zod").ZodString>;
        namespace: import("zod").ZodOptional<import("zod").ZodString>;
        source: import("zod").ZodOptional<import("zod").ZodString>;
    } & {
        type: import("zod").ZodLiteral<"company">;
        fullName: import("zod").ZodOptional<import("zod").ZodString>;
        industry: import("zod").ZodOptional<import("zod").ZodString>;
        sounds_like: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
    }, "strip", import("zod").ZodTypeAny, {
        type: "company";
        id: string;
        name: string;
        sounds_like?: string[] | undefined;
        notes?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        createdBy?: string | undefined;
        namespace?: string | undefined;
        source?: string | undefined;
        fullName?: string | undefined;
        industry?: string | undefined;
    }, {
        type: "company";
        id: string;
        name: string;
        sounds_like?: string[] | undefined;
        notes?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        createdBy?: string | undefined;
        namespace?: string | undefined;
        source?: string | undefined;
        fullName?: string | undefined;
        industry?: string | undefined;
    }>;
    term: import("zod").ZodObject<{
        id: import("zod").ZodString;
        name: import("zod").ZodString;
        notes: import("zod").ZodOptional<import("zod").ZodString>;
        createdAt: import("zod").ZodOptional<import("zod").ZodDate>;
        updatedAt: import("zod").ZodOptional<import("zod").ZodDate>;
        createdBy: import("zod").ZodOptional<import("zod").ZodString>;
        namespace: import("zod").ZodOptional<import("zod").ZodString>;
        source: import("zod").ZodOptional<import("zod").ZodString>;
    } & {
        type: import("zod").ZodLiteral<"term">;
        expansion: import("zod").ZodOptional<import("zod").ZodString>;
        domain: import("zod").ZodOptional<import("zod").ZodString>;
        sounds_like: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
        projects: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        topics: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
    }, "strip", import("zod").ZodTypeAny, {
        type: "term";
        id: string;
        name: string;
        sounds_like?: string[] | undefined;
        notes?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        createdBy?: string | undefined;
        namespace?: string | undefined;
        source?: string | undefined;
        topics?: string[] | undefined;
        description?: string | undefined;
        expansion?: string | undefined;
        domain?: string | undefined;
        projects?: string[] | undefined;
    }, {
        type: "term";
        id: string;
        name: string;
        sounds_like?: string[] | undefined;
        notes?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        createdBy?: string | undefined;
        namespace?: string | undefined;
        source?: string | undefined;
        topics?: string[] | undefined;
        description?: string | undefined;
        expansion?: string | undefined;
        domain?: string | undefined;
        projects?: string[] | undefined;
    }>;
    ignored: import("zod").ZodObject<{
        id: import("zod").ZodString;
        name: import("zod").ZodString;
        notes: import("zod").ZodOptional<import("zod").ZodString>;
        createdAt: import("zod").ZodOptional<import("zod").ZodDate>;
        updatedAt: import("zod").ZodOptional<import("zod").ZodDate>;
        createdBy: import("zod").ZodOptional<import("zod").ZodString>;
        namespace: import("zod").ZodOptional<import("zod").ZodString>;
        source: import("zod").ZodOptional<import("zod").ZodString>;
    } & {
        type: import("zod").ZodLiteral<"ignored">;
        reason: import("zod").ZodOptional<import("zod").ZodString>;
        ignoredAt: import("zod").ZodOptional<import("zod").ZodString>;
    }, "strip", import("zod").ZodTypeAny, {
        type: "ignored";
        id: string;
        name: string;
        notes?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        createdBy?: string | undefined;
        namespace?: string | undefined;
        source?: string | undefined;
        reason?: string | undefined;
        ignoredAt?: string | undefined;
    }, {
        type: "ignored";
        id: string;
        name: string;
        notes?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        createdBy?: string | undefined;
        namespace?: string | undefined;
        source?: string | undefined;
        reason?: string | undefined;
        ignoredAt?: string | undefined;
    }>;
};
/**
 * Plural names for directory mapping.
 */
export declare const redaksjonPluralNames: {
    person: string;
    company: string;
};
//# sourceMappingURL=index.d.ts.map