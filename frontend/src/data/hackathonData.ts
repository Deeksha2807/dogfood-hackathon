import { Track, Prize, RubricCriterion, Event } from "../types";

export interface ParticipantData {
  id: string;
  name: string;
  email: string;
  collegeCompany: string;
  phone: string;
  teamId?: string;
  teamName?: string;
  status: "Active" | "Pending";
  registeredAt: string;
}

export interface TeamData {
  id: string;
  name: string;
  inviteCode: string;
  trackId: string;
  trackName: string;
  submissionId?: string;
  projectName?: string;
  submissionStatus: "Draft" | "Submitted" | "Under Review" | "Judged" | "None";
  members: {
    id: string;
    name: string;
    email: string;
    role: "LEADER" | "MEMBER";
    collegeCompany: string;
  }[];
  createdAt: string;
}

export interface SubmissionData {
  id: string;
  projectName: string;
  tagline: string;
  description: string;
  teamId: string;
  teamName: string;
  trackId: string;
  trackName: string;
  repoUrl: string;
  demoUrl: string;
  videoUrl: string;
  techStack: string[];
  screenshots: string[];
  status: "Draft" | "Submitted" | "Under Review" | "Judged" | "Disqualified";
  submittedAt: string;
  disqualifiedReason?: string;
  voteCount: number;
  aiSummary: {
    whatItDoes: string;
    techUsed: string;
    repoActivity: string;
    highlights: string[];
  };
}

export interface JudgeData {
  id: string;
  name: string;
  email: string;
  title: string;
  organization: string;
  avatar: string;
  assignedCount: number;
  completedCount: number;
}

export interface EvaluationRecord {
  id: string;
  judgeId: string;
  judgeName: string;
  submissionId: string;
  scores: {
    innovation: number; // max 25
    technical: number;  // max 25
    impact: number;     // max 20
    ux: number;         // max 15
    presentation: number; // max 15
  };
  totalScore: number; // out of 100
  feedback: string;
  isDraft: boolean;
  isRecused?: boolean;
  recuseReason?: string;
  submittedAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  type: "announcement" | "deadline" | "judging" | "system";
}

