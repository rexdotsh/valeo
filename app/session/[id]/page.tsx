'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TuiFallbackDialog } from '@/components/TuiFallbackDialog';
import { PeerJsEngine } from '@/lib/call/PeerJsEngine';
import { authClient } from '@/lib/auth-client';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { NotesPanel } from '@/components/NotesPanel';
import { MicActivity } from '@/components/MicActivity';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Terminal,
  UserCircle2,
  Stethoscope,
  Send,
} from 'lucide-react';

type Role = 'patient' | 'doctor';

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = useMemo(
    () => (Array.isArray(params?.id) ? params.id[0] : params?.id) ?? '',
    [params],
  );

  const { data: authSession, isPending: authPending } = authClient.useSession();
  const referrerRole = useMemo<Role>(() => {
    const ref = typeof document !== 'undefined' ? document.referrer || '' : '';
    return ref.includes('/doctor') ? 'doctor' : 'patient';
  }, []);
  const role = useMemo<Role>(
    () =>
      authPending ? referrerRole : authSession?.user ? 'doctor' : 'patient',
    [authPending, authSession, referrerRole],
  );
  const roleReady = !authPending;

  const [ready, setReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [showTui, setShowTui] = useState(false);
  const [hasRemote, setHasRemote] = useState(false);

  const serverMessages = useQuery(
    api.index.listMessages,
    sessionId ? { sessionId } : 'skip',
  );
  const sendServerMessage = useMutation(api.index.sendMessage);
  const setStatus = useMutation(api.index.setSessionStatus);
  const sessionInfo = useQuery(
    api.index.getSession,
    sessionId ? { sessionId } : 'skip',
  );

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<PeerJsEngine | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!sessionId || !roleReady) return;

    const myId = `${role}-${sessionId}`;
    const otherId = `${role === 'patient' ? 'doctor' : 'patient'}-${sessionId}`;

    const engine = new PeerJsEngine(myId, otherId, {
      onConnected: () => {
        setIsConnected(true);
        setError(null);
      },
      onRemoteStream: (remote) => {
        const v = remoteVideoRef.current;
        if (v) {
          v.srcObject = remote;
          v.play().catch(() => {});
        }
        setHasRemote(true);
        setIsConnected(true);
        setError(null);
      },
      onData: () => {},
      onError: (msg) => {
        const m = (msg || '').toLowerCase();
        const isTransient =
          m.includes('could not connect') ||
          m.includes('peer-unavailable') ||
          m.includes('not found') ||
          m.includes('unavailable') ||
          m.includes('ice') ||
          m.includes('network');
        if (isTransient) {
          setError(null);
          setIsConnected(false);
          setReady(true);
          return;
        }
        setError(msg);
      },
    });
    engineRef.current = engine;

    engine
      .start()
      .then(async (local) => {
        const v = localVideoRef.current;
        if (v) {
          v.srcObject = local;
          v.muted = true;
          v.play().catch(() => {});
        }

        setVideoOn(local.getVideoTracks().length > 0);
        pcRef.current = engine.getPeerConnection();
        setReady(true);
        if (sessionId) {
          try {
            await setStatus({ sessionId, status: 'in_call' });
          } catch {}
        }
      })
      .catch((e) => setError(e?.message ?? 'Failed to start'));

    return () => {
      engineRef.current?.close();
      pcRef.current = null;
      setHasRemote(false);
    };
  }, [sessionId, setStatus, role, roleReady]);

  function toggleMute() {
    engineRef.current?.setMuted(!muted);
    setMuted((m) => !m);
  }

  async function toggleVideo() {
    const stream = (localVideoRef.current?.srcObject as MediaStream) || null;
    if (!stream) return;
    if (videoOn) {
      for (const t of stream.getVideoTracks()) t.stop();
      setVideoOn(false);
      return;
    }
    try {
      await engineRef.current?.toggleVideo(true);
      setVideoOn(true);
    } catch {}
  }

  function sendMessage(textarea: HTMLTextAreaElement | null) {
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) return;
    if (sessionId) {
      void sendServerMessage({ sessionId, sender: role, text });
    }
    textarea.value = '';
  }

  return (
    <TooltipProvider>
      <main className="h-screen flex flex-col overflow-hidden p-4 gap-4">
        <Card className="shrink-0">
          <CardContent className="flex items-center justify-between px-4 py-0">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1">
                {role === 'doctor' ? (
                  <>
                    <Stethoscope className="size-4 mr-2" />
                    Doctor
                  </>
                ) : (
                  <>
                    <UserCircle2 className="size-4 mr-2" />
                    Patient
                  </>
                )}
              </Badge>
              {!error && !ready && (
                <Badge variant="secondary">
                  <div className="size-2 bg-accent rounded-full animate-pulse mr-2" />
                  Connecting...
                </Badge>
              )}
              {!error && ready && !isConnected && (
                <Badge variant="secondary">
                  <div className="size-2 bg-accent rounded-full mr-2" />
                  Waiting for {role === 'doctor' ? 'patient' : 'doctor'}
                </Badge>
              )}
              {!error && isConnected && (
                <Badge variant="default">
                  <div className="size-2 bg-primary-foreground rounded-full mr-2" />
                  Connected
                </Badge>
              )}
              {error && (
                <Badge variant="destructive" className="px-3 py-1">
                  {error}
                </Badge>
              )}
            </div>
            <MicActivity
              stream={(localVideoRef.current?.srcObject as MediaStream) || null}
            />
          </CardContent>
        </Card>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-0">
          <div className="xl:col-span-3 flex flex-col gap-4 min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="shrink-0 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="size-5" />
                  Video Conference
                </CardTitle>
                <CardDescription>
                  {isConnected
                    ? 'Live session in progress'
                    : !error && !ready
                      ? 'Establishing connection...'
                      : 'Waiting for participant'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                  <div className="flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">
                        {role === 'doctor' ? 'Patient' : 'Doctor'}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {!error && !ready
                          ? 'Connecting'
                          : isConnected
                            ? 'Connected'
                            : 'Waiting'}
                      </Badge>
                    </div>
                    <div className="relative flex-1 min-h-0 bg-muted rounded-lg overflow-hidden">
                      <video
                        ref={remoteVideoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        autoPlay
                      />

                      {(() => {
                        const hasPatientMessages = (serverMessages ?? []).some(
                          (m) => m.sender === 'patient',
                        );
                        if (role === 'doctor' && hasPatientMessages) {
                          return (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                              <div className="text-center text-muted-foreground">
                                <UserCircle2 className="size-16 mx-auto mb-3" />
                                <p className="text-sm">
                                  Patient connected via TUI (chat-only)
                                </p>
                              </div>
                            </div>
                          );
                        }
                        if (!error && !ready && !hasRemote) {
                          return (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                              <div className="text-center text-muted-foreground">
                                <div className="size-12 border-4 border-muted-foreground border-t-primary rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-sm">Connecting...</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {ready && !hasRemote && !error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <div className="text-center text-muted-foreground">
                            <UserCircle2 className="size-16 mx-auto mb-3" />
                            <p className="text-sm">
                              Waiting for{' '}
                              {role === 'doctor' ? 'patient' : 'doctor'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">You</h3>
                      <Badge variant="outline" className="text-xs">
                        {videoOn ? 'Camera On' : 'Camera Off'}
                      </Badge>
                    </div>
                    <div className="relative flex-1 min-h-0 bg-muted rounded-lg overflow-hidden">
                      <video
                        ref={localVideoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        autoPlay
                        muted
                      />

                      {!videoOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <div className="text-center text-muted-foreground">
                            <VideoOff className="size-16 mx-auto mb-3" />
                            <p className="text-sm">Camera Off</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shrink-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={toggleMute}
                        variant={muted ? 'destructive' : 'default'}
                        size="sm"
                        className="h-10 px-4"
                      >
                        {muted ? (
                          <MicOff className="size-4 mr-2" />
                        ) : (
                          <Mic className="size-4 mr-2" />
                        )}
                        {muted ? 'Unmute' : 'Mute'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {muted ? 'Unmute microphone' : 'Mute microphone'}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={toggleVideo}
                        variant={videoOn ? 'default' : 'secondary'}
                        size="sm"
                        className="h-10 px-4"
                      >
                        {videoOn ? (
                          <Video className="size-4 mr-2" />
                        ) : (
                          <VideoOff className="size-4 mr-2" />
                        )}
                        Camera
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {videoOn ? 'Turn off camera' : 'Turn on camera'}
                    </TooltipContent>
                  </Tooltip>

                  <Separator orientation="vertical" className="h-6" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setShowTui(true)}
                        size="sm"
                        className="h-10 px-4"
                      >
                        <Terminal className="size-4 mr-2" />
                        TUI
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Switch to text-based interface
                    </TooltipContent>
                  </Tooltip>

                  <Button
                    onClick={() => router.refresh()}
                    variant="outline"
                    size="sm"
                    className="h-10 px-4"
                  >
                    Reconnect
                  </Button>

                  <Separator orientation="vertical" className="h-6" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={async () => {
                          if (sessionId) {
                            try {
                              await setStatus({ sessionId, status: 'ended' });
                            } catch {}
                          }
                          router.push(`/session/${sessionId}/summary`);
                        }}
                        variant="destructive"
                        size="sm"
                        className="h-10 px-4"
                      >
                        <PhoneOff className="size-4 mr-2" />
                        End Call
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>End the consultation</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="shrink-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="size-4" />
                  Chat
                </CardTitle>
                <CardDescription>
                  Communicate during the session
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3 min-h-0">
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-3 pr-3">
                    {(serverMessages ?? []).map((m) => (
                      <div
                        key={m._id}
                        className={`flex ${m.sender === role ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 ${
                            m.sender === role
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <div className="text-xs opacity-70 mb-1">
                            {m.sender === 'doctor' ? 'Doctor' : 'Patient'}
                          </div>
                          <p className="text-sm">{m.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2 shrink-0">
                  <Textarea
                    placeholder="Type a message..."
                    className="min-h-[40px] resize-none flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e.currentTarget);
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="h-[40px] w-10"
                    onClick={() => {
                      const textarea = document.querySelector(
                        'textarea',
                      ) as HTMLTextAreaElement;
                      sendMessage(textarea);
                    }}
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="shrink-0">
              <NotesPanel sessionId={sessionId} readOnly={role !== 'doctor'} />
            </div>
          </div>
        </div>

        <TuiFallbackDialog
          open={showTui}
          onOpenChange={setShowTui}
          sessionId={sessionId}
        />
      </main>
    </TooltipProvider>
  );
}
