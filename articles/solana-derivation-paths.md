---
title: "Solana derivation paths: why your seed phrase shows different balances in different wallets"
slug: solana-derivation-paths
summary: Same 12 or 24 words. Different addresses. Funds appear missing. This is the #1 cause of "where did my SOL go" tickets — and it's not a bug. Here's how Solana derivation paths actually work, why wallets disagree, and how to recover.
author_twitter: metasal
author_name: metasal
tags: [wallets, security, derivation, bip44, recovery]
cover_image:
published: true
---

You write down your 12-word seed phrase from Phantom. Six months later you import it into Solflare. The balance is wrong. You import the same seed into a Ledger. Different wallet again. Different balance. Your SOL hasn't moved — but it isn't where you can see it.

This isn't a bug. It's how hierarchical deterministic (HD) wallets work. The same seed phrase can derive *millions* of valid wallet addresses; which one you actually use depends on the **derivation path**. Different wallet apps default to different paths.

If you've ever lost an hour to "but the seed phrase is correct, why doesn't the balance match", this article is the explanation.

## What a derivation path actually is

The relevant standards stack:

- **BIP39** — turns a 12/24-word mnemonic into a 64-byte seed
- **BIP32** — derives a tree of child keys from that seed
- **BIP44** — defines a standard path structure: `m / purpose' / coin_type' / account' / change / address_index`
- **SLIP-44** — registers a coin type number per blockchain. **Solana = 501.**
- **SLIP-10** — extends BIP32 derivation to non-secp256k1 curves like ed25519 (which Solana uses)

A Solana derivation path looks like:

```
m / 44' / 501' / 0' / 0'
^   ^    ^     ^    ^
|   |    |     |    |
|   |    |     |    └─ change / address index (some wallets stop here)
|   |    |     └────── account index
|   |    └──────────── coin type (501 = Solana, hardened)
|   └───────────────── purpose (44 = BIP44, hardened)
└───────────────────── master key from seed
```