// 5 Sample Tracks
export const SAMPLE_TRACKS: Track[] = [
  {
    id: "track-ai",
    eventId: "00000000-0000-4000-8000-000000000001",
    name: "Artificial Intelligence",
    description: "Autonomous agents, neural workflows, large language model integrations, and intelligent automation systems.",
    criteria: "Autonomy, model orchestration, inference efficiency, real-world utility",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "track-web",
    eventId: "00000000-0000-4000-8000-000000000001",
    name: "Web Development",
    description: "High-performance fullstack web applications, real-time collaboration engines, and cutting-edge developer tooling.",
    criteria: "Architecture, responsive UI/UX, bundle performance, code ergonomics",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "track-fintech",
    eventId: "00000000-0000-4000-8000-000000000001",
    name: "FinTech",
    description: "Smart contracts, decentralized finance protocols, automated fraud mitigation, and next-generation payments.",
    criteria: "Security audit compliance, cryptographic soundness, transaction throughput",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "track-health",
    eventId: "00000000-0000-4000-8000-000000000001",
    name: "Healthcare",
    description: "Predictive diagnostics, telemedicine platforms, patient privacy systems, and healthcare accessibility tooling.",
    criteria: "Clinical relevance, HIPAA privacy compliance, accessibility, diagnostic accuracy",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "track-sustain",
    eventId: "00000000-0000-4000-8000-000000000001",
    name: "Sustainability",
    description: "Carbon footprint tracking, clean energy smart grids, climate resilience data modeling, and circular economy tools.",
    criteria: "Ecological impact, quantifiable carbon mitigation, scalable deployment",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
];

// The 5 Exact Criteria
export const STANDARD_RUBRIC_CRITERIA: RubricCriterion[] = [
  {
    id: "crit-innovation",
    rubricId: "rubric-default",
    name: "Innovation & Originality",
    description: "Novelty of solution, out-of-the-box thinking, uniqueness of competitive angle.",
    weight: 0.25,
    maxScore: 25,
  },
  {
    id: "crit-technical",
    rubricId: "rubric-default",
    name: "Technical Implementation",
    description: "Architectural robustness, effective technology stack, code cleanliness, and working complexity.",
    weight: 0.25,
    maxScore: 25,
  },
  {
    id: "crit-impact",
    rubricId: "rubric-default",
    name: "Real-World Impact",
    description: "Market viability, depth of problem solved, societal/commercial potential.",
    weight: 0.20,
    maxScore: 20,
  },
  {
    id: "crit-ux",
    rubricId: "rubric-default",
    name: "User Experience (UX)",
    description: "Intuitive flow, polished aesthetic, accessibility compliance, and responsiveness.",
    weight: 0.15,
    maxScore: 15,
  },
  {
    id: "crit-presentation",
    rubricId: "rubric-default",
    name: "Presentation & Demo",
    description: "Clarity of video walkthrough, documentation completeness, and live demo reliability.",
    weight: 0.15,
    maxScore: 15,
  },
];

// 3 Judges
export const SAMPLE_JUDGES: JudgeData[] = [
  {
    id: "judge-1",
    name: "Dr. Marcus Brody",
    email: "judge1@hackathon.local",
    title: "Chief AI Research Fellow",
    organization: "Stanford AI Lab / DeepMind",
    avatar: "MB",
    assignedCount: 10,
    completedCount: 8,
  },
  {
    id: "judge-2",
    name: "Dr. Sarah Chen",
    email: "judge2@hackathon.local",
    title: "VP of Engineering & Cloud Infra",
    organization: "Vercel / Cloudflare",
    avatar: "SC",
    assignedCount: 10,
    completedCount: 7,
  },
  {
    id: "judge-3",
    name: "Alex Rivera",
    email: "judge3@hackathon.local",
    title: "Principal Design Architect",
    organization: "Linear / Figma",
    avatar: "AR",
    assignedCount: 9,
    completedCount: 6,
  },
];

// Colleges & Companies for realistic mock generation
const COLLEGES_COMPANIES = [
  "Stanford University", "MIT", "UC Berkeley", "Carnegie Mellon",
  "Google", "Microsoft", "Stripe", "OpenAI", "Meta", "Amazon AWS",
  "Georgia Tech", "University of Waterloo", "ETH Zürich", "Harvard",
  "Datadog", "Scale AI", "Anthropic", "Palantir", "Vercel", "GitHub"
];

const FIRST_NAMES = [
  "Alice", "Bob", "Carol", "David", "Emma", "Frank", "Grace", "Henry",
  "Ivy", "Jack", "Kavya", "Liam", "Maya", "Noah", "Olivia", "Priya",
  "Quinn", "Rahul", "Sophia", "Thomas", "Uma", "Vikram", "Wendy", "Xavier",
  "Yasmine", "Zach", "Aarav", "Elena", "Rohan", "Chloe", "Marcus", "Ananya",
  "Devon", "Farhan", "Siddharth", "Tara", "Leo", "Fatima", "Chen", "Leila"
];

const LAST_NAMES = [
  "Johnson", "Smith", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson",
  "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez",
  "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
];

// Helper to generate 120 realistic participants
export function generate120Participants(): ParticipantData[] {
  const participants: ParticipantData[] = [
    {
      id: "u-alice",
      name: "Alice Johnson",
      email: "alice@hackathon.local",
      collegeCompany: "MIT AI Lab",
      phone: "+1 (555) 019-2831",
      teamId: "team-1",
      teamName: "Team AlphaForge",
      status: "Active",
      registeredAt: "2026-09-10T14:30:00Z",
    },
    {
      id: "u-bob",
      name: "Bob Smith",
      email: "bob@hackathon.local",
      collegeCompany: "Stanford University",
      phone: "+1 (555) 014-9922",
      teamId: "team-1",
      teamName: "Team AlphaForge",
      status: "Active",
      registeredAt: "2026-09-10T15:10:00Z",
    },
    {
      id: "u-carol",
      name: "Carol Williams",
      email: "carol@hackathon.local",
      collegeCompany: "OpenAI",
      phone: "+1 (555) 018-4411",
      teamId: "team-2",
      teamName: "Neural Nexus Devs",
      status: "Active",
      registeredAt: "2026-09-11T09:20:00Z",
    }
  ];

  let idCounter = 4;
  for (let i = participants.length; i < 120; i++) {
    const fName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const org = COLLEGES_COMPANIES[i % COLLEGES_COMPANIES.length];
    const teamNum = (i % 35) + 1;
    const isPending = i % 15 === 0;

    participants.push({
      id: `p-${idCounter++}`,
      name: `${fName} ${lName}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@hackathon.org`,
      collegeCompany: org,
      phone: `+1 (555) ${100 + (i * 7) % 899}-${1000 + (i * 13) % 8999}`,
      teamId: `team-${teamNum}`,
      teamName: `Team ${teamNum <= 5 ? ["AlphaForge", "Neural Nexus", "FinFlow Pulse", "HealthBridge AI", "EcoGrid Energy"][teamNum - 1] : "Squad #" + teamNum}`,
      status: isPending ? "Pending" : "Active",
      registeredAt: new Date(Date.now() - (15 * 86400000) + (i * 3600000)).toISOString(),
    });
  }
  return participants;
}

// 28 Submissions Data
export const SAMPLE_SUBMISSIONS: SubmissionData[] = [
  {
    id: "sub-1",
    projectName: "AgentForge AutoPilot",
    tagline: "Autonomous multi-agent orchestration for end-to-end fullstack code generation.",
    description: "AgentForge AutoPilot connects specialized LLM micro-agents to write unit tests, verify builds, resolve pull requests, and deploy cloud containers with zero human intervention. Uses vector memories and self-correcting sandboxes.",
    teamId: "team-1",
    teamName: "Team AlphaForge",
    trackId: "track-ai",
    trackName: "Artificial Intelligence",
    repoUrl: "https://github.com/hackforge/agent-autopilot",
    demoUrl: "https://agentforge-demo.vercel.app",
    videoUrl: "https://youtube.com/watch?v=agentforge-demo",
    techStack: ["React 19", "TypeScript", "Node.js", "LangChain", "PyTorch", "Docker"],
    screenshots: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60"
    ],
    status: "Judged",
    submittedAt: "2026-09-28T18:30:00Z",
    voteCount: 64,
    aiSummary: {
      whatItDoes: "Multi-agent runtime that continuously analyzes git changes and auto-generates test suites.",
      techUsed: "LangChain orchestration with Dockerized sandbox isolation and FastAPI backend.",
      repoActivity: "42 commits during hackathon, 98% test coverage, comprehensive CI workflow.",
      highlights: [
        "Fully working sub-second sandbox execution",
        "Deterministic recovery on lint failures",
        "Polished dark-mode developer console"
      ]
    }
  },
  {
    id: "sub-2",
    projectName: "DevShield Sentinel",
    tagline: "Real-time AI static analysis and vulnerability patching for CI/CD pipelines.",
    description: "DevShield continuously scans git pull requests for zero-day exploits, semantic logic flaws, and memory leaks. Employs fine-tuned AST models to draft verified pull request fixes in seconds.",
    teamId: "team-2",
    teamName: "Neural Nexus Devs",
    trackId: "track-web",
    trackName: "Web Development",
    repoUrl: "https://github.com/neuralnexus/devshield",
    demoUrl: "https://devshield-live.io",
    videoUrl: "https://youtube.com/watch?v=devshield-demo",
    techStack: ["Next.js 15", "Rust", "TypeScript", "Tree-Sitter", "PostgreSQL"],
    screenshots: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60"
    ],
    status: "Judged",
    submittedAt: "2026-09-28T19:15:00Z",
    voteCount: 52,
    aiSummary: {
      whatItDoes: "High-speed Rust parser scanning code ASTs for memory leaks and security vulnerabilities.",
      techUsed: "Rust core with WebAssembly bindings, Next.js frontend, and GitHub Actions integration.",
      repoActivity: "31 commits, multi-architecture GitHub action builds, zero memory allocations in hot loop.",
      highlights: [
        "10x faster than traditional SonarQube scans",
        "1-click automated PR remediation comments"
      ]
    }
  },
  {
    id: "sub-3",
    projectName: "FinFlow Zero",
    tagline: "Decentralized automated micro-clearing and real-time cross-border settlements.",
    description: "FinFlow Zero eliminates traditional 3-day ACH settlement delays by executing batch cryptographic zero-knowledge liquidity proofs over instant liquidity pools with 0.01% transaction fees.",
    teamId: "team-3",
    teamName: "FinFlow Pulse",
    trackId: "track-fintech",
    trackName: "FinTech",
    repoUrl: "https://github.com/finflow/finflow-zero",
    demoUrl: "https://finflow-demo.eth.limo",
    videoUrl: "https://youtube.com/watch?v=finflow-demo",
    techStack: ["Solidity", "TypeScript", "React", "Circom ZK", "Ethers.js"],
    screenshots: [
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=60"
    ],
    status: "Judged",
    submittedAt: "2026-09-28T20:00:00Z",
    voteCount: 47,
    aiSummary: {
      whatItDoes: "Zero-knowledge proof financial clearing protocol reducing cross-border transfer friction.",
      techUsed: "Circom zk-SNARK circuits with Solidity verification contracts and React dashboard.",
      repoActivity: "28 commits, gas-optimized contracts benchmarked on Ethereum Sepolia testnet.",
      highlights: [
        "Verified zk-proof circuit execution in browser under 3 seconds",
        "Complete liquidity provider yield simulation"
      ]
    }
  },
  {
    id: "sub-4",
    projectName: "AI Health Assistant",
    tagline: "Personalized medical triage, diagnostic guidance, and secure EHR sync.",
    description: "AI-powered personalized health guidance system analyzing patient symptoms, vitals, and medical histories to recommend immediate clinical interventions while preserving HIPAA compliance through local encryption.",
    teamId: "team-4",
    teamName: "HealthBridge AI",
    trackId: "track-health",
    trackName: "Healthcare",
    repoUrl: "https://github.com/healthbridge/ai-health-assistant",
    demoUrl: "https://healthbridge-ai.med.app",
    videoUrl: "https://youtube.com/watch?v=healthai-demo",
    techStack: ["React", "FastAPI", "Python", "BioBERT", "ChromaDB", "WebCrypto"],
    screenshots: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60"
    ],
    status: "Judged",
    submittedAt: "2026-09-28T21:10:00Z",
    voteCount: 59,
    aiSummary: {
      whatItDoes: "Clinical symptom triage model that maps patient complaints to ICD-10 diagnostic codes.",
      techUsed: "Fine-tuned BioBERT model with ChromaDB vector search and client-side encryption.",
      repoActivity: "39 commits, 15 synthetic patient case studies, automated evaluation harness.",
      highlights: [
        "94% concordance with board-certified triage protocols",
        "Zero unencrypted patient data transmitted over network"
      ]
    }
  },
  {
    id: "sub-5",
    projectName: "EcoGrid Dynamic",
    tagline: "Decentralized solar micro-grid load balancing and carbon offset verification.",
    description: "EcoGrid uses IoT smart-meter telemetry and weather predictive AI to automatically balance neighborhood renewable energy distribution and issue audited verifiable carbon credits.",
    teamId: "team-5",
    teamName: "EcoGrid Energy",
    trackId: "track-sustain",
    trackName: "Sustainability",
    repoUrl: "https://github.com/ecogrid/ecogrid-dynamic",
    demoUrl: "https://ecogrid-live.energy",
    videoUrl: "https://youtube.com/watch?v=ecogrid-demo",
    techStack: ["Vue.js", "Python", "TimescaleDB", "MQTT", "TensorFlow"],
    screenshots: [
      "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=60"
    ],
    status: "Judged",
    submittedAt: "2026-09-28T21:45:00Z",
    voteCount: 41,
    aiSummary: {
      whatItDoes: "Predicts peak solar yield curves and dynamically optimizes residential battery discharge.",
      techUsed: "LSTM time-series neural models with TimescaleDB and live MQTT IoT telemetry.",
      repoActivity: "25 commits, complete simulated neighborhood dataset with 120 solar nodes.",
      highlights: [
        "18.4% reduction in peak-hour grid consumption in simulation",
        "Real-time dynamic energy pricing calculation"
      ]
    }
  }
];

