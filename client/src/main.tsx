import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ClipboardList,
  Gauge,
  Map as MapIcon,
  Moon,
  Radio,
  ShieldCheck,
  Siren,
  Sun,
  Truck,
} from 'lucide-react';
import './index.css';

/* ────────────────────────────────────────────────────────────────────────────
 * Entry point and landing page.
 *
 * Routing, data fetching and theming are wired here so every page added next
 * inherits them. The remaining routes (/login, /dashboard, /report, /admin…)
 * are not implemented yet and deliberately fall through to NotFound rather
 * than being advertised as links that go nowhere.
 * ──────────────────────────────────────────────────────────────────────────*/

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Theme ──────────────────────────────────────────────────────────────────

type Theme = 'dark' | 'light';

function useTheme() {
  const [theme, setTheme] = React.useState<Theme>(() => {
    try {
      return (localStorage.getItem('resq-theme') as Theme | null) ?? 'dark';
    } catch {
      return 'dark';
    }
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('resq-theme', theme);
    } catch {
      /* storage can be blocked; the class above is what actually matters */
    }
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) };
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

// ─── Shell ──────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">RESQ</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#assessment" className="transition-colors hover:text-foreground">
            Assessment
          </a>
          <a href="#resources" className="transition-colors hover:text-foreground">
            Resources
          </a>
          <a href="#intelligence" className="transition-colors hover:text-foreground">
            Intelligence
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="#get-started"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col gap-3 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>RESQ — disaster assessment and emergency response coordination.</p>
        <p>
          In a live emergency, contact your local emergency services first.
          <span className="ml-1.5 font-medium text-foreground">Emergency: 112</span>
        </p>
      </div>
    </footer>
  );
}

// ─── Landing page sections ──────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="container relative py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Deterministic severity scoring, AI-assisted guidance
          </span>

          <h1 className="text-balance mt-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Rapid Response. Smarter Assessment.
          </h1>

          <p className="text-balance mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Report emergencies, assess disaster severity, coordinate resources, and monitor response
            from one unified platform.
          </p>

          <div
            id="get-started"
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a
              href="#how-it-works"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
            >
              <Siren className="h-4 w-4" />
              Report an Emergency
            </a>
            <a
              href="#assessment"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-6 text-sm font-medium transition-colors hover:bg-secondary sm:w-auto"
            >
              Explore Demo
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Decision support for coordinators — it does not replace emergency services.
          </p>
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}

/** Static product mockup — representative of the admin console being built. */
function DashboardMockup() {
  const stats = [
    { label: 'Active incidents', value: '7', tone: 'text-foreground' },
    { label: 'Critical', value: '2', tone: 'text-severity-critical' },
    { label: 'People affected', value: '2,845', tone: 'text-foreground' },
    { label: 'Resources available', value: '3,912', tone: 'text-severity-low' },
  ];

  const incidents = [
    { code: 'RSQ-4K2P', type: 'Flood', place: 'Sanaur Road', severity: 'CRITICAL', score: 91 },
    { code: 'RSQ-8ZQ1', type: 'Fire', place: 'Focal Point', severity: 'CRITICAL', score: 84 },
    { code: 'RSQ-3MD7', type: 'Industrial', place: 'Bhadson Road', severity: 'HIGH', score: 68 },
    { code: 'RSQ-9XT4', type: 'Storm', place: 'Mall Road', severity: 'MODERATE', score: 44 },
  ];

  return (
    <div className="animate-fade-up mx-auto mt-16 max-w-5xl">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/20">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-severity-critical/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-severity-moderate/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-severity-low/70" />
          <span className="ml-3 text-xs text-muted-foreground">RESQ — Response Center</span>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-background/60 p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`tabular mt-1.5 text-2xl font-semibold ${s.tone}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto scrollbar-slim">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2.5 pr-4 font-medium">Report</th>
                  <th className="py-2.5 pr-4 font-medium">Type</th>
                  <th className="py-2.5 pr-4 font-medium">Location</th>
                  <th className="py-2.5 pr-4 font-medium">Severity</th>
                  <th className="py-2.5 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((i) => (
                  <tr key={i.code} className="border-b border-border/60 last:border-0">
                    <td className="tabular py-3 pr-4 font-medium">{i.code}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{i.type}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{i.place}</td>
                    <td className="py-3 pr-4">
                      <SeverityBadge severity={i.severity} />
                    </td>
                    <td className="tabular py-3 font-medium">{i.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const tone: Record<string, string> = {
    LOW: 'border-severity-low/30 bg-severity-low/10 text-severity-low',
    MODERATE: 'border-severity-moderate/30 bg-severity-moderate/10 text-severity-moderate',
    HIGH: 'border-severity-high/30 bg-severity-high/10 text-severity-high',
    CRITICAL: 'border-severity-critical/30 bg-severity-critical/10 text-severity-critical',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        tone[severity] ?? tone.LOW
      }`}
    >
      {severity}
    </span>
  );
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}

