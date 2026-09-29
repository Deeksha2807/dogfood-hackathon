// Initial mock database for Hackathon & Dogfooding Platform

export const initialEvents = [
  {
    id: "evt-101",
    title: "AI Product Dogfood Sprint Q3",
    description: "Internal 48-hour hackathon to test and dogfood our next-gen Copilot API and agentic SDKs before enterprise release.",
    bannerUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    status: "Active", // Active, Upcoming, Completed, Draft
    category: "AI & ML",
    startDate: "2026-10-01T09:00:00Z",
    endDate: "2026-10-03T18:00:00Z",
    location: "Hybrid (Building 42 + Virtual)",
    prizePool: "$25,000 in Cash & Tech Credits",
    maxParticipants: 200,
    registeredCount: 142,
    submissionsCount: 28,
    tags: ["Agentic AI", "Dogfooding", "Internal Innovation"],
    organizer: "DevPulse Platform Team",
    isRegistered: true
  },
  {
    id: "evt-102",
    title: "Cloud Native Performance Challenge",
    description: "Stress test our microservices mesh, optimize Kubernetes deployments, and build ultra-resilient distributed systems.",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    status: "Upcoming",
    category: "Infrastructure",
    startDate: "2026-10-15T09:00:00Z",
    endDate: "2026-10-17T17:00:00Z",
    location: "Global Remote",
    prizePool: "$15,000 Tech Gadgets & Cloud Credits",
    maxParticipants: 150,
    registeredCount: 89,
    submissionsCount: 0,
    tags: ["Kubernetes", "Rust", "Observability"],
    organizer: "Infrastructure Guild",
    isRegistered: false
  },
  {
    id: "evt-103",
    title: "UX & Accessibility Dogfood Jam",
    description: "Identify and eliminate papercuts in our web applications. Redesign key user flows for screen readers, keyboard users, and high-contrast modes.",
    bannerUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80",
    status: "Completed",
    category: "Design & UX",
    startDate: "2026-09-10T09:00:00Z",
    endDate: "2026-09-12T18:00:00Z",
    location: "Design Studio HQ",
    prizePool: "$10,000 Design Tech Grants",
    maxParticipants: 100,
    registeredCount: 96,
    submissionsCount: 22,
    tags: ["a11y", "Design System", "WCAG 2.2"],
    organizer: "Product Design Team",
    isRegistered: false
  },
  {
    id: "evt-104",
    title: "Security & Zero Trust Hackfest",
    description: "Red-team vs Blue-team hackathon focused on container sandbox escape prevention, OAuth 2.1 hardening, and secrets scanning.",
    bannerUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    status: "Upcoming",
    category: "Cybersecurity",
    startDate: "2026-11-05T09:00:00Z",
    endDate: "2026-11-07T18:00:00Z",
    location: "Virtual",
    prizePool: "$20,000 Security Bounty Pool",
    maxParticipants: 120,
    registeredCount: 64,
    submissionsCount: 0,
    tags: ["Zero Trust", "AppSec", "Pentesting"],
    organizer: "InfoSec Engineering",
    isRegistered: true
  }
];

export const initialUsers = [
  {
    id: "usr-01",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@devpulse.io",
    role: "Judge", // Participant, Judge, Admin, Organizer
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    department: "AI Research",
    bio: "Principal AI Scientist working on multi-agent collaboration frameworks.",
    eventsJoined: 12
  },
  {
    id: "usr-02",
    name: "Alex Rivera",
    email: "alex.rivera@devpulse.io",
    role: "Participant",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    department: "Frontend Engineering",
    bio: "Fullstack tinkerer, passionate about micro-interactions and performance.",
    eventsJoined: 5
  },
  {
    id: "usr-03",
    name: "Maya Patel",
    email: "maya.patel@devpulse.io",
    role: "Judge",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    department: "Product Management",
    bio: "Senior Director of Enterprise Tools. Loves customer-centric innovations.",
    eventsJoined: 18
  },
  {
    id: "usr-04",
    name: "Liam O'Connor",
    email: "liam.o@devpulse.io",
    role: "Admin",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    department: "DevOps & SRE",
    bio: "Hackathon Lead & Infrastructure Architect.",
    eventsJoined: 24
  }
];