// Generate 23 additional realistic submissions to reach total 28 submissions
const SUBMISSION_TEMPLATES = [
  { name: "CodeMorph AI", tag: "Automated legacy codebase modernization to modern TypeScript.", track: "track-ai", tName: "Artificial Intelligence" },
  { name: "PulseFlow API", tag: "Ultra-low latency edge GraphQL federation gateway.", track: "track-web", tName: "Web Development" },
  { name: "PayShield Fraud", tag: "Graph neural networks detecting credit card syndicate fraud.", track: "track-fintech", tName: "FinTech" },
  { name: "NeuroVision Scan", tag: "Computer vision MRI anomaly segmentation in 5 seconds.", track: "track-health", tName: "Healthcare" },
  { name: "TerraTrace Carbon", tag: "Supply chain carbon audit using satellite remote sensing.", track: "track-sustain", tName: "Sustainability" },
  { name: "OmniVoice Agent", tag: "Real-time speech-to-speech customer service agent.", track: "track-ai", tName: "Artificial Intelligence" },
  { name: "HydraState Sync", tag: "Conflict-free replicated data types for collaborative apps.", track: "track-web", tName: "Web Development" },
  { name: "Sovereign Vault", tag: "Multi-party computation cryptocurrency treasury vault.", track: "track-fintech", tName: "FinTech" },
  { name: "BioGraph DrugFinder", tag: "Knowledge graph discovery for protein target repurposing.", track: "track-health", tName: "Healthcare" },
  { name: "WindCast Predict", tag: "Wind turbine wake deficit modeling for offshore farms.", track: "track-sustain", tName: "Sustainability" },
  { name: "PromptArmor Security", tag: "Adversarial prompt injection firewall for LLM APIs.", track: "track-ai", tName: "Artificial Intelligence" },
  { name: "RapidDeploy Edge", tag: "Zero-config edge microservice deployments via WebAssembly.", track: "track-web", tName: "Web Development" },
  { name: "SmartYield DeFi", tag: "Risk-adjusted algorithmic yield optimization aggregator.", track: "track-fintech", tName: "FinTech" },
  { name: "CareCompanion", tag: "Elderly cognitive companion and medication reminder bot.", track: "track-health", tName: "Healthcare" },
  { name: "GreenRoute Logistics", tag: "Fleet route optimization saving 22% diesel emissions.", track: "track-sustain", tName: "Sustainability" },
  { name: "DataSynth Engine", tag: "Differential privacy compliant synthetic tabular data.", track: "track-ai", tName: "Artificial Intelligence" },
  { name: "UltraBundle Vite", tag: "Incremental compilation caching compiler plugin.", track: "track-web", tName: "Web Development" },
  { name: "MicroLend P2P", tag: "Reputation-based peer-to-peer micro-lending for artisans.", track: "track-fintech", tName: "FinTech" },
  { name: "GeneCraft CRISPR", tag: "Off-target cutting risk predictor using deep learning.", track: "track-health", tName: "Healthcare" },
  { name: "ReCycle Vision", tag: "Municipal conveyor belt automated recyclables sorting.", track: "track-sustain", tName: "Sustainability" },
  { name: "Axiom Proof Assistant", tag: "Interactive formal software verification assistant.", track: "track-ai", tName: "Artificial Intelligence" },
  { name: "ReactCanvas Next", tag: "GPU accelerated DOM rendering for infinite canvas tools.", track: "track-web", tName: "Web Development" },
  { name: "AquaPure Monitor", tag: "Real-time municipal tap water pollutant sensor matrix.", track: "track-sustain", tName: "Sustainability" }
];

