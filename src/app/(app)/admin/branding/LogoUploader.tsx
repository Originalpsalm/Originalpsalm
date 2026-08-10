"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Trash2, Upload } from "lucide-react";
import { removeLogoAction, uploadLogoAction, type BrandingState } from "@/actions/branding";
import { Alert, Button, cn } from "@/components/ui";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
      {pending ? "Uploading…" : "Upload logo"}
    </Button>
  );
}

export function LogoUploader({ hasLogo }: { hasLogo: boolean }) {
  const [state, action] = useActionState<BrandingState, FormData>(uploadLogoAction, {});
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview(null);
      setFileName(null);
      return;
    }
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form action={action} className="card space-y-4 p-6">
      {state.error && <Alert>{state.error}</Alert>}

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-leaf-500/25 bg-ink-900/40 p-8 text-center transition hover:border-leaf-500/50",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="New logo preview" className="size-20 rounded-xl object-contain" />
        ) : (
          <Upload size={28} className="text-mist" />
        )}
        <span className="text-sm text-mist">
          {fileName ? (
            <span className="font-medium text-chalk">{fileName}</span>
          ) : (
            <>
              <span className="font-semibold text-leaf-400">Tap to choose</span> a logo image
            </>
          )}
        </span>
        <input
          type="file"
          name="logo"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={onPick}
          className="sr-only"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton disabled={!fileName} />

        {hasLogo && (
          <button
            type="submit"
            formAction={removeLogoAction}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            <Trash2 size={14} /> Remove, use default
          </button>
        )}
      </div>
    </form>
  );
}
