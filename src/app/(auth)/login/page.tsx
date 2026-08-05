import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="animate-rise">
      <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-mist">Sign in to continue where you stopped.</p>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-8 text-center text-sm text-mist">
        New here?{" "}
        <Link href="/signup" className="focus-ring rounded font-semibold text-leaf-400 hover:underline">
          Create your account
        </Link>
      </p>
    </div>
  );
}
