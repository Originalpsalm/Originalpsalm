import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* ------------------------------------------------- brand panel --- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(700px 500px at 20% 20%, rgba(23,196,113,.22), transparent 65%)," +
              "radial-gradient(600px 400px at 80% 80%, rgba(245,179,1,.12), transparent 60%)",
          }}
        />
        <Link href="/" className="focus-ring w-fit rounded-xl">
          <Logo size={38} />
        </Link>

        <div className="max-w-md">
          <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight">
            Your <span className="text-gradient">exam year</span> just got easier.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-mist">
            Years of WAEC, JAMB, NECO and NABTEB past questions — each one with the working shown, not
            just the answer. Then bring your classmates in and grind together.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-mist">
            {[
              "Real CBT-style timing, so exam day feels familiar",
              "Study groups with the people in your class",
              "Your weak topics, tracked automatically",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-leaf-400" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-mist/60">
          One account, one student. That is how we keep it cheap for everybody.
        </p>
      </aside>

      {/* ------------------------------------------------------- form --- */}
      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="focus-ring mb-8 inline-block rounded-xl lg:hidden">
            <Logo size={34} />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
