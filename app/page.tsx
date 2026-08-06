import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/** Entry point: straight to the dashboard when signed in, otherwise sign in. */
export default async function HomePage() {
  redirect((await getAuthContext()) ? "/dashboard" : "/login");
}
