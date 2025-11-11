import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  FileAudio,
  Loader2,
  CheckCircle2,
  Settings2,
  Download,
  Send,
  MessageSquareText,
  MicOff,
  ShieldCheck,
  Clock3,
  Wand2,
  ListChecks,
  Quote,
  BookOpen,
  FileText,
  History,
  Search,
} from "lucide-react";

// --- Mock data ---
const MOCK_SEGMENTS = [
  { start: 2.1, end: 9.2, text: "Welcome to Lecture 7 on Markov Decision Processes (MDPs)." },
  { start: 12.4, end: 28.7, text: "An MDP is a tuple (S, A, P, R, \u03b3). We'll unpack each term and show a gridworld example." },
  { start: 30.2, end: 55.8, text: "Policy \u03c0 maps states to actions. Our goal is to maximize expected return: G_t = \u2211 \u03b3^k R_{t+k+1}." },
  { start: 60.3, end: 78.0, text: "Bellman expectation equation ties value of a state to its successors under policy \u03c0." },
  { start: 82.5, end: 106.0, text: "Bellman optimality equation defines V* recursively; value iteration alternates backup sweeps until convergence." },
];

const MOCK_NOTES = {
  summary:
    "We introduce MDPs: states, actions, transitions, rewards, discount. We define policies and objectives, derive Bellman expectation and optimality, and outline policy evaluation, improvement, and value iteration, with gridworld as a running example.",
  outline: [
    { h2: "1. Motivation & Setup", bullets: ["Decision making under uncertainty", "Examples: robot navigation, inventory"] },
    { h2: "2. MDP Definition", bullets: ["Tuple (S, A, P, R, γ)", "Stationary transitions: P(s'|s,a)", "Reward signal and discount γ"] },
    { h2: "3. Policies & Returns", bullets: ["Policy π(a|s)", "Objective: maximize expected return G_t"] },
    { h2: "4. Bellman Equations", bullets: ["Expectation eq. for V^π", "Optimality eq. for V* and Q*"] },
    { h2: "5. Algorithms", bullets: ["Policy evaluation & improvement", "Value iteration and convergence"] },
  ],
  bullets: [
    "An MDP formalizes sequential decision making.",
    "Discount factor γ ∈ [0,1) ensures convergence and encodes uncertainty/preferences.",
    "Bellman equations: dynamic programming foundations.",
  ],
  glossary: [
    { term: "MDP", def: "Mathematical framework for sequential decisions under uncertainty." },
    { term: "Policy (π)", def: "Mapping from states to action probabilities." },
    { term: "Value function (V)", def: "Expected return from a state under a policy." },
    { term: "Bellman equation", def: "Recursive relationship for value functions." },
  ],
  equations: [
    { label: "Return", latex: "G_t = \\sum_{k=0}^{\\infty} \\gamma^{k} R_{t+k+1}" },
    { label: "Bellman V^π", latex: "V^{\\pi}(s) = \\sum_{a} \\pi(a|s) \\sum_{s'} P(s'|s,a)[R(s,a,s') + \\gamma V^{\\pi}(s')]" },
    { label: "Optimality", latex: "V^*(s) = \\max_a \\sum_{s'} P(s'|s,a)[R(s,a,s') + \\gamma V^*(s')]" },
  ],
  qa: [
    { q: "What is an MDP?", a: "A 5-tuple (S,A,P,R,γ) modeling decisions over time with uncertainty." },
    { q: "How does value iteration work?", a: "Repeatedly apply the Bellman optimality backup until values converge." },
  ],
  flashcards: [
    { front: "Tuple of an MDP", back: "(S, A, P, R, γ)" },
    { front: "Policy improvement principle", back: "Greedy w.r.t V^π yields ≥ performance; iterate with evaluation." },
  ],
};