SUBMISSION_TEMPLATES.forEach((tpl, i) => {
  const subNum = i + 6;
  const teamNum = subNum;
  SAMPLE_SUBMISSIONS.push({
    id: `sub-${subNum}`,
    projectName: tpl.name,
    tagline: tpl.tag,
    description: `${tpl.name} provides an industry-grade solution for modern challenges. Built from the ground up during the DogFood Hackathon 2026, it addresses key bottlenecks using state-of-the-art architectures and rigorous testing.`,
    teamId: `team-${teamNum}`,
    teamName: `Team ${tpl.name.split(" ")[0]}`,
    trackId: tpl.track,
    trackName: tpl.tName,
    repoUrl: `https://github.com/hackathon-team/${tpl.name.toLowerCase().replace(/\s+/g, "-")}`,
    demoUrl: `https://${tpl.name.toLowerCase().replace(/\s+/g, "-")}.demo.live`,
    videoUrl: `https://youtube.com/watch?v=demo-${subNum}`,
    techStack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    screenshots: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60"
    ],
    status: subNum <= 22 ? "Judged" : "Under Review",
    submittedAt: new Date(Date.now() - (2 * 86400000) + (i * 1800000)).toISOString(),
    voteCount: 15 + ((i * 7) % 30),
    aiSummary: {
      whatItDoes: tpl.tag,
      techUsed: "Modern fullstack architecture with automated verification checks.",
      repoActivity: `${18 + (i % 15)} commits, cleanly modularized code structure.`,
      highlights: [
        "Verified prototype running in real time",
        "Clear technical roadmap and clean architectural documentation"
      ]
    }
  });
});

