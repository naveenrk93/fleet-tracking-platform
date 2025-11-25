import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { ROUTE_PATHS } from "../app/routes";

export const RoleBasedRedirect = () => {
  const { role } = useSelector((state: RootState) => state.user);
  
  if (role === "admin") {
    return <Navigate to={ROUTE_PATHS.ADMIN.DASHBOARD} replace />;
  }
  
  return <Navigate to={ROUTE_PATHS.DRIVER.SHIFT_VIEW} replace />;
};

