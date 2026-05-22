---
title: "Squads Multisig: the default treasury layer for Solana"
slug: squads-multisig
summary: Squads turned Solana multisigs from a CLI exercise into a SaaS-grade product. It's where most major Solana DAOs, protocols, and treasuries actually hold their funds — and the broader Squads Labs stack is going much further.
author_twitter: metasal
author_name: metasal
tags: [multisig, treasury, security, squads, sdk]
cover_image:
published: true
---

If you're running anything multi-signer on Solana — a DAO treasury, a protocol upgrade authority, a startup's stablecoin balance — you're probably already using [Squads Multisig](https://squads.so). And if you're not, you should be.

Squads is the multisig platform most Solana teams default to. It's not the only one, but it's the one that turned multisig management from "wire up the CLI carefully and pray" into a product experience that feels like a fintech SaaS — without giving up any of the on-chain custody guarantees.

## What it is

In their own words from the docs: "Squads Multisig is a multisig platform to secure and manage Solana assets. With Squads, teams can deploy a multisig in a few clicks, configure it to satisfy their security and organizational requirements, and then use it to manage a wide range of onchain assets."

That covers more ground than it sounds like:

- **Treasuries** — hold SOL, USDC, SPL tokens with M-of-N signing rules
- **Program upgrade authorities** — the upgrade key of your deployed program, owned by a squad instead of a single keypair
- **Admin keys** — admin authorities on protocols, vaults, governance
- **Tokens** — mint authorities and freeze authorities
- **Validators** — vote authority and withdraw authority

Each of those used to require deep CLI fluency or hand-rolled tooling. Squads collapses them into the same interface.

## Why it's the default

Three structural reasons Squads ended up as the de facto pick:

1. **User experience that doesn't punish non-engineers.** Most multisig tools (Solana and otherwise) feel like they were built by engineers, for engineers. Squads is built like a SaaS — the legal lead at a protocol can co-sign a transaction without learning Solana CLI flags.

2. **Programmatic enforcement.** Squads is built on top of the Squads Protocol, an open-source Solana program. The rules of your multisig — signer set, thresholds, transaction lifecycles — are enforced on-chain by code, not by a hosted backend. The web app is convenience; the protocol is the source of truth.

3. **Network effects.** Most Solana teams hold their treasuries on Squads. That means integrations, partners, and tooling assume Squads compatibility. Stake providers, accounting tools, payment platforms — they all wire into Squads first.

## The developer surface

For developers building Solana-specific workflows on top of multisigs, Squads ships the [`@sqds/multisig`](https://www.npmjs.com/package/@sqds/multisig) TypeScript SDK (v2.1.4 at time of writing), targeting Squads Multisig Program v4. The SDK covers:

- Multisig creation and configuration
- Proposal lifecycle (create → vote → execute)
- Vault and asset management
- Member updates and threshold changes

You can build entire workflows around it — programmable treasuries, scheduled transactions, auto-rebalancing across squads — without leaving the type system.

## The bigger Squads Labs picture

Squads Multisig is one product. Squads Labs — the company behind it — has built out a stack much wider than that, all positioned around "finance without legacy constraints":

- **Altitude** — a global business account to save, earn, and move money. Squads's bet on the business-banking layer.
- **Fuse** — a consumer-facing personal finance app for stablecoins and tokenized assets.
- **Grid** — the stablecoin API for accounts, payments, cards, and yield. The B2B developer surface.
- **Multisig** — the original product, still the entry point most users meet first.

Read in order, the strategy is clear: own the on-chain custody layer first (Multisig), then build the rails on top — for businesses (Altitude, Grid) and consumers (Fuse). The multisig isn't a side project; it's the foundation of an entire stablecoin-economy product line.

## Practical setup

Getting from zero to a working squad is genuinely 10 minutes:

1. Go to [app.squads.so](https://app.squads.so) and connect a wallet.
2. Create a new squad. Pick signers and threshold (e.g. 3-of-5).
3. Add members by wallet address; they connect and accept.
4. Fund the squad's vault address.
5. From here, every outbound transaction requires the threshold of signers to approve.

The UI handles the transaction-construction nuance you'd otherwise have to script: PDA derivation, ephemeral signing accounts, instruction wrapping. Members see a clean "approve / reject" interface and don't have to know the protocol mechanics.

## Things to know before using it

- **You're trusting the Squads Protocol, not Squads Labs.** The protocol is open-source and audited; the company can disappear and your squad keeps working. That's the right trust model.
- **Off-ramping requires planning.** Sending funds from a squad to a centralized exchange usually means generating an address tagged to the squad and tracking it. The docs cover this — read them before you send your first large transfer.
- **Mobile experience is partial.** Most multisig flows still need a desktop browser; mobile signing is improving but not full feature-parity yet.

## When to use it

**Use Squads when:**
- You're a team, DAO, or protocol holding *any* meaningful capital on Solana
- You're holding a program upgrade authority that shouldn't be a single keypair
- You're moving from a CEX or fiat treasury onto on-chain rails and want the auditing/approval flows people expect from fintech
- You want a multisig vendor whose ecosystem support is universal in the Solana developer stack

**Look elsewhere when:**
- You're a solo operator holding small balances — a single hardware wallet is simpler
- Your use case is *transient* — Squads is for ongoing treasury management, not one-off coordinated transactions

## Resources

- **Site:** [squads.so](https://squads.so)
- **App:** [app.squads.so](https://app.squads.so)
- **Docs:** [docs.squads.so](https://docs.squads.so)
- **SDK (TypeScript):** [`@sqds/multisig`](https://www.npmjs.com/package/@sqds/multisig)
- **GitHub:** linked from the main site (protocol code, SDK source, examples)
- **Adjacent products:** Altitude, Fuse, Grid (all from squads.so)

If your team holds Solana assets and the answer to "who controls the keys?" is anything other than "a multisig", that's the gap to close. Squads is where most of the ecosystem closed it.
