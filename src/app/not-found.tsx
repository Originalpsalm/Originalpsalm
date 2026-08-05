import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="text-center">
        <Logo size={34} className="mx-auto" />
        <p className="mt-10 text-6xl font-extrabold text-leaf-400">404</p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">This page is not here</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-mist">
          The paper, group or page you were looking for does not exist — or it has moved.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/dashboard">Go to home</ButtonLink>
          <ButtonLink href="/practice" variant="ghost">
            Browse past questions
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
