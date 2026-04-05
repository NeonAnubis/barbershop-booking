import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./LoginForm";

// Server component — runs auth() with full DB validation before rendering.
// If the session is valid (user exists in DB), redirect to dashboard.
// If the JWT is stale or the user doesn't exist, auth() returns null and
// we simply render the login form.
export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
