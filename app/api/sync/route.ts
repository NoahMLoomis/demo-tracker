import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { syncUser } from "@/lib/sync";

export async function POST() {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const result = await syncUser(session.userId);
		return NextResponse.json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Sync failed";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