export const initialJudges = [
  {
    id: "jdg-01",
    userId: "usr-01",
    name: "Dr. Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    expertise: ["Machine Learning", "LLM Fine-tuning", "System Architecture"],
    assignedEventId: "evt-101",
    assignedSubmissions: ["sub-201", "sub-202", "sub-203"],
    evaluatedCount: 2
  },
  {
    id: "jdg-02",
    userId: "usr-03",
    name: "Maya Patel",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    expertise: ["Product Strategy", "UX Design", "Business Impact"],
    assignedEventId: "evt-101",
    assignedSubmissions: ["sub-201", "sub-204"],
    evaluatedCount: 1
  }
];

export const initialSubmissions = [
  {
    id: "sub-201",
    eventId: "evt-101",
    eventTitle: "AI Product Dogfood Sprint Q3",
    title: "AutoDoc Agentic Copilot",
    tagline: "Autonomous codebase documentation generator powered by DevPulse SDK",
    description: "AutoDoc scans repository commits, traces AST call graphs, and generates interactive markdown documentation with live architectural diagrams.",
    repoUrl: "https://github.com/devpulse/autodoc-agent",
    demoUrl: "https://autodoc-demo.internal.devpulse.io",
    teamName: "Neural Nexus",
    members: ["Alex Rivera", "Elena Rostova", "Marcus Vance"],
    category: "AI & ML",
    status: "Under Review", // Draft, Under Review, Evaluated, Winner
    score: 91.5,
    votes: 342,
    createdAt: "2026-10-02T14:30:00Z"
  },
  {
    id: "sub-202",
    eventId: "evt-101",
    eventTitle: "AI Product Dogfood Sprint Q3",
    title: "TraceGazer Observability Hub",
    tagline: "Real-time distributed tracing visualizer for multi-agent workflows",
    description: "Catch deadlocks and memory bottlenecks across asynchronous AI agent chains in milliseconds.",
    repoUrl: "https://github.com/devpulse/tracegazer",
    demoUrl: "https://tracegazer.internal.devpulse.io",
    teamName: "Chaos Monkeys",
    members: ["Jordan Lee", "David Kim"],
    category: "Infrastructure",
    status: "Evaluated",
    score: 96.0,
    votes: 512,
    createdAt: "2026-10-02T16:15:00Z"
  },
  {
    id: "sub-203",
    eventId: "evt-101",
    eventTitle: "AI Product Dogfood Sprint Q3",
    title: "VoiceOps Assistant",
    tagline: "Hands-free terminal command execution for mobile SRE response",
    description: "Control Kubernetes clusters and trigger canary rollback scripts using secure voice authorization.",
    repoUrl: "https://github.com/devpulse/voice-ops",
    demoUrl: "https://voiceops.internal.devpulse.io",
    teamName: "Acoustic AI",
    members: ["Samantha Ray", "Tariq Mansoor"],
    category: "AI & ML",
    status: "Under Review",
    score: 87.0,
    votes: 198,
    createdAt: "2026-10-02T18:45:00Z"
  },
  {
    id: "sub-204",
    eventId: "evt-103",
    eventTitle: "UX & Accessibility Dogfood Jam",
    title: "A11yLens React Plugin",
    tagline: "Automated color-blindness and contrast checker integrated into Vite dev server",
    description: "Instant overlay in local browser showing screen reader compatibility score in real-time.",
    repoUrl: "https://github.com/devpulse/a11ylens",
    demoUrl: "https://a11ylens.internal.devpulse.io",
    teamName: "Inclusive Tech Guild",
    members: ["Priya Sharma"],
    category: "Design & UX",
    status: "Winner",
    score: 98.5,
    votes: 620,
    createdAt: "2026-09-11T12:00:00Z"
  }
];

export const initialCommunityVoting = {
  eventId: "evt-101",
  totalVotesCast: 1052,
  userVotedSubmissions: ["sub-202"], // Submissions current user has voted for
  leaderboard: [
    { submissionId: "sub-204", title: "A11yLens React Plugin", votes: 620, rank: 1, category: "Design & UX" },
    { submissionId: "sub-202", title: "TraceGazer Observability Hub", votes: 512, rank: 2, category: "Infrastructure" },
    { submissionId: "sub-201", title: "AutoDoc Agentic Copilot", votes: 342, rank: 3, category: "AI & ML" },
    { submissionId: "sub-203", title: "VoiceOps Assistant", votes: 198, rank: 4, category: "AI & ML" }
  ]
};
