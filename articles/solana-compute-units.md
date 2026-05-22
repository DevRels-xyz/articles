---
title: "Compute units explained: Solana's pricing knob, demystified"
slug: solana-compute-units
summary: Compute Units are the metric Solana uses to price work. Understanding them is the difference between transactions that land cheaply and transactions that get dropped during congestion. Here's how CU work, what costs what, and how to optimize.
author_twitter: metasal
author_name: metasal
tags: [compute-units, performance, fees, optimization, pinocchio]
cover_image:
published: true
---

If Ethereum charges in gas, Solana charges in **compute units (CU)**. The mechanics are different, the optimisation strategies are different, and the implications for your code are different.

Knowing what consumes CU and what doesn't is a productivity multiplier — for users (cheaper transactions, faster landing during congestion) and for program developers (smaller CU footprint = better composability).

## What a CU actually measures

A compute unit is Solana's abstract metric for "how much work did the runtime perform". Each instruction the eBPF VM executes consumes some CU. Syscalls consume more. Cryptographic operations consume a lot.

Some rough costs (subject to change as the runtime evolves):

| Operation | Approximate CU |
|---|---:|
| BPF instruction | 1 |
| `sol_log` (small string) | ~100 |
| `sol_log_data` per byte | ~10 |
| `sol_sha256` (32-byte input) | ~85 |
| `sol_keccak256` | ~210 |
| Ed25519 signature verify (sigverify) | ~25,000 (charged at tx level) |
| Secp256k1 recover | ~25,000 |
| Account read (small) | ~1,000–5,000 |
| Account write | ~1,000–5,000 |
| CPI call overhead | ~1,000 + child program CU |
| Allocation (heap alloc syscall) | varies — expensive |

The numbers are deliberately approximate because the runtime tunes them periodically. The point is the *relative* cost hierarchy: cryptography is expensive, syscalls are expensive, basic arithmetic is essentially free.

## The 1.4M CU transaction limit

The hard ceiling: **a transaction can consume up to 1,400,000 CU**. Most actual transactions consume far less:

