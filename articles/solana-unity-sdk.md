---
title: "Solana.Unity SDK: ship a Solana game without leaving Unity"
slug: solana-unity-sdk
summary: A full-featured C# SDK that puts the Solana stack — wallets, NFTs, SPL tokens, DEX swaps, Solana Mobile Stack — inside the Unity editor. Maintained by MagicBlock Labs, with Web3Auth, Phantom, and Wallet Adapter all built in.
author_twitter: metasal
author_name: metasal
tags: [unity, gaming, sdk, csharp, magicblock]
cover_image:
published: true
---

If you're a Unity developer who wants to ship a Solana game and you're looking for the path of least resistance, [Solana.Unity SDK](https://solana.unity-sdk.gg) is it. Open-source, MIT-licensed, on the Unity Asset Store as a Verified Solution, and maintained by the [MagicBlock](https://devrels.xyz/articles/magicblock-real-time-solana) team — the same group that built Ephemeral Rollups for real-time Solana apps.

It's the SDK most Solana Unity games already build on.

## What it actually gives you

The feature list is more substantial than "wrap an RPC client". From the README:

- **Full JSON-RPC API coverage** — every method on a Solana node, callable from C#
- **In-game wallet** — non-custodial, sollet + solana-keygen compatible. Players never leave your game to manage keys.
- **Auth that actually fits a game's UX**:
  - **Phantom** support (when the player has it)
  - **Web3Auth** — social login for players who don't (Google / Discord / Twitter → wallet)
  - **Solana Mobile Stack** support for the Saga / dApp Store path
  - **Solana Wallet Adapter** compatibility (every standard-compliant wallet works)
- **SPL token primitives** — send, receive, JIT-provision Associated Token Accounts. The plumbing that usually takes a weekend to wire up correctly.
- **NFTs** — mint, fetch, render metadata directly in Unity
- **Compile to xNFTs** — your game can ship as a Backpack xNFT, runnable inside the wallet itself
- **Native DEX operations** — Orca and Jupiter swaps from C# without a server round-trip
- **WebSockets** — register triggers on account changes, signature status, program activity. Game state can react to chain events in real time.
- **Transaction & message decoding** — base64 in, decompiled human-readable out, re-encodable to wire format

The underlying library is [`Solana.Unity-Core`](https://github.com/magicblock-labs/Solana.Unity-Core), a .NET Standard 2.0 port of Solnet — which makes the SDK genuinely Unity-compatible (Mono, IL2CPP, both targets).

## Why MagicBlock maintains it

If you've read the [MagicBlock article](https://devrels.xyz/articles/magicblock-real-time-solana), you know the team's core thesis: Solana for *real-time* applications, particularly games. Ephemeral Rollups deliver 1ms block time and sub-50ms end-to-end latency — but only if game developers can actually consume them. The Unity SDK is the consumption layer.

The strategic alignment is tight:
- **Game devs build with Unity** (or Unreal — but Unity is the dominant indie/mobile engine)
- **Solana programs running inside Ephemeral Rollups** can sustain game-loop interaction
- **Solana.Unity SDK** is the C# bridge from one to the other

It's not a side project. It's the developer experience layer for MagicBlock's whole game thesis. That's also why it's actively maintained — the team has structural incentive to keep it current.

## Install

The official path is via the Unity Package Manager:

1. Open Package Manager (`Window` → `Package Manager`)
2. Click the **+** button → **Add package from git URL**
3. Paste:
   ```
   https://github.com/magicblock-labs/Solana.Unity-SDK.git
   ```
4. After install, in Package Manager inspector → Samples → **Import** to get the example scenes
5. A sample wallet scene appears at `Samples/Solana SDK/0.0.x/Simple Wallet/Solana Wallet/scenes/wallet_scene.unity`

If you want a pinned version: append `#vX.Y.Z` to the URL.

Alternative path for teams who prefer it: the [Unity Asset Store package](https://assetstore.unity.com/packages/decentralization/infrastructure/solana-sdk-for-unity-246931) — also free, also Verified.

## Setting up a wallet (90 seconds)

The README's step-by-step actually works:

1. Create a new scene
2. Import the `WalletController` prefab
3. On the `SimpleWallet` script, pick the RPC cluster — Mainnet, Testnet, Devnet, or custom URI
4. Create a Canvas, import the `WalletHolder` prefab (or build your own UI around the wallet prefab)
5. Hit Play — you have a working Solana wallet running inside your game

That's the bare-minimum integration. The interesting part is what you do next.

## What you can actually build

A few patterns that are unlocked once the SDK is in your project:

- **Player-owned items as NFTs.** Your game's sword, skin, or character is a Solana NFT. Player owns the asset; the chain enforces the supply.
- **On-chain leaderboards.** Player scores written to a Solana program; everyone in the world sees the same ranking; no central database to trust.
- **In-game economies with real liquidity.** A reward token your game mints is tradeable on Orca/Jupiter via the SDK's native DEX support. Players can sell off accumulated rewards without ever leaving the game.
- **Composable game state.** Other apps — websites, mobile companions, other games — can read your game's on-chain accounts and surface them. You get a frontend you didn't have to build.
- **Real-time multiplayer via Ephemeral Rollups.** Combine the SDK with MagicBlock's `#[ephemeral]` programs and you get 1ms-block-time game logic that settles to Solana mainnet.

The xNFT path is particularly interesting: compile your Unity game into a [Backpack](https://www.backpack.app/) xNFT and the game runs *inside* the user's wallet. No download, no install — the wallet is the launcher.

## Android build setup (gotcha)

One real gotcha to know about: building for Android, you'll hit `Duplicate Class` or `Dependency Conflict` errors out of the box. Fix:

1. **Edit** → **Project Settings** → **Player**
2. **Android** tab
3. Enable **Custom Main Gradle Template**

The README walks through the rest. Worth flagging because it's not obvious, and you'll waste an afternoon if you don't know.

## When to reach for it

**Use Solana.Unity SDK when:**
- You're shipping a Solana game in Unity (the obvious case)
- You want Phantom + social-login + mobile wallet support from one integration
- You want NFT and SPL token mechanics inside the game, not as a separate companion site
- You want native DEX support so your in-game economy has real liquidity exits

**Look elsewhere when:**
- You're on Unreal Engine — there's a separate (less mature) Solana Unreal community effort
- You're building a pure web app — use [`@solana/kit`](https://devrels.xyz/articles/solana-kit-modern-web3-javascript) instead
- Your "game" is actually a betting/prediction app — you might want a leaner wallet stack rather than a full Unity package

## Resources

- **Site:** [solana.unity-sdk.gg](https://solana.unity-sdk.gg)
- **GitHub:** [magicblock-labs/Solana.Unity-SDK](https://github.com/magicblock-labs/Solana.Unity-SDK)
- **Docs / tutorials:** [developers.garbles.fun](https://developers.garbles.fun)
- **Unity Asset Store:** [Solana SDK for Unity](https://assetstore.unity.com/packages/decentralization/infrastructure/solana-sdk-for-unity-246931)
- **Live demo:** [magicblock-labs.github.io/Solana.Unity-SDK](https://magicblock-labs.github.io/Solana.Unity-SDK/)
- **Underlying core lib:** [Solana.Unity-Core](https://github.com/magicblock-labs/Solana.Unity-Core) — .NET Standard 2.0 Solnet port
- **Discord:** [discord.com/invite/MBkdC3gxcv](https://discord.com/invite/MBkdC3gxcv)
- **Listed on devrels.xyz:** [Solana.Unity SDK resource](https://devrels.xyz/resources/8e05906e-fc20-464c-af57-b6c5c819ed0c)

If you've been watching the on-chain gaming category and looking for the actual on-ramp, this is it. The MagicBlock + Unity SDK combination is the closest thing Solana has to a turnkey path from "I have a Unity game" to "it runs on-chain with real-time game loop guarantees".
