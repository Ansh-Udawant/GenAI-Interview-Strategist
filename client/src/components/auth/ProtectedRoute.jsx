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

    if (!user && !isAuthenticated && !isCheckingAuth) {

      dispatch(checkAuth());

    }

  }, [dispatch, user, isAuthenticated, isCheckingAuth]);


  if (isCheckingAuth) {

    return null;

  }

  if (!isAuthenticated || !user) {

    return <Navigate to="/login" replace />;

  }

  return children;
  
}

