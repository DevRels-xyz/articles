---
title: "How Solana transactions actually work — and where the limits bite"
slug: solana-transactions-and-limits
summary: 'A Solana transaction is a tightly-constrained envelope: 1232 bytes, atomic execution, deterministic ordering. Understanding the limits is the difference between "my transaction fails for no reason" and "I''m shipping resilient on-chain code."'
author_twitter: metasal
author_name: metasal
tags: [transactions, fundamentals, limits, performance, compute]
cover_image:
published: true
---

You probably know that Solana transactions are fast and cheap. You may not know that they're also tightly constrained envelopes with hard limits that are easy to hit in production — and that those limits shape almost every design decision in a real Solana app.

Here's the practical mental model.

## Anatomy of a transaction

A Solana transaction is a single atomic unit that:

1. References a recent **blockhash** (proof of freshness)
2. Lists the **accounts** it will read or write
3. Carries one or more **instructions** that the runtime executes in order
4. Includes **signatures** from required signers

If any instruction fails, the entire transaction reverts. There's no partial state change. There's no "this part succeeded but that part didn't."

```
Transaction
├── Header (signers count, RO/RW signer count, RO account count)
├── Account Keys: [pubkey, pubkey, ...]
├── Recent Blockhash
├── Instructions:
│   ├── Instruction 0: { program_id_index, accounts[], data }
│   ├── Instruction 1: { ... }
│   └── ...
└── Signatures: [sig, sig, ...]
```

## The 1232-byte limit

The most visible limit: **a transaction must fit in 1232 bytes wire-encoded**. That's the MTU-aligned packet size Solana picked, and it's a hard ceiling.

Everything counts:
- Each pubkey is 32 bytes
- Each signature is 64 bytes  
- Each instruction has program ID (1 byte index), accounts list (1 byte each), data length, and data
- Headers, length prefixes, padding — all count

In practice this means you can typically fit:
- ~3–6 complex instructions, or
- 1–2 medium instructions plus many account references, or
- A long Jupiter swap route — which is why Jupiter's "exact size" calculation matters

If you exceed it, your transaction is rejected at the network layer. Your wallet won't even broadcast it.

## Versioned transactions + ALTs

The escape hatch: **Address Lookup Tables (ALTs)**, introduced via versioned transactions.

An ALT is an on-chain table that holds up to 256 pubkeys. Your transaction references the table once, then refers to its entries by 1-byte indices instead of 32-byte full pubkeys. That's 31 bytes saved per account.

For a Jupiter swap that touches 30 accounts, ALTs are the difference between "this fits" and "this is impossible."

```ts
import { TransactionMessage, VersionedTransaction } from "@solana/web3.js"

const altAccount = await connection.getAddressLookupTable(altAddress)
const messageV0 = new TransactionMessage({
  payerKey: payer,
  recentBlockhash: blockhash,
  instructions,
}).compileToV0Message([altAccount.value])

const tx = new VersionedTransaction(messageV0)
```

If you're not using versioned transactions and ALTs in production today, you're leaving capability on the table.

## The 1.4M compute unit limit

A transaction can consume up to **1.4 million compute units (CU)** by default. Compute units are Solana's metric for "how much work did the runtime do" — instruction count, signature verification, syscalls, etc.

You can request a higher limit (up to ~1.4M is the default; the actual ceiling is a hard 1.4M as of 2026) and a lower priority fee per CU:

```ts
import { ComputeBudgetProgram } from "@solana/web3.js"

const setComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  units: 800_000,
})
const setPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 1000,
})
```

You include these as the first two instructions in your transaction. Setting CU limits well below the actual budget is a real optimization — the leader can schedule more transactions per block if each one declares a smaller budget.

