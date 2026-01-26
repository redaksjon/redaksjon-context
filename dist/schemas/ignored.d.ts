import { z } from 'zod';
/**
 * Ignored term - phrases the user doesn't want to be prompted about.
 */
export declare const IgnoredTermSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
    createdBy: z.ZodOptional<z.ZodString>;
    namespace: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"ignored">;
    reason: z.ZodOptional<z.ZodString>;
    ignoredAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
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
//# sourceMappingURL=ignored.d.ts.map