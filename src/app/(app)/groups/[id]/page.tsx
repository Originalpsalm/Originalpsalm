import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Lock, LogOut, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { groupById, groupMembers, groupMessages, isMember } from "@/lib/queries";
import { leaveGroupAction } from "@/actions/groups";
import { Avatar, Badge, Button, ButtonLink } from "@/components/ui";
import { GroupChat } from "./GroupChat";
import { InviteCode } from "./InviteCode";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const group = groupById(Number(id));
  return { title: group?.name ?? "Group" };
}

export default async function GroupPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();
  const group = groupById(Number(id));
  if (!group) notFound();

  const member = isMember(group.id, user.id);

  // A private group shows nothing at all to a non-member.
  if (!member && group.is_private === 1) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card p-8 text-center">
          <Lock size={24} className="mx-auto text-gold-400" />
          <h1 className="mt-4 text-lg font-bold">This group is private</h1>
          <p className="mt-2 text-sm text-mist">
            Ask a member for the 6-letter invite code, then join from the groups page.
          </p>
          <ButtonLink href="/groups" className="mt-6">
            Back to groups
          </ButtonLink>
        </div>
      </div>
    );
  }

  const members = groupMembers(group.id);
  const messages = member ? groupMessages(group.id) : [];

  return (
    <div className="space-y-5">
      <Link
        href="/groups"
        className="focus-ring inline-flex items-center gap-1.5 rounded text-sm text-mist hover:text-chalk"
      >
        <ArrowLeft size={15} /> All groups
      </Link>

      {/* --------------------------------------------------------- head --- */}
      <header className="card animate-rise p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{group.name}</h1>
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
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">{group.description}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-mist">
              <span className="inline-flex items-center gap-1">
                <Users size={13} /> {members.length}{" "}
                {members.length === 1 ? "member" : "members"}
              </span>
              {group.exam_body && <Badge tone="mist">{group.exam_body}</Badge>}
              {group.subject && <Badge tone="mist">{group.subject}</Badge>}
            </div>
          </div>

          {member && <InviteCode code={group.invite_code} />}
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        {/* ------------------------------------------------------ chat --- */}
        <section className="order-2 lg:order-1">
          {member ? (
            <GroupChat groupId={group.id} initialMessages={messages} viewerId={user.id} />
          ) : (
            <div className="card p-8 text-center">
              <Users size={24} className="mx-auto text-leaf-400" />
              <h2 className="mt-4 font-bold">Join to see the conversation</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-mist">
                Members of {group.name} discuss questions here every day.
              </p>
              <form action="/groups" className="mt-5">
                <ButtonLink href="/groups">Go to groups and join</ButtonLink>
              </form>
            </div>
          )}
        </section>

        {/* --------------------------------------------------- members --- */}
        <aside className="order-1 space-y-4 lg:order-2">
          <div className="surface p-4">
            <h2 className="mb-3 text-sm font-bold">Members</h2>
            <ul className="space-y-2.5">
              {members.map((entry) => (
                <li key={entry.id} className="flex items-center gap-2.5">
                  <Avatar name={entry.name} hue={entry.avatar_hue} userId={entry.id} avatarVersion={entry.avatar_version} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {entry.name}
                      {entry.id === user.id && <span className="text-mist"> (you)</span>}
                    </p>
                    <p className="truncate text-xs text-mist">
                      {entry.class_level ?? "Student"}
                      {entry.school ? ` · ${entry.school}` : ""}
                    </p>
                  </div>
                  {entry.role === "owner" && <Badge tone="gold">Owner</Badge>}
                </li>
              ))}
            </ul>
          </div>

          {member && (
            <form action={leaveGroupAction}>
              <input type="hidden" name="groupId" value={group.id} />
              <Button variant="danger" size="sm" className="w-full">
                <LogOut size={15} /> Leave group
              </Button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
