#!/usr/bin/env node
// Lints every articles/*.md file: frontmatter parses, required fields present,
// filename matches slug, no duplicate slugs across the repo.

import { readdirSync, readFileSync } from "node:fs"
import { extname, basename, join } from "node:path"
import matter from "gray-matter"

const ARTICLES_DIR = "articles"
const REQUIRED = ["title", "summary"]
const IGNORE_FILENAMES = new Set(["template.md"])

function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

const files = readdirSync(ARTICLES_DIR)
  .filter((f) => extname(f) === ".md" && !IGNORE_FILENAMES.has(f))

let errors = 0
const slugs = new Map()

for (const file of files) {
  const filePath = join(ARTICLES_DIR, file)
  const raw = readFileSync(filePath, "utf8")
  let parsed
  try {
    parsed = matter(raw)
  } catch (err) {
    console.error(`✘ ${filePath}: invalid frontmatter — ${err.message}`)
    errors++
    continue
  }
  const fm = parsed.data

  // Required fields
  for (const key of REQUIRED) {
    if (!fm[key] || (typeof fm[key] === "string" && fm[key].trim() === "")) {
      console.error(`✘ ${filePath}: missing required field "${key}"`)
      errors++
    }
  }

  // Slug consistency
  const declaredSlug = fm.slug ? slugify(fm.slug) : (fm.title ? slugify(fm.title) : null)
  const fileSlug = basename(file, ".md")
  if (declaredSlug && declaredSlug !== fileSlug) {
    console.error(`✘ ${filePath}: filename "${fileSlug}" does not match slug "${declaredSlug}"`)
    errors++
  }

  // Duplicate slugs
  if (declaredSlug) {
    if (slugs.has(declaredSlug)) {
      console.error(`✘ ${filePath}: duplicate slug "${declaredSlug}" (also in ${slugs.get(declaredSlug)})`)
      errors++
    } else {
      slugs.set(declaredSlug, filePath)
    }
  }

  // Tags shape
  if (fm.tags !== undefined) {
    if (!Array.isArray(fm.tags) || fm.tags.some((t) => typeof t !== "string")) {
      console.error(`✘ ${filePath}: tags must be a list of strings`)
      errors++
    } else if (fm.tags.length > 6) {
      console.error(`✘ ${filePath}: tags must not exceed 6 entries`)
      errors++
    }
  }

  // Body not empty
  if (!parsed.content || parsed.content.trim().length < 50) {
    console.error(`✘ ${filePath}: body is empty or too short`)
    errors++
  }

  if (errors === 0 || !files.includes(file)) continue
}

console.log(`Linted ${files.length} article(s).`)
if (errors > 0) {
  console.error(`${errors} error(s) found.`)
  process.exit(1)
}
console.log("All good ✓")
