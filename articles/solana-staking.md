---
title: "Solana staking, properly: native, liquid, and how the yield actually works"
slug: solana-staking
summary: Solana's proof-of-stake is straightforward once you separate the three layers — native staking, validator commissions, and liquid staking tokens like JitoSOL and mSOL. Here's how each layer earns, where the yield comes from, and which path fits your needs.
author_twitter: metasal
author_name: metasal
tags: [staking, validators, defi, jito, marinade]
cover_image:
published: true
---

Staking on Solana is structurally simpler than Ethereum. There are no slashing horror stories, no 32-SOL minimums, no months-long unbond queues. You delegate SOL to a validator. They earn inflation rewards. You receive your share automatically every epoch (~2 days).

But the actual mechanics — what you're choosing when you "stake," where the yield comes from, what JitoSOL vs mSOL actually are — that's where most users get fuzzy. Let's clear it up.

## What "staking" actually does

Solana uses proof-of-stake. Validators secure the network by running consensus; their voting weight is proportional to **stake delegated to them**, including their own SOL plus everything users have delegated.

When you stake:
1. You **create a stake account** holding your SOL (a separate account from your wallet)
2. You **delegate** that stake account to a validator
3. The next epoch starts, and your stake activates
4. From that epoch onward, you earn a share of the inflation rewards that validator receives

When you unstake, the reverse happens. Your stake deactivates over an epoch, then your SOL becomes withdrawable from the stake account.

Two important properties:

- **Your SOL never leaves your control.** The validator can't move it, spend it, or rug you. They earn voting rights from your stake, not custody of it.
- **There's no slashing for downtime.** A validator that's offline simply doesn't earn rewards that epoch. They aren't punished beyond opportunity cost. (Slashing for double-signing exists at the protocol spec level but isn't enforced in production today.)

## Where the yield actually comes from

Solana's annual yield is currently around **6–7% APR**. That number breaks down into three components:

- **Inflation issuance** — the protocol mints new SOL each epoch. A schedule reduces the rate over time. Most of this issuance goes to stakers (after validator commission).
- **MEV** — extra value validators extract from transaction ordering. Jito's MEV-aware client redistributes most of this back to stakers.
- **Priority fees** — the bidding pool for inclusion in the next block. A portion flows to validators and through them to delegators.

Your effective APR is:

```
(inflation + MEV + priority fee share) × (1 − validator commission)
```

Validator commission ranges 0–100%. Most reputable validators charge 5–10%. Some charge 0 to attract stake. Some charge 100% (essentially a private validator).

## Native staking, step by step

The CLI approach:

```sh
# Create a stake account holding 10 SOL
solana-keygen new --outfile ~/stake-account.json
solana create-stake-account ~/stake-account.json 10

# Delegate to a validator
solana delegate-stake ~/stake-account.json <VALIDATOR_VOTE_ACCOUNT>

# Check status
solana stake-account ~/stake-account.json
```

In Phantom / Solflare / Backpack, every wallet has a "Stake" tab that does the same flow with a UI. Pick a validator from a list, choose an amount, confirm. Same on-chain operations underneath.

## The catch: native staking locks your SOL

If you delegate 10 SOL natively, that 10 SOL is illiquid until you unstake (one epoch deactivation) and withdraw. For most users in volatile markets, that's an unacceptable tradeoff — you give up the ability to react to market moves.

This is the gap **liquid staking** fills.

## Liquid staking tokens (LSTs)

A liquid staking protocol stakes SOL on your behalf and gives you a tradable receipt token in return. The receipt represents your share of the underlying stake pool. As the pool earns rewards, the receipt's redemption value goes up.

The major Solana LSTs:

- **JitoSOL** ([Jito](https://jito.network)) — staked into Jito's MEV-aware validator set. Captures MEV on top of inflation. Currently the largest LST on Solana by TVL.
- **mSOL** ([Marinade](https://marinade.finance)) — the original liquid staking token on Solana. Spreads stake across a diversified validator set.
- **bSOL** ([SolBlaze](https://solblaze.org)) — focuses on contributing to Solana's decentralization by staking with smaller validators.
- **INF** ([Sanctum](https://www.sanctum.so)) — an LST that mixes multiple underlying LSTs into a single index.
- **JitoSOL is also natively used in DeFi** — borrow against it, supply it to AMMs, use it as collateral

Why use an LST instead of native staking:

- **Liquid** — sell, swap, lend, or LP at any time
- **Composable** — every DeFi protocol on Solana accepts LSTs as collateral
- **Yield-stacking** — earn staking APR + LP fees + lending APR on the same SOL
- **No epoch wait** — instant exit via swap, just at the current market exchange rate

The tradeoff: you're trusting the LST protocol's smart contracts and validator selection. There's smart-contract risk on top of validator risk.

## Yield math, concretely

If SOL is currently yielding 7% APR via staking:

- **Native staking with a 7% commission validator**: ~6.5% effective APR
- **JitoSOL**: ~7.5–8% (inflation + MEV redistribution, minus Jito's small fee)
- **mSOL**: ~6.5–7% (inflation only, Marinade's small fee)
- **JitoSOL deposited into Kamino as collateral, borrowing USDC to buy more JitoSOL**: ~12% if rates work out (leveraged LST loop)

The last one is risky — borrowing rates can flip and force liquidations. But it's an example of how LSTs unlock yield strategies that aren't possible with native staking.

## Validator selection matters

If you stake natively or pick a validator to delegate to via Solflare, your choice affects:

- **Yield** — commission rate directly affects net APR
- **Network decentralization** — staking with the top-10 validators concentrates voting power; staking with smaller validators decentralizes it
- **Reliability** — a validator that misses blocks earns less, which means you earn less

Resources for picking:

- [Stakewiz](https://stakewiz.com) — performance metrics and reliability stats per validator
- [Solana Beach](https://solanabeach.io) — explorer with validator data
- The Solana Foundation's validator-onboarding programs increasingly favor distribution; staking with smaller, well-operated validators is good for the network

## When to use which

**Stake natively when:**
- You want to support a specific validator (decentralization, ideology, friendship)
- You don't need liquidity for the next 30+ days
- You're okay with the slower exit path

**Use JitoSOL when:**
- You want maximum yield from a single SOL position
- You want the option to use it in DeFi
- MEV redistribution is a feature you value

**Use mSOL or bSOL when:**
- You want diversified validator exposure rather than Jito's set
- You're indifferent to MEV-vs-vanilla yield

**Use Sanctum's INF when:**
- You want a "set and forget" multi-LST exposure

## Resources

- **Solana docs (staking):** [solana.com/staking](https://solana.com/staking)
- **Jito:** [jito.network](https://jito.network)
- **Marinade:** [marinade.finance](https://marinade.finance)
- **Sanctum:** [sanctum.so](https://www.sanctum.so)
- **Solana Compass — staking guide:** [solanacompass.com](https://solanacompass.com)
- **Validator picker:** [Stakewiz](https://stakewiz.com)

Solana staking is one of the simpler PoS systems in crypto. The mistakes most users make are downstream: picking a 10% commission validator when 5% is available, leaving SOL in their wallet when LSTs would earn yield, or going leveraged on an LST loop without understanding liquidation mechanics. Skip those mistakes and the yield is genuinely worth the click.