function FeatureGrid({
  id,
  eyebrow,
  heading,
  description,
  features,
}: {
  id: string;
  eyebrow: string;
  heading: string;
  description: string;
  features: Feature[];
}) {
  return (
    <section id={id} className="border-b border-border py-20">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
          <h2 className="text-balance mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-muted-foreground">{description}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AssessmentSection() {
  const factors = [
    { label: 'Disaster type', max: 18, detail: 'Intrinsic hazard index per type' },
    { label: 'Reported urgency', max: 26, detail: "The reporter's urgency selection" },
    { label: 'People affected', max: 24, detail: 'Non-linear population bands' },
    { label: 'Situation indicators', max: 24, detail: 'Signals mined from the description' },
    { label: 'Response context', max: 8, detail: 'Night-time, vague location, thin detail' },
  ];

  return (
    <section id="assessment" className="border-b border-border py-20">
      <div className="container grid items-start gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-primary">Disaster assessment</p>
          <h2 className="text-balance mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            A severity score you can explain
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every incident is scored 0–100 by a deterministic engine — not by a language model. The
            same report always produces the same score, and each point is attributable to a named
            factor, so a coordinator can see exactly why an incident ranked where it did.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as const).map((s) => (
              <SeverityBadge key={s} severity={s} />
            ))}
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Bands: 0–25 low · 26–50 moderate · 51–75 high · 76–100 critical.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium">Score breakdown</p>
          <ul className="mt-5 space-y-5">
            {factors.map((f) => (
              <li key={f.label}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium">{f.label}</span>
                  <span className="tabular text-xs text-muted-foreground">max {f.max}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(f.max / 26) * 100}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{f.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Landing() {
  return (
    <>
      <Hero />

      <FeatureGrid
        id="how-it-works"
        eyebrow="How it works"
        heading="From a field report to a coordinated response"
        description="One pipeline carries an incident from the moment it is reported to the moment it is resolved, with an auditable record at every step."
        features={[
          {
            icon: ClipboardList,
            title: '1. Report',
            body: 'A reporter submits the disaster type, location, people affected, urgency and an optional photo — from a phone, in under a minute.',
          },
          {
            icon: Gauge,
            title: '2. Assess',
            body: 'The engine scores severity, extracts risk factors, and recommends resources and immediate actions. No network call required.',
          },
          {
            icon: Activity,
            title: '3. Coordinate',
            body: 'Coordinators verify, assign resources and advance the incident through a status lifecycle that is enforced server-side.',
          },
        ]}
      />

      <AssessmentSection />

      <FeatureGrid
        id="resources"
        eyebrow="Emergency resources"
        heading="Know what is available, and where"
        description="Hospitals, ambulances, shelters, fire stations, rescue teams, food and water points and blood banks — each with live capacity and availability."
        features={[
          {
            icon: Truck,
            title: 'Live availability',
            body: 'Capacity and free units are tracked per resource, so a dispatch decision is made against the current picture rather than a static list.',
          },
          {
            icon: MapIcon,
            title: 'Distance-aware',
            body: 'When a reporter shares their position, resources are sorted by real distance. Denying location permission never blocks the flow.',
          },
          {
            icon: Radio,
            title: 'Targeted alerts',
            body: 'Coordinators broadcast area announcements, and reporters are notified automatically each time their own incident changes state.',
          },
        ]}
      />

      <FeatureGrid
        id="intelligence"
        eyebrow="AI-assisted intelligence"
        heading="AI that adds to the assessment, never replaces it"
        description="The deterministic score is authoritative. The AI layer sits on top of it to turn structured output into operational guidance — and the platform works fully without it."
        features={[
          {
            icon: BrainCircuit,
            title: 'Structured, bounded input',
            body: 'Only compact, length-capped fields are sent — never raw documents. Responses are schema-validated before anything is stored or shown.',
          },
          {
            icon: ShieldCheck,
            title: 'Fails safe',
            body: 'A missing key, timeout, refusal or malformed reply is caught and recorded. The assessment still saves and the UI shows "AI insights unavailable".',
          },
          {
            icon: Siren,
            title: 'Assistive by design',
            body: 'Output is decision support for a trained coordinator. It does not replace emergency services or professional responders.',
          },
        ]}
      />
    </>
  );
}

// ─── Fallback route ─────────────────────────────────────────────────────────

function NotFound() {
  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page isn’t built yet</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The RESQ client is still being assembled. The landing page is live; the dashboard, reporting
        and admin console are next.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Back to home
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root is missing from index.html');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
