---
title: "LiteSVM: faster Solana program testing"
slug: litesvm-faster-solana-program-testing
summary: An in-process Solana VM that skips RPC, slots, and consensus — and runs your test suite in microseconds instead of minutes. Why LiteSVM is becoming the default for unit and integration testing on Solana.
author_twitter: metasal
author_name: metasal
tags: [testing, rust, tooling, anchor, tutorial]
cover_image:
published: true
published_at: 2026-05-21T02:19:07Z
---

Testing a Solana program has always been a tradeoff between speed and realism. `solana-test-validator` boots a full local validator — accurate, but slow to start, slow to mine slots, and heavy on resources. `solana-program-test` is faster but ships with its own quirks and a steep API.

[LiteSVM](https://github.com/LiteSVM/litesvm) takes a different approach: an in-process Solana VM that's optimized for program developers. No RPC, no consensus, no slot timing — just the SVM, your program, and an ergonomic Rust API. The repo has crossed 600 stars and is rapidly becoming the default choice for unit and integration testing Solana programs.

## Why in-process

When you run a transaction through LiteSVM, there's no network round-trip and no JSON-RPC serialization. Your test code calls into the SVM directly, which means a transaction that takes ~50ms on `solana-test-validator` runs in microseconds on LiteSVM. Multiply that by hundreds of tests across a CI run and the difference is significant — CI pipelines that used to take minutes drop to seconds.

The tradeoff: you're not testing against a real network. If your code depends on RPC behavior, slot timing, or things like fee market dynamics, you still want a validator. For program logic, account state, and PDA interactions, LiteSVM is the right tool.

## Getting started

Add it as a dev dependency:

```sh
cargo add --dev litesvm
```

A minimal transfer test:

```rust
use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_signer::Signer;
use solana_system_interface::instruction::transfer;
use solana_transaction::Transaction;
use solana_message::Message;

let from = Keypair::new();
let to = solana_address::Address::new_unique();

let mut svm = LiteSVM::new();
svm.airdrop(&from.pubkey(), 10_000).unwrap();

let ix = transfer(&from.pubkey(), &to, 64);
let tx = Transaction::new(
    &[&from],
    Message::new(&[ix], Some(&from.pubkey())),
    svm.latest_blockhash(),
);

svm.send_transaction(tx).unwrap();
assert_eq!(svm.get_account(&to).unwrap().lamports, 64);
```

No async runtime. No `tokio::test`. No waiting for blocks. The whole flow is synchronous and runs in the same process as your test.

## Features that change how you write tests

A few capabilities stand out because they let you write tests that would be awkward or impossible against a real validator.

**Time travel.** `svm.warp_to_slot(slot)` jumps forward in slot time instantly, and `svm.set_sysvar::<Clock>(...)` lets you set the on-chain clock to any value. Testing vesting schedules, expiry conditions, or anything time-sensitive becomes a one-line setup.

**Arbitrary account writes.** `svm.set_account(pubkey, account)` writes any account state directly, bypassing runtime checks. Need to give your test wallet a million USDC without owning the mint authority? One line. Need to fake a specific PDA state to test an edge case? One line.

**Program loading.** `svm.add_program_from_file(program_id, "path/to/program.so")` loads any compiled program. Combined with `solana program dump`, you can pull a mainnet program by its address and test against it locally — useful for CPI tests against real DeFi protocols.

**Simulation.** `svm.simulate_transaction(tx)` runs a transaction without committing state, returning the logs and compute units used. Same flow as the `simulateTransaction` RPC, but instant.

**Compute budget control.** Tweak compute unit limits and heap size per test. Useful for catching CU regressions before they hit production.

**Sigverify off.** `LiteSVM::new().with_sigverify(false)` skips signature verification. For test code that doesn't care about signing semantics, this shaves more time off an already fast loop.

## The ecosystem

LiteSVM has grown beyond a single crate. A handful of companion crates handle the boilerplate you'd otherwise write yourself:

- **`litesvm-token`** — builder-style API for SPL Token operations: `CreateMint`, `CreateAssociatedTokenAccount`, `MintTo`, `Transfer`, plus authority management. No more hand-rolling token instruction bytes.
- **`litesvm-loader`** — wraps the upgradeable BPF loader's multi-step deployment flow (create buffer → write chunks → deploy → set authority) into ergonomic helpers.
- **`litesvm-utils`** — three traits (`TestHelpers`, `AssertionHelpers`, `TransactionHelpers`) that collapse common test patterns into one-liners, plus a fluent `LiteSVMBuilder`. Framework-agnostic.
- **`anchor-litesvm`** — Anchor-native testing with `anchor-client`-style syntax but zero RPC overhead. Handles discriminators, account deserialization, and event parsing automatically. The recommended path for Anchor programs.

```sh
cargo add --dev litesvm litesvm-token anchor-litesvm
```

## Not just Rust

There's an [official Node.js wrapper](https://www.npmjs.com/package/litesvm) for TypeScript-first stacks. The API mirrors the Rust crate closely, so you can run an in-process SVM from your existing TS test suite without spawning a child process or pulling in a validator.

```ts
import { LiteSVM } from "litesvm"
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js"

const svm = new LiteSVM()
const payer = Keypair.generate()
svm.airdrop(payer.publicKey, 10_000n)
```

This is the missing piece for teams who write programs in Rust but tests in TypeScript — you no longer have to choose between bankrun's API constraints and the validator's startup cost.

## When to reach for something else

LiteSVM isn't a drop-in replacement for every Solana test scenario. Skip it when:

- You're testing client SDKs that need to hit real RPC methods like `getProgramAccounts` or websocket subscriptions
- You're verifying behavior tied to the fee market, leader schedule, or actual consensus
- You're running end-to-end tests that simulate user wallets connecting via real RPC

For everything else — program logic, account state, CPI flows, PDA derivation, error paths, compute usage — LiteSVM is the fastest path from idea to passing test.

## Resources

- **Docs:** [litesvm.com](https://litesvm.com)
- **API reference:** [docs.rs/litesvm](https://docs.rs/litesvm/latest/litesvm/)
- **GitHub:** [LiteSVM/litesvm](https://github.com/LiteSVM/litesvm)
- **Node.js wrapper:** [npm: litesvm](https://www.npmjs.com/package/litesvm)
- **Anchor integration:** [anchor-litesvm](https://crates.io/crates/anchor-litesvm)

If you maintain a Solana program and your test suite still boots a validator, give LiteSVM a 30-minute trial. The compounding wins on CI feedback loop alone tend to pay for the migration within the first week.
