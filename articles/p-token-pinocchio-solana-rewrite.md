---
title: "p-token: the Solana rewrite that made every token transfer 98% cheaper"
slug: p-token-pinocchio-solana-rewrite
summary: SPL Token is the most-used program on Solana. p-token is a Pinocchio-based drop-in replacement that takes a transfer from 4,645 compute units to 76 — a ~98% reduction — with zero migration required from app developers or users.
author_twitter: metasal
author_name: metasal
tags: [p-token, pinocchio, performance, anza, spl]
cover_image:
published: true
---

The SPL Token program is the most-used program on Solana. Every wallet balance, every swap, every mint, every NFT transfer goes through it. Make it cheaper and you make the whole chain cheaper — not just at the margin, but for every user, every transaction, every day.

That's what **p-token** does. It's a drop-in reimplementation of the SPL Token program, written in [Pinocchio](https://devrels.xyz/articles/rust-anchor-quasar-solana-program-stack), with a single eye-popping result: a token transfer went from **4,645 compute units down to 76**. That's not an optimisation — that's a rewrite of the price floor of Solana itself.

## The numbers

The benchmark numbers from the Anza team and independent reproductions:

| Instruction | SPL Token (old) | p-token (new) | Reduction |
|---|---:|---:|---:|
| Transfer | 4,645 CU | 76 CU | **~98%** |
| Various other instructions | ~ | ~ | up to ~98% |

Roughly 70% of those savings come from just two architectural changes:

1. **Replacing the traditional `solana-program` entrypoint** with Pinocchio's no-std, no-alloc entrypoint. The boilerplate Solana programs inherit from the standard SDK turns out to consume serious CU.
2. **Zero-copy reads.** Instead of deserializing accounts into structs, p-token pointer-casts directly from the raw input buffer. No allocation, no copying, no overhead per account read.

The remaining ~30% comes from a litany of smaller wins — better signer checking, leaner error handling, eliminated allocations across the hot paths.

This is what an architectural rewrite looks like when the rewrite is done by someone who's optimised every byte twice.

## Who built it

[Fernando Otero — "Febo"](https://x.com/_febo_) at Anza. He's also the engineer behind **Pinocchio**, the no-std, no-alloc Solana program framework that p-token is built on. The story is consistent end-to-end: Pinocchio started as a way to reduce dependency conflicts in Solana programs; it turned out to also be the path to dramatically cheaper compute.

p-token is the first major real-world test of that architectural bet. The result validates it.

## What changes for app developers

The deliberate answer is: **almost nothing**.

p-token is a *byte-for-byte* compatible replacement for SPL Token:

- **Same program ID.** No new address to integrate against.
- **Same instruction layout.** Your `TransferChecked`, `MintTo`, `Approve`, etc. transactions work unchanged.
- **Same account layout.** Existing token accounts continue to be read and written identically.
- **Same SDK behaviour.** `@solana/spl-token`, the Rust client crates, Anchor's `Token` constraints, Pinocchio's own token helpers — all of them keep working.

The upgrade is one program-binary swap at the protocol level. Every wallet, every DEX, every protocol gets the savings for free.

That's the same shape as a chain hard fork: nobody has to do anything, but everyone's transactions get cheaper the day it ships.

## How it lands: SIMD-0266

p-token's path to mainnet is via [SIMD-0266: Efficient Token program](https://github.com/solana-foundation/solana-improvement-documents/pull/266). SIMDs (Solana Improvement Documents) are the formal mechanism for proposing protocol-level changes. SIMD-0266 specifies how the SPL Token program's executable should be replaced with the p-token binary.

Once SIMD-0266 is accepted and the upgrade is deployed via validator coordination, the entire network sees the new compute economics atomically.

## Why this matters beyond the numbers

A few second-order effects worth thinking about:

**Cheaper DeFi.** Every Jupiter swap, every Drift trade, every Kamino loan touches the token program. CU reductions there compound into materially cheaper composed transactions.

**More headroom for programs.** The 1.4M CU per transaction ceiling stops being a binding constraint for token-heavy flows. Programs that today have to split logic across multiple transactions can fit it all into one.

**Mobile-friendly transactions.** Lower compute = lower priority fees for the same confirmation behaviour = better UX on mobile/Solana Mobile Stack apps where every transaction needs to feel free.

**Validator load.** Token transactions are the most common workload on Solana. Reducing their compute load reduces validator CPU, which raises the practical ceiling on TPS and reduces operating costs.

It's the most direct example I've seen of an architectural change that benefits literally every Solana user, regardless of whether they know it happened.

## The Pinocchio connection

p-token isn't an isolated win — it's the proof point for Pinocchio as a framework. If you read the [Rust / Anchor / Quasar article](https://devrels.xyz/articles/rust-anchor-quasar-solana-program-stack), this is the validation of the thesis: no-std, no-alloc, pointer-cast Solana programs aren't a theoretical optimisation — they cut a 98% slice off the chain's most-used program.

The pattern is also a template. Other heavily-used Solana programs (Token-2022, the Memo program, system program adjacents) are candidates for the same treatment. Expect more of these rewrites in the next 12 months.

## Resources

- **Site:** [pinocchio-token.xyz](https://www.pinocchio-token.xyz/) — the dedicated p-token landing page
- **Original PoC repo:** [febo/p-token](https://github.com/febo/p-token)
- **Upstream (in solana-program/token):** [solana-program/token/pinocchio](https://github.com/solana-program/token/tree/main/pinocchio/program)
- **SIMD-0266 (the protocol proposal):** [PR #266 on solana-improvement-documents](https://github.com/solana-foundation/solana-improvement-documents/pull/266)
- **Helius deep-dive:** [P-Token: Solana's Next Big Efficiency Unlock](https://www.helius.dev/blog/solana-p-token)
- **Pinocchio framework:** [github.com/anza-xyz/pinocchio](https://github.com/anza-xyz/pinocchio)

If you've ever looked at a Solana transaction breakdown and noticed how much CU the token program eats, you've seen the problem p-token solves. The fix is a rewrite, not a tuning pass. And once it ships to mainnet, every transaction on Solana gets cheaper from the same upgrade.

That's the rare engineering win that benefits literally everyone at once.
