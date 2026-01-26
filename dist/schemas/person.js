import { z } from 'zod';
import { BaseEntitySchema } from '@theunwalked/overcontext';
/**
 * Person entity - named individuals the user frequently mentions.
 */
export const PersonSchema = BaseEntitySchema.extend({
    type: z.literal('person'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    company: z.string().optional(), // Company ID reference
    role: z.string().optional(), // e.g., "Manager", "Developer"
    sounds_like: z.array(z.string()).optional(), // Common mishearings
    context: z.string().optional(), // How user knows them
});
