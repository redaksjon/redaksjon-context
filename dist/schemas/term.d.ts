import { z } from 'zod';
/**
 * Term entity - domain-specific terminology and acronyms.
 */
export declare const TermSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
    createdBy: z.ZodOptional<z.ZodString>;
    namespace: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"term">;
    expansion: z.ZodOptional<z.ZodString>;
    domain: z.ZodOptional<z.ZodString>;
    sounds_like: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    projects: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    description: z.ZodOptional<z.ZodString>;
    topics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
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
//# sourceMappingURL=term.d.ts.map