---
title: "MagicBlock: real-time backend for Solana, 1ms blocks and all"
slug: magicblock-real-time-solana
summary: MagicBlock layers Ephemeral Rollups over Solana to deliver 1ms block times, sub-50ms end-to-end latency, and zero-fee transactions — without forking your program. Here's how it works and what it unlocks.
author_twitter: metasal
author_name: metasal
tags: [magicblock, rollups, performance, gaming, infrastructure]
cover_image:
published: true
---

Solana is already the fastest L1 most people use. But "fast for an L1" still isn't fast enough for high-frequency trading, real-time multiplayer games, or any UX where a 400ms slot feels like a click that didn't register. That gap is where [MagicBlock](https://magicblock.gg) lives.

It's not a sidechain. It's not a separate chain. It's an execution environment your existing Solana program *opts into*, on a per-account basis, with one macro and one delegate call.

## The pitch

MagicBlock positions itself as "the real-time engine for Solana apps" — the backend for what they call "the new financial internet". Three numbers carry the value prop:

- **1ms block time** on the MagicBlock execution layer
- **<50ms end-to-end** thanks to globally co-located validators
- **Zero fees** during execution — transactions inside the ER cost nothing

If you've ever fought Solana's confirmation latency for a real-time use case, those numbers are a different category of product.

## How it works: Ephemeral Rollups

The core primitive is the **Ephemeral Rollup (ER)** — a short-lived execution environment that runs the same Solana program code, on the same accounts, with the same SVM semantics, just dramatically faster.

The flow:

1. You write a normal Solana program with one extra macro: `#[ephemeral]`.
2. When a user wants to do high-frequency work (place a trade, move a chess piece, fire a weapon), your program **delegates** the relevant account to MagicBlock's ER.
3. While delegated, all writes to that account happen inside the ER — at 1ms block times, with zero fees.
4. When the session ends (or when the account is undelegated), state is committed back to Solana mainnet.

```rust
#[ephemeral]
#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count += 1;
        Ok(())
    }

    /// Delegate the counter account to the ER
    pub fn delegate(ctx: Context<DelegateInput>) -> Result<()> {
        ctx.accounts.delegate_pda(
            &ctx.accounts.payer,
            &[TEST_PDA_SEED],
            DelegateConfig::default(),
        )?;
        Ok(())
    }
}
```

You don't fork your codebase. You don't write to a separate VM. The accounts that need to be fast become fast; the rest of your program stays unchanged.

## The product line

ERs are the foundation. On top of them, MagicBlock has shipped a small product surface:

- **Ephemeral Rollup (ER)** — real-time, zero-fee transactions secured by Solana.
- **Private Ephemeral Rollup (PER)** — same primitive with privacy on top, using Intel TDX TEEs to keep state confidential while still committing publicly. Aimed at compliance-sensitive use cases.
- **Private Payment API** — drop-in private on-chain transfers, compliant by default.
- **Solana VRF** — verifiable randomness for games, raffles, lotteries, and any real-time app that needs trustworthy randomness without waiting for a slot.
- **Pricing Oracle** — low-latency on-chain price feeds for trading and DeFi.

Public validators run in Asia (`as.magicblock.app`), EU (`eu.magicblock.app`), US (`us.magicblock.app`), and a dedicated TEE validator (`mainnet-tee.magicblock.app`) for the private rollup variant. Devnet versions of each exist for development.

## What this unlocks

The thing MagicBlock makes shippable is the category of Solana app that simply wasn't possible at 400ms slots:

- **High-frequency DEXes.** Order book matching at sub-50ms latency, with settlement back to mainnet. The performance ceiling stops being the chain.
- **Real-time multiplayer games.** MMORPGs, fighting games, racing — anything where input → response latency is a gameplay variable.
- **On-chain AI gaming.** Game state moves fast enough that AI opponents can react inside the same loop the player perceives.
- **DePIN with tight feedback loops.** Sensors, devices, and oracles that need to report and reconcile state at human-perception speeds.
- **Private payments at consumer UX.** TEE-backed PER means an app can offer private transfers without becoming non-compliant in its jurisdiction.

The pattern across all of these: Solana is the source of truth and the security model; MagicBlock is the execution layer for the parts of the application that need to feel real.

## Trade-offs to know

A few things to keep in mind:

- **Delegated accounts can't be written to from regular Solana transactions while in the ER.** Your program logic needs to handle the in-ER / on-mainnet duality cleanly. The macros help.
- **The ER is a separate validator set.** You're trusting MagicBlock's operator setup for the duration of a delegation, though final settlement back to Solana mainnet remains the security guarantee.
- **It's an active product surface.** New primitives (PER, the Private Payment API) are recent. The interfaces are evolving — keep an eye on the changelog if you ship against the bleeding edge.

These aren't dealbreakers — they're the normal "this is a real-time execution layer with its own model" considerations.

## Related project to watch

Worth following alongside MagicBlock: **[@proofnetwork on X](https://x.com/proofnetwork)** — a related stealth-stage effort in the verifiable execution space. Limited public info today; the X feed is the place to track when more lands.

## Getting started

The fastest path:

1. Read the [Ephemeral Rollup docs](https://docs.magicblock.gg) to internalise the delegation model.
2. Clone one of the templates from the docs and run it against a devnet ER validator.
3. Add `#[ephemeral]` to your existing program and pick one account to delegate as a proof of concept.
4. Once it works on devnet, point at a mainnet ER region close to your users (Asia / EU / US).

## Resources

- **Site:** [magicblock.gg](https://magicblock.gg)
- **Docs:** [docs.magicblock.gg](https://docs.magicblock.gg)
- **Magic Incubator (accelerator program):** linked from the main site
- **Proof Network (related):** [@proofnetwork](https://x.com/proofnetwork) on X
- **Ecosystem:** browse from the main MagicBlock site to see who's already shipping on top

If you've ever shaved a feature out of a Solana app spec because the latency wouldn't work, MagicBlock is the answer to "put it back in".
