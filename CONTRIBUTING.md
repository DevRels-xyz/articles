# Contributing

Thanks for wanting to write something for devrels.xyz!

## TL;DR

```sh
git clone https://github.com/DevRels-xyz/articles
cd articles
npm install
cp articles/template.md articles/my-slug.md
# write the article
npm run lint
git checkout -b article/my-slug
git commit -am "article: my slug"
git push origin article/my-slug
# open a PR
```

## Picking a slug

The slug is the URL: `devrels.xyz/articles/<slug>`. Use lowercase words separated by hyphens. Keep it short and descriptive. The filename must match the slug exactly — `articles/my-cool-article.md` becomes `devrels.xyz/articles/my-cool-article`.

If you omit the `slug:` field in frontmatter, we auto-derive it from the title.

## Writing style

- **Lead with the takeaway.** Don't bury the lede — explain what the reader will know by the end in the first paragraph.
- **Show, don't tell.** Code samples beat prose for technical articles. Make them runnable.
- **Cite versions.** Solana moves fast. State the version of any tool you're writing about.
- **Voice = your own.** This isn't a corporate blog. Keep your personality.

Aim for 600-1500 words. Longer is fine if the depth justifies it.

## Linking to people / projects

If the article mentions people active in the Solana ecosystem, link to their devrels.xyz member page where possible: `https://devrels.xyz/members/<their-x-handle>`. Same for organisations and resources.

## Code blocks

Use fenced code blocks with a language tag — the site syntax-highlights them. Prefer real, copy-pasteable examples over pseudo-code.

```rust
fn hello() { println!("hi"); }
```

## Images

Cover images go in the `cover_image` frontmatter field — host them anywhere with a stable URL (Cloudflare R2, an existing CDN, GitHub raw, etc.). 16:9 aspect ratio renders best. We don't currently host inline images in the body — link them externally.

## Linting

```sh
npm run lint
```

This checks:
- Frontmatter parses and required fields are present
- Filename matches the slug
- No duplicate slugs across the repo
- Cover image URL is reachable (warning only)

## Reviewer expectations

Reviews aim for <72h turnaround. Possible outcomes:

- **Merge** — article goes live.
- **Request changes** — usually small fixes; resubmit and we'll re-review fast.
- **Decline with notes** — when the topic isn't a fit. We'll explain why.

## Questions

Open an issue or ping us on the [devrels.xyz Telegram](https://t.me/+m3q9fZInYskwYzM9).
