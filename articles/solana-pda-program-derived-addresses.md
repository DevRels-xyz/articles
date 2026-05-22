---
title: "PDAs explained: the magic behind every Solana program account"
slug: solana-pda-program-derived-addresses
summary: Program Derived Addresses are how Solana programs own and reference accounts deterministically without anyone holding a private key. Understanding them is the difference between "I'm fighting the SDK" and "I'm writing real Solana programs."
author_twitter: metasal
author_name: metasal
tags: [pda, programs, anchor, pinocchio, fundamentals]
cover_image:
published: true
---

If there's one Solana concept that confuses every developer coming from Ethereum, it's **Program Derived Addresses**. Solidity contracts hold state inside themselves. Solana programs don't — every byte of state lives in a separate account, and the program needs a way to own those accounts without anyone (including itself) holding the private key.

That mechanism is the PDA. Once it clicks, the rest of Solana's account model clicks with it.

## The core idea

A PDA is a public-key-shaped address with one critical property: **no private key exists for it**. It's not a wallet. It's a deterministic 32-byte value that the runtime treats as if it belongs to a specific program.

The math is straightforward: take some seeds (bytes you choose), append the program's ID, hash, and check if the result is a valid point on the ed25519 curve. If it isn't, you've found a PDA — an address that no keypair can ever produce. If it is, increment a "bump" byte and try again.

Two practical consequences:
1. **The same seeds always derive the same PDA.** Anyone can compute it independently. Your program, your client, a competitor's bot — all see the same address from the same seeds.
2. **Only the owning program can sign for the PDA.** The runtime grants signing power based on program ID, not key ownership. This is how programs "own" accounts.

## A canonical example

Imagine a counter program. Each user has their own counter account. The account address derives from `(user_pubkey, b"counter")` + your program ID:

```rust
// Rust (anchor-style)
let (counter_pda, bump) = Pubkey::find_program_address(
    &[b"counter", user.key().as_ref()],
    &program_id,
);
```

```ts
// TypeScript (@solana/web3.js)
const [counterPda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter"), user.publicKey.toBuffer()],
  programId,
)
```

Both produce the same address. Your client constructs the transaction targeting `counterPda`. Your program, when invoked, can sign for that same `counterPda` because the runtime knows: "this address derives from seeds + this program ID, so this program is the only one allowed to write to it."

No private key exists. Nothing to leak, nothing to lose.

## The bump

When deriving a PDA, Solana increments a single byte called the **bump** until it finds an off-curve address. The bump matters because:

- The full seed set used to derive the address includes the bump
- Programs that re-derive the PDA inside an instruction need the *same* bump to produce the *same* address
- Storing the bump in the account's data lets you skip the iterative search on every CPI

```rust
// Anchor lets you store and read the bump cleanly
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        seeds = [b"counter", user.key().as_ref()],
        bump = counter.bump,  // read from account state
    )]
    pub counter: Account<'info, Counter>,
    pub user: Signer<'info>,
}
```

In bare-metal Solana (without Anchor) you handle bumps explicitly with `create_program_address` vs `find_program_address`.

## The four big patterns

Most Solana programs use PDAs for one of four reasons:

**1. Per-user accounts.** `[b"profile", user.key().as_ref()]` gives every user their own profile account, owned by your program, with a predictable address.

**2. Per-resource state.** `[b"market", market_id]` gives each market its own state account. Anyone can compute the address from the market ID; only the market program can write to it.

**3. Program-controlled vaults.** `[b"vault", mint.key().as_ref()]` is the canonical "this is where the program holds funds" pattern. The PDA owns a token account; the program signs token transfers via CPI.

**4. Singletons.** `[b"global-config"]` gives a single, deterministic address for program-wide config. Initialized once, referenced everywhere.

These four patterns cover ~90% of real-world PDA usage.

## Signing as a PDA

The half that makes PDAs powerful: your program can *sign* CPI calls as a PDA without holding any key. The mechanism:

```rust
// Anchor: invoke_signed with seeds
let signer_seeds: &[&[&[u8]]] = &[&[b"vault", mint.key().as_ref(), &[vault_bump]]];

token::transfer(
    CpiContext::new_with_signer(
        token_program,
        transfer_accounts,
        signer_seeds,
    ),
    amount,
)?;
```

The runtime checks: does this program have permission to derive this PDA from these seeds? Yes → the CPI succeeds with the PDA as the signer.

This is how a DEX can hold pooled liquidity, how an escrow can release funds, how a vault can custody assets — all without any human or program holding a private key for the funds. The program *is* the signer, gated by deterministic seed validation.

## When to use which derivation function

- **`find_program_address` / `findProgramAddressSync`** — iterates bumps until it finds an off-curve address. Use during account creation when you don't know the bump yet. Returns `(pda, bump)`.
- **`create_program_address` / `createProgramAddressSync`** — takes a specific bump. Use when you've stored the bump in account state and want to re-derive cheaply. Returns just the PDA or errors if invalid.

The second is dramatically cheaper in CU. Real Solana programs derive once during `init`, store the bump, and re-derive with `create_program_address` everywhere else.

## What PDAs aren't

A few common confusions:

- **PDAs aren't accounts by themselves.** They're addresses. You still need to create an account at that address with `system_program::create_account` (via the program's signing power).
- **PDAs can't hold SOL freely.** They can if the program controls them and uses `invoke_signed` to transfer — but they're not user-controlled wallets.
- **PDAs aren't unique to your program.** Anyone can derive any address from any program ID + seeds. The protection is in *who can sign*, not in *who can compute*.

## Where PDAs touch every part of Solana

If you've used Solana products, you've used PDAs:

- **Associated Token Accounts** are PDAs of the ATA program — same wallet + same mint always gives the same ATA address
- **Anchor's account macros** silently derive PDAs from your `seeds` constraint
- **SPL Stake Pools, Metaplex NFTs, every AMM pool, every lending market** — all PDAs underneath
- **The new [p-token](https://devrels.xyz/articles/p-token-pinocchio-solana-rewrite)** keeps the same PDA layout as classic SPL Token — that's what makes it byte-for-byte compatible

PDAs are the universal pattern for "deterministic address, program-owned, no private key." Internalise that and you've internalised the model that Solana programs are built on.

## Resources

- **Anchor PDA docs:** [anchor-lang.com](https://www.anchor-lang.com)
- **Cookbook recipe:** [How to derive a PDA — solana.com/developers/cookbook](https://solana.com/developers/cookbook)
- **Pinocchio's PDA primitives:** [github.com/anza-xyz/pinocchio](https://github.com/anza-xyz/pinocchio) — minimal, no-alloc derivation
- **Stack Exchange:** [solana.stackexchange.com](https://solana.stackexchange.com) — the canonical place to ask "is this the right way to PDA"

PDAs are the part of Solana that confuses you for a week, then becomes invisible for the rest of your career. Push through the initial confusion. Everything downstream becomes simpler.
