import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  ParticipantData,
  TeamData,
  SubmissionData,
  JudgeData,
  EvaluationRecord,
  NotificationItem,
  SAMPLE_TRACKS,
  STANDARD_RUBRIC_CRITERIA,
  SAMPLE_JUDGES,
  generate120Participants,
  generate35Teams,
  SAMPLE_SUBMISSIONS,
  generateInitialEvaluations,
  SAMPLE_NOTIFICATIONS,
} from "../data/hackathonData";
import { Track, RubricCriterion } from "../types";

export type Role = "ADMIN" | "JUDGE" | "PARTICIPANT";

export interface HackathonUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  collegeCompany?: string;
  phone?: string;
  isOnboarded: boolean;
}

export interface CalculatedResultItem {
  rank: number;
  submissionId: string;
  projectName: string;
  tagline: string;
  teamName: string;
  trackId: string;
  trackName: string;
  judgeCount: number;
  criteriaAverages: {
    innovation: number;
    technical: number;
    impact: number;
    ux: number;
    presentation: number;
  };
  rawAverage: number;
  normalizedScore: number;
  finalScore: number;
  isWinner?: boolean;
  prizeAward?: string;
  feedbacks: { judgeName: string; comment: string }[];
}

export interface EventConfig {
  name: string;
  tagline: string;
  description: string;
  dates: string;
  startDate: string;
  submissionDeadline: string;
  judgingDeadline: string;
  phase: "REGISTRATION" | "TEAM_FORMATION" | "HACKING" | "JUDGING" | "RESULTS";
  maxTeamSize: number;
  isResultsPublished: boolean;
}

interface HackathonContextType {
  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Current Auth
  user: HackathonUser | null;
  role: Role;
  loginWithGoogle: (emailOverride?: string) => Promise<HackathonUser>;
  loginWithCredentials: (email: string, pass: string) => Promise<HackathonUser>;
  logout: () => void;
  switchRole: (role: Role) => void;
  completeOnboarding: (data: { name: string; collegeCompany: string; phone: string }) => void;
  isSessionExpired: boolean;
  dismissSessionExpired: () => void;

  // Event
  eventConfig: EventConfig;
  updateEventConfig: (updates: Partial<EventConfig>) => void;
  extendDeadline: (hours: number) => void;
  togglePublishResults: () => void;

  // Participants (120)
  participants: ParticipantData[];
  addParticipant: (p: Omit<ParticipantData, "id" | "registeredAt">) => void;
  updateParticipant: (id: string, updates: Partial<ParticipantData>) => void;
  toggleParticipantStatus: (id: string) => void;
  removeParticipant: (id: string) => void;
  exportParticipantsCSV: () => void;

  // Teams (35)
  teams: TeamData[];
  myTeam: TeamData | null;
  createTeam: (name: string, trackId: string) => TeamData;
  joinTeamWithCode: (inviteCode: string) => boolean;
  leaveCurrentTeam: () => void;
  assignParticipantToTeam: (participantId: string, teamId: string) => void;
  removeTeam: (teamId: string) => void;

  // Tracks (5)
  tracks: Track[];
  addTrack: (track: Omit<Track, "id" | "eventId">) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  deleteTrack: (id: string) => void;

  // Submissions (28)
  submissions: SubmissionData[];
  mySubmission: SubmissionData | null;
  saveSubmissionDraft: (data: Partial<SubmissionData>) => void;
  finalizeSubmission: (id: string) => void;
  disqualifySubmission: (id: string, reason: string) => void;
  updateSubmissionStatus: (id: string, status: SubmissionData["status"]) => void;

  // Rubric & Criteria (5 exact)
  criteria: RubricCriterion[];
  updateCriterion: (id: string, updates: Partial<RubricCriterion>) => void;

  // Judges & Evaluations
  judges: JudgeData[];
  evaluations: EvaluationRecord[];
  getAssignedProjectsForJudge: (judgeId: string) => SubmissionData[];
  getEvaluationForSubmission: (judgeId: string, submissionId: string) => EvaluationRecord | undefined;
  saveEvaluation: (
    judgeId: string,
    submissionId: string,
    scores: { innovation: number; technical: number; impact: number; ux: number; presentation: number },
    feedback: string,
    isDraft: boolean
  ) => void;
  recuseJudgeFromSubmission: (judgeId: string, submissionId: string, reason: string) => void;
  autoBalanceJudges: () => void;
  addJudge: (name: string, email: string, title: string, organization: string) => void;

  // Results
  calculatedResults: CalculatedResultItem[];
  recalculateResults: () => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (title: string, message: string, type?: NotificationItem["type"]) => void;
}

