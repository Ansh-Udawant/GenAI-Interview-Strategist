import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router";

import { checkAuth } from "../../redux/slices/authSlice";

/**
 * Route protection wrapper component that ensures user is authenticated before rendering children.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {React.ReactNode}
 */
export function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, isCheckingAuth, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(checkAuth());
    }
  }, [dispatch, user]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#09090b] text-zinc-400">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <p className="text-xs tracking-wide font-mono">Verifying Authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
