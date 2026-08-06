"use client";

import { useState } from "react";
import { Ban, ShieldCheck, Trash2 } from "lucide-react";
import { deleteUserAction, lockAccountAction, setRoleAction } from "@/actions/admin";
import { Button, cn, inputClass } from "@/components/ui";
import type { Role } from "@/lib/types";

export function DangerZone({
  userId,
  username,
  role,
  locked,
  canSetRole,
}: {
  userId: number;
  username: string;
  role: Role;
  locked: boolean;
  canSetRole: boolean;
}) {
  const [confirmation, setConfirmation] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  return (
    <section className="card border-red-500/25 p-5">
      <h3 className="font-bold text-red-300">Restricted actions</h3>
      <p className="mt-1 text-sm text-mist">
        Everything here is written to the activity log against your name.
      </p>

      <div className="mt-5 space-y-5">
        {/* ------------------------------------------------------- staff --- */}
        {canSetRole && (
          <div className="border-t border-leaf-500/10 pt-4">
            <p className="text-sm font-semibold">Staff access</p>
            <p className="mt-1 text-xs text-mist">
              An administrator can see every student, grant premium, unlock accounts and delete
              students. They cannot promote anyone or touch your founder account.
            </p>
            <form action={setRoleAction} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="role" value={role === "admin" ? "student" : "admin"} />
              <Button size="sm" variant={role === "admin" ? "ghost" : "primary"}>
                <ShieldCheck size={14} />
                {role === "admin" ? "Remove admin access" : "Make an administrator"}
              </Button>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------- suspend --- */}
        {!locked && (
          <div className="border-t border-leaf-500/10 pt-4">
            <p className="text-sm font-semibold">Suspend the account</p>
            <p className="mt-1 text-xs text-mist">
              Signs them out everywhere and blocks sign-in until the date passes. They are shown
              the reason you type.
            </p>
            <form action={lockAccountAction} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="userId" value={userId} />
              <label className="text-xs text-mist">
                Days
                <input
                  name="days"
                  type="number"
                  min={1}
                  max={365}
                  defaultValue={7}
                  className={inputClass + " mt-1 w-20 px-3 py-1.5 text-sm"}
                />
              </label>
              <label className="min-w-[200px] flex-1 text-xs text-mist">
                Reason shown to the student
                <input
                  name="reason"
                  maxLength={120}
                  placeholder="Sharing an account with other students."
                  className={inputClass + " mt-1 px-3 py-1.5 text-sm"}
                />
              </label>
              <Button size="sm" variant="danger">
                <Ban size={14} /> Suspend
              </Button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------ delete --- */}
        <div className="border-t border-leaf-500/10 pt-4">
          <p className="text-sm font-semibold">Delete permanently</p>
          <p className="mt-1 text-xs text-mist">
            Removes the account and everything attached to it — scores, group messages and payment
            records. This cannot be undone. Suspending is usually the better answer.
          </p>

          {!showDelete ? (
            <Button
              size="sm"
              variant="ghost"
              className="mt-3"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 size={14} /> I still want to delete this account
            </Button>
          ) : (
            <form action={deleteUserAction} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="userId" value={userId} />
              <label className="min-w-[220px] flex-1 text-xs text-mist">
                Type <span className="font-mono text-chalk">{username}</span> to confirm
                <input
                  name="confirm"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="off"
                  className={cn(
                    inputClass,
                    "mt-1 px-3 py-1.5 font-mono text-sm",
                    confirmation && confirmation !== username && "border-red-500/40",
                  )}
                />
              </label>
              <Button size="sm" variant="danger" disabled={confirmation !== username}>
                <Trash2 size={14} /> Delete for good
              </Button>
              <Button
                size="sm"
                variant="subtle"
                type="button"
                onClick={() => {
                  setShowDelete(false);
                  setConfirmation("");
                }}
              >
                Cancel
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
