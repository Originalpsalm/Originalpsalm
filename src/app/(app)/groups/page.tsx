import Link from "next/link";
import { Globe, Lock, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { discoverGroups, groupsForUser } from "@/lib/queries";
import { Badge, Button, EmptyState } from "@/components/ui";
import { joinGroupAction } from "@/actions/groups";
import { GroupTools } from "./GroupTools";

export const metadata = { title: "Study groups" };

export default async function GroupsPage() {
  const user = await requireUser();
  const mine = groupsForUser(user.id);
  const discover = discoverGroups(user.id);

  return (
    <div className="space-y-8">
      <header className="animate-rise">
        <h1 className="text-3xl font-extrabold tracking-tight">Study groups</h1>
        <p className="mt-2 max-w-2xl text-mist">
          Studying with people who are writing the same exam is the fastest way to improve. Create a
          group for your class, or join one with a 6-letter invite code.
        </p>
      </header>

      <GroupTools />

      {/* ---------------------------------------------------- my groups --- */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Your groups</h2>

        {mine.length === 0 ? (
          <EmptyState
            icon={<Users size={24} />}
            title="You are not in any group yet"
            body="Create one above and share the invite code with your classmates, or join a public group below."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {mine.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="focus-ring card p-5 transition hover:border-leaf-500/35"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold">{group.name}</h3>
                  {group.is_private === 1 ? (
                    <Badge tone="mist">
                      <Lock size={11} /> Private
                    </Badge>
                  ) : (
                    <Badge tone="leaf">
                      <Globe size={11} /> Public
                    </Badge>
                  )}
                </div>

                {group.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-mist">{group.description}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-mist">
                  <span className="inline-flex items-center gap-1">
                    <Users size={13} /> {group.member_count}
                  </span>
                  {group.exam_body && <Badge tone="mist">{group.exam_body}</Badge>}
                  {group.subject && <Badge tone="mist">{group.subject}</Badge>}
                  <span className="ml-auto font-mono tracking-widest text-leaf-400">
                    {group.invite_code}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------ discover --- */}
      {discover.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Open groups you can join</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {discover.map((group) => (
              <article key={group.id} className="card flex flex-col p-5">
                <h3 className="font-bold">{group.name}</h3>
                {group.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-mist">{group.description}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-mist">
                  <span className="inline-flex items-center gap-1">
                    <Users size={13} /> {group.member_count}
                  </span>
                  {group.exam_body && <Badge tone="mist">{group.exam_body}</Badge>}
                  {group.subject && <Badge tone="mist">{group.subject}</Badge>}
                </div>

                <p className="mt-3 text-xs text-mist/70">Created by {group.owner_name}</p>

                <form action={joinGroupAction} className="mt-4">
                  <input type="hidden" name="groupId" value={group.id} />
                  <Button variant="ghost" size="sm" className="w-full">
                    Join group
                  </Button>
                </form>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
