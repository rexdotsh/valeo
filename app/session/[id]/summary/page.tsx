'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function SummaryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = useMemo(
    () => (Array.isArray(params?.id) ? params.id[0] : params?.id) ?? '',
    [params],
  );

  const session = useQuery(
    api.index.getSession,
    sessionId ? { sessionId } : 'skip',
  );
  const notes = useQuery(
    api.index.getNotes,
    sessionId ? { sessionId } : 'skip',
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Visit summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Session: {sessionId}
          </div>
          {session?.triage ? (
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Category:</span>{' '}
                {session.triage.category}
              </div>
              <div>
                <span className="font-medium">Urgency:</span>{' '}
                {session.triage.urgency}
              </div>
              <div>
                <span className="font-medium">Language:</span>{' '}
                {session.triage.language}
              </div>
              <div>
                <span className="font-medium">Complaint:</span>{' '}
                {session.triage.symptoms}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No triage data found.
            </div>
          )}

          {notes?.body ? (
            <div className="space-y-1 text-sm">
              <div className="font-medium">Doctor notes</div>
              <div className="whitespace-pre-wrap text-muted-foreground">
                {notes.body}
              </div>
            </div>
          ) : null}

          <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            AI summary will appear here after the call. This will include key
            findings, advice, and red-flags.
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => window.print()}>
              Print
            </Button>
            <Button onClick={() => router.push('/')}>Back</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
