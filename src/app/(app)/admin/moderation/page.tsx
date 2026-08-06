import Link from "next/link";
import { Trash2 } from "lucide-react";
import { recentMessages } from "@/lib/admin";
import { deleteMessageAction } from "@/actions/admin";
import { Avatar, Button } from "@/components/ui";

export default function AdminModerationPage() {
  const messages = recentMessages(80);

  return (
    <div className="space-y-4">
      <p className="text-xs text-mist">
        The newest messages from every study group, so you can spot bullying, exam-malpractice
        offers or spam early. Deleting removes the message for everyone.
      </p>

      {messages.length === 0 ? (
        <p className="card px-5 py-12 text-center text-sm text-mist">
          Nothing has been posted yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {messages.map((message) => (
            <li key={message.id} className="card flex flex-wrap items-start gap-3 p-4">
              <Avatar name={message.author_name} hue={message.avatar_hue} size={36} />

              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-xs text-mist">
                  <Link
                    href={`/admin/users/${message.author_id}`}
                    className="focus-ring rounded font-semibold text-chalk hover:text-leaf-400"
                  >
                    {message.author_name}
                  </Link>
                  <span>@{message.author_username}</span>
                  <span>in</span>
                  <Link
                    href={`/groups/${message.group_id}`}
                    className="focus-ring rounded hover:text-chalk"
                  >
                    {message.group_name}
                  </Link>
                  <span className="tabular-nums">{message.created_at.slice(0, 16)}</span>
                </p>
                <p className="mt-1.5 whitespace-pre-wrap break-words text-sm">{message.body}</p>
              </div>

              <form action={deleteMessageAction}>
                <input type="hidden" name="messageId" value={message.id} />
                <Button size="sm" variant="ghost" aria-label="Delete message">
                  <Trash2 size={14} />
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
