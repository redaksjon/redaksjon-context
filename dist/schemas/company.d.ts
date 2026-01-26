import { z } from 'zod';
/**
 * Company entity - organizations referenced in notes.
 */
export declare const CompanySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
    createdBy: z.ZodOptional<z.ZodString>;
    namespace: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"company">;
    fullName: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
    sounds_like: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
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
//# sourceMappingURL=company.d.ts.map