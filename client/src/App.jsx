
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router";

import { router } from "./app.route";
import { checkAuth } from "./redux/slices/authSlice";

/**
 * Root React Application component wrapping RouterProvider.
 * Handles top-level authentication initialization and BFCache restoration.
 *
 * @returns {React.ReactElement}
 */
export default function App() {
  const dispatch = useDispatch();
  const { isCheckingAuth } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());

    const handlePageShow = (event) => {
      if (event.persisted) {
        dispatch(checkAuth());
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#09090b] text-zinc-400">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <p className="text-xs tracking-wide font-mono">Verifying Authentication...</p>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

