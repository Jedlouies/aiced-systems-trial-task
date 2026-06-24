import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { asUser, asOwner, pool, ALICE, BOB, CAROL, ACME, GLOBEX } from "./helpers";

describe("notes", () => {
  beforeAll(async () => {
    await asOwner("delete from notes");
    await asOwner(`
      insert into notes (group_id, author_id, body) values 
      ($1, $2, 'Acme private note'),
      ($3, $4, 'Globex private note')
    `, [ACME, ALICE, GLOBEX, BOB]);
  });

  afterAll(async () => {
    await asOwner("delete from notes");
    await pool.end();
  });

  it("a member sees only their own group's notes", async () => {
    const aliceNotes = await asUser(ALICE, async (q) => (await q("select body from notes")).rows);
    expect(aliceNotes).toHaveLength(1);
    expect(aliceNotes[0].body).toBe("Acme private note");

    const bobNotes = await asUser(BOB, async (q) => (await q("select body from notes")).rows);
    expect(bobNotes).toHaveLength(1);
    expect(bobNotes[0].body).toBe("Globex private note");
  });

  it("a user cannot insert a note into a group they don't belong to", async () => {
    const illegalInsert = asUser(ALICE, async (q) => {
      await q("insert into notes (group_id, author_id, body) values ($1, $2, 'Infiltrator body')", [GLOBEX, ALICE]);
    });

    await expect(illegalInsert).rejects.toThrow();
  });
});