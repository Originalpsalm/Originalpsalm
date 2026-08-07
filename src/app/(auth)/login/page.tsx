import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Alert } from "@/components/ui";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ reset?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { reset } = await searchParams;

  return (
    <div className="animate-rise">
      <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-mist">Sign in to continue where you stopped.</p>

      {reset === "1" && (
        <div className="mt-6">
          <Alert tone="success">Password changed. Sign in with your new password.</Alert>
        </div>
      )}

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm">
        <Link
          href="/forgot-password"
          className="focus-ring rounded text-mist hover:text-chalk"
        >
          Forgot your password?
        </Link>
      </p>

      <p className="mt-6 text-center text-sm text-mist">
        New here?{" "}
        <Link href="/signup" className="focus-ring rounded font-semibold text-leaf-400 hover:underline">
          Create your account
        </Link>
      </p>
    </div>
  );
}
