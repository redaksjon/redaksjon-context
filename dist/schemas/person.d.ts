import { z } from 'zod';
/**
 * Person entity - named individuals the user frequently mentions.
 */
export declare const PersonSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
    createdBy: z.ZodOptional<z.ZodString>;
    namespace: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"person">;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    sounds_like: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    context: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
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
//# sourceMappingURL=person.d.ts.map