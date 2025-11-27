import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUserRole, setUserId } from "../../store/userSlice.ts";
import type { RootState } from "../../store.ts";

interface RoleAutoSwitchProps {
  children: React.ReactNode;
}

/**
 * Component that automatically switches user role based on the current URL path
 * - /driver/* routes -> switches to "driver" role
 * - /admin/* routes -> switches to "admin" role
 */
export const RoleAutoSwitch = ({ children }: RoleAutoSwitchProps) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentRole = useSelector((state: RootState) => state.user.role);

  useEffect(() => {
    const path = location.pathname;

    // Check if we're on a driver route
    if (path.startsWith("/driver")) {
      if (currentRole !== "driver") {
        dispatch(setUserRole("driver"));
        // Set a default driver ID for testing (you can customize this)
        dispatch(setUserId("driver-1"));
      }
    }
    // Check if we're on an admin route
    else if (path.startsWith("/admin")) {
      if (currentRole !== "admin") {
        dispatch(setUserRole("admin"));
        // Set admin ID to null or customize as needed
        dispatch(setUserId(null));
      }
    }
  }, [location.pathname, currentRole, dispatch]);

  return <>{children}</>;
};

