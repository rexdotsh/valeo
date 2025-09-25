'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { schema, type FormValues } from './types';
import { STEPS } from './QuestionnaireSteps';
import QuestionnaireHeader from './QuestionnaireHeader';
import QuestionnaireFooter from './QuestionnaireFooter';

function generateSessionId(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => (b % 36).toString(36))
    .join('');
}

export default function PatientQuestionnaire({
  onSubmitted,
}: {
  onSubmitted?: (sessionId: string) => void;
}): React.JSX.Element {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const enqueue = useMutation(api.index.enqueueSession);
  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Category', blurb: 'Type of care' },
    { title: 'Urgency', blurb: 'How urgent' },
    { title: 'Language', blurb: 'Preferred language' },
    { title: 'Symptoms', blurb: 'Describe issue' },
    { title: 'Confirm', blurb: 'Review & consent' },
  ] as const;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: '',
      urgency: 'routine',
      language: 'en',
      symptoms: '',
      consent: false,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const sessionId = generateSessionId();
      const { category, urgency, language, symptoms } = values;
      await enqueue({
        sessionId,
        triage: { category, urgency, language, symptoms },
      });
      if (onSubmitted) onSubmitted(sessionId);
      else router.push(`/session/${sessionId}/waiting`);
    } finally {
      setSubmitting(false);
    }
  }

  const stepFields: Array<Array<keyof FormValues>> = [
    ['category'],
    ['urgency'],
    ['language'],
    ['symptoms'],
    ['consent'],
  ];

  async function next() {
    const valid = await form.trigger(stepFields[step], { shouldFocus: true });
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  const progressValue = Math.round(((step + 1) / steps.length) * 100);

  return (
    <div className="h-full w-full flex flex-col">
      <QuestionnaireHeader
        step={step}
        totalSteps={steps.length}
        progressValue={progressValue}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDownCapture={(e) => {
            if (e.key === 'Enter' && step !== steps.length - 1) {
              e.preventDefault();
              void next();
            }
          }}
          className="flex-1 min-h-0 flex flex-col"
        >
          <div className="flex-1 min-h-0 p-2 space-y-3">
            {(() => {
              const StepComponent = STEPS[step];
              return <StepComponent />;
            })()}
          </div>

          <QuestionnaireFooter
            canGoBack={step > 0}
            isLast={step === steps.length - 1}
            submitting={submitting}
            onBack={back}
            onNext={() => void next()}
          />
        </form>
      </Form>
    </div>
  );
}