The `'` (apostrophe) means "hardened" derivation — a slightly different cryptographic operation that breaks the parent-key-to-child-public-key path. On ed25519 (Solana's signature curve) **all derivation steps must be hardened**. This is a hard rule from SLIP-10.

## The five paths you'll actually see on Solana

This is where the chaos starts. Here are the real defaults across the major wallets:

| Wallet | Default derivation path |
|---|---|
| **Phantom** | `m/44'/501'/0'/0'` |
| **Solflare** | `m/44'/501'/0'/0'` |
| **Backpack** | `m/44'/501'/0'/0'` |
| **Ledger (Solana app)** | `m/44'/501'/0'` ← note the missing trailing index |
| **`solana-keygen` (default)** | `m/44'/501'/0'/0'` |
| **`solana-keygen` (legacy / no derivation flag)** | raw seed (no BIP44 at all) |

Same seed phrase. Five plausible "first wallet" addresses. The Ledger one is the most common cause of confusion — it's structurally one level shorter than what every software wallet uses.

If you generate a wallet on Ledger and then import the seed into Phantom, **Phantom will not show your Ledger balance by default**. You'd have to add a path-specific account: Phantom → Settings → Manage Accounts → Add → "Recover from seed phrase" → choose alternate derivation paths.

## Why this happens

Each wallet's default was set by whoever wrote it, often years before the others existed. There was no Solana-wide standard saying "the canonical first address is at *this exact path*." By the time the ecosystem noticed, every wallet had a userbase and migrating defaults would break those users.

The closest the ecosystem has to a consensus is `m/44'/501'/0'/0'` — but Ledger predates that consensus and uses `m/44'/501'/0'` instead. Importing across the two halves of the ecosystem is where the confusion happens.

## How to derive a Solana address in code

The reliable libraries:

**TypeScript / JavaScript (using `@solana/web3.js` + `ed25519-hd-key`):**

```ts
import { Keypair } from "@solana/web3.js"
import { derivePath } from "ed25519-hd-key"
import * as bip39 from "bip39"

const mnemonic = "your twelve words ..."
const seed = await bip39.mnemonicToSeed(mnemonic) // 64 bytes

// Phantom / Solflare / Backpack default path
const path = "m/44'/501'/0'/0'"
const derived = derivePath(path, seed.toString("hex")).key

const keypair = Keypair.fromSeed(derived)
console.log(keypair.publicKey.toBase58())
```

**Rust (`solana-keygen`):**

```sh
# Default BIP44 path m/44'/501'/0'/0'
solana-keygen recover --derivation-path "m/44'/501'/0'/0'"

# Ledger-style path
solana-keygen recover --derivation-path "m/44'/501'/0'"

# Raw seed (no derivation) — legacy / matches solana-keygen new without a path
solana-keygen recover --no-derivation
```

**Notes that matter:**

- `Keypair.fromSeed` in web3.js takes a *32-byte* seed. You must derive it via SLIP-10 first — handing the raw mnemonic bytes will produce a different keypair than every wallet.
- `Keypair.fromSecretKey` takes the 64-byte expanded secret — that's the export format used when copying a "private key" out of Phantom.
- The new [`@solana/kit`](https://devrels.xyz/articles/solana-kit-modern-web3-javascript) SDK uses native `CryptoKey` objects via Web Crypto; the derivation path concept is unchanged but the API surface differs.

## How to recover funds at an alternate path

If you suspect funds are at a path you can't see:

1. **In Phantom**: Settings → Manage Accounts → Add / Connect Wallet → "Import private key" or "Add additional account" — Phantom 24+ shows path options when importing.
2. **In Solflare**: Settings → Wallets → + Add Wallet → Recover from seed → "Custom derivation path" → try `m/44'/501'/0'` (the Ledger default).
3. **In Backpack**: Account → Add wallet → Recover from seed → it scans common paths by default; if it misses, manually specify.
4. **From CLI**: derive each candidate path with `solana-keygen recover`, then `solana balance <pubkey>` against each. Five paths take 60 seconds to check.

If you find the address but can't get the key into your preferred wallet, you can always:

```sh
# Export the keypair file at the recovered path
solana-keygen recover --derivation-path "m/44'/501'/0'" --outfile ~/recovery.json

# Send funds from it to a new address in your preferred wallet
solana transfer <new-address> ALL --keypair ~/recovery.json
```

## Best practices going forward

- **Stick to one wallet ecosystem per seed.** Don't import the same seed into Phantom + Ledger + Solflare and expect them to align. Pick one canonical path family.
- **Document the derivation path when you export.** If you ever write down a seed phrase on paper, write the derivation path next to it. "Future you" will thank "present you" in three years.
- **For multi-account use, increment the account index, not the address index.** `m/44'/501'/0'/0'`, `m/44'/501'/1'/0'`, `m/44'/501'/2'/0'` — that's the canonical way to derive multiple wallets from the same seed. Same path shape; different `account` segment.
- **Treat Ledger and software wallets as separate hierarchies.** If your Ledger holds funds at `m/44'/501'/0'`, don't generate "additional accounts" in software at the four-segment path expecting them to match.

## When paths actually matter for you as a developer

If you're building anything that takes a user's seed phrase or interacts with their wallet:

- **Don't ever ask for the seed phrase.** This is the cardinal rule. Use Wallet Adapter / [Reown](https://devrels.xyz/articles/privy-dynamic-magic-crossmint-comparison) / [Privy](https://devrels.xyz/articles/privy-whitelabel-wallet-infrastructure) instead.
- **If you absolutely must derive deterministically server-side** (e.g. an embedded-wallet provider), document your path choice loudly and never change it after launch.
- **If you ship a recovery flow**, scan at least the three common paths (`m/44'/501'/0'/0'`, `m/44'/501'/0'`, raw seed) and surface balances at each.

## Resources

- **SLIP-44 coin types list (Solana = 501):** [github.com/satoshilabs/slips/blob/master/slip-0044.md](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
- **SLIP-10 (ed25519 derivation spec):** [github.com/satoshilabs/slips/blob/master/slip-0010.md](https://github.com/satoshilabs/slips/blob/master/slip-0010.md)
- **`ed25519-hd-key` npm package:** [npmjs.com/package/ed25519-hd-key](https://www.npmjs.com/package/ed25519-hd-key)
- **`solana-keygen recover`:** part of the Solana CLI suite

If you've ever sat in front of a wallet thinking "I know the seed is right, where is my money" — the answer is almost always "at a different derivation path." Now you know how to find it.
