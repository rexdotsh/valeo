'use client';

import Link from 'next/link';
import Image from 'next/image';
import * as React from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  getMonthPrescriptionMap,
  getUpcomingPrescriptions,
} from '@/lib/sampledata';

function PrescriptionCalendarTile(): React.JSX.Element {
  const [month, setMonth] = React.useState<Date>(new Date());
  React.useMemo(() => getMonthPrescriptionMap(month), [month]);
  const upcoming = React.useMemo(
    () => getUpcomingPrescriptions(new Date(), 7),
    [],
  );

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-background to-muted/30 backdrop-blur-sm">
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
        <Link
          href="/doctor"
          className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium transition-colors"
        >
          Doctor portal
        </Link>
      </header>

      <div className="flex flex-1 flex-col justify-end p-4 pb-4">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-muted/50 h-[500px] rounded-xl md:col-span-1" />
            <div className="bg-muted/50 h-[500px] rounded-xl md:col-span-2 overflow-hidden">
              <PrescriptionCalendarTile />
            </div>
            <div className="bg-muted/50 h-72 rounded-xl md:col-span-2" />
            <div className="bg-muted/50 h-72 rounded-xl md:col-span-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
