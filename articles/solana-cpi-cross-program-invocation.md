---
title: "CPI on Solana: how programs call other programs, properly"
slug: solana-cpi-cross-program-invocation
summary: Cross-Program Invocation is how a Solana program calls another program inside the same transaction. It's the composability primitive — but the rules around signing, account passing, and recursion are strict, and the gotchas are real.
author_twitter: metasal
author_name: metasal
tags: [cpi, programs, anchor, fundamentals, composability]
cover_image:
published: true
---

A Solana program doesn't live on an island. The whole point of the platform is that programs **compose** — your lending protocol calls the token program to transfer USDC; your DEX calls Pyth for a price; your governance program calls the system program to create a new account. The mechanism for all of that is **Cross-Program Invocation (CPI)**.

If PDAs are the "how programs own state" primitive, CPI is the "how programs talk to each other" primitive. Both are non-negotiable for serious Solana development.

## What CPI actually is

A CPI is when an instruction inside Solana program A invokes a separate program B, in the same transaction, with a portion of A's account set passed through.

The runtime model:
- Program A is mid-execution
- It builds an "inner instruction" — same shape as a top-level instruction
- It hands that instruction to the runtime via `invoke()` or `invoke_signed()`
- The runtime suspends A, executes B, and resumes A with B's result
- If B fails, the entire transaction fails

The CPI is **atomic within the parent transaction**. There's no try-catch across program boundaries — a failure anywhere kills everything.

## The canonical example: token transfer

You want your program to transfer tokens on behalf of a vault. The token program owns the transfer logic; your program owns the authority. CPI is the bridge.

**Anchor:**

```rust
use anchor_spl::token::{self, Transfer};

let cpi_accounts = Transfer {
    from: ctx.accounts.vault.to_account_info(),
    to: ctx.accounts.recipient.to_account_info(),
    authority: ctx.accounts.vault_authority.to_account_info(),
};
let cpi_program = ctx.accounts.token_program.to_account_info();
let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

token::transfer(cpi_ctx, amount)?;
```

What's happening underneath: Anchor constructs a transfer instruction, calls `invoke()`, and the token program executes the transfer with `vault_authority` as the signer.

**Bare-metal (no Anchor):**

```rust
let ix = spl_token::instruction::transfer(
    &spl_token::id(),
    vault.key,
    recipient.key,
    vault_authority.key,
    &[],
    amount,
)?;

solana_program::program::invoke(
    &ix,
    &[vault.clone(), recipient.clone(), vault_authority.clone()],
)?;
```

Same operation; more explicit plumbing.

## The signing rule

Here's the rule that confuses everyone exactly once:

**A CPI inherits the signers of its parent.** If `wallet.signer = true` in the parent, then `wallet` is also a signer for the CPI. You don't need to re-sign.

But: **if you need the CPI to sign as a PDA**, you must explicitly provide the seeds via `invoke_signed`:

```rust
let signer_seeds: &[&[&[u8]]] = &[&[
    b"vault",
    mint.key.as_ref(),
    &[vault_bump],
]];

solana_program::program::invoke_signed(
    &ix,
    &[vault.clone(), recipient.clone(), vault_authority.clone()],
    signer_seeds,
)?;
```

The runtime checks: does `program_id` match the program that derives this PDA from these seeds? Yes → the PDA is a valid signer for the inner instruction. This is how programs "sign as themselves" without holding a private key.