// Generate 35 Teams
export function generate35Teams(): TeamData[] {
  const teams: TeamData[] = [];
  for (let i = 1; i <= 35; i++) {
    const track = SAMPLE_TRACKS[(i - 1) % SAMPLE_TRACKS.length];
    const sub = SAMPLE_SUBMISSIONS.find((s) => s.teamId === `team-${i}`);
    const teamName = i === 1 ? "Team AlphaForge" : i === 2 ? "Neural Nexus Devs" : i === 3 ? "FinFlow Pulse" : i === 4 ? "HealthBridge AI" : i === 5 ? "EcoGrid Energy" : `Team ${sub ? sub.projectName.split(" ")[0] : "Squad #" + i}`;

    teams.push({
      id: `team-${i}`,
      name: teamName,
      inviteCode: `CODE-${1000 + i * 47}`,
      trackId: track.id,
      trackName: track.name,
      submissionId: sub ? sub.id : undefined,
      projectName: sub ? sub.projectName : undefined,
      submissionStatus: sub ? sub.status : "Draft",
      members: [
        {
          id: `m-${i}-1`,
          name: i === 1 ? "Alice Johnson" : `Hacker Lead ${i}`,
          email: i === 1 ? "alice@hackathon.local" : `lead${i}@hackathon.org`,
          role: "LEADER",
          collegeCompany: COLLEGES_COMPANIES[i % COLLEGES_COMPANIES.length],
        },
        {
          id: `m-${i}-2`,
          name: i === 1 ? "Bob Smith" : `Member ${i}A`,
          email: i === 1 ? "bob@hackathon.local" : `member${i}a@hackathon.org`,
          role: "MEMBER",
          collegeCompany: COLLEGES_COMPANIES[(i + 3) % COLLEGES_COMPANIES.length],
        },
        {
          id: `m-${i}-3`,
          name: `Member ${i}B`,
          email: `member${i}b@hackathon.org`,
          role: "MEMBER",
          collegeCompany: COLLEGES_COMPANIES[(i + 6) % COLLEGES_COMPANIES.length],
        }
      ],
      createdAt: new Date(Date.now() - 10 * 86400000 + i * 3600000).toISOString(),
    });
  }
  return teams;
}

