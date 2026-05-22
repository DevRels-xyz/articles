---
title: "Umbra: the financial privacy layer Solana didn't have"
slug: umbra-privacy-layer-for-solana
summary: Confidential transactions, encrypted balances, and stealth addresses on Solana — with auditing baked in. Umbra is the privacy primitive most of the new wave of Solana payment apps quietly build on top of.
author_twitter: metasal
author_name: metasal
tags: [privacy, umbra, solana, stealth, sdk]
cover_image:
published: true
---

Solana is fast, cheap, and *transparent* — which is exactly the problem if you're trying to pay an employee, manage a treasury, or send a remittance without broadcasting the amount to the entire internet. Mainnets are accidentally hostile to financial privacy.

[Umbra](https://umbraprivacy.com) is the answer that's started showing up underneath most of the new Solana payment apps you've heard of in the last six months: a financial privacy layer for Solana that ships confidential transfers, encrypted balances, and stealth addresses, with auditing built in.

## What Umbra is

The Umbra docs put it simply: "the financial privacy layer for Solana, providing the infrastructure for confidential, unlinkable, and auditable transactions."

In practice that's three primitives layered on each other:

- **Stealth addresses** — every payment goes to a fresh, unlinkable address derived from the recipient's view/spend keys. Outside observers can't tell which payments belong to the same recipient.
- **Encrypted balances** — token balances are encrypted on-chain. The amount you hold is private to you and anyone you grant a viewing key to.
- **Confidential transfers** — the *amount* of a transaction is hidden, even from indexers, while the chain can still verify the transfer is valid.

The product is **public mainnet live** today, with an iOS consumer wallet shipping via TestFlight ("Incognito Mode for your Money") and a TypeScript SDK builders use to add the same primitives to their own apps.

## The auditing piece is what makes it work

The hardest thing about privacy in finance isn't the cryptography — it's the regulatory gap. A purely-private system is unusable by any business that needs to comply with anything. A purely-public system is unusable by any user who values their financial life.

Umbra threads that needle with **viewing keys**. The owner of a stealth address can share a viewing key with a specific party — an auditor, a tax authority, a partner — granting that party visibility into the address's transaction history. The rest of the world sees nothing. The audited party sees exactly what they're authorised to see, and no more.

This is the design that makes Umbra fundable for treasury workflows, payroll, and remittances at scale — the use cases the docs lead with.

## The SDK

Umbra ships as `@umbra-privacy/sdk` on npm:

```sh
npm install @umbra-privacy/sdk
```

Latest at time of writing: **v4.0.0** — comprehensive TypeScript SDK covering address derivation, balance encryption, transfer construction, and viewing-key share/grant flows. The 434+ public GitHub references to `@umbra-privacy/sdk` are a useful sanity check that this isn't a paper protocol — there's an ecosystem actively building on it.

A representative sample of what's already shipped on top:

- **VeilPay** — privacy-native financial OS built on Solana + Umbra
- **PayHaven** — privacy-first USDC remittance for Nigeria
- **Umbra DAO Treasury** — private treasury management for DAOs (Arcium MPC + Umbra stealth addresses)
- **Hush** — confidential payroll, contractor payments, and viewing-key audits

Most of these came out of the recent Umbra Side Track at the latest hackathon round, which is itself a useful indicator — Umbra is incentivising builders to ship integrations, and the integrations are happening.

## What it composes with

The Solana privacy story isn't a single product — it's a stack. Umbra sits at a specific layer:

- **Underneath** Umbra: Arcium-style MPC (multi-party computation) and ZK proofs handle the cryptography. Umbra integrates these primitives so app developers don't have to.
- **Alongside** Umbra: TEE-based execution environments like [MagicBlock's Private Ephemeral Rollup](https://devrels.xyz/articles/magicblock-real-time-solana) handle private state at the execution layer.
- **On top of** Umbra: consumer wallets, payroll tools, remittance apps, and treasury managers consume the SDK to add privacy without having to engineer it themselves.

The result: an app developer can ship a private payment feature without becoming a cryptographer. That's the bar privacy needs to clear to actually reach mainstream Solana use.

## Why now

Three forces are converging:

1. **Stablecoins are exploding on Solana** — and the people moving stablecoins (payroll, remittances, B2B) genuinely cannot use transparent on-chain transfers for legal reasons.
2. **Regulatory clarity is finally arriving** — MiCA in Europe, evolving FinCEN guidance in the US, similar moves globally. Privacy primitives with built-in auditing are the only design that fits the new rules.
3. **The crypto-native consumer wallet narrative wants privacy** — Phantom and friends are competing on UX, but the next bar is "the chain can't see what I do".

Umbra is at the intersection of all three.

## When to reach for it

**Use Umbra when:**
- You're building any Solana payment app where the amount or counterparty should be private (payroll, B2B payments, remittances, donations)
- You're managing on-chain treasury and don't want competitors / journalists / scrapers profiling your moves
- You need privacy *with* compliance — auditors get visibility on a per-relationship basis

**Look elsewhere when:**
- Your product needs full *anonymity* from authorities, not just privacy from the public (Umbra is auditable by design — that's a feature, not a bug, but it's not what you want for adversarial-to-the-state use cases)
- Your users are crypto-native and prefer connecting an existing wallet — the iOS app is consumer-flavoured and won't be the right fit

## Resources

- **Main site:** [umbraprivacy.com](https://umbraprivacy.com)
- **Docs:** [docs.umbraprivacy.com](https://docs.umbraprivacy.com)
- **SDK:** [`@umbra-privacy/sdk` on npm](https://www.npmjs.com/package/@umbra-privacy/sdk)
- **iOS app (Testflight):** linked from the main site
- **Listed on devrels.xyz:** [Umbra org](https://devrels.xyz/organisations/umbra), [Umbra SDK resource](https://devrels.xyz/resources)

The next twelve months of Solana payment apps will look very different from the last twelve. Most of the difference is going to be privacy — and most of the privacy is going to be Umbra underneath.
