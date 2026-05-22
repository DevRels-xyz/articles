---
title: "Pyth: the price layer of global finance, with Solana underneath"
slug: pyth-the-price-layer
summary: 138+ first-party publishers, 3000+ price feeds, on-chain prices for stocks, FX, commodities, and crypto. Pyth is the oracle bet that pulled traditional finance directly into Solana — and the data layer most of DeFi now runs on.
author_twitter: metasal
author_name: metasal
tags: [oracle, pyth, defi, infrastructure, data]
cover_image:
published: true
---

If [Switchboard](https://devrels.xyz/articles/switchboard-the-everything-oracle) is the everything oracle, [Pyth](https://pyth.network) is the *first-party data* oracle. The structural difference matters: Pyth doesn't aggregate prices from public APIs and republish them. Pyth gets data directly from the institutions that *make* the prices — the world's biggest exchanges, market makers, and trading firms. That source distinction is most of why Pyth ended up where it ended up.

The numbers tell the story: **138+ publishers, 3,059+ price feeds.** Apple, Amazon, gold, the yen, GDP rates, every meaningful crypto pair. Pyth is the closest thing on-chain finance has to a Bloomberg terminal.

## What Pyth is

The product surface is straightforward:

- **First-party price publishing.** Major financial institutions — exchanges, market makers, trading firms — publish their own prices directly to the Pyth network. No middleman, no aggregator, no scraping.
- **Pull-based feeds.** Like Switchboard, Pyth uses a pull model. Consumers request a price update bundled into the transaction that needs it, instead of streaming continuously to an account.
- **Confidence intervals.** Every price ships with a confidence range — the spread of values across publishers. Smart protocols use this to widen liquidation buffers when uncertainty is high.
- **Cross-chain.** Pyth distributes prices to 40+ chains via its Wormhole-bridged pull architecture. Solana is home, but the data crosses everywhere.

## Why "first-party" actually matters

A lot of oracle marketing talks about decentralisation. What Pyth has — and most don't — is **provenance**.

When the BTC/USD price you consume on a Pyth feed came directly from Cboe, Jane Street, Wintermute, Jump, and 30+ other firms quoting the same pair, that's a fundamentally different security model than "we scraped Binance and CoinGecko". You don't have a single point of failure in price source. You don't have a published-API attack vector. The publishers are competing with each other to provide accurate quotes; their reputation and (at scale) their staked capital is on the line.

This is the model that finally convinced traditional-finance-flavored Solana protocols (Drift, Marginfi, Kamino, Jito, every major lending market) to bet their liquidations on on-chain data. Without first-party publishing, the trust math just doesn't work for serious size.

## The 3,000+ feeds

Pyth's breadth is hard to overstate. A sample from the live page:

- **Crypto**: BTC/USD, ETH/USD, SOL/USD, USDC/USD, PYTH/USD, HYPE/USD, and the long tail of Solana SPL tokens
- **Equities**: AAPL/USD, AMZN/USD, and hundreds of US-listed tickers
- **FX**: USD/JPY, EUR/USD, and the standard major + minor pair set
- **Commodities**: XAU/USD (gold), other precious metals, energy benchmarks
- **Macro**: GDP rates, inflation prints, central-bank-aligned indicators

This is the data set that makes onchain-finance ideas like tokenized stocks, real-world synthetic indices, and macro-hedged stablecoins actually viable. The infrastructure is there. The use cases are still being built.

## The PYTH token

Pyth has its own token (PYTH/USD is on the network — fittingly). The economic role is broadly:

- **Publisher staking** — publishers stake PYTH against their data quality; bad data risks the stake
- **Governance** — token-holders shape protocol parameters
- **Long-term incentive alignment** — the network grows the publisher set by making honest quoting more profitable than gaming

If you're a DeFi protocol consumer, you don't interact with the token directly — you consume feeds. The economics happen one layer below.

## How developers actually use it

Two integration patterns dominate:

**Pull (recommended for new builds):**

```ts
import { PythHttpClient, getPythProgramKeyForCluster } from "@pythnetwork/client"
// or use the on-demand price service for cross-chain pulls
```

You request a price update at the moment your transaction needs it. The price is verified on-chain via Pyth's program; your protocol consumes it; the transaction completes.

**Streaming via Wormhole (cross-chain):**

For non-Solana chains, prices are bridged via Wormhole. The same data; different distribution layer. Your EVM contract can consume a Pyth price that originated from Solana publishers, with cryptographic proof of authenticity.

The official Pyth Terminal at [pyth.network](https://pyth.network) is the discovery layer — browse feeds, see publishers, copy the feed ID into your code.

## Pyth vs Switchboard

Worth being honest about this because they're often compared:

- **Pyth's strength**: first-party publishing, breadth of TradFi-flavored feeds, regulatory legitimacy with institutional publishers. Best when you need a price for a real-world asset.
- **Switchboard's strength**: TEE-secured custom feeds, permissionless feed deployment, lowest latency tier (Surge 2-5ms). Best when you need a feed that doesn't exist yet, or sub-millisecond freshness.

Most serious Solana DeFi protocols use both — Pyth for the standard feeds, Switchboard for the custom or ultra-low-latency cases.

## When to reach for Pyth

**Use Pyth when:**
- You need a price feed for a major asset (crypto, stock, FX, commodity, macro)
- Your protocol's risk model wants confidence intervals, not just point estimates
- You're going cross-chain and want one oracle vendor across Solana + EVM + Sui
- Publisher provenance matters for your audit or legal posture

**Look elsewhere when:**
- You need a feed for a long-tail asset Pyth doesn't yet cover — Switchboard's permissionless feed model handles this
- You're shipping a non-financial use case (sports outcomes, weather, random data) — those need different oracle architectures

## Resources

- **Site:** [pyth.network](https://pyth.network)
- **Terminal (feed discovery):** linked from the homepage
- **Docs:** [docs.pyth.network](https://docs.pyth.network)
- **GitHub:** [pyth-network](https://github.com/pyth-network)
- **PYTH token:** governance + publisher staking; data on the homepage feed list

The shape of on-chain finance over the next decade depends on real-world data being on-chain accurately and continuously. Pyth is the closest thing to that today — and the bet most of Solana's DeFi stack quietly stands on.
