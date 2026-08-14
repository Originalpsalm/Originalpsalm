"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { removeAvatarAction, uploadAvatarAction, type ProfileState } from "@/actions/profile";
import { Alert, Avatar, Button } from "@/components/ui";

const MAX_BYTES = 1_000_000;

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={disabled || pending}>
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
      {pending ? "Uploading…" : "Save photo"}
    </Button>
  );
}

function RemoveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="sm" disabled={pending}>
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      Remove
    </Button>
  );
}

export function AvatarUploader({
  userId,
  name,
  avatarHue,
  avatarVersion,
  hasPhoto,
}: {
  userId: number;
  name: string;
  avatarHue: number;
  avatarVersion: number;
  hasPhoto: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [chosen, setChosen] = useState(false);

  const [uploadState, uploadAction] = useActionState<ProfileState, FormData>(
    uploadAvatarAction,
    {},
  );
  const [removeState, removeAction] = useActionState<ProfileState, FormData>(
    () => removeAvatarAction(),
    {},
  );

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    setLocalError(null);
    const file = event.target.files?.[0];
    if (!file) {
      setChosen(false);
      setPreview(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("That photo is over 1 MB. Please pick a smaller one.");
      event.target.value = "";
      setChosen(false);
      setPreview(null);
      return;
    }
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    setChosen(true);
  }

  const error = localError ?? uploadState.error ?? removeState.error;
  const success = uploadState.success ?? removeState.success;

  return (
    <section className="card p-6">
      <div className="flex items-start gap-3">
        <Camera size={20} className="mt-0.5 shrink-0 text-leaf-400" />
        <div>
          <h2 className="text-lg font-bold">Profile picture</h2>
          <p className="mt-1 text-sm text-mist">
            A JPG, PNG or WEBP up to 1 MB. Classmates see this next to your name.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {success && !error && (
        <div className="mt-4">
          <Alert tone="success">{success}</Alert>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-5">
        {preview ? (
          <span className="relative inline-flex size-16 shrink-0 overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="h-full w-full object-cover" />
          </span>
        ) : (
          <Avatar
            name={name}
            hue={avatarHue}
            size={64}
            userId={userId}
            avatarVersion={avatarVersion}
          />
        )}

        <form action={uploadAction} className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPick}
            className="max-w-[200px] text-sm text-mist file:mr-3 file:rounded-full file:border-0 file:bg-leaf-500/15 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-leaf-400 hover:file:bg-leaf-500/25"
          />
          <SaveButton disabled={!chosen} />
        </form>

        {hasPhoto && (
          <form action={removeAction}>
            <RemoveButton />
          </form>
        )}
      </div>
    </section>
  );
}
