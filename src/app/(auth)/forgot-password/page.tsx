import Link from "next/link";
import { ForgotForm } from "./ForgotForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="animate-rise">
      <h1 className="text-3xl font-extrabold tracking-tight">Forgot your password?</h1>
      <p className="mt-2 text-mist">
        Type your email and we will send you a link that resets it. The link works once and expires
        in two hours.
      </p>

      <div className="mt-8">
        <ForgotForm />
      </div>

      <p className="mt-8 text-center text-sm text-mist">
        Remembered it?{" "}
        <Link href="/login" className="focus-ring rounded font-semibold text-leaf-400 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