This is also why the [p-token rewrite](https://devrels.xyz/articles/p-token-pinocchio-solana-rewrite) — taking transfers from 4,645 CU to 76 — matters so much: every CU you save is room for more transactions per block, or more headroom for your other operations.

## The 256-account limit

Each transaction can reference at most ~256 accounts (the exact number depends on whether they're RO/RW/signer). With ALTs that's per-table, so multiple ALTs let you compose larger account sets.

You'll rarely hit this except for very large composed flows (multi-hop routes, complex DEX aggregations). When you do, it's a sign the operation should be split across multiple transactions.

## The deterministic ordering rule

Two transactions touching the same writable account are serialized. Two transactions touching different accounts run in parallel. This is Solana's killer scheduling feature — but it has a corollary:

**If you write to a "hot" account from many transactions, you bottleneck.** Every Jupiter swap doesn't conflict with every other Jupiter swap because they touch different mint accounts. But every transaction touching the global state account of a poorly-designed protocol will serialize, and your TPS ceiling becomes the protocol's hot-account contention rate.

This is why production Solana program design is partly an exercise in "what state can I PDA-shard so the runtime can parallelize me."

## Priority fees and the mempool that isn't

Solana doesn't have an Ethereum-style mempool. Transactions flow through the leader directly via the validator's TPU (Transaction Processing Unit). The leader processes them in order:

1. **Priority fee** (CU price × CU consumed) — highest priority wins
2. **Stake-weighted forwarding** — validators forward your tx to the next leader based on stake-weighted QoS

This is why setting a non-zero priority fee on transactions that need to land matters. Zero-priority transactions are last in line and frequently dropped during high load.

```ts
ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 5_000 })
```

5,000 microlamports per CU × 200,000 CU ≈ 0.001 SOL. Cheap protection against a busy block.

## Confirmation levels

When your transaction lands, three confirmation states matter:

- **Processed** — a leader saw your transaction and included it in their next slot. Could still be re-forked.
- **Confirmed** — supermajority of stake has voted on the block containing your tx. ~400ms typical.
- **Finalized** — block has 32+ confirmations. Cannot be reverted barring catastrophic chain fork.

For UI purposes, "confirmed" is usually enough. For irreversible side effects (sending fiat, releasing inventory), wait for "finalized" or accept the (rare) risk of a re-fork.

## The hard limits, summarized

| Limit | Value | Mitigation |
|---|---:|---|
| Transaction size | 1,232 bytes | Use ALTs + versioned transactions |
| Compute units | 1,400,000 | Split across transactions; optimize CU usage |
| Account references | ~256 | Use ALTs |
| Account size | 10 MB | Split state across multiple accounts |
| Instruction data | included in tx size | Compress / chunk if needed |

## Things that surprise people

A few non-obvious behaviors:

- **A transaction with a stale blockhash is rejected, not retried.** Blockhashes live ~150 slots (~60s). Your client must use a fresh one or your tx silently fails.
- **A transaction that simulates fine can fail on-chain.** Network state moves between simulate and submit. Always send-and-check, not simulate-then-trust.
- **Signature uniqueness matters.** The same signature can't land twice. If you're retrying, use a fresh blockhash so the signature changes.
- **Read-only accounts are cheap.** Listing an account as RO costs less in terms of contention. Be precise about read-vs-write.

## When the limits actually bite

The four most common production failures:

1. **"Transaction too large"** — you composed too many instructions; use ALTs or split the operation
2. **"Compute budget exceeded"** — request more CU explicitly via `setComputeUnitLimit`, or optimize hot paths
3. **"Blockhash not found"** — your client's blockhash is stale; fetch a fresh one within ~30s of submit
4. **"Transaction was dropped"** — usually low priority fee + network congestion; bump the fee

Each has a fix that takes minutes once you know it. The first time you hit them, they look like Solana is broken. It isn't — you're meeting the limits the chain was designed around.

## Resources

- **Transactions deep-dive:** [solana.com/docs/core/transactions](https://solana.com/docs/core/transactions)
- **Versioned transactions guide:** [solana.com/developers/guides/advanced/versions](https://solana.com/developers/guides/advanced/versions)
- **Compute Budget instruction docs:** part of the official solana-program docs
- **Stack Exchange transaction tag:** [solana.stackexchange.com](https://solana.stackexchange.com)
- **[How to optimize compute usage on Solana](https://solana.com/developers/cookbook)** in the Cookbook

Solana's transaction model is a tight design. The limits are deliberate. Engineering with them rather than around them is how production Solana apps stay reliable at scale.