function fmt(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function Toolbar({ depth, setDepth, tone, setTone, onRegenerate, onExport, version, setVersion }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2"><Settings2 className="h-4 w-4"/> Depth: {depth}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Summary depth</DropdownMenuLabel>
          <DropdownMenuSeparator/>
          {["Brief","Standard","Detailed"].map((d)=> (
            <DropdownMenuItem key={d} onClick={()=> setDepth(d)}>{d}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2"><Wand2 className="h-4 w-4"/> Tone: {tone}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Tone</DropdownMenuLabel>
          <DropdownMenuSeparator/>
          {["Plain","Technical","Exam Prep"].map((t)=> (
            <DropdownMenuItem key={t} onClick={()=> setTone(t)}>{t}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2"><History className="h-4 w-4"/> Version: {version}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Notes versions</DropdownMenuLabel>
          <DropdownMenuSeparator/>
          {["v1","v2","v3"].map((v)=> (
            <DropdownMenuItem key={v} onClick={()=> setVersion(v)}>{v}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={onRegenerate} className="gap-2"><ListChecks className="h-4 w-4"/> Regenerate</Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="gap-2"><Download className="h-4 w-4"/> Export</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {['PDF','DOCX','Markdown','JSON'].map((fmt)=> (
            <DropdownMenuItem key={fmt} onClick={()=> onExport(fmt)}>{fmt}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4"/>
        FERPA-friendly: local use, auto-delete raw audio
      </div>
    </div>
  );
}

function TranscriptPanel({ segments, onSeek, query, setQuery }) {
  const filtered = useMemo(()=> {
    const q = query.trim().toLowerCase();
    if (!q) return segments;
    return segments.filter(s => s.text.toLowerCase().includes(q));
  }, [segments, query]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> Transcript</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e)=> setQuery(e.target.value)} placeholder="Search transcript…" className="pl-8"/>
          </div>
        </div>
        <Separator/>
        <div className="flex-1 overflow-auto space-y-2 pr-1">
          {filtered.map((s, i)=> (
            <div key={i} className="group rounded-xl border p-3 hover:bg-muted/50 transition">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{fmt(s.start)}–{fmt(s.end)}</Badge>
                <Button variant="ghost" size="xs" className="h-6 px-2" onClick={()=> onSeek?.(s.start)}>Jump</Button>
              </div>
              <p className="mt-1 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NotesPanel({ notes }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5"/> Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="outline">Outline</TabsTrigger>
            <TabsTrigger value="bullets">Bullets</TabsTrigger>
            <TabsTrigger value="glossary">Glossary</TabsTrigger>
            <TabsTrigger value="equations">Equations</TabsTrigger>
            <TabsTrigger value="qa">Q&A</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4">
            <p className="leading-relaxed">{notes.summary}</p>
          </TabsContent>

          <TabsContent value="outline" className="mt-4 space-y-4">
            {notes.outline.map((sec, i)=> (
              <div key={i} className="rounded-xl border p-4">
                <h3 className="font-semibold text-lg mb-1">{sec.h2}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {sec.bullets.map((b, j)=> <li key={j}>{b}</li>)}
                </ul>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="bullets" className="mt-4">
            <ul className="list-disc pl-5 space-y-2">
              {notes.bullets.map((b, i)=> <li key={i}>{b}</li>)}
            </ul>
          </TabsContent>

          <TabsContent value="glossary" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {notes.glossary.map((g, i)=> (
              <div key={i} className="rounded-xl border p-4">
                <div className="font-semibold">{g.term}</div>
                <div className="text-sm text-muted-foreground">{g.def}</div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="equations" className="mt-4 space-y-3">
            {notes.equations.map((eq, i)=> (
              <div key={i} className="rounded-xl border p-4">
                <div className="text-sm text-muted-foreground mb-1">{eq.label}</div>
                <code className="block bg-muted rounded p-3 overflow-auto">{eq.latex}</code>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="qa" className="mt-4 space-y-3">
            {notes.qa.map((item, i)=> (
              <div key={i} className="rounded-xl border p-4">
                <div className="font-semibold flex items-center gap-2"><Quote className="h-4 w-4"/> {item.q}</div>
                <p className="mt-1">{item.a}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="flashcards" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {notes.flashcards.map((fc, i)=> (
              <div key={i} className="rounded-2xl border p-4 hover:shadow-sm">
                <div className="text-sm text-muted-foreground">Front</div>
                <div className="font-semibold mb-2">{fc.front}</div>
                <Separator/>
                <div className="text-sm text-muted-foreground mt-2">Back</div>
                <div>{fc.back}</div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ChatDock({ messages, onSend }) {
  const [value, setValue] = useState("");
  const endRef = useRef(null);

  const handleSend = () => {
    if (!value.trim()) return;
    onSend?.(value);
    setValue("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="fixed right-6 bottom-6 w-[420px] max-w-[92vw]">
      <Card className="shadow-2xl border-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><MessageSquareText className="h-5 w-5"/> Lecture Chat (grounded)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-64 overflow-auto space-y-3 pr-1 rounded-lg bg-muted/40 p-3">
            {messages.map((m, i)=> (
              <div key={i} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role==='user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                  <div>{m.content}</div>
                  {m.citations?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.citations.map((c, j)=> (
                        <Badge key={j} variant="secondary">{fmt(c.start)}–{fmt(c.end)}</Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="flex items-center gap-2">
            <Textarea value={value} onChange={(e)=> setValue(e.target.value)} placeholder="Ask about this lecture… e.g., ‘Explain Bellman optimality in simple terms’" className="min-h-[44px] max-h-[120px]"/>
            <Button onClick={handleSend} className="h-10"><Send className="h-4 w-4"/></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UploadStep({ onBegin }) {
  const [fileName, setFileName] = useState("");
  const [consent, setConsent] = useState(true);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5"/> Upload lecture audio/video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border-2 border-dashed p-6 text-center">
            <FileAudio className="mx-auto h-10 w-10 text-muted-foreground"/>
            <div className="mt-2 text-sm text-muted-foreground">Drag & drop or choose a file (.mp3, .m4a, .wav, .mp4)</div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Input type="file" accept="audio/*,video/*" onChange={(e)=> setFileName(e.target.files?.[0]?.name ?? "")} />
            </div>
            {fileName && (
              <div className="mt-2 text-sm">Selected: <span className="font-medium">{fileName}</span></div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border p-3">
            <div className="text-sm">
              <div className="font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4"/> Consent & privacy</div>
              <div className="text-muted-foreground">I have permission to upload this recording. For personal academic use only.</div>
            </div>
            <Switch checked={consent} onCheckedChange={setConsent} />
          </div>

          <div className="flex items-center justify-between rounded-xl border p-3">
            <div className="text-sm">
              <div className="font-medium flex items-center gap-2"><MicOff className="h-4 w-4"/> No in-app recording</div>
              <div className="text-muted-foreground">Bring your own audio; we handle transcription + notes + chat.</div>
            </div>
            <Badge variant="outline">Scope</Badge>
          </div>

          <div className="flex gap-2">
            <Button disabled={!fileName || !consent} onClick={onBegin} className="gap-2">
              <Loader2 className="h-4 w-4"/> Process
            </Button>
            <Button variant="outline" className="gap-2"><Settings2 className="h-4 w-4"/> Transcription settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5"/> What you’ll get</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-xl border p-3">
            <div className="font-medium">Timestamped transcript</div>
            <div className="text-muted-foreground">Speaker-aware (optional), searchable, jump-to-time controls.</div>
          </div>
          <div className="rounded-xl border p-3">
            <div className="font-medium">Structured notes</div>
            <div className="text-muted-foreground">Summary, outline, bullets, glossary, equations, Q&A, flashcards.</div>
          </div>
          <div className="rounded-xl border p-3">
            <div className="font-medium">Grounded chat</div>
            <div className="text-muted-foreground">Ask questions with citations to transcript timestamps.</div>
          </div>
          <div className="rounded-xl border p-3">
            <div className="font-medium">Exports</div>
            <div className="text-muted-foreground">PDF/DOCX/Markdown/JSON. Versioning of regenerated notes.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProcessingStep({ onDone }) {
  const [pct, setPct] = useState(24);

  React.useEffect(()=>{
    const id = setInterval(()=> setPct(p=> Math.min(100, p + Math.random()*18)), 700);
    const done = setTimeout(onDone, 4000 + Math.random()*1200);
    return ()=> { clearInterval(id); clearTimeout(done); };
  }, [onDone]);

  const stages = [
    { label: "Uploading", done: pct > 15 },
    { label: "Transcribing", done: pct > 45 },
    { label: "Generating notes", done: pct > 75 },
    { label: "Finalizing", done: pct > 95 },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/> Processing your lecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={pct} />
          <div className="grid grid-cols-2 gap-2">
            {stages.map((s, i)=> (
              <div key={i} className={`rounded-xl border p-3 flex items-center gap-2 ${s.done ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                {s.done ? <CheckCircle2 className="h-4 w-4 text-green-600"/> : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>}
                <div className="text-sm">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2"><Clock3 className="h-4 w-4"/> Typical time: ~audio length for transcription; notes within ~1–2 minutes after.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewStep() {
  const [depth, setDepth] = useState("Standard");
  const [tone, setTone] = useState("Plain");
  const [version, setVersion] = useState("v2");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I’ve read your transcript. What would you like to review?", citations: [] },
  ]);

  const handleSend = (text) => {
    // Very simple grounded mock: cite the first segment that matches a keyword
    const lower = text.toLowerCase();
    const hit = MOCK_SEGMENTS.find(s => s.text.toLowerCase().includes("bellman") || s.text.toLowerCase().includes("policy"));
    const reply = hit
      ? {
          role: "assistant",
          content: "Bellman optimality defines the value of a state as the max over actions of expected next rewards plus discounted next-state values. In short: choose actions that maximize long-term return.",
          citations: [{ start: hit.start, end: hit.end }],
        }
      : { role: "assistant", content: "Let me check the transcript and notes… (no direct hit found in this mock).", citations: [] };
    setMessages((m)=> [...m, { role: "user", content: text }, reply ]);
  };

  const onRegenerate = () => {
    // no-op mock
    alert(`Regenerating notes with depth=${depth}, tone=${tone}…`);
  };

  const onExport = (fmt) => {
    alert(`Exporting as ${fmt}…`);
  };

  return (
    <div className="space-y-4">
      <Toolbar depth={depth} setDepth={setDepth} tone={tone} setTone={setTone} onRegenerate={onRegenerate} onExport={onExport} version={version} setVersion={setVersion} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[60vh]">
        <TranscriptPanel segments={MOCK_SEGMENTS} onSeek={(t)=> console.log("seek to", t)} query={query} setQuery={setQuery} />
        <NotesPanel notes={MOCK_NOTES} />
      </div>
      <ChatDock messages={messages} onSend={handleSend} />
    </div>
  );
}

export default function OreosHifiPrototype() {
  const [step, setStep] = useState("upload");

  return (
    <div className="p-4 md:p-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-bold">O</div>
        <div>
          <div className="text-xl font-semibold leading-tight">Oreos — AI-Powered Audio Note Summaries</div>
          <div className="text-sm text-muted-foreground -mt-0.5">Upload → Transcribe → Notes → Chat</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3 w-3"/> Privacy-first</Badge>
          <Badge variant="outline" className="gap-1"><Clock3 className="h-3 w-3"/> Fast turnaround</Badge>
        </div>
      </header>

      <Tabs value={step} onValueChange={setStep} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upload" className="gap-2"><Upload className="h-4 w-4"/> Upload</TabsTrigger>
          <TabsTrigger value="processing" className="gap-2"><Loader2 className="h-4 w-4"/> Processing</TabsTrigger>
          <TabsTrigger value="review" className="gap-2"><CheckCircle2 className="h-4 w-4"/> Review</TabsTrigger>
        </TabsList>

        <TabsContent value="upload"><UploadStep onBegin={()=> setStep("processing")} /></TabsContent>
        <TabsContent value="processing"><ProcessingStep onDone={()=> setStep("review")} /></TabsContent>
        <TabsContent value="review"><ReviewStep /></TabsContent>
      </Tabs>

      <footer className="mt-10 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
        <ShieldCheck className="h-3 w-3"/> Built for students; professor consent required. No institutional recording integration.
      </footer>
    </div>
  );
}
