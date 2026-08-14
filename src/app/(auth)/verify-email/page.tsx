import Link from "next/link";
import { CircleCheck, CircleX } from "lucide-react";
import { confirmEmail } from "@/lib/verification";

export const metadata = { title: "Confirm your email" };

type Props = { searchParams: Promise<{ token?: string }> };

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const result = token ? confirmEmail(token) : null;

  if (!result) {
    return (
      <div className="animate-rise text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-red-500/12 text-red-300">
          <CircleX size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">This link no longer works</h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          Verification links expire after 48 hours and can be used only once. Sign in and use the
          banner at the top to send yourself a fresh one.
        </p>
        <Link
          href="/login"
          className="focus-ring mt-6 inline-flex rounded-full brand-gradient px-5 py-2.5 text-sm font-semibold text-brandink"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-rise text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-leaf-500/12 text-leaf-400">
        <CircleCheck size={26} />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Email confirmed</h1>
      <p className="mt-3 text-sm leading-relaxed text-mist">
        Thank you — your email address is verified. You now have full access to GURU.
      </p>
      <Link
        href="/dashboard"
        className="focus-ring mt-6 inline-flex rounded-full brand-gradient px-5 py-2.5 text-sm font-semibold text-brandink"
      >
        Go to my dashboard
      </Link>
    </div>
  );
}
