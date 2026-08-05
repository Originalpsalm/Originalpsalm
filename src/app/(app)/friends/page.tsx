import { Check, Clock, Search, UserPlus, UserRound, X } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  friendsOf,
  incomingRequests,
  outgoingRequests,
  searchStudents,
  suggestedStudents,
  type FriendRow,
} from "@/lib/queries";
import {
  acceptRequestAction,
  declineRequestAction,
  sendRequestAction,
} from "@/actions/friends";
import { Avatar, Badge, Button, EmptyState, inputClass } from "@/components/ui";
import type { PublicUser } from "@/lib/types";

export const metadata = { title: "Friends" };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function FriendsPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const user = await requireUser();
  const query = (q ?? "").trim();

  const friends = friendsOf(user.id);
  const incoming = incomingRequests(user.id);
  const outgoing = outgoingRequests(user.id);
  const results = query ? searchStudents(query, user.id) : [];
  const suggestions = query ? [] : suggestedStudents(user.id);

  const friendIds = new Set(friends.map((friend) => friend.id));
  const pendingIds = new Set([
    ...outgoing.map((request) => request.id),
    ...incoming.map((request) => request.id),
  ]);

  return (
    <div className="space-y-8">
      <header className="animate-rise">
        <h1 className="text-3xl font-extrabold tracking-tight">Friends</h1>
        <p className="mt-2 max-w-2xl text-mist">
          Find your classmates by name, username or school, then add them so you can pull them into
          your study groups.
        </p>
      </header>

      {/* -------------------------------------------------------- search --- */}
      <form className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist"
        />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by name, username or school…"
          aria-label="Search students"
          className={inputClass + " pl-11"}
        />
      </form>

      {/* ------------------------------------------------------ requests --- */}
      {incoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">
            Friend requests <Badge tone="leaf">{incoming.length}</Badge>
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {incoming.map((request) => (
              <li key={request.friendship_id} className="card flex items-center gap-3 p-4">
                <PersonSummary person={request} />
                <div className="flex shrink-0 gap-2">
                  <form action={acceptRequestAction}>
                    <input type="hidden" name="friendshipId" value={request.friendship_id} />
                    <Button size="sm" aria-label={`Accept ${request.name}`}>
                      <Check size={15} />
                    </Button>
                  </form>
                  <form action={declineRequestAction}>
                    <input type="hidden" name="friendshipId" value={request.friendship_id} />
                    <Button size="sm" variant="ghost" aria-label={`Decline ${request.name}`}>
                      <X size={15} />
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* -------------------------------------------------- search results --- */}
      {query && (
        <section>
          <h2 className="mb-3 text-lg font-bold">
            Results for “{query}”{" "}
            <span className="text-sm font-normal text-mist">({results.length})</span>
          </h2>

          {results.length === 0 ? (
            <EmptyState
              icon={<Search size={24} />}
              title="Nobody matched that"
              body="Try their username, or ask them for it. Every student on GURU has their own account."
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {results.map((person) => (
                <li key={person.id} className="card flex items-center gap-3 p-4">
                  <PersonSummary person={person} />
                  <AddButton
                    person={person}
                    isFriend={friendIds.has(person.id)}
                    isPending={pendingIds.has(person.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* --------------------------------------------------- your friends --- */}
      <section>
        <h2 className="mb-3 text-lg font-bold">
          Your friends <span className="text-sm font-normal text-mist">({friends.length})</span>
        </h2>

        {friends.length === 0 ? (
          <EmptyState
            icon={<UserRound size={24} />}
            title="No friends added yet"
            body="Search for a classmate above, or share your username so they can find you."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {friends.map((friend) => (
              <li key={friend.id} className="card flex items-center gap-3 p-4">
                <PersonSummary person={friend} />
                <form action={declineRequestAction} className="shrink-0">
                  <input type="hidden" name="friendshipId" value={friend.friendship_id} />
                  <Button size="sm" variant="ghost">
                    Remove
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------- pending --- */}
      {outgoing.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Requests you sent</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {outgoing.map((request) => (
              <li key={request.friendship_id} className="surface flex items-center gap-3 p-4">
                <PersonSummary person={request} />
                <Badge tone="mist" className="shrink-0">
                  <Clock size={11} /> Pending
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --------------------------------------------------- suggestions --- */}
      {suggestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Students you can add</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((person) => (
              <li key={person.id} className="card flex items-center gap-3 p-4">
                <PersonSummary person={person} />
                <AddButton person={person} isFriend={false} isPending={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PersonSummary({ person }: { person: PublicUser | FriendRow }) {
  return (
    <>
      <Avatar name={person.name} hue={person.avatar_hue} size={42} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{person.name}</p>
        <p className="truncate text-xs text-mist">
          @{person.username}
          {person.class_level ? ` · ${person.class_level}` : ""}
        </p>
        {person.school && <p className="truncate text-xs text-mist/70">{person.school}</p>}
      </div>
    </>
  );
}

function AddButton({
  person,
  isFriend,
  isPending,
}: {
  person: PublicUser;
  isFriend: boolean;
  isPending: boolean;
}) {
  if (isFriend) {
    return (
      <Badge tone="leaf" className="shrink-0">
        <Check size={11} /> Friends
      </Badge>
    );
  }
  if (isPending) {
    return (
      <Badge tone="mist" className="shrink-0">
        <Clock size={11} /> Pending
      </Badge>
    );
  }
  return (
    <form action={sendRequestAction} className="shrink-0">
      <input type="hidden" name="userId" value={person.id} />
      <Button size="sm" aria-label={`Add ${person.name}`}>
        <UserPlus size={15} /> Add
      </Button>
    </form>
  );
}
