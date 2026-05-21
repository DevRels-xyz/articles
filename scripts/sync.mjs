#!/usr/bin/env node
// Posts every article in `articles/` to the devrels.xyz sync webhook.
//
// Usage:
//   ARTICLES_SYNC_URL=https://devrels.xyz/api/articles/sync \
//   ARTICLES_SYNC_SECRET=...                              \
//   node scripts/sync.mjs [files...]
//
// If file paths are provided, only those are synced. Otherwise every article
// in `articles/` is synced (skipping template.md).

import { readdirSync, readFileSync } from "node:fs"
import { extname, basename, join } from "node:path"
import matter from "gray-matter"

const URL = process.env.ARTICLES_SYNC_URL
const SECRET = process.env.ARTICLES_SYNC_SECRET
if (!URL || !SECRET) {
  console.error("ARTICLES_SYNC_URL and ARTICLES_SYNC_SECRET must be set")
  process.exit(1)
}

const ARTICLES_DIR = "articles"
const IGNORE = new Set(["template.md"])

let targets = process.argv.slice(2)
if (targets.length === 0) {
  targets = readdirSync(ARTICLES_DIR)
    .filter((f) => extname(f) === ".md" && !IGNORE.has(f))
    .map((f) => join(ARTICLES_DIR, f))
}

let failures = 0
for (const filePath of targets) {
  const raw = readFileSync(filePath, "utf8")
  const { data, content } = matter(raw)
  const slug = data.slug || basename(filePath, ".md")
  const payload = {
    slug,
    title: data.title,
    summary: data.summary || null,
    body: content,
    cover_image: data.cover_image || null,
    author_twitter: data.author_twitter || null,
    author_name: data.author_name || null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    featured: !!data.featured,
    published: data.published !== false,
    published_at: data.published_at || null,
  }

  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-sync-secret": SECRET },
    body: JSON.stringify(payload),
  })
  const body = await res.text()
  if (!res.ok) {
    console.error(`✘ ${filePath} → ${res.status} ${body}`)
    failures++
  } else {
    console.log(`✓ ${filePath} → ${body}`)
  }
}

if (failures > 0) process.exit(1)