This is the mechanism that makes [PDAs](https://devrels.xyz/articles/solana-pda-program-derived-addresses) genuinely useful. Without `invoke_signed`, PDAs would just be deterministic addresses with no signing capability — which would mean no vaults, no escrows, no program-owned state of any consequence.

## Anchor's CpiContext

Anchor's `CpiContext::new()` and `CpiContext::new_with_signer()` are wrappers around `invoke` and `invoke_signed`:

```rust
// Standard CPI — uses parent signers
let cpi_ctx = CpiContext::new(token_program, accounts);

// PDA-signed CPI — provides seeds for the runtime check
let signer_seeds: &[&[&[u8]]] = &[&[b"vault", &[vault_bump]]];
let cpi_ctx = CpiContext::new_with_signer(token_program, accounts, signer_seeds);

token::transfer(cpi_ctx, amount)?;
```

If you're writing Anchor, 95% of your CPIs look like this. The remaining 5% are CPIs to programs that don't have Anchor wrappers — for those, you construct the instruction manually and pass it to `invoke[_signed]`.

## The depth limit

CPI can recurse, but only so far. The runtime imposes a **CPI depth limit of 4**.

That means: your program → another program → another → another. Four levels deep. The fifth invoke fails.

In practice this is rarely a real constraint — most CPI chains are 1-2 deep. But composed DeFi flows (a vault calling a lending market calling an AMM calling the token program) can approach the limit. When they do, the protocol design has to flatten.

## What can and can't change during CPI

A few important invariants:

- **Account data passed to a CPI** can be modified by the callee. When the parent resumes, those accounts may have new content. Your program must re-read state after the CPI returns.
- **The callee can't add accounts** to the parent's account set. All accounts a CPI touches must be in the parent's instruction.
- **Lamports can move** during a CPI (subject to ownership rules). Account balances may differ between before-CPI and after-CPI.
- **The signer set is bounded**. A CPI inherits parent signers (and explicit PDA signers via seeds), but can't *promote* a non-signer to a signer.

This last property is what stops CPI from being a privilege-escalation vector. If your program isn't authorized to act on an account in the parent context, calling another program won't give it new authorization.

## Common CPI patterns

The four that show up everywhere:

**1. Token transfers from a PDA-owned vault.** Standard escrow / vault / staking pattern. PDA holds the token account; program signs as the PDA via `invoke_signed` to move funds.

**2. Account creation via system_program.** Your program needs a new account at a specific PDA. CPI to `system_program::create_account` with the PDA's seeds as signers.

**3. Calling Pyth/Switchboard for prices.** Read-only CPI to oracle programs to get a recent price feed for your liquidation/swap logic.

**4. Token-2022 transfer hooks.** When you transfer a token with the Transfer Hook extension, the token program *itself* CPIs into your hook program. Your program is on the receiving end of a CPI initiated by Token-2022.

## Things that surprise people

A few non-obvious behaviors:

- **A CPI uses your remaining CU.** If the parent has used 800k CU and the inner program needs 700k, you're short. The 1.4M CU budget is shared across the whole call tree.
- **CPI events / logs are namespaced.** Inner program logs prefix with `Program <id> invoke [n]` so you can tell which level produced what.
- **CPI return data exists.** Callee programs can set return data; callers can read it. Most uses don't need this; the canonical case is `simulate_transaction` returning structured results.
- **CPI to non-existent programs fails the transaction.** No "soft" calls.

## Composability vs reliability

The composability win of CPI is enormous: any Solana program can call any other, atomically, in the same transaction. The reliability cost is the linked-failure model: if any of the called programs fails, your transaction fails.

In practice this means:
- **Don't CPI into programs whose stability you don't trust** — pick well-known, audited callees
- **Wrap external CPIs in your own validation** — verify the result account state matches your expectations after the call
- **Be precise about which accounts you pass** — passing more than the callee needs is a security risk

## Resources

- **Solana CPI docs:** [solana.com/docs/core/cpi](https://solana.com/docs/core/cpi)
- **Anchor's `CpiContext` reference:** [anchor-lang.com](https://www.anchor-lang.com)
- **Pinocchio's CPI primitives:** [github.com/anza-xyz/pinocchio](https://github.com/anza-xyz/pinocchio)
- **Cookbook:** [How to handle multiple signers — solana.com/developers/cookbook](https://solana.com/developers/cookbook)

CPI is the part of Solana that turns it from "a chain that executes programs" into "a chain that composes programs". Once you've internalised PDAs and CPI, you've internalised the model that everything else builds on.
