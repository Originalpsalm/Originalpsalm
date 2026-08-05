import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Create account" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="animate-rise">
      <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mt-2 text-mist">
        Free to start. Your progress and study groups follow this account only.
      </p>

      <div className="mt-8">
        <SignupForm />
      </div>

      <p className="mt-8 text-center text-sm text-mist">
        Already have an account?{" "}
        <Link href="/login" className="focus-ring rounded font-semibold text-leaf-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
