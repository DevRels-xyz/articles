---
title: "Switchboard: the everything oracle Solana DeFi actually runs on"
slug: switchboard-the-everything-oracle
summary: Pull-based, permissionless, TEE-secured price feeds with 2–5ms Surge latency. Switchboard is the data layer behind Kamino, Jito, Marginfi, and Drift — and the closest thing Solana has to a default oracle.
author_twitter: metasal
author_name: metasal
tags: [oracle, switchboard, defi, infrastructure, data]
cover_image:
published: true
---

If you've used a Solana DeFi protocol in the last year, the price you saw probably came from [Switchboard](https://switchboard.xyz). It powers Kamino, Jito, Marginfi, and Drift — the protocols that move the most volume on the chain. Hundreds of millions of requests per week. Billions of dollars of on-chain volume secured. "The Everything Oracle" isn't a slogan; it's the position they've taken.

## The pitch

Switchboard's architecture is built around four principles, in their own words:

- **Fastest oracle updates.** 400ms with standard oracles. **2–5ms** with Surge, their streaming product.
- **Low costs.** Pull feeds — created and used only when a transaction needs them — instead of constantly streaming push prices.
- **Permissionless and flexible.** Deploy a new data feed for any source, on-chain or off-chain, with the exact parameters you need. No waiting for a vendor to whitelist your asset.
- **Secure and private.** Oracle code and data live inside Trusted Execution Environments (TEEs). Node operators can't read, modify, or front-run your data.

The "everything" framing is literal — Switchboard runs on Solana/SVM, EVM, Sui, Aptos, Iota, and Movement, with one protocol and one API. It's not a Solana-only company that happens to support other chains; it's a cross-chain oracle that happens to be the dominant pick on Solana.

## How pull oracles change the cost curve

A push oracle constantly updates an on-chain price account whether anyone's reading it or not. That model wastes transactions and bloats validator state. It also creates a single price per asset, no matter what your protocol's risk model actually needs.

Pull oracles flip that. Your protocol asks for a price *at the moment it's needed*, bundled into the transaction that uses it. The price feed only spends gas when it has to. Three concrete effects:

- **Lower costs** — you stop paying for updates nobody reads.
- **Lower latency** — the price you act on is microseconds old, not seconds.
- **More accurate liquidations** — when a position needs to be closed at a precise level, a fresh pull beats a stale push.

This is why every major Solana DeFi protocol that touches lending or perps has migrated to Switchboard's pull model.

## Install

The TypeScript client for Switchboard On-Demand is on npm:

```sh
npm install @switchboard-xyz/on-demand
```

Latest version at the time of writing: **3.10.2**. There's a [Rust SDK](https://github.com/switchboard-xyz/solana-sdk) too, plus official examples at [`sb-on-demand-examples`](https://github.com/switchboard-xyz/sb-on-demand-examples).

## Surge: the 2–5ms tier

Surge is the part that matters if you're shipping anything compute-bound — high-frequency DEX, perps protocol, anything where the price you act on needs to be effectively real-time.

The latency claim is genuine: prices stream from Switchboard's TEE infrastructure into your application's transaction within 2–5 milliseconds of an external source update. That's faster than the underlying Solana block time, which means Surge is one of the few oracle products that has to coordinate with [MagicBlock](https://devrels.xyz/articles/magicblock-real-time-solana)-style real-time execution environments to be fully consumed.

For traditional pull use cases — lending markets, liquidation checks, vault rebalances — the 400ms standard tier is enough.

## TEEs as the trust model

Most oracles trust their node operators. Switchboard's model is that you shouldn't have to.

By running oracle code inside hardware-isolated TEEs (Intel TDX, AMD SEV), the operator literally cannot see the data being processed. They can't pause it, modify it, or run their own arbitrage on it before your protocol consumes it. The result is an oracle that's permissionless to deploy *and* trust-minimised in the same architecture.

This is the same TEE story that's showing up across the Solana infrastructure stack — see [MagicBlock's Private Ephemeral Rollup](https://devrels.xyz/articles/magicblock-real-time-solana), or Umbra's privacy primitives. TEEs are quietly becoming the default "verifiable execution" layer underneath multiple categories of Solana product.

## The tooling layer

Beyond the core oracle protocol, Switchboard ships a handful of tools that matter for builders:

- **Crossbar** — a hosted gateway that simplifies integration without running infrastructure yourself.
- **CLI** — local-first deploy, simulate, and manage your feeds.
- **SAIL + Switchboard Agent Skill** — AI agent integrations, so an LLM-driven workflow can request prices, build feeds, or trigger oracle updates programmatically.

The agent angle is small today, large tomorrow. As [x402](https://devrels.xyz/articles/x402-internet-native-payments) and agentic-payment stacks scale, agents will need first-class access to oracle data — and Switchboard is already there.

## Who uses it

The customer list is its own argument:

- **Kamino** — Solana's largest lending market
- **Jito** — MEV infrastructure and LSTs
- **Marginfi** — lending protocol
- **Drift** — perps DEX

These are the protocols at the top of TVL leaderboards. They picked Switchboard not because it was the only option, but because the latency and pull-model economics work at the scale they operate at.

## When to use it

**Use Switchboard when:**
- You're building anything that needs a price feed on Solana
- You're shipping a perps or HFT DEX where Surge latency moves the needle
- You're going multi-chain and want one oracle vendor across Solana, EVM, Sui, and the rest
- You want to deploy a *custom* feed (a custom asset, a custom aggregation strategy) without negotiating with a centralised provider

**It's overkill when:**
- You're building a static UI that just displays a price (use a public REST API)
- You're an experiment that doesn't yet need real liquidations
- Your protocol's pricing logic doesn't depend on freshness at all

## Resources

- **Site:** [switchboard.xyz](https://switchboard.xyz)
- **Docs:** [docs.switchboard.xyz](https://docs.switchboard.xyz)
- **GitHub:** [switchboard-xyz](https://github.com/switchboard-xyz)
- **npm (TypeScript):** [`@switchboard-xyz/on-demand`](https://www.npmjs.com/package/@switchboard-xyz/on-demand)
- **Examples:** [`sb-on-demand-examples`](https://github.com/switchboard-xyz/sb-on-demand-examples)

If you're shipping a Solana DeFi product and you haven't already wired up Switchboard, the question isn't whether to integrate — it's which feed shape (pull vs Surge) matches your latency budget.
