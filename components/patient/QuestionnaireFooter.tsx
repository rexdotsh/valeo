'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function QuestionnaireFooter({
  canGoBack,
  isLast,
  submitting,
  onBack,
  onNext,
}: {
  canGoBack: boolean;
  isLast: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
}): React.JSX.Element {
  return (
    <div className="border-t px-3 py-2 flex items-center justify-between">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onBack}
        disabled={!canGoBack}
      >
        <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
      </Button>
      {isLast ? (
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </Button>
      ) : (
        <Button type="button" size="sm" onClick={onNext}>
          Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
