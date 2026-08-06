import Link from "next/link";
import { Globe, Lock, MessageSquare, Trash2, Users } from "lucide-react";
import { listGroups } from "@/lib/admin";
import { deleteGroupAction } from "@/actions/admin";
import { Badge, Button, inputClass } from "@/components/ui";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminGroupsPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const groups = listGroups(q ?? "");

  return (
    <div className="space-y-4">
      <form>
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search groups by name or invite code…"
          aria-label="Search groups"
          className={inputClass}
        />
      </form>

      {groups.length === 0 ? (
        <p className="card px-5 py-12 text-center text-sm text-mist">No groups found.</p>
      ) : (
        <ul className="space-y-2">
          {groups.map((group) => (
            <li key={group.id} className="card p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/groups/${group.id}`}
                      className="focus-ring truncate rounded font-semibold hover:text-leaf-400"
                    >
                      {group.name}
                    </Link>
                    {group.is_private === 1 ? (
                      <Badge tone="mist">
                        <Lock size={11} /> Private
                      </Badge>
                    ) : (
                      <Badge tone="leaf">
                        <Globe size={11} /> Public
                      </Badge>
                    )}
                    <span className="font-mono text-xs tracking-widest text-leaf-400">
                      {group.invite_code}
                    </span>
                  </div>

                  {group.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-mist">{group.description}</p>
                  )}

                  <p className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-mist">
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} /> {group.member_count}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={12} /> {group.message_count}
                    </span>
                    <span>
                      by{" "}
                      <Link
                        href={`/admin/users/${group.owner_id}`}
                        className="focus-ring rounded hover:text-chalk"
                      >
                        {group.owner_name}
                      </Link>
                    </span>
                    <span>{group.created_at.slice(0, 10)}</span>
                  </p>
                </div>

                <form action={deleteGroupAction}>
                  <input type="hidden" name="groupId" value={group.id} />
                  <Button size="sm" variant="danger">
                    <Trash2 size={14} /> Delete
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
