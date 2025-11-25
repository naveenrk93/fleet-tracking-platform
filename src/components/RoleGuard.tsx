import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { UserRole } from "../store/userSlice";
import { ROUTE_PATHS } from "../app/routes";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGuard = ({ children, allowedRole }: RoleGuardProps) => {
  const { role } = useSelector((state: RootState) => state.user);
  
  if (role !== allowedRole) {
    // Redirect to the appropriate dashboard based on current role
    if (role === "admin") {
      return <Navigate to={ROUTE_PATHS.ADMIN.DASHBOARD} replace />;
    }
    return <Navigate to={ROUTE_PATHS.DRIVER.SHIFT_VIEW} replace />;
  }
  
  return <>{children}</>;
};