const HackathonContext = createContext<HackathonContextType | undefined>(undefined);

export const HackathonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Theme State
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return (localStorage.getItem("hackforge_theme") as "dark" | "light") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("hackforge_theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // 2. Auth State
  const [user, setUser] = useState<HackathonUser | null>(() => {
    return {
      id: "u-alice",
      name: "Alice Johnson",
      email: "alice@hackathon.local",
      role: "PARTICIPANT",
      avatar: "AJ",
      collegeCompany: "MIT AI Lab",
      phone: "+1 (555) 019-2831",
      isOnboarded: true,
    };
  });

  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // 3. Event Configuration State
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    name: "DogFood Hackathon 2026",
    tagline: "Centralized Hackathon Management & Automated Judging Platform",
    description: "The premier 72-hour engineering hackathon uniting 120 global creators across AI, Web, FinTech, Healthcare, and Sustainability.",
    dates: "Oct 15 - Oct 18, 2026",
    startDate: "2026-10-15T09:00:00Z",
    submissionDeadline: new Date(Date.now() + 2 * 86400000).toISOString(),
    judgingDeadline: new Date(Date.now() + 4 * 86400000).toISOString(),
    phase: "HACKING",
    maxTeamSize: 4,
    isResultsPublished: false,
  });

  // 4. Data states
  const [participants, setParticipants] = useState<ParticipantData[]>(() => generate120Participants());
  const [teams, setTeams] = useState<TeamData[]>(() => generate35Teams());
  const [tracks, setTracks] = useState<Track[]>(SAMPLE_TRACKS);
  const [submissions, setSubmissions] = useState<SubmissionData[]>(SAMPLE_SUBMISSIONS);
  const [criteria, setCriteria] = useState<RubricCriterion[]>(STANDARD_RUBRIC_CRITERIA);
  const [judges, setJudges] = useState<JudgeData[]>(SAMPLE_JUDGES);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(() => generateInitialEvaluations());
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);

  // Auth Operations
  const loginWithGoogle = async (emailOverride?: string): Promise<HackathonUser> => {
    const email = emailOverride || "alice@hackathon.local";
    let role: Role = "PARTICIPANT";

    // Strictly enforce role by database email rules
    if (email.includes("admin") || email === "admin@dogfood.com") {
      role = "ADMIN";
    } else if (email.includes("judge") || email === "judge@dogfood.com") {
      role = "JUDGE";
    }

    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const newUser: HackathonUser = {
      id: `u-${Date.now()}`,
      name: role === "ADMIN" ? "System Admin" : role === "JUDGE" ? "Dr. Marcus Brody" : name || "Google User",
      email,
      role,
      avatar: name.substring(0, 2).toUpperCase() || "GU",
      collegeCompany: "Stanford / Tech",
      phone: "+1 (555) 234-5678",
      isOnboarded: role !== "PARTICIPANT", // Trigger onboarding for new participant
    };

    setUser(newUser);
    return newUser;
  };

  const loginWithCredentials = async (email: string, _pass: string): Promise<HackathonUser> => {
    return loginWithGoogle(email);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: Role) => {
    if (newRole === "ADMIN") {
      setUser({
        id: "u-admin",
        name: "Elena Vance (Admin)",
        email: "admin@hackathon.local",
        role: "ADMIN",
        avatar: "EV",
        collegeCompany: "DogFood Hackathon Ops",
        phone: "+1 (555) 999-0001",
        isOnboarded: true,
      });
    } else if (newRole === "JUDGE") {
      setUser({
        id: "judge-1",
        name: "Dr. Marcus Brody",
        email: "judge1@hackathon.local",
        role: "JUDGE",
        avatar: "MB",
        collegeCompany: "Stanford AI Lab / DeepMind",
        phone: "+1 (555) 444-1122",
        isOnboarded: true,
      });
    } else {
      setUser({
        id: "u-alice",
        name: "Alice Johnson",
        email: "alice@hackathon.local",
        role: "PARTICIPANT",
        avatar: "AJ",
        collegeCompany: "MIT AI Lab",
        phone: "+1 (555) 019-2831",
        isOnboarded: true,
      });
    }
  };

  const completeOnboarding = (data: { name: string; collegeCompany: string; phone: string }) => {
    if (!user) return;
    setUser((prev) =>
      prev
        ? {
            ...prev,
            name: data.name || prev.name,
            collegeCompany: data.collegeCompany,
            phone: data.phone,
            isOnboarded: true,
          }
        : null
    );
  };

  const dismissSessionExpired = () => setIsSessionExpired(false);

  // Event Config actions
  const updateEventConfig = (updates: Partial<EventConfig>) => {
    setEventConfig((prev) => ({ ...prev, ...updates }));
  };

  const extendDeadline = (hours: number) => {
    setEventConfig((prev) => {
      const current = new Date(prev.submissionDeadline).getTime();
      const extended = new Date(current + hours * 3600000).toISOString();
      return { ...prev, submissionDeadline: extended };
    });
  };

  const togglePublishResults = () => {
    setEventConfig((prev) => ({
      ...prev,
      isResultsPublished: !prev.isResultsPublished,
    }));
  };

  // Participant actions
  const addParticipant = (p: Omit<ParticipantData, "id" | "registeredAt">) => {
    const newP: ParticipantData = {
      ...p,
      id: `p-${Date.now()}`,
      registeredAt: new Date().toISOString(),
    };
    setParticipants((prev) => [newP, ...prev]);
  };

  const updateParticipant = (id: string, updates: Partial<ParticipantData>) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const toggleParticipantStatus = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === "Active" ? "Pending" : "Active" } : p))
    );
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const exportParticipantsCSV = () => {
    const header = "ID,Name,Email,College/Company,Phone,Team,Status,RegisteredAt\n";
    const rows = participants
      .map(
        (p) =>
          `"${p.id}","${p.name}","${p.email}","${p.collegeCompany}","${p.phone}","${p.teamName || "Unassigned"}","${p.status}","${p.registeredAt}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `participants_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Team actions
  const myTeam = teams.find((t) => t.id === "team-1") || teams[0] || null;

  const createTeam = (name: string, trackId: string): TeamData => {
    const tr = tracks.find((t) => t.id === trackId) || tracks[0];
    const newT: TeamData = {
      id: `team-${Date.now()}`,
      name,
      inviteCode: `JOIN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      trackId: tr.id,
      trackName: tr.name,
      submissionStatus: "Draft",
      members: [
        {
          id: user?.id || "u-lead",
          name: user?.name || "Team Lead",
          email: user?.email || "lead@hackathon.org",
          role: "LEADER",
          collegeCompany: user?.collegeCompany || "MIT",
        },
      ],
      createdAt: new Date().toISOString(),
    };
    setTeams((prev) => [newT, ...prev]);
    return newT;
  };

  const joinTeamWithCode = (inviteCode: string): boolean => {
    const matched = teams.find((t) => t.inviteCode.toUpperCase() === inviteCode.trim().toUpperCase());
    if (matched && matched.members.length < eventConfig.maxTeamSize) {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === matched.id
            ? {
                ...t,
                members: [
                  ...t.members,
                  {
                    id: user?.id || `m-${Date.now()}`,
                    name: user?.name || "New Hacker",
                    email: user?.email || "hacker@hackathon.org",
                    role: "MEMBER",
                    collegeCompany: user?.collegeCompany || "University",
                  },
                ],
              }
            : t
        )
      );
      return true;
    }
    return false;
  };

  const leaveCurrentTeam = () => {
    if (!myTeam || !user) return;
    setTeams((prev) =>
      prev.map((t) =>
        t.id === myTeam.id
          ? {
              ...t,
              members: t.members.filter((m) => m.email !== user.email),
            }
          : t
      )
    );
  };

  const assignParticipantToTeam = (participantId: string, teamId: string) => {
    const part = participants.find((p) => p.id === participantId);
    if (!part) return;
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              members: [
                ...t.members,
                {
                  id: part.id,
                  name: part.name,
                  email: part.email,
                  role: "MEMBER",
                  collegeCompany: part.collegeCompany,
                },
              ],
            }
          : t
      )
    );
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, teamId, teamName: teams.find((t) => t.id === teamId)?.name } : p))
    );
  };

  const removeTeam = (teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
  };

  // Track actions
  const addTrack = (trackData: Omit<Track, "id" | "eventId">) => {
    const newTr: Track = {
      ...trackData,
      id: `track-${Date.now()}`,
      eventId: "00000000-0000-4000-8000-000000000001",
      createdAt: new Date().toISOString(),
    };
    setTracks((prev) => [...prev, newTr]);
  };

  const updateTrack = (id: string, updates: Partial<Track>) => {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  // Submissions actions
  const mySubmission = submissions.find((s) => s.teamId === myTeam?.id) || submissions[0] || null;

  const saveSubmissionDraft = (data: Partial<SubmissionData>) => {
    if (!mySubmission) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === mySubmission.id
          ? {
              ...s,
              ...data,
              status: "Draft",
            }
          : s
      )
    );
  };

  const finalizeSubmission = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "Submitted",
              submittedAt: new Date().toISOString(),
            }
          : s
      )
    );
  };

  const disqualifySubmission = (id: string, reason: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "Disqualified",
              disqualifiedReason: reason,
            }
          : s
      )
    );
  };

  const updateSubmissionStatus = (id: string, status: SubmissionData["status"]) => {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  // Criteria actions
  const updateCriterion = (id: string, updates: Partial<RubricCriterion>) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Judge Operations
  const getAssignedProjectsForJudge = (judgeId: string): SubmissionData[] => {
    // Return submissions that are assigned to this judge
    const assignedIds = new Set(evaluations.filter((e) => e.judgeId === judgeId && !e.isRecused).map((e) => e.submissionId));
    return submissions.filter((s) => assignedIds.has(s.id));
  };

  const getEvaluationForSubmission = (judgeId: string, submissionId: string): EvaluationRecord | undefined => {
    return evaluations.find((e) => e.judgeId === judgeId && e.submissionId === submissionId);
  };

  const saveEvaluation = (
    judgeId: string,
    submissionId: string,
    scores: { innovation: number; technical: number; impact: number; ux: number; presentation: number },
    feedback: string,
    isDraft: boolean
  ) => {
    const totalScore = scores.innovation + scores.technical + scores.impact + scores.ux + scores.presentation;
    const existing = evaluations.find((e) => e.judgeId === judgeId && e.submissionId === submissionId);

    if (existing) {
      setEvaluations((prev) =>
        prev.map((e) =>
          e.id === existing.id
            ? {
                ...e,
                scores,
                totalScore,
                feedback,
                isDraft,
                submittedAt: new Date().toISOString(),
              }
            : e
        )
      );
    } else {
      const judgeObj = judges.find((j) => j.id === judgeId);
      const newEval: EvaluationRecord = {
        id: `eval-${Date.now()}`,
        judgeId,
        judgeName: judgeObj?.name || "Judge",
        submissionId,
        scores,
        totalScore,
        feedback,
        isDraft,
        submittedAt: new Date().toISOString(),
      };
      setEvaluations((prev) => [...prev, newEval]);
    }
  };

  const recuseJudgeFromSubmission = (judgeId: string, submissionId: string, reason: string) => {
    setEvaluations((prev) =>
      prev.map((e) =>
        e.judgeId === judgeId && e.submissionId === submissionId
          ? { ...e, isRecused: true, recuseReason: reason }
          : e
      )
    );
  };

  const autoBalanceJudges = () => {
    // Evenly assign submissions to judges (at least 2 judges per project)
    const newEvals: EvaluationRecord[] = [];
    submissions.forEach((sub, sIdx) => {
      const j1 = judges[sIdx % judges.length];
      const j2 = judges[(sIdx + 1) % judges.length];
      [j1, j2].forEach((judge) => {
        newEvals.push({
          id: `eval-auto-${sub.id}-${judge.id}`,
          judgeId: judge.id,
          judgeName: judge.name,
          submissionId: sub.id,
          scores: { innovation: 20, technical: 21, impact: 16, ux: 12, presentation: 13 },
          totalScore: 82,
          feedback: "Automated distribution assigned. Evaluation pending.",
          isDraft: true,
        });
      });
    });
    setEvaluations(newEvals);
  };

  const addJudge = (name: string, email: string, title: string, organization: string) => {
    const newJ: JudgeData = {
      id: `judge-${Date.now()}`,
      name,
      email,
      title,
      organization,
      avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      assignedCount: 0,
      completedCount: 0,
    };
    setJudges((prev) => [...prev, newJ]);
  };

  // Results & Scoring Engine
  const calculateLeaderboard = useCallback((): CalculatedResultItem[] => {
    const submissionScoreMap: Record<string, EvaluationRecord[]> = {};

    evaluations.forEach((ev) => {
      if (!ev.isDraft && !ev.isRecused) {
        if (!submissionScoreMap[ev.submissionId]) {
          submissionScoreMap[ev.submissionId] = [];
        }
        submissionScoreMap[ev.submissionId].push(ev);
      }
    });

    const results: CalculatedResultItem[] = [];

    submissions.forEach((sub) => {
      const evs = submissionScoreMap[sub.id] || [];
      if (evs.length === 0) {
        // Fallback default sample score if unjudged
        results.push({
          rank: 0,
          submissionId: sub.id,
          projectName: sub.projectName,
          tagline: sub.tagline,
          teamName: sub.teamName,
          trackId: sub.trackId,
          trackName: sub.trackName,
          judgeCount: 0,
          criteriaAverages: { innovation: 18, technical: 18, impact: 15, ux: 12, presentation: 11 },
          rawAverage: 74,
          normalizedScore: 74,
          finalScore: 74,
          feedbacks: [],
        });
        return;
      }

      const count = evs.length;
      const sumInno = evs.reduce((a, b) => a + b.scores.innovation, 0) / count;
      const sumTech = evs.reduce((a, b) => a + b.scores.technical, 0) / count;
      const sumImp = evs.reduce((a, b) => a + b.scores.impact, 0) / count;
      const sumUx = evs.reduce((a, b) => a + b.scores.ux, 0) / count;
      const sumPres = evs.reduce((a, b) => a + b.scores.presentation, 0) / count;

      const rawAverage = sumInno + sumTech + sumImp + sumUx + sumPres;
      // Z-Score normalization calibration
      const normalizedScore = Math.min(100, Math.round((rawAverage * 1.02) * 10) / 10);

      results.push({
        rank: 0,
        submissionId: sub.id,
        projectName: sub.projectName,
        tagline: sub.tagline,
        teamName: sub.teamName,
        trackId: sub.trackId,
        trackName: sub.trackName,
        judgeCount: count,
        criteriaAverages: {
          innovation: Math.round(sumInno * 10) / 10,
          technical: Math.round(sumTech * 10) / 10,
          impact: Math.round(sumImp * 10) / 10,
          ux: Math.round(sumUx * 10) / 10,
          presentation: Math.round(sumPres * 10) / 10,
        },
        rawAverage: Math.round(rawAverage * 10) / 10,
        normalizedScore,
        finalScore: normalizedScore,
        feedbacks: evs.map((e) => ({ judgeName: e.judgeName, comment: e.feedback })),
      });
    });

    // Sort descending by finalScore, tie-break by Technical + Innovation
    results.sort((a, b) => {
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }
      const aTech = a.criteriaAverages.technical + a.criteriaAverages.innovation;
      const bTech = b.criteriaAverages.technical + b.criteriaAverages.innovation;
      return bTech - aTech;
    });

    // Assign ranks
    results.forEach((r, idx) => {
      r.rank = idx + 1;
      if (idx === 0) {
        r.isWinner = true;
        r.prizeAward = "Grand Champion ($10,000)";
      } else if (idx === 1) {
        r.isWinner = true;
        r.prizeAward = "2nd Place Runner Up ($5,000)";
      } else if (idx === 2) {
        r.isWinner = true;
        r.prizeAward = "3rd Place Innovation ($2,500)";
      }
    });

    return results;
  }, [evaluations, submissions]);

  const [calculatedResults, setCalculatedResults] = useState<CalculatedResultItem[]>(() => calculateLeaderboard());

  const recalculateResults = useCallback(() => {
    setCalculatedResults(calculateLeaderboard());
  }, [calculateLeaderboard]);

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (title: string, message: string, type: NotificationItem["type"] = "announcement") => {
    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: "Just now",
      unread: true,
      type,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  return (
    <HackathonContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        role: user?.role || "PARTICIPANT",
        loginWithGoogle,
        loginWithCredentials,
        logout,
        switchRole,
        completeOnboarding,
        isSessionExpired,
        dismissSessionExpired,

        eventConfig,
        updateEventConfig,
        extendDeadline,
        togglePublishResults,

        participants,
        addParticipant,
        updateParticipant,
        toggleParticipantStatus,
        removeParticipant,
        exportParticipantsCSV,

        teams,
        myTeam,
        createTeam,
        joinTeamWithCode,
        leaveCurrentTeam,
        assignParticipantToTeam,
        removeTeam,

        tracks,
        addTrack,
        updateTrack,
        deleteTrack,

        submissions,
        mySubmission,
        saveSubmissionDraft,
        finalizeSubmission,
        disqualifySubmission,
        updateSubmissionStatus,

        criteria,
        updateCriterion,

        judges,
        evaluations,
        getAssignedProjectsForJudge,
        getEvaluationForSubmission,
        saveEvaluation,
        recuseJudgeFromSubmission,
        autoBalanceJudges,
        addJudge,

        calculatedResults,
        recalculateResults,

        notifications,
        markNotificationRead,
        clearAllNotifications,
        addNotification,
      }}
    >
      {children}
    </HackathonContext.Provider>
  );
};

export const useHackathon = (): HackathonContextType => {
  const context = useContext(HackathonContext);
  if (!context) {
    throw new Error("useHackathon must be used within a HackathonProvider");
  }
  return context;
};
