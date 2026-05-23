---
title: Mobile Wallet Adapter, explained
slug: mobile-wallet-adapter-explained
summary: How Solana dapps talk to wallets on a phone — the protocol, the trust model, and why it isn't just "wallet adapter, but mobile."
author_twitter: metasal
author_name: metasal
tags: [mobile, wallets, sms]
cover_image:
published: true
---

If you build on Solana, you already know `@solana/wallet-adapter`. You drop it into a Next.js app, the user clicks Connect, a browser extension popup asks them to sign, done. None of that works on a phone. Mobile Wallet Adapter (MWA) is the protocol that fills the gap — and the substitution is less direct than it looks.

The takeaway up front: MWA is not a port of web wallet adapter. It's a separate JSON-RPC protocol with its own session model, transport, and trust assumptions. The reason it exists is that mobile operating systems don't have the browser-extension escape hatch the web flow quietly depends on.

## Why the web pattern breaks

Web wallet adapter relies on either an injected `window.solana` (extension) or a popup that the dapp can postMessage to. On iOS and Android, the browser sandbox blocks both. A page rendered in mobile Safari has no way to reach the Phantom app installed on the same device — they live in separate sandboxes with no shared scripting context.

You could fake it with deep links — open a `phantom://` URL, hope the user comes back — but deep links are a one-way fire-and-forget primitive. There's no return channel, no session, no way for the wallet to stream back a signed transaction without a custom protocol on top.

MWA is that protocol on top.

## The two scenarios

MWA was designed around two physical setups, and the difference matters for understanding the spec:

**Local** — the dapp and the wallet are on the same device. A React Native or native Android dapp invokes the wallet via the OS's app-to-app intent system. On Android this is an `Intent` with the `solana-wallet:` scheme; the OS picks a registered handler. The handoff is local; the OS mediates trust.

**Remote** — the dapp is on a laptop (a web page), the wallet is on a phone. The two pair via a websocket relay called a *reflector*. The browser displays a QR code; the wallet scans it; from that point on both ends speak MWA JSON-RPC through the reflector. No private keys leave the phone, and the reflector is just a dumb message bus — it can't decrypt the traffic.

Same protocol, two transports. The session shape is identical: `authorize`, then any number of `sign_transactions`, `sign_messages`, `sign_and_send_transactions`, then optionally `deauthorize`.

## The auth token, not the public key, is the session

This is the part people miss when they come from web. On web, "connected" usually means "we know the user's pubkey." On MWA, `authorize` returns an **auth token** that's scoped to (your dapp's identity, the cluster, optionally a chain). You store that token. Next time the user opens your app, you call `reauthorize` with the token and get the same wallet account back without re-prompting the user.

This is what makes "sign in with Solana" actually feel like sign-in on mobile — the wallet treats your dapp as a known caller across launches, not just within a single session. It's also what makes silent re-pairing possible in the remote scenario: a saved token plus a fresh reflector connection can re-establish a session without another QR scan.

Lose the token on the dapp side and you start over. Lose it on the wallet side (uninstall, key rotation) and the dapp's stored token is dead — handle the `AuthorizationNotValid` error and call `authorize` again.

## What the protocol does and doesn't do

MWA covers: discovering a wallet, authorizing a session, signing transactions and messages, signing-and-sending in one call (so the wallet can pick the RPC), and clean teardown. It deliberately doesn't cover account creation, key backup, network selection UI, fee estimation, or anything that's a wallet UX concern. That separation is why the same protocol works across Phantom, Solflare, Backpack, Ultimate, and Espresso Cash — they each ship whatever onboarding they want, then expose the same RPC surface.

The current spec is MWA 2.0. The big additions over 1.0 were Sign In With Solana (SIWS) folded into `authorize` so you don't need a separate sign-message round trip for auth, and `sign_and_send_transactions` returning per-transaction results instead of failing the whole batch on one bad tx.

## iOS is the asterisk

Almost everything above assumes Android. iOS has no equivalent of Android's intent system that lets an arbitrary app register as a handler for `solana-wallet:` and get a structured response back. The current iOS path is Universal Links plus app-specific custom schemes, with the reflector pattern doing more of the work even for same-device flows. It works, but the latency and UX are worse, and a wallet has to be installed and have opened at least once for its Universal Link to resolve. If you're targeting both platforms, expect to special-case iOS.

## How this fits with Solana Mobile

MWA is the protocol; the [Solana Mobile Stack](https://solanamobile.com) (SMS) is the toolkit around it. SMS ships the Android reference implementation, the React Native SDK (`@solana-mobile/mobile-wallet-adapter-protocol`), and Seed Vault — a hardware-backed key custody service exposed to wallets on Saga and Seeker devices. As a dapp developer you don't talk to Seed Vault directly; you talk to MWA, and if the user's wallet uses Seed Vault under the hood, signing goes through the secure element automatically.

For a typical React Native dapp, the integration surface is small — wrap your app in the MWA provider, call `transact()` with a callback that runs your sign/send calls, handle the auth token persistence. The protocol's complexity is hidden behind the SDK; what's worth understanding is the session model above, because that's what shapes your app's auth UX.

## Where to go next

If you're starting a mobile dapp, the [Solana Mobile docs](https://docs.solanamobile.com) walk through the React Native setup end-to-end. If you're maintaining a web dapp and want desktop-to-phone signing, look at the [`@solana/wallet-adapter-mobile`](https://github.com/anza-xyz/wallet-adapter) package — it speaks MWA over the remote/reflector transport while exposing the wallet adapter API your code already uses. And if you're considering whether to ship a mobile build at all: the gating question is rarely "can MWA do it" — it almost always can — but whether your users' wallets have shipped MWA support yet. Check that first.
