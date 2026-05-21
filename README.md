# devrels.xyz articles

The submission repo for articles on [devrels.xyz/articles](https://devrels.xyz/articles).

This repo is the **submission pipeline**. Articles are stored on the site itself (in Turso) — this repo is where the community proposes, reviews, and merges new ones via pull request. Once a PR is merged to `main`, a GitHub Action syncs the markdown file into devrels.xyz and it goes live.

## How to contribute

1. **Fork this repo.**
2. Add a new file under `articles/your-slug.md` with the [frontmatter format](#frontmatter) below.
3. Open a pull request. Keep PRs to one article each.
4. A maintainer will review for accuracy, tone, and fit. On merge, the article appears on devrels.xyz within ~30 seconds.

Run `npm install && npm run lint` before opening the PR if you want to catch frontmatter errors locally.

## Frontmatter

Every article must begin with a YAML frontmatter block:

```markdown
---
title: LiteSVM — faster Solana program testing
slug: litesvm-faster-solana-program-testing       # optional, auto-derived from title
summary: One paragraph hook for cards, OG, RSS.
author_twitter: metasal                            # optional — links the article to a dev profile on devrels.xyz
author_name: metasal                               # fallback when no devrels.xyz dev row matches
tags: [testing, rust, tooling]                     # optional, max 6
cover_image: https://example.com/cover.png         # optional, 16:9 preferred
featured: false                                    # admins only — leave false in PRs
published: true                                    # set false to land as draft
published_at: 2026-05-21T00:00:00Z                 # optional — defaults to merge time
---

Your article body in **markdown** starts here.
```

See [`articles/litesvm-faster-solana-program-testing.md`](articles/litesvm-faster-solana-program-testing.md) for a full real example.

## What we accept

- Solana DevRel content: tooling deep-dives, getting-started tutorials, lessons from shipping, infra writeups.
- Original work or significant rewrites — not link-bait or LLM filler.
- Code examples that compile (or that we can reproduce).

We will **not** merge:
- Affiliate-flavoured promo for a single product.
- Anonymously authored pieces with no traceable identity.
- Articles already published verbatim elsewhere without canonical attribution.

## Editing or unpublishing

For typos and metadata fixes, prefer a follow-up PR — the repo stays in sync with the site.

For takedowns or urgent fixes, devrels.xyz admins can edit/unpublish directly via `/admin/articles`. Those direct edits will be overwritten if a later PR touches the same slug, so loop back to the repo when possible.

## License

Each article retains the author's copyright. By submitting a PR you grant devrels.xyz a perpetual, non-exclusive licence to display it on the site. The repo as a whole is [CC BY 4.0](LICENSE).
