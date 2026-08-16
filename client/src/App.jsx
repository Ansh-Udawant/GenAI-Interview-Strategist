
import { RouterProvider } from "react-router";
import { router } from "./app.route";

/**
 * Root React Application component wrapping RouterProvider.
 *
 * @returns {React.ReactElement}
 */
export default function App() {
  return <RouterProvider router={router} />;
}

