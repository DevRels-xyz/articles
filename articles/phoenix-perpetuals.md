---
title: "Phoenix: from on-chain order book to Solana perpetuals"
slug: phoenix-perpetuals
summary: Phoenix started as the cleanest on-chain order book on Solana — atomic settlement, no MEV, all in a single Rust program. It's now Phoenix Perpetuals. Here's the architecture and why it still matters.
author_twitter: metasal
author_name: metasal
tags: [defi, perpetuals, orderbook, phoenix, solana]
cover_image:
published: true
---

[Phoenix](https://phoenix.trade) is one of the more interesting architectural bets in Solana DeFi. While most of the ecosystem went the AMM or pool-to-peer route, Phoenix went the other way — a fully on-chain central limit order book, atomically settled, no MEV bot in the loop. The product has since evolved into **Phoenix Perpetuals**, but the original architecture is still what makes it worth knowing about.

Built by [Ellipsis Labs](https://www.ellipsislabs.xyz), Phoenix has been quietly one of the most technically respected projects in the Solana DEX layer.

## The original Phoenix CLOB

The v1 Phoenix program — `Ellipsis-Labs/phoenix-v1` on GitHub, 260+ stars, all Rust — was an on-chain central limit order book that "atomically settles trades." That phrase is doing a lot of work, so it's worth unpacking:

- **Central limit order book (CLOB).** Real bids and asks, ordered by price-time priority, like a traditional exchange. Not a pool. Not a vAMM. Order matching the way humans expect it to work.
- **Fully on-chain.** No off-chain matching engine, no centralised relayer. The matching happens inside the Solana program; the book lives in account state.
- **Atomic settlement.** When two orders cross, the asset transfer happens *in the same transaction* as the match. There's no separate settlement step — and crucially, no window for MEV bots to insert themselves between the match and the settlement.

That last point is the differentiator. On most order-book DEXes (across most chains), MEV extraction lives in the gap between matching and settling. Phoenix designed that gap out.

## Why CLOB on Solana was hard

Most chains can't run a CLOB on-chain because the gas economics don't work. Every order placement, modification, and cancellation is a transaction. On Ethereum mainnet, this means a $10 limit order costs $5 of gas — which means nobody quotes tight.

Solana's economics make CLOBs viable: fees are negligible, block time is fast enough that order updates feel real-time, and the SVM can process the parallelism of dozens of market-makers quoting concurrently. Phoenix proved this works at production scale before perp protocols started taking it seriously.

The architectural lessons from Phoenix v1 leaked into the broader ecosystem — when Solana DeFi protocols today say "we use an order book", they're often using Phoenix or a Phoenix-inspired design.

## Phoenix Perpetuals

The current product at phoenix.trade is **Phoenix Perpetuals** — the perps market built on top of (and inspired by) the original CLOB architecture.

Visible product surface from the live app:

- Real-time order book with bids, asks, and last-trade tape
- Cross-margin and isolated-margin modes
- Long/short market and limit orders
- Take Profit / Stop Loss configured at order placement
- Reduce-only and post-only order types
- 15x leverage on SOL (the visible default; other pairs may vary)
- 0.035% taker fee tier (visible in the UI)

It's a clean, professional-trader UI — the kind of order entry that anyone coming from a CEX trader interface will recognise immediately. That's deliberate. Phoenix's positioning is the "we did the architecture right" answer to traders who want a real order book on-chain.

## Ellipsis Labs

The team behind Phoenix is [Ellipsis Labs](https://www.ellipsislabs.xyz) — a small, technically-focused Solana engineering shop. The org has 29+ public repos, including Phoenix v1, related tooling, and adjacent infrastructure. X: [@ellipsis_labs](https://x.com/ellipsis_labs).

If you read Solana technical writeups, you've probably already encountered work from this team — they're consistently producing reference material on order book design, AMM mechanics, and Solana program optimization.

## What Phoenix is good at

A few things Phoenix's design actually delivers:

- **Tight spreads.** When market makers compete at the top of book, you get price discovery a pool-to-peer DEX can't match.
- **Price-time priority.** Your order's place in the queue is deterministic and visible — no opaque AMM curves doing the matching.
- **No MEV in execution.** Atomic settlement closes the standard MEV attack vector on order books.
- **Composability.** Other programs can read the book and reference Phoenix prices in the same transaction.

## Tradeoffs to know

Order books aren't free wins:

- **Spreads are only as tight as the market makers make them.** Low-liquidity pairs can quote wide. Pool-to-peer DEXes paper over this by always offering *some* price, even if it's a bad one.
- **Order placement is a transaction.** Even at Solana's fee levels, a market maker quoting hundreds of times per second is paying real money. This favours sophisticated MMs over casual liquidity provision.
- **The product is more demanding to use.** A CLOB asks the trader to think in bids and asks. Pool-to-peer asks them to think in "I want to long X". The latter wins more casual users.

## When to reach for Phoenix

**Use Phoenix when:**
- You're a serious trader who wants real order-book mechanics
- You value tight spreads and visible queue priority
- You're building a market-maker or arbitrage bot — Phoenix's clean APIs are a friendly target
- You care about MEV-free execution as a property

**Look elsewhere when:**
- You're a casual user opening "I want to long SOL with 10x" — [Flash](https://devrels.xyz/articles/flash-trade-perpetuals) or Drift's simpler interfaces will feel friendlier
- The pair you want to trade has thin order book liquidity — check market-by-market before committing flow

## Resources

- **Site:** [phoenix.trade](https://phoenix.trade)
- **Phoenix v1 (CLOB) repo:** [Ellipsis-Labs/phoenix-v1](https://github.com/Ellipsis-Labs/phoenix-v1)
- **Ellipsis Labs:** [ellipsislabs.xyz](https://www.ellipsislabs.xyz)
- **X:** [@ellipsis_labs](https://x.com/ellipsis_labs)

Phoenix is the answer to "can you actually do a real order book on a high-performance chain?" The answer turned out to be yes — and the perps product is what happens when that proof becomes a business.
