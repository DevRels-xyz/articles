---
title: "SPL Token vs Token-2022: which one should you actually use?"
slug: spl-token-vs-token-2022
summary: Classic SPL Token is what every Solana app today already handles. Token-2022 adds transfer hooks, confidential transfers, interest-bearing balances, metadata extensions, and more. The compatibility story is real but messier than the marketing.
author_twitter: metasal
author_name: metasal
tags: [tokens, spl, token-2022, fundamentals, extensions]
cover_image:
published: true
---

Every Solana token you've ever held — USDC, BONK, your favorite memecoin, the LP tokens you got from staking — was born from one of two programs. The original is **SPL Token** (Program ID `TokenkegQ...`). The newer is **Token-2022** (Program ID `TokenzQd...`), often called "Token Extensions."

The marketing pitch is that Token-2022 is a drop-in upgrade that adds powerful new features. The reality is more nuanced. Here's what you actually need to know to pick one.

## What's the same

The basics are identical:

- Both create mints, mint tokens, transfer them, burn them
- Both use the same Associated Token Account convention
- Both use the same instruction *shapes* for the core operations (transfer, mintTo, burn, approve)
- Both produce token accounts with the standard `amount` / `owner` / `mint` fields

For 80% of code paths — "show me my balance", "send X tokens to Y" — your app handles a Token-2022 token the same way it handles SPL Token, as long as you point at the right program ID.

## What's different

Token-2022 introduces **extensions** — opt-in features that attach to mints or token accounts at creation time. Once attached, they change how the token behaves.

The headline extensions:

- **Transfer Hooks** — every transfer invokes a custom program of your choice via CPI. Use cases: royalty enforcement, KYC checks, on-chain governance enforcement, compliance hooks.
- **Confidential Transfers** — amounts are encrypted on-chain. Combined with [Arcium](https://devrels.xyz/articles/arcium-encrypted-supercomputer) or similar MPC, this is how serious confidential payment apps work.
- **Interest-Bearing Tokens** — the balance grows automatically over time at a configured rate. Useful for tokenized real-world assets that earn yield.
- **Transfer Fees** — a percentage of every transfer is captured to a designated address. Royalty enforcement that actually works because it's enforced by the token program itself.
- **Metadata Pointer / Metadata Extension** — metadata can live directly on the mint without needing Metaplex. The mint *is* the NFT, in a sense.
- **Permanent Delegate** — a designated address can move tokens from any holder. Sounds dangerous; useful for compliance / revocation in regulated assets.
- **Default Account State** — new token accounts start frozen by default; the issuer must explicitly thaw them. Standard pattern for permissioned tokens.
- **Non-Transferable** — soulbound tokens. Once held, can't be moved.
- **Group / GroupMember** — native support for token collections without Metaplex.
- **CPI Guard** — protect users from malicious CPI calls draining their tokens.

Each extension is opt-in per mint and most are immutable once set.

## The compatibility tax

Here's the part the marketing doesn't lead with: **Token-2022 is not a drop-in replacement.** Apps need to handle it explicitly.

What breaks if you don't:

- **Hardcoded program IDs.** If your app references `TokenkegQ...` constants, Token-2022 tokens are invisible to it.
- **Account size assumptions.** Token-2022 token accounts can be larger because of extensions. `getAccountInfo` parsing that assumes fixed size will fail.
- **Transfer logic.** If a mint has a Transfer Fee extension, your "send 1000 tokens" instruction needs to know the fee will be deducted. Naive UIs will show the wrong final amount.
- **ATA derivation.** Same derivation function, but with the Token-2022 program ID as the owner — different program ID input, different ATA address.

In practice, modern Solana SDKs handle most of this for you:

- **[`@solana/kit`](https://devrels.xyz/articles/solana-kit-modern-web3-javascript)** — has first-class Token-2022 support via codegenned clients
- **`@solana-program/token-2022`** — the canonical TypeScript client
- **`spl-token` CLI** — supports both programs via the `--program-id` flag
- **Jupiter, Phantom, Solflare** — all handle Token-2022 in normal swap and send flows

If you're using these as your foundation, the compatibility tax is mostly already paid.

## Token-2022 isn't yet universal

Despite being live for a while, Token-2022 hasn't fully replaced SPL Token. Three reasons:

1. **Major tokens are on classic SPL.** USDC, SOL-wrapped, JitoSOL, mSOL, every major stablecoin and LST is still on classic SPL Token. No incentive to migrate — bridging an existing supply across programs is a coordinated event most issuers don't want to schedule.
2. **Tooling fragmentation.** Some indexers, explorers, and third-party dashboards still struggle with extensions. If your token's TVL depends on appearing correctly on DeFi Llama or in Phantom's portfolio view, classic SPL is the safer bet.
3. **Audit complexity.** Each extension expands the attack surface. Transfer Hooks in particular let arbitrary programs run on every transfer — auditors are still building muscle memory around the patterns.

## When to use Token-2022

**Reach for Token-2022 when:**
- You need any of the extensions — transfer hooks, fees, confidential transfers, metadata-on-mint, interest accrual
- You're shipping a new token from scratch and want native metadata without Metaplex
- You're building a compliance-flavored asset (regulated stablecoin, tokenized security) where the extensions match the legal model
- You're shipping confidential payments — Token-2022's Confidential Transfers extension is foundational

**Stick to classic SPL Token when:**
- You just need basic ERC-20-shaped token mechanics
- Your token integrates with infrastructure (DEXes, bridges, lending markets) that you can't guarantee supports Token-2022 fully
- Your audit / legal team is more comfortable with the smaller attack surface
- You want to maximize liquidity venue support out of the gate

## A practical recommendation

If you're launching a memecoin or a basic utility token: classic SPL Token. The integration surface is universal and the basic shape is enough.

If you're launching a real-world-asset token, a regulated stablecoin, or anything with on-chain compliance constraints: Token-2022. The extensions are exactly what those use cases need.

If you're building a token-adjacent app (wallet, DEX, indexer, portfolio tracker): handle both. Token-2022 isn't optional anymore.

## What about [p-token](https://devrels.xyz/articles/p-token-pinocchio-solana-rewrite)?

Not a competitor — a *replacement implementation* of classic SPL Token written in Pinocchio. Same program ID, same instruction shapes, ~98% cheaper compute units. Once SIMD-0266 ships, every classic SPL Token transaction gets cheaper at the same time. Token-2022 isn't (yet) affected by this rewrite — that's a separate, future project.

## Resources

- **Token-2022 docs:** [spl.solana.com/token-2022](https://spl.solana.com/token-2022)
- **Extensions reference:** [spl.solana.com/token-2022/extensions](https://spl.solana.com/token-2022/extensions)
- **Classic SPL Token docs:** [spl.solana.com/token](https://spl.solana.com/token)
- **TS clients:** [`@solana-program/token`](https://www.npmjs.com/package/@solana-program/token) and [`@solana-program/token-2022`](https://www.npmjs.com/package/@solana-program/token-2022)
- **Stack Exchange Token-2022 tag:** [solana.stackexchange.com](https://solana.stackexchange.com)

The right answer is rarely "always Token-2022" or "always classic." It's "which features do I actually need, and where is the integration surface my token has to live in." Pick from there.
