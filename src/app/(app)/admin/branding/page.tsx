import { notFound } from "next/navigation";
import { ImageUp } from "lucide-react";
import { isOwner, requireAdmin } from "@/lib/auth";
import { getLogoInfo, logoVersion } from "@/lib/settings";
import { Alert } from "@/components/ui";
import { LogoUploader } from "./LogoUploader";

export const metadata = { title: "Branding" };

type Props = { searchParams: Promise<{ updated?: string }> };

export default async function BrandingPage({ searchParams }: Props) {
  const actor = await requireAdmin();
  // Only the founder changes the app's face; admins get a 404 here.
  if (!isOwner(actor)) notFound();

  const { updated } = await searchParams;
  const logo = getLogoInfo();
  const version = logoVersion();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <ImageUp size={20} className="text-leaf-400" /> Branding
        </h2>
        <p className="mt-1 text-sm text-mist">
          Upload your GURU logo. It replaces the default mark everywhere in the app and on the
          sign-in screen. A square PNG with a transparent background works best.
        </p>
      </div>

      {updated === "1" && <Alert tone="success">Logo updated. It is live across the app now.</Alert>}

      <section className="card p-6">
        <p className="mb-3 text-sm font-medium text-mist">Current logo</p>
        <div className="flex items-center gap-4">
          <div className="grid size-20 place-items-center rounded-2xl border border-leaf-500/15 bg-ink-900/60">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/brand/logo?v=${version}`}
                alt="Current logo"
                className="size-16 rounded-xl object-contain"
              />
            ) : (
              <span className="text-xs text-mist">Default</span>
            )}
          </div>
          <p className="text-xs text-mist">
            {logo
              ? `Custom logo in use · ${logo.mime.replace("image/", "").toUpperCase()}`
              : "Using the built-in GURU mark."}
          </p>
        </div>
      </section>

      <LogoUploader hasLogo={!!logo} />

      <p className="text-xs leading-relaxed text-mist/70">
        The logo is stored with your data on the server disk, so it stays put across updates. Max
        file size 1 MB. PNG, JPG or WEBP.
      </p>
    </div>
  );
}
