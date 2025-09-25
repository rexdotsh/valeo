'use client';

export default function QuestionnaireHeader({
  step,
  totalSteps,
  progressValue,
}: {
  step: number;
  totalSteps: number;
  progressValue: number;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b">
      <div className="text-[11px] text-muted-foreground font-medium">
        Step {step + 1} of {totalSteps}
      </div>
      <div className="flex items-center gap-2 w-28">
        <div className="h-1.5 w-full rounded bg-muted overflow-hidden">
          <div
            className="h-1.5 bg-primary"
            style={{ width: `${progressValue}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          {step + 1}/{totalSteps}
        </span>
      </div>
    </div>
  );
}
