import { useSelector } from "react-redux";
import { Navigate } from "react-router";

/**
 * Route wrapper for public authentication pages (e.g. /login, /register)
 * that redirects already-authenticated users to /dashboard.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {React.ReactNode}
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#09090b] text-zinc-400">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <p className="text-xs tracking-wide font-mono">Verifying Authentication...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
