import Link from "next/link";
import { CircleX } from "lucide-react";
import { verifyToken } from "@/lib/passwords";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "Reset your password" };

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const info = token ? verifyToken(token) : null;

  if (!info) {
    return (
      <div className="animate-rise text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-red-500/12 text-red-300">
          <CircleX size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">This link no longer works</h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          Reset links expire after two hours and can be used only once. Request a fresh one.
        </p>
        <Link
          href="/forgot-password"
          className="focus-ring mt-6 inline-flex rounded-full brand-gradient px-5 py-2.5 text-sm font-semibold text-brandink"
        >
          Send me a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <h1 className="text-3xl font-extrabold tracking-tight">Choose a new password</h1>
      <p className="mt-2 text-mist">
        Resetting the password for <span className="text-chalk">{info.email}</span>. Every device
        currently signed in as you will be signed out.
      </p>

      <div className="mt-8">
        <ResetForm token={token!} />
      </div>
    </div>
  );
}
