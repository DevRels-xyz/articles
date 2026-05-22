---
title: "SNS: the .sol identity layer Solana actually uses"
slug: sns-solana-name-service
summary: Solana Name Service turns 32-byte public keys into readable .sol names. It's the identity primitive Phantom, Backpack, and every Solana wallet already supports — and the on-ramp for Web3 reputation, profiles, and discovery.
author_twitter: metasal
author_name: metasal
tags: [identity, sns, naming, infrastructure, wallets]
cover_image:
published: true
---

Pasting `9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM` into a wallet and hoping it's the right person is the most user-hostile thing in crypto. [SNS](https://sns.id) is the layer that fixed it on Solana: 32-byte public keys become readable `.sol` names. Send to `metasal.sol` instead of the address; receive the same way.

If you've ever typed a `.sol` name into Phantom, Backpack, Solflare, or any major Solana wallet, you've used SNS — even if you didn't know.

## What it is

Solana Name Service is the canonical naming protocol for Solana addresses. The product surface is small and focused:

- **Register a `.sol` name** — claim a primary identity that maps to your wallet address
- **Subdomains** — `payments.metasal.sol`, `treasury.dao.sol`; multiple sub-identities under one root
- **Records** — attach metadata to a name: a Twitter handle, a Discord, an IPFS hash, an email, a profile picture
- **Reverse resolution** — look up "what `.sol` name does this address resolve to?" for display in UIs

The protocol is on-chain. Names are stored as accounts. Resolution is a deterministic PDA derivation. Wallets and apps integrate by calling the on-chain program — no centralised registry, no DNS dependency.

## Why it matters

Three concrete reasons SNS ended up as the default:

**1. Universal wallet support.** Phantom, Backpack, Solflare, and the long tail of Solana wallets all resolve `.sol` names natively in their send flows. Your name works everywhere without per-wallet integration.

**2. Identity beyond just an address.** Once you have a `.sol` name, you can attach records to it — your X handle, your GitHub, your IPFS-hosted profile, your email. Apps reading SNS records can pull a coherent identity from one lookup. This is the substrate every Solana social/identity product builds on.

**3. NFT-shaped ownership.** A `.sol` name is an NFT. You can transfer it, sell it on Magic Eden or Tensor, gift it, hold it in a multisig. Names trade as real assets, with the usual on-chain market dynamics.

## The integration surface

For developers, the SDK is straightforward:

```sh
npm install @bonfida/spl-name-service
```

The Bonfida-maintained [`@bonfida/spl-name-service`](https://github.com/Bonfida/sns-sdk) is the most-used TypeScript SDK. It covers:

- Resolve a `.sol` name → wallet address
- Reverse resolve an address → primary `.sol` name
- Read records (Twitter, GitHub, IPFS, etc.)
- Register / transfer / update names

If you're shipping a Solana app, the bare-minimum integration is "accept a `.sol` name anywhere you accept a wallet address". Two-line change in a typical send flow; massive UX improvement.

## What good integrations look like

A few patterns that show up across the better-designed Solana apps:

- **Send by name.** Your UI accepts `metasal.sol` and resolves it server-side or client-side before signing.
- **Reverse-resolve in feeds.** A transaction feed shows `0x9WzD…AWWM sent 50 SOL to metasal.sol` instead of two opaque blobs.
- **Profile enrichment.** Pull X/GitHub/IPFS records from a `.sol` name to render a profile card without asking the user to fill in another form.
- **Subdomain delegation.** A DAO assigns subdomains like `treasury.dao.sol`, `grants.dao.sol`, each pointing to a sub-multisig. Visible structure on-chain.

## The economics

SNS names use a hybrid pricing model:

- **Auction-based** for premium / short names — multiple bidders compete
- **Length-based fixed pricing** for normal names — shorter = more expensive
- **No annual renewal** — buy once, hold forever (different from ENS's annual fee model)

The "buy once, hold forever" choice is interesting; it makes names more durable as identity primitives but caps the protocol's recurring revenue. Trade-off the team made deliberately.

## SNS and devrels.xyz

Worth knowing — most Solana profiles you encounter have a `.sol` name attached. devrels.xyz members usually have one too, alongside their X handle. If you're a builder browsing the [directory](https://devrels.xyz/directory), the `.sol` is often the quickest way to reach someone's preferred contact list.

## When to integrate it

**Reach for SNS when:**
- You're building any Solana app where users send to or receive from other users
- You have user profiles and want them to be portable, on-chain, and not locked to your DB
- You want to support `.sol` payment links, donation pages, or "send to creator" flows
- You're building a Solana social product — SNS is the identity layer to anchor to

**It doesn't help when:**
- Your product is purely programmatic — no humans address-typing
- You're building agent-to-agent flows where names don't add value (see [x402](https://devrels.xyz/articles/x402-internet-native-payments))

## Resources

- **Site:** [sns.id](https://sns.id)
- **Docs:** [sns.guide](https://sns.guide) (the protocol's developer docs)
- **SDK (TypeScript):** [`@bonfida/spl-name-service`](https://github.com/Bonfida/sns-sdk)
- **Marketplace:** SNS names trade on [Magic Eden](https://magiceden.io) and [Tensor](https://www.tensor.trade)
- **Solana wallet support:** Phantom, Backpack, Solflare, Glow, Slope, others — all resolve `.sol` natively

A 32-byte public key isn't an identity. `metasal.sol` is. SNS made that the default on Solana, and every meaningful Solana app already integrates it. If yours doesn't, that's the smallest UX win you can ship.
