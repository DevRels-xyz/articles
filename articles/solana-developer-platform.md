---
title: "Solana's developer platform: the official on-ramp for new builders"
slug: solana-developer-platform
summary: solana.com/developers is the Solana Foundation's curated hub — docs, bootcamps, the Cookbook, payments primitives, and links into every meaningful learning path in the ecosystem. Here's how to actually use it.
author_twitter: metasal
author_name: metasal
tags: [developers, learning, docs, foundation, onboarding]
cover_image:
published: true
---

If you're new to Solana and you don't know where to start, the answer is [solana.com/developers](https://solana.com/developers) — the Solana Foundation's official developer platform. It's the curated entry point that links into every meaningful learning path, doc set, and tooling resource in the ecosystem.

You don't have to use it. But if you're starting cold, working through it before bouncing around random tutorials will save you a week.

## What it is

The platform is structured as a hub, not a single course. The headline modules:

- **Documentation** — the canonical Solana docs (architecture, transactions, accounts, programs)
- **API** — JSON-RPC reference, including the methods every Solana app uses
- **Cookbook** — recipes for common Solana tasks: send a transaction, fetch token accounts, derive a PDA, sign a message, manage versioned transactions
- **Bootcamp** — multi-week structured curricula from the Foundation
- **Payments** — Solana Pay, the protocol for QR-coded crypto payments
- **Skills** — task-specific learning paths
- **Get Support** — Discord and Stack Exchange entry points

The framing is explicit on the page itself: *"By builders for builders."* The Foundation maintains the platform; the surrounding ecosystem (Blueshift, Turbin3, Superteam, RareSkills, Hackquest) contributes courses that the platform links into.

## The learning paths

Rather than reinventing courses, the platform curates the ones the community has already built:

- **[Blueshift](https://devrels.xyz/articles/blueshift-solana-learning-platform)** — the free education platform with structured paths, on-chain verified challenges, and an assembly-level deep track. Most engineers' fastest path from zero to shipping.
- **Solana Foundation Developers Learn Bootcamp** — Foundation-run, multi-week, more comprehensive than a self-paced course.
- **Solana Bootcamp** — the curated public-facing bootcamp, with cohort options.
- **Solana Bytes** — short-form bite-sized lessons. Good for filling specific knowledge gaps.
- **Build on Solana by Rise In** — partner-run course covering full-stack Solana development.
- **Ethereum to Solana Developer Course by RareSkills** — the canonical EVM-to-Solana onboarding for engineers coming from the Ethereum side.
- **Hackquest Solana Learning Track** — quest-style learning, ideal for self-directed learners.

If you're picking just one, Blueshift is the right default for engineers. If you're a hackathon team trying to ship in two weeks, the Foundation's Solana Bootcamp is the more structured pick.

## The Cookbook is underrated

Easy to miss because it's tucked into the platform — the Cookbook is the page most Solana engineers end up coming back to long after they've finished their first course.

Sample of what's in it:

- "How to optimize compute usage on Solana"
- "How to get Solana devnet SOL (airdrops + faucets + POW)"
- "How to create a versioned transaction"
- "How to derive a PDA"
- "How to handle multiple signers"
- "How to send tokens with metadata"

Each recipe is short, copy-pasteable, and version-current. It's the "Stack Overflow but written by people who actually know" of Solana docs.

## The Skills track

The Skills section is a relatively newer addition — opinionated learning paths bundled around specific outcomes. Things like:

- "Build a Solana mobile app"
- "Build a Solana wallet"
- "Launch a token on Solana"
- "Build a Solana program"

Each Skill is a stitched-together path through docs, tutorials, and code samples. They sit at a useful level between "read the docs" and "do a bootcamp" — concrete, outcome-driven, ~2-4 hours of work each.

## How to actually use the platform

A few patterns that work:

**If you're new to crypto entirely:**
1. Start with the introductory docs to understand SOL, accounts, and transactions
2. Walk through Solana Bytes for short concept primers
3. Pick a Skill in an area you want to build
4. Use the Cookbook as you hit specific tasks

**If you're a developer coming from EVM:**
1. Read the RareSkills "Ethereum to Solana" course end-to-end
2. Skim the architecture docs to internalise the account model
3. Jump straight into a Blueshift Anchor challenge to feel the difference
4. Use the Cookbook for "how do I do X in Solana" questions

**If you're shipping for a hackathon:**
1. Solana Bootcamp's hackathon curriculum
2. Cookbook for any tactical "how do I…" question
3. Get Support → Discord / Solana Stack Exchange for unstuck moments

## What it isn't

A couple of useful disclaimers:

- **It isn't the only place to learn.** Blueshift, Turbin3, Superteam, RareSkills all run education programs the Foundation links to. The platform is curation, not exclusivity.
- **It isn't always the most current.** Solana moves fast; some docs lag the cutting edge by a release or two. Cross-reference with the GitHub source if you're working with brand-new features.
- **It isn't a developer relations service.** For real-time help, the Solana Stack Exchange and the Foundation Discord are the right channels.

## Resources

- **Developer hub:** [solana.com/developers](https://solana.com/developers)
- **Core docs:** [solana.com/docs](https://solana.com/docs)
- **Cookbook:** [solana.com/developers/cookbook](https://solana.com/developers/cookbook)
- **Bootcamp:** linked from the main developer page
- **Stack Exchange:** [solana.stackexchange.com](https://solana.stackexchange.com)
- **Discord:** linked from solana.com/developers under "Get Support"

If you're starting cold or onboarding new hires, this is the centralised entry point that respects your time. Use it as the spine, then branch into the community-maintained material (Blueshift, Turbin3, others on [devrels.xyz](https://devrels.xyz)) as you need depth in specific areas.
