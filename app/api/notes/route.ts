import { NextRequest, NextResponse } from "next/server";
import { createUserClient } from "@/lib/supabase";
import { z } from "zod";

const createNoteSchema = z.object({
  group_id: z.string().uuid("Invalid group ID format"),
  body: z.string().min(1, "Note body cannot be empty"),
});


export async function GET(req: NextRequest) {
  const supabase = createUserClient(req);

  const { data, error } = await supabase
    .from("notes")
    .select("id, group_id, author_id, body, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: data });
}

export async function POST(req: NextRequest) {
  const supabase = createUserClient(req);

  try {
    const bodyJson = await req.json();
    const result = createNoteSchema.safeParse(bodyJson);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access token" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("notes")
      .insert({
        group_id: result.data.group_id,
        author_id: user.id,
        body: result.data.body,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ note: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }
}