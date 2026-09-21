# PEN backend setup

The repository currently contains the backend migration and protected AI Edge Function, but GitHub Pages cannot create Supabase tables or deploy functions by itself.

## Supabase

1. Open Supabase SQL Editor for project `rapzyhiejlqdivzdziwr`.
2. Run `supabase/migrations/202609210001_pen_social_features.sql`.
3. Deploy `supabase/functions/pen-ai-chat/index.ts` with the Supabase CLI:

```bash
supabase functions deploy pen-ai-chat
supabase secrets set OPENAI_API_KEY=your_key_here
```

Never put the OpenAI key in `index.html` or commit it to GitHub.

## Frontend

The existing frontend must be restored before wiring these tables into its profile and feed screens. The previous fallback commit replaced the application file rather than patching it. Restore commit `5230ac20d12714cc1bf67e9375e071c8ef4eb9bc`, then wire calls such as:

- follow: `db.from('follows').insert({ follower_id: user.id, following_id: profile.id })`
- unfollow: `db.from('follows').delete().match({ follower_id: user.id, following_id: profile.id })`
- following feed: query `posts` where `author_id` is in the current user's `follows.following_id`
- explore feed: query recent `posts` excluding followed author IDs
- AI: `db.functions.invoke('pen-ai-chat', { body: { messages } })`

The database constraints and row-level security policies enforce no self-follows, no duplicate follows, and separate FOLLOW and CONNECT records.