- Simple SOL transfer: ~150 CU (post-[p-token](https://devrels.xyz/articles/p-token-pinocchio-solana-rewrite))
- Classic SPL Token transfer: ~4,645 CU
- Anchor account-init + simple write: ~30,000 CU
- Jupiter aggregator swap (multi-hop): 200,000–800,000 CU
- Complex DeFi composition: pushing 1M+

If you exceed the limit, your transaction fails with "exceeded maximum allowed compute units". The instruction that overran reports it; everything before reverts.

## The two compute budget instructions you should always use

When you submit a transaction, you can declare:

1. **`setComputeUnitLimit`** — how much CU you're requesting (default 200,000)
2. **`setComputeUnitPrice`** — how many microlamports you're paying per CU

Both are simple system-level instructions you include at the top of your transaction:

```ts
import { ComputeBudgetProgram, TransactionMessage } from "@solana/web3.js"

const setUnitLimit = ComputeBudgetProgram.setComputeUnitLimit({
  units: 400_000,
})
const setUnitPrice = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 5_000,
})

const messageV0 = new TransactionMessage({
  payerKey: payer,
  recentBlockhash,
  instructions: [setUnitLimit, setUnitPrice, ...yourInstructions],
}).compileToV0Message()
```

Why both matter:

- **Setting the limit below the default** tells the leader "this only needs 400k, not 200k default". The leader can fit more transactions in a block, and your tx is more likely to be scheduled. Setting it *too* low fails your tx — measure first.
- **Setting the price** is your priority fee bid. Solana has no traditional mempool — transactions flow through the leader, who orders them partly by CU price. During congestion, the bid is the difference between landing and being dropped.

## How to measure your actual CU usage

Three ways, in order of precision:

**1. `simulateTransaction` returns `unitsConsumed`:**

```ts
const sim = await connection.simulateTransaction(tx)
console.log("CU consumed:", sim.value.unitsConsumed)
```

That's the easiest, fastest measurement.

**2. Run with `RUST_LOG=solana_runtime::message_processor=debug`** when invoking via the test validator to see per-instruction CU breakdown.

**3. Use the [Helius](https://www.helius.dev) "Priority Fee API" or [Triton](https://triton.one) RPC enhancements** to get historical CU statistics for similar transactions.

The pattern most teams use: simulate, multiply by 1.2 (safety margin), set that as your `setComputeUnitLimit`. Cheap protection against transactions failing for "ran 5% over".

## Where the CU goes (a rough budget for a typical tx)

For a representative Solana DeFi transaction (Jupiter swap, ~30 accounts, 5 inner CPIs):

- Account loading: ~50,000 CU
- Sigverify (1 signer): ~25,000 CU
- Jupiter routing logic: ~80,000 CU
- Token program CPIs (5×): ~25,000 CU total
- AMM swap math + state writes: ~100,000 CU
- Misc syscalls and overhead: ~20,000 CU

Total: ~300,000 CU. That leaves ~1.1M CU of headroom for the next swap, the next ALT, the next composed call.

## Optimization patterns for program developers

If you're writing a program, here's how CU savings stack:

**1. Use Pinocchio (no-std, no-alloc).** The biggest single win available today. Eliminates the standard `solana-program` entrypoint cost and zero-copy account reads. p-token's 98% reduction is the proof point.

**2. Read accounts zero-copy.** `bytemuck::from_bytes` over `borsh::deserialize`. The runtime doesn't allocate; your program runs faster.

**3. Store the bump on PDAs.** `create_program_address(seeds, bump)` is cheap. `find_program_address` (which iterates) is expensive. Init once, store bump, re-derive cheaply.

**4. Avoid logging in hot paths.** `msg!()` is cheap but not free. In production programs, log only on errors or important state transitions.

**5. Pre-validate before CPI.** A CPI you don't need is CPI overhead you don't need.

**6. Pack data tightly.** Smaller account sizes = cheaper reads = less CU.

## Optimization patterns for app developers

If you're submitting transactions:

**1. Always set CU limit explicitly.** Don't ride the 200k default if your tx needs less; you're wasting block space and slowing your land time.

**2. Use a recent priority fee estimate.** RPC providers (Helius, Triton, QuickNode) expose recent priority fee data; bid at or above the 75th percentile of the last few seconds.

**3. Bundle compute budget instructions in the same transaction as the work.** Adding them as separate transactions doesn't help — they're scoped to the tx they're in.

**4. Measure, don't guess.** Simulate your real transaction shape; don't copy CU values from blog posts.

## The p-token effect

The pending [p-token](https://devrels.xyz/articles/p-token-pinocchio-solana-rewrite) deployment via SIMD-0266 takes the most-used program on Solana from 4,645 CU per transfer down to 76. That's:

- More tokens transferred per block (cheaper from the leader's POV)
- More headroom in composed transactions (you can fit another swap)
- Lower priority fees for the same confirmation behaviour (you outbid easier)
- Cheaper UX for every Solana user, atomically when SIMD-0266 ships

It's the largest single CU-economics improvement Solana will see in years.

## Things that surprise people

A few non-obvious behaviors:

- **CU is consumed even if your instruction reverts.** A failed transaction still pays its consumed-CU × price priority fee.
- **CU is consumed across CPI depth.** All inner CPIs charge against the same parent budget. Composability has a price.
- **Setting CU limit higher than needed doesn't directly cost more.** The fee is `CU consumed × price`, not `CU limit × price`. But a high limit competes worse with smaller, tighter transactions for block inclusion.
- **The CU limit cap is per-transaction, not per-block.** Solana doesn't enforce a per-block CU ceiling — that's why high-throughput is possible — but each tx has the 1.4M cap.

## Resources

- **Compute Budget docs:** [solana.com/docs/core/fees#compute-budget](https://solana.com/docs/core/fees#compute-budget)
- **Cookbook — How to optimize compute usage:** [solana.com/developers/cookbook](https://solana.com/developers/cookbook)
- **Helius priority fee API:** [docs.helius.dev](https://docs.helius.dev)
- **Anza CU docs / SIMD list:** [docs.anza.xyz](https://docs.anza.xyz)
- **p-token:** [our article on it](https://devrels.xyz/articles/p-token-pinocchio-solana-rewrite)

The two-line summary: Solana prices work in CU, you can control how much you request and how much you pay per CU, and being precise about both makes your transactions land cheaper and faster. Treat CU optimization as part of UX, not as an afterthought.
