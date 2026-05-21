---
title: "@solana/kit: the modern JavaScript SDK for Solana"
slug: solana-kit-modern-web3-javascript
summary: A practical look at @solana/kit — Anza's successor to @solana/web3.js v1 — what changed, why it's smaller and faster, and where to find migration snippets when you get stuck.
author_twitter: metasal
author_name: metasal
tags: [javascript, typescript, sdk, web3, migration]
cover_image:
published: true
---

If you've been writing Solana clients in JavaScript for the last three years, you know `@solana/web3.js` v1: the class-heavy, all-in-one bundle that ships even when you only need to read a balance. That era is over. The official successor is [`@solana/kit`](https://github.com/anza-xyz/kit) — same vendor (Anza), totally different philosophy.

If you're starting something new in TypeScript on Solana in 2026, this is the SDK to start from.

## What changed

`@solana/kit` is not v1 with a fresh coat of paint. It's a ground-up redesign with three different bets:

1. **Treeshakeable, function-first.** Almost everything is an exported function rather than a method on a god-object. Your bundle pulls only the bytes for the operations you actually call. The minimal "send a transaction" footprint is dramatically smaller than v1's.
2. **Web-native primitives.** Crypto via the Web Crypto API (`SubtleCrypto`) instead of bundled Node polyfills. Keys are native `CryptoKey` objects. Edge-runtime, Workers, and modern browsers stop being second-class environments.
3. **Strongly typed.** Branded types throughout. An `Address` is not just a string. A `Signature` is not just a base58 blob. The compiler catches whole categories of bug that v1 left to runtime.

The repo lives at [`anza-xyz/kit`](https://github.com/anza-xyz/kit) and the package is now on version `6.9.0` at the time of writing — well past initial-release jitters.

## Install

```sh
npm install @solana/kit
```

That's it. Where v1 forced you to remember which sub-imports lived under `@solana/web3.js`, in `@solana/kit` you import functions directly:

```ts
import {
  createSolanaRpc,
  generateKeyPairSigner,
  lamports,
  pipe,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  signAndSendTransactionMessageWithSigners,
} from "@solana/kit"
```

If that import list feels long, your bundler will thank you — every name there is independently dropped if you don't use it.

## A minimal transaction

A SOL transfer in the new style:

```ts
import { createSolanaRpc, generateKeyPairSigner } from "@solana/kit"
import { getTransferSolInstruction } from "@solana-program/system"

const rpc = createSolanaRpc("https://api.devnet.solana.com")

const sender = await generateKeyPairSigner()
const recipient = await generateKeyPairSigner()

// Airdrop, then send 0.001 SOL
await rpc.requestAirdrop(sender.address, 10_000_000n).send()

const ix = getTransferSolInstruction({
  source: sender,
  destination: recipient.address,
  amount: 1_000_000n,
})

// Build, sign, send (functional pipeline elided for brevity — see docs)
```

The shape is consistent across the SDK: factories like `createSolanaRpc`, plain async functions, BigInt for lamports, branded types for addresses. Once you internalise it, v1's class hierarchy starts to feel quaint.

## Why the migration is worth it

A few concrete wins beyond "the bundle is smaller":

- **Edge-runtime support is real.** v1's reliance on Node-flavoured crypto made it painful to use on Cloudflare Workers, Vercel Edge, or Deno without polyfills. Kit just works.
- **No more `Buffer` everywhere.** Kit uses `Uint8Array` natively. Your code stops carrying a Node-isms tax in the browser.
- **Tooling is cleaner.** The official `@solana-program/*` packages (the codegen IDL clients) target Kit directly. Anchor's modern codegen is moving the same direction.

## Where to find migration snippets

The v1 → Kit jump is conceptually clean but practically a lot of small lookups: "what's the new way to get an associated token account address," "where did `Keypair.fromSecretKey` go," "how do I get the latest blockhash now." Most of those have a one-line answer in the new API — you just need to find it.

I've been collecting these snippets at **[kit.metasal.xyz](https://kit.metasal.xyz)**. It's a quick-reference for the v1 → Kit migration with the patterns I keep reaching for: keypair generation, address derivation, transaction assembly, account fetching, signature parsing. It's modelled loosely on Yihau Chen's old Solana Cookbook, which was great but stopped getting updates around v1. Kit's API is too new for the cookbook to cover, so this fills the gap for now.

It pairs well with the official docs at [solanakit.com](https://www.solanakit.com) — Anza's site is the canonical reference; mine is the "I know what I want, just give me the snippet" version.

## When NOT to migrate

If you have a production application on `@solana/web3.js` v1 today, you don't have to rewrite tomorrow. v1 still works. The reasons to stay:

- You have a heavy investment in client code that wraps v1's classes
- You depend on third-party libraries that haven't released Kit-compatible versions
- Your stack is already happy on Node-only with bundled polyfills

The reasons to migrate:

- You're starting a new project (just use Kit)
- You're shipping to the edge or Cloudflare Workers (Kit is much friendlier)
- Your bundle size is hurting page-load metrics (Kit is much smaller)
- You're standardising on the same SDK your `@solana-program/*` clients want anyway

## Resources

- **Official docs:** [solanakit.com](https://www.solanakit.com)
- **Repo:** [github.com/anza-xyz/kit](https://github.com/anza-xyz/kit)
- **Snippet finder for v1 → Kit:** [kit.metasal.xyz](https://kit.metasal.xyz)
- **Codegen IDL clients that target Kit:** the [`@solana-program/*`](https://www.npmjs.com/org/solana-program) npm org

Kit is the future of Solana's JavaScript SDK story. The earlier you start writing it, the less code you'll be migrating later.