// Pre-seeded Evaluations for realistic scoring & normalization
export function generateInitialEvaluations(): EvaluationRecord[] {
  const evals: EvaluationRecord[] = [];

  // Seed evaluations for the first 22 submissions across the 3 judges
  for (let sIdx = 0; sIdx < 22; sIdx++) {
    const sub = SAMPLE_SUBMISSIONS[sIdx];
    
    // Judge 1 (Dr. Brody - strict, high tech focus)
    const j1_inno = Math.min(25, 18 + ((sIdx * 3) % 8));
    const j1_tech = Math.min(25, 19 + ((sIdx * 2) % 7));
    const j1_imp = Math.min(20, 14 + (sIdx % 7));
    const j1_ux = Math.min(15, 11 + ((sIdx * 4) % 5));
    const j1_pres = Math.min(15, 12 + ((sIdx * 2) % 4));
    const total1 = j1_inno + j1_tech + j1_imp + j1_ux + j1_pres;

    evals.push({
      id: `eval-${sub.id}-j1`,
      judgeId: "judge-1",
      judgeName: "Dr. Marcus Brody",
      submissionId: sub.id,
      scores: {
        innovation: j1_inno,
        technical: j1_tech,
        impact: j1_imp,
        ux: j1_ux,
        presentation: j1_pres,
      },
      totalScore: total1,
      feedback: "Strong architectural foundation and solid demonstration. Code organization shows high technical maturity.",
      isDraft: false,
      submittedAt: new Date(Date.now() - 3600000 * (25 - sIdx)).toISOString(),
    });

    // Judge 2 (Dr. Sarah Chen - cloud infra & reliability focus)
    const j2_inno = Math.min(25, 19 + ((sIdx * 4) % 7));
    const j2_tech = Math.min(25, 20 + ((sIdx * 3) % 6));
    const j2_imp = Math.min(20, 15 + ((sIdx * 2) % 6));
    const j2_ux = Math.min(15, 10 + ((sIdx * 5) % 6));
    const j2_pres = Math.min(15, 11 + ((sIdx * 3) % 5));
    const total2 = j2_inno + j2_tech + j2_imp + j2_ux + j2_pres;

    evals.push({
      id: `eval-${sub.id}-j2`,
      judgeId: "judge-2",
      judgeName: "Dr. Sarah Chen",
      submissionId: sub.id,
      scores: {
        innovation: j2_inno,
        technical: j2_tech,
        impact: j2_imp,
        ux: j2_ux,
        presentation: j2_pres,
      },
      totalScore: total2,
      feedback: "Exceptional resilience under stress. The live demo executed flawlessly.",
      isDraft: false,
      submittedAt: new Date(Date.now() - 3600000 * (20 - sIdx)).toISOString(),
    });

    // Judge 3 (Alex Rivera - UX & Product polish)
    if (sIdx < 16) {
      const j3_inno = Math.min(25, 20 + ((sIdx * 2) % 6));
      const j3_tech = Math.min(25, 18 + ((sIdx * 4) % 8));
      const j3_imp = Math.min(20, 16 + (sIdx % 5));
      const j3_ux = Math.min(15, 14 + (sIdx % 2));
      const j3_pres = Math.min(15, 13 + ((sIdx * 2) % 3));
      const total3 = j3_inno + j3_tech + j3_imp + j3_ux + j3_pres;

      evals.push({
        id: `eval-${sub.id}-j3`,
        judgeId: "judge-3",
        judgeName: "Alex Rivera",
        submissionId: sub.id,
        scores: {
          innovation: j3_inno,
          technical: j3_tech,
          impact: j3_imp,
          ux: j3_ux,
          presentation: j3_pres,
        },
        totalScore: total3,
        feedback: "Superb product design aesthetic. Navigation is intuitive and delightfully crisp.",
        isDraft: false,
        submittedAt: new Date(Date.now() - 3600000 * (15 - sIdx)).toISOString(),
      });
    }
  }

  return evals;
}

// Sample System Notifications & Announcements
export const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Judging Phase Officially Underway",
    message: "All 28 finalized submissions are now undergoing evaluation across our 3 panel judges.",
    timestamp: "10 mins ago",
    unread: true,
    type: "judging",
  },
  {
    id: "notif-2",
    title: "Submission Deadline Closed",
    message: "The deadline for DogFood Hackathon 2026 has concluded. Finalized submissions are now locked.",
    timestamp: "2 hours ago",
    unread: true,
    type: "deadline",
  },
  {
    id: "notif-3",
    title: "Workshop: Building Autonomous Agents",
    message: "Recording of the DeepMind Agentic Workflows workshop is now available in your resources tab.",
    timestamp: "Yesterday",
    unread: false,
    type: "announcement",
  },
];
