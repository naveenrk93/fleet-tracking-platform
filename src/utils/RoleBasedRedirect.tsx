import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store.ts";
import { ROUTE_PATHS } from "../app/routes.tsx";

export const RoleBasedRedirect = () => {
  const { role } = useSelector((state: RootState) => state.user);
  
  if (role === "admin") {
    return <Navigate to={ROUTE_PATHS.ADMIN.DASHBOARD} replace />;
  }
  
  return <Navigate to={ROUTE_PATHS.DRIVER.SHIFT_VIEW} replace />;
};

