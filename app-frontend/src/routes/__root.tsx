import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { UseAuthResult, useSignedIn } from "../hooks/use-auth";

type RootRouterContext = {
  auth: UseAuthResult;
};

export const Route = createRootRouteWithContext<RootRouterContext>()({
  component: Root,
});

function Root() {
  const signedIn = useSignedIn();
  return (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
        {signedIn ? (
          <Link to="/auth/logout" className="[&.active]:font-bold">
            Logout
          </Link>
        ) : (
          <Link to="/auth/signin" className="[&.active]:font-bold">
            Login
          </Link>
        )}
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
