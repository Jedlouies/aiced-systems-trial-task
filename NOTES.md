# Implementation Notes — Notes Feature

### Row-Level Security (RLS) Approach
For the `notes` table, I implemented an identity-aware, multi-tenant Row-Level Security (RLS) strategy utilizing PostgreSQL subqueries to strictly isolate group data. Both the `SELECT` and `INSERT` policies dynamically query the `memberships` table to verify if the active user (`auth.uid()`) belongs to the target company group (`group_id`). Additionally, the write policy enforces data integrity by ensuring that the `author_id` explicitly matches the authenticated user's ID. 

### Use of AI Tools
I used Gemini as my sole AI assistant throughout the duration of this task. I heavily leveraged Gemini during the refactoring, improvement, and debugging phases of the code to optimize the layout of the Next.js API routes, ensure strict type safety inside the Zod schema validation layer, fix implementation bugs, and refine the syntax of the transaction-isolated Vitest integration suite to guarantee robust tenant separation.