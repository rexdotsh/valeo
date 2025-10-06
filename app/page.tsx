'use client';

import Link from 'next/link';
import Image from 'next/image';
import * as React from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { getUpcomingPrescriptions } from '@/lib/sampledata';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { orders, splitOrders } from '@/lib/orders';
import PatientQuestionnaire from '@/components/patient/PatientQuestionnaire';
import { authClient } from '@/lib/auth-client';
import { Sparkles, Stethoscope } from 'lucide-react';

function PastConsultationsTile(): React.JSX.Element {
  const { isAuthenticated } = useConvexAuth();
  const consultations = useQuery(
    api.index.listPastConsultations,
    isAuthenticated ? { limit: 5 } : 'skip',
  );
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-medium">Consultations</h3>
        <span className="text-xs text-muted-foreground">Last 5</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3">
        {consultations === undefined ? (
          <div className="h-full grid place-items-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : consultations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="h-16 w-16 rounded-full bg-muted grid place-items-center mb-3">
              💬
            </div>
            <div className="text-sm font-medium">No past consultations</div>
            <div className="text-xs text-muted-foreground mt-1">
              When you finish a visit, it will appear here.
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {consultations.map((c) => (
              <li
                key={c.sessionId}
                className="rounded-md border bg-background p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${c.urgency === 'emergency' ? 'bg-rose-500' : c.urgency === 'urgent' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                  <div className="text-sm font-medium truncate capitalize">
                    {c.category}
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {format(new Date(c.date), 'MMM d, yyyy')}
                  </div>
                </div>
                {c.summary ? (
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {c.summary}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StartConsultationTile(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-medium">Start a consultation</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-3 py-1 rounded-md border bg-background text-sm hover:bg-accent"
        >
          {open ? 'Close' : 'Begin'}
        </button>
      </div>
      {open ? (
        <div className="flex-1 min-h-0 overflow-hidden p-3">
          <PatientQuestionnaire />
        </div>
      ) : (
        <div className="flex-1 flex items-center p-6 gap-6">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
                Talk to a Provider
              </h3>
              <p className="text-sm text-muted-foreground">
                Get personalized medical advice from licensed healthcare
                professionals in minutes
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Available 24/7
                </span>
              </div>
            </div>
          </div>

          <div className="h-32 w-px bg-border/50" />

          <div className="flex-[1.5] flex items-center justify-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group relative px-16 py-8 rounded-xl bg-background border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground mb-1">
                    Begin now
                  </div>
                  <div className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Click to start →
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersTile(): React.JSX.Element {
  const { history, upcoming } = React.useMemo(() => splitOrders(orders), []);
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-medium">Orders</h3>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:underline"
        >
          View all
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-4">
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Upcoming
          </div>
          {upcoming.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              No upcoming orders
            </div>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((o) => (
                <li key={o.id} className="rounded-md border bg-background p-3">
                  <div className="text-sm font-medium truncate">{o.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                    <span>{o.quantity}</span>
                    {o.eta ? (
                      <span>• ETA {format(new Date(o.eta), 'MMM d')}</span>
                    ) : null}
                    <span className="ml-auto capitalize">{o.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            History
          </div>
          {history.length === 0 ? (
            <div className="text-xs text-muted-foreground">No past orders</div>
          ) : (
            <ul className="space-y-2">
              {history.map((o) => (
                <li key={o.id} className="rounded-md border bg-background p-3">
                  <div className="text-sm font-medium truncate">{o.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                    <span>{o.quantity}</span>
                    <span>
                      • Placed {format(new Date(o.placedAt), 'MMM d')}
                    </span>
                    <span className="ml-auto capitalize">{o.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function PrescriptionCalendarTile(): React.JSX.Element {
  const [month, setMonth] = React.useState<Date>(new Date());
  const upcoming = React.useMemo(
    () => getUpcomingPrescriptions(new Date(), 7),
    [],
  );

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">
              💊
            </span>
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Prescriptions
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground font-medium">
            {format(new Date(), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 min-h-0">
        <div className="lg:flex-1">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 rounded-xl blur-xl" />
            <Calendar
              month={month}
              onMonthChange={setMonth}
              className="relative w-full max-w-sm mx-auto lg:mx-0 rounded-xl border shadow-lg bg-background/80 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="flex-1 lg:flex-[2] lg:border-l lg:pl-6">
          <div className="h-full flex flex-col">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg blur-xl" />
              <div className="relative bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                <h4 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Upcoming Prescriptions
                </h4>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-primary to-secondary rounded-full" />
                  <p className="text-sm text-muted-foreground">Next 7 days</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <span className="text-lg">💤</span>
                  </div>
                  No upcoming doses
                </div>
              ) : (
                <div className="space-y-6">
                  {upcoming.map((d, dayIndex) => (
                    <div
                      key={d.date}
                      className="space-y-4 animate-fade-in"
                      style={{ animationDelay: `${dayIndex * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-foreground bg-gradient-to-r from-primary/10 to-secondary/10 px-3 py-1 rounded-full">
                          {format(new Date(d.date), 'EEE, MMM d')}
                        </div>
                        <div className="h-px bg-gradient-to-r from-border via-primary/20 to-transparent flex-1" />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {d.entries.slice(0, 6).map((e, index) => (
                          <div
                            key={e.id}
                            className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-background to-muted/20 border border-border/50 hover:border-primary/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                            style={{
                              animationDelay: `${dayIndex * 0.1 + index * 0.05}s`,
                            }}
                          >
                            <div className="relative">
                              <span
                                className={`h-4 w-4 rounded-full flex-shrink-0 ${e.colorClass} shadow-lg group-hover:shadow-xl transition-shadow`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-base font-semibold truncate mb-1 group-hover:text-primary transition-colors">
                                {e.name}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <span className="text-xs">🕒</span>
                                {e.times.slice(0, 3).join(' • ')}
                                {e.times.length > 3 &&
                                  ` +${e.times.length - 3} more`}
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs text-primary">→</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {d.entries.length > 6 && (
                          <div className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
                            <span className="mr-2">📋</span>+
                            {d.entries.length - 6} more medications
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/valeo.svg"
            alt="Valeo"
            width={150}
            height={150}
            className="h-11 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="p-2 hover:bg-secondary/80 rounded-md transition-colors"
            title="Chat"
          >
            <Sparkles className="h-5 w-5" />
          </Link>
          <Link
            href="/doctor"
            className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium transition-colors"
          >
            Doctor portal
          </Link>
          <button
            type="button"
            onClick={() => authClient.signOut()}
            className="px-4 py-2 bg-muted text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-end p-4 pb-4">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-muted/50 h-[460px] rounded-xl md:col-span-1 overflow-hidden">
              <PastConsultationsTile />
            </div>
            <div className="bg-muted/50 h-[460px] rounded-xl md:col-span-2 overflow-hidden">
              <PrescriptionCalendarTile />
            </div>
            <div className="bg-muted/50 h-80 rounded-xl md:col-span-2 overflow-hidden">
              <StartConsultationTile />
            </div>
            <div className="bg-muted/50 h-80 rounded-xl md:col-span-1 overflow-hidden">
              <OrdersTile />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
