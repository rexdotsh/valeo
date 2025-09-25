'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CATEGORY_OPTIONS, URGENCY_OPTIONS, LANGUAGE_OPTIONS } from './types';
import type { FormValues } from './types';

export function CategoryStep(): React.JSX.Element {
  const form = useFormContext<FormValues>();
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            What type of care do you need?
          </FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-2 gap-3"
            >
              {CATEGORY_OPTIONS.map((opt) => {
                const id = `category-tile-${opt.value}`;
                const selected = field.value === opt.value;
                return (
                  <div key={opt.value} className="relative">
                    <RadioGroupItem
                      id={id}
                      value={opt.value}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={id}
                      className={cn(
                        'flex cursor-pointer select-none items-center justify-center rounded-lg border p-4 text-sm font-medium transition-colors min-h-[60px]',
                        selected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20 text-primary'
                          : 'hover:bg-accent/50 hover:border-accent-foreground/20',
                      )}
                    >
                      {opt.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function UrgencyStep(): React.JSX.Element {
  const form = useFormContext<FormValues>();
  return (
    <FormField
      control={form.control}
      name="urgency"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            How urgent is your concern?
          </FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex flex-col gap-2"
            >
              {URGENCY_OPTIONS.map((opt) => {
                const id = `urgency-tile-${opt.value}`;
                const selected = field.value === opt.value;
                return (
                  <div key={opt.value} className="relative">
                    <RadioGroupItem
                      id={id}
                      value={opt.value}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={id}
                      className={cn(
                        'flex cursor-pointer select-none items-center justify-center rounded-md border px-3 py-2 text-xs font-medium transition-colors',
                        selected
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/20 text-primary'
                          : 'hover:bg-accent/50 hover:border-accent-foreground/20',
                      )}
                    >
                      {opt.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function LanguageStep(): React.JSX.Element {
  const form = useFormContext<FormValues>();
  return (
    <FormField
      control={form.control}
      name="language"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            What language would you prefer?
          </FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-2 gap-3"
            >
              {LANGUAGE_OPTIONS.map((opt) => {
                const id = `language-tile-${opt.value}`;
                const selected = field.value === opt.value;
                return (
                  <div key={opt.value} className="relative">
                    <RadioGroupItem
                      id={id}
                      value={opt.value}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={id}
                      className={cn(
                        'flex cursor-pointer select-none items-center justify-center rounded-lg border p-4 text-sm font-medium transition-colors min-h-[60px]',
                        selected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20 text-primary'
                          : 'hover:bg-accent/50 hover:border-accent-foreground/20',
                      )}
                    >
                      {opt.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SymptomsStep(): React.JSX.Element {
  const form = useFormContext<FormValues>();
  return (
    <FormField
      control={form.control}
      name="symptoms"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Describe your issue
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Tell us what's bothering you..."
              rows={4}
              className="text-sm resize-none"
              {...field}
            />
          </FormControl>
          <FormDescription className="text-muted-foreground text-xs">
            Keep it brief and specific to help us route you to the right doctor.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ConfirmStep(): React.JSX.Element {
  const form = useFormContext<FormValues>();
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
      <div className="space-y-2">
        <div className="text-lg font-medium">Almost done!</div>
        <div className="text-sm text-muted-foreground">
          Just need your consent to proceed
        </div>
      </div>

      <FormField
        control={form.control}
        name="consent"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-start gap-3 text-sm">
              <input
                id="consent"
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary mt-0.5 flex-shrink-0"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <Label htmlFor="consent" className="leading-relaxed text-left">
                I consent to use this service and agree to the privacy notice.
              </Label>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export const STEPS = [
  CategoryStep,
  UrgencyStep,
  LanguageStep,
  SymptomsStep,
  ConfirmStep,
] as const;
