import { z } from 'zod';
/**
 * Project classification signals.
 */
export declare const ProjectClassificationSchema: z.ZodObject<{
    context_type: z.ZodEnum<["work", "personal", "mixed"]>;
    associated_people: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    associated_companies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    topics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    explicit_phrases: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
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
/**
 * Project routing configuration.
 */
export declare const ProjectRoutingSchema: z.ZodObject<{
    destination: z.ZodOptional<z.ZodString>;
    structure: z.ZodEnum<["none", "year", "month", "day"]>;
    filename_options: z.ZodArray<z.ZodEnum<["date", "time", "subject"]>, "many">;
    auto_tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
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
/**
 * Project relationships.
 */
export declare const ProjectRelationshipsSchema: z.ZodOptional<z.ZodObject<{
    parent: z.ZodOptional<z.ZodString>;
    children: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    siblings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dependsOn: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    relatedTerms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
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
/**
 * Project entity - work contexts that affect routing and understanding.
 */
export declare const ProjectSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
    createdBy: z.ZodOptional<z.ZodString>;
    namespace: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"project">;
    description: z.ZodOptional<z.ZodString>;
    classification: z.ZodObject<{
        context_type: z.ZodEnum<["work", "personal", "mixed"]>;
        associated_people: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        associated_companies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        topics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        explicit_phrases: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    routing: z.ZodObject<{
        destination: z.ZodOptional<z.ZodString>;
        structure: z.ZodEnum<["none", "year", "month", "day"]>;
        filename_options: z.ZodArray<z.ZodEnum<["date", "time", "subject"]>, "many">;
        auto_tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    sounds_like: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    relationships: z.ZodOptional<z.ZodObject<{
        parent: z.ZodOptional<z.ZodString>;
        children: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        siblings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        dependsOn: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        relatedTerms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
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
//# sourceMappingURL=project.d.ts.map