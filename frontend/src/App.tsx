import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { HackathonProvider } from "./context/HackathonContext";
import { ToastProvider } from "./context/ToastContext";
import { ModeProvider } from "./context/ModeContext";
import { Navbar } from "./components/common/Navbar";
import { Sidebar } from "./components/common/Sidebar";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { OnboardingModal } from "./components/common/OnboardingModal";
import { SessionExpiredModal } from "./components/common/SessionExpiredModal";

// Public & Landing
import { LandingPage } from "./pages/public/LandingPage";

// Auth Pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

// Participant Pages
import { ParticipantDashboard } from "./pages/participant/Dashboard";
import { MyTeam } from "./pages/participant/MyTeam";
import { MyProject } from "./pages/participant/MyProject";
import { ProjectEdit } from "./pages/participant/ProjectEdit";
import { ProjectGallery } from "./pages/participant/ProjectGallery";
import { ProjectDetails } from "./pages/participant/ProjectDetails";
import { DiscoverTracks } from "./pages/participant/DiscoverTracks";
import { RulesAndCriteria } from "./pages/participant/RulesAndCriteria";
import { MyActivity } from "./pages/participant/MyActivity";

// Admin / Organizer Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ParticipantsPage } from "./pages/admin/ParticipantsPage";
import { TeamManagement } from "./pages/admin/TeamManagement";
import { TracksManagement } from "./pages/admin/TracksManagement";
import { SubmissionReview } from "./pages/admin/SubmissionReview";
import { JudgeAssignments } from "./pages/admin/JudgeAssignments";
import { JudgeManagement } from "./pages/admin/JudgeManagement";
import { RubricManagement } from "./pages/admin/RubricManagement";
import { ResultsDashboard } from "./pages/admin/ResultsDashboard";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { EventManagement } from "./pages/admin/EventManagement";

// Judge Pages
import { JudgeDashboard } from "./pages/judge/JudgeDashboard";
import { JudgeProjects } from "./pages/judge/JudgeProjects";
import { JudgeEvaluate } from "./pages/judge/JudgeEvaluate";

// Community Pages
import { CommunityVoting } from "./pages/community/CommunityVoting";

// Error Pages
import { Unauthorized } from "./pages/common/Unauthorized";
import { NotFound } from "./pages/common/NotFound";

import "./App.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isLandingPage = location.pathname === "/landing";

  if (isAuthPage || isLandingPage) {
    return (
      <>
        {children}
        <OnboardingModal />
        <SessionExpiredModal />
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
        <OnboardingModal />
        <SessionExpiredModal />
      </div>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <HackathonProvider>
            <ModeProvider>
              <Layout>
                <Routes>
                  {/* Public / Landing */}
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* Participant Routes */}
                  <Route path="/" element={<ParticipantDashboard />} />
                  <Route path="/dashboard" element={<ParticipantDashboard />} />
                  <Route
                    path="/team"
                    element={
                      <ProtectedRoute>
                        <MyTeam />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/project"
                    element={
                      <ProtectedRoute>
                        <MyProject />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/submission"
                    element={
                      <ProtectedRoute>
                        <MyProject />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/project/create"
                    element={
                      <ProtectedRoute>
                        <ProjectEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/project/edit"
                    element={
                      <ProtectedRoute>
                        <ProjectEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/project/edit/:id"
                    element={
                      <ProtectedRoute>
                        <ProjectEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/project/:id" element={<ProjectDetails />} />
                  <Route path="/gallery" element={<ProjectGallery />} />
                  <Route path="/tracks" element={<DiscoverTracks />} />
                  <Route path="/rules" element={<RulesAndCriteria />} />
                  <Route
                    path="/activity"
                    element={
                      <ProtectedRoute>
                        <MyActivity />
                      </ProtectedRoute>
                    }
                  />

                  {/* Results: accessible to all, with organizer publish control */}
                  <Route
                    path="/results"
                    element={
                      <ProtectedRoute>
                        <ResultsDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes - Exactly mapping the 8 Sidebar links */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/participants"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <ParticipantsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/teams"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <TeamManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/tracks"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <TracksManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/submissions"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <SubmissionReview />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/judging"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <JudgeAssignments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/results"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <ResultsDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Aliases for direct path access */}
                  <Route
                    path="/participants"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <ParticipantsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <ParticipantsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/teams"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <TeamManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/submissions"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <SubmissionReview />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/judges"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <JudgeManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/assignments"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <JudgeAssignments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/rubrics"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <RubricManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <EventManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute requireOrganizer>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Judge Routes */}
                  <Route
                    path="/judge"
                    element={
                      <ProtectedRoute requireJudge>
                        <JudgeDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/judge/projects"
                    element={
                      <ProtectedRoute requireJudge>
                        <JudgeProjects />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/judge/projects/:id"
                    element={
                      <ProtectedRoute requireJudge>
                        <JudgeEvaluate />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/judge/evaluate/:id"
                    element={
                      <ProtectedRoute requireJudge>
                        <JudgeEvaluate />
                      </ProtectedRoute>
                    }
                  />

                  {/* Community Voting */}
                  <Route path="/community" element={<CommunityVoting />} />
                  <Route path="/community/projects" element={<CommunityVoting />} />
                  <Route path="/community/projects/:id" element={<ProjectDetails />} />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </ModeProvider>
          </HackathonProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
