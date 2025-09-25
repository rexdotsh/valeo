import { z } from 'zod';

export const schema = z.object({
  category: z.string().min(1, 'Select a category'),
  urgency: z.enum(['routine', 'urgent', 'emergency']),
  language: z.string().min(1, 'Select a language'),
  symptoms: z.string().min(1, 'Please describe your issue'),
  consent: z.boolean().refine((v) => v === true, 'Consent is required'),
});

export type FormValues = z.infer<typeof schema>;

export const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'mental_health', label: 'Mental health' },
] as const;

export const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
] as const;
