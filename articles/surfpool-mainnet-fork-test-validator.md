---
title: "Surfpool: the drop-in test validator with Mainnet forking and cheatcodes"
slug: surfpool-mainnet-fork-test-validator
summary: Surfpool is what solana-test-validator should have been — fork Mainnet state instantly, manipulate time and balances via RPC, deploy with Infrastructure-as-Code, and observe everything through a real-time dashboard. Now maintained under the Solana Foundation.
author_twitter: metasal
author_name: metasal
tags: [testing, surfpool, local-dev, tooling, mainnet-fork]
cover_image:
published: true
---

The Solana local development experience used to look like this: spin up `solana-test-validator`, manually fund a few accounts, deploy your program, hope your test inputs roughly resemble Mainnet. Repeat. Curse. Repeat.

[Surfpool](https://surfpool.run) is the answer to "what if local validators worked like Foundry's anvil does for Ethereum?" — fork Mainnet on demand, manipulate state with RPC cheatcodes, deploy with Infrastructure-as-Code, and watch it all live in a dashboard.

It's now maintained under [solana-foundation/surfpool](https://github.com/solana-foundation/surfpool) with 559+ stars and Apache-2.0 licensing. If you're shipping anything non-trivial on Solana, this should be your default local environment.

## What makes it different

There are two ways to test Solana programs locally today:

- **[LiteSVM](https://devrels.xyz/articles/litesvm-faster-solana-program-testing)** — in-process SVM, microsecond-fast, perfect for unit tests
- **`solana-test-validator`** — a real validator process, accurate but slow, no mainnet state

Surfpool is a third option that sits between them: a real local validator (so the network behavior is faithful) but with **Mainnet forking** so you can test against real on-chain state without needing to deploy to devnet first.

That gap matters. Most production bugs aren't unit-test bugs — they're "this worked in tests but Mainnet's actual USDC mint behavior is slightly different" bugs. Surfpool eliminates the gap.

## Install

```sh
curl -sL https://run.surfpool.run/ | bash
```

That's it. The script puts the binary on your PATH. From there:

```sh
surfpool start
```

You now have a local Solana validator running, plus Surfpool Studio (the dashboard) open in your browser.

## Mainnet forking

The headline feature. Clone any account, program, or token balance from Mainnet to your local network with one RPC call:

```sh
# Clone a specific account from Mainnet
curl -X POST http://localhost:8899 \
  -d '{"jsonrpc":"2.0","method":"surfnet_setAccount","params":["<address>",{"clone":"mainnet"}]}'

# Or fork all of Mainnet on startup
surfpool start --fork mainnet
```

Now you can:
- Test against the real USDC mint, real Jupiter routing accounts, real Marinade vault state
- Run your DEX against actual liquidity-pool account shapes from production
- Simulate transactions that would interact with mainnet protocols, locally, without spending real SOL or risking real funds

The state is a snapshot — you can modify it locally without touching Mainnet.

## RPC cheatcodes

Surfpool exposes a `surfnet_*` family of RPC methods that give you superpowers a real network would never let you have:

| Cheatcode | What it does |
|---|---|
| `surfnet_setAccount` | Overwrite any account's state |
| `surfnet_setTokenBalance` | Set any wallet's token balance to anything |
| `surfnet_setTokenAccount` | Create a token account at any address |
| `surfnet_timeTravel` | Jump to any future slot or epoch |
| `surfnet_resetNetwork` | Reset everything to a clean slate |
| `surfnet_cloneProgram` | Pull a program binary from another network |

This is what makes testing edge cases viable. Want to test what happens when a user has exactly 1 lamport less than the rent-exempt minimum? Set their balance. Want to test your vesting contract over 5 years? Time-travel. Want to test interactions with a freshly-deployed mainnet protocol you don't have devnet access to? Clone the program.

All without writing test fixtures by hand or running long-running test scenarios.

## Universal faucet

A small but quality-of-life feature: Surfpool ships a faucet that hands out **any token**, not just SOL.

```
Available: SOL, USDC, USDT, BONK, JitoSOL, ...
```

No more hunting for testnet token contracts. No more "I need 100 USDC for tests, where do I get it." One command, any balance.

## Infrastructure-as-Code deployments

When you run Surfpool inside an Anchor or Pinocchio project, it generates Infrastructure-as-Code (IaC) for your deployments. The syntax mirrors Terraform but is Solana-native:

```hcl
addon "svm" {
  network = "devnet"
}

action "deploy" "svm::deploy_program" {
  program_path = "./target/deploy/my_program.so"
  signer = signer.deployer
}
```

What this enables:

- **Reproducible deployments.** The same IaC file produces the same on-chain artifacts across machines and engineers.
- **Chain composable actions.** Deploy → initialize → seed accounts → run integration test, all in one script.
- **Multi-network workflows.** The same IaC can target localnet, devnet, mainnet — change the addon network, run again.

This is also where Surfpool nudges you toward better security practices: on-disk keypairs are fine for local, but the IaC framework supports multisig signers natively for mainnet. That's a real win — the SDK is shaped to make doing the right thing on mainnet the easy thing.

## Surfpool Studio

The dashboard at `localhost:8900` (or whatever port you started Surfpool with) shows:

- Live slot and epoch counter
- Stream of transactions hitting the local network
- Account inspector for any address
- Program log viewer with structured filtering
- Transaction success/failure breakdown

This is the part that turns testing from a black box into something you can actually debug. When a test fails in CI on devnet, you have logs. When a test fails locally on Surfpool, you have logs + a UI you can scrub through.

## When to reach for Surfpool

**Use Surfpool when:**
- You're testing against Mainnet behavior — DEX integrations, oracle reads, real token mint quirks
- Your tests need to manipulate time, balances, or state in ways the real network won't allow
- You're shipping a deployment flow and want it reproducible via IaC
- You want a dashboard to debug local test runs

**Use [LiteSVM](https://devrels.xyz/articles/litesvm-faster-solana-program-testing) when:**
- You're writing fast unit tests for your program logic
- You don't need full validator behavior — just SVM semantics
- Test suite time matters more than network fidelity

**Use `solana-test-validator` when:**
- ...rarely. Surfpool is the better default now. The original validator still works but Surfpool gives you more for less effort.

## Things to know

A few practical notes:

- **Mainnet fork is a snapshot.** Once forked, the local state doesn't track Mainnet changes. Re-fork when state moves.
- **Storage matters.** Forking large account sets eats disk fast. Surfpool's default is light, but if you fork heavy programs, watch your `~/.surfpool/` directory.
- **Cheatcodes are additive.** Standard Solana RPC methods all work; cheatcodes are extra. Existing tools and SDKs need no changes.
- **It's still relatively new.** Active development, occasional rough edges, friendly community on the Solana Foundation Discord.

## Resources

- **Site:** [surfpool.run](https://surfpool.run)
- **Docs:** [docs.surfpool.run](https://docs.surfpool.run)
- **GitHub:** [solana-foundation/surfpool](https://github.com/solana-foundation/surfpool)
- **Install:** `curl -sL https://run.surfpool.run/ | bash`
- **LLM integration:** Surfpool ships [/llms.txt](https://surfpool.run) for AI-assisted setup — a nice touch for the Claude / Cursor era
- **Listed on devrels.xyz:** [Surfpool resource](https://devrels.xyz/resources/7c38d82e-bf1d-41e4-9a6f-aa154bf20b2c)

If you've been quietly suffering through `solana-test-validator` for years, Surfpool is the upgrade. The mainnet-fork-plus-cheatcodes model is what local Solana development should always have looked like — and it's now the official Foundation-stewarded tool to use.
