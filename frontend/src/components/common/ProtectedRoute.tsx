import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
  requireOrganizer?: boolean;
  requireJudge?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin,
  requireOrganizer,
  requireJudge,
}) => {
  const { user, isLoading, isSuperAdmin, isOrganizer, isJudge } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullPage message="Authenticating session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireOrganizer && !isOrganizer && !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireJudge && !isJudge && !isOrganizer && !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
