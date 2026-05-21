---
title: "Kit²: Solana for SvelteKit, finally treated as a first-class citizen"
slug: kit-squared-sveltekit-solana
summary: A SvelteKit-native library wrapping @solana/kit with wallet connection, transaction helpers, and Anchor program support — for the slice of Solana that doesn't want to learn React.
author_twitter: metasal
author_name: metasal
tags: [sveltekit, javascript, wallet, sdk, frontend]
cover_image:
published: true
---

The Solana frontend ecosystem is overwhelmingly React. `@solana/wallet-adapter` ships React first. Most starter templates assume Next.js. Most tutorials assume hooks. If you've ever opened a "build with Solana" doc as a Svelte developer, you've probably hit the wall of "great, now port all of this to your stack yourself".

[Kit² (`kit-squared`)](https://github.com/AnAllergyToAnalogy/kit-squared) is the answer for the SvelteKit side of the ecosystem.

## What it is

Kit² is a SvelteKit-native library that wraps [`@solana/kit`](https://devrels.xyz/articles/solana-kit-modern-web3-javascript) — Anza's modern JavaScript SDK — and gives you what every Svelte app actually needs:

- **Wallet connection** via [`@wallet-standard`](https://github.com/wallet-standard/wallet-standard), so any standard-compliant Solana wallet (Phantom, Solflare, Backpack, etc.) just works
- **Transaction helpers** built on Kit's functional primitives, sized for Svelte's reactive model
- **Anchor program helpers** so you can call IDL-defined programs without hand-rolling instruction builders

The package is on npm as `kit-squared` and the repo lives at [`AnAllergyToAnalogy/kit-squared`](https://github.com/AnAllergyToAnalogy/kit-squared).

## Install

```sh
npm install kit-squared
```

That single dependency pulls in the SvelteKit-flavored bindings around `@solana/kit`. You don't need to install `@solana/wallet-adapter`, the React-bound `@solana/wallet-adapter-react`, or any of the React-ecosystem packages most Solana tutorials assume.

## Why it matters

Two structural reasons Kit² is useful beyond "SvelteKit users now have a library":

**It's built on Kit, not the legacy v1 stack.** A lot of community-maintained framework bindings still target `@solana/web3.js` v1, which means SvelteKit developers using them inherit v1's bundle size and Node-isms — exactly the wrong direction for a framework that prides itself on small bundles. Kit² being Kit-native means SvelteKit apps get the tree-shaken, edge-friendly modern SDK behaviour by default.

**It uses `@wallet-standard`, not `@solana/wallet-adapter`.** The Wallet Standard is the chain-agnostic protocol that's quietly replacing the React-specific wallet-adapter stack across the Solana ecosystem. Building on it now means Kit²'s wallet integration doesn't drag in React, and it's portable to any environment that respects the standard.

The net effect: a SvelteKit + Solana app can be small, fast, and idiomatic to both halves of its stack rather than feeling like a React project wearing a Svelte hat.

## When to reach for it

**Use Kit² when:**
- You're building a Solana app in SvelteKit (the obvious case)
- You want Kit semantics and bundle behaviour in a non-React framework
- You want wallet connection without dragging the wallet-adapter React tree in

**Look elsewhere when:**
- You're on React or Next.js (use `@solana/kit` directly, with `@solana/wallet-adapter` for React)
- You're on Vue, Nuxt, Solid, or Astro — you'll need to roll a similar layer (Kit² is a good reference if you do)
- Your project is pre-Kit and on v1 — finish the migration first, then drop in Kit²

## What it doesn't do

Kit² is a library, not a full starter. It doesn't ship UI components, a styling system, or a wallet-modal you can drop in. Bring your own UI; the package focuses on the JavaScript layer that the official ecosystem hasn't wrapped for Svelte.

That's the right call — the React side of the ecosystem has shown that pre-built modal components age badly and lock you into a visual language you'll outgrow within a release.

## Resources

- **GitHub:** [AnAllergyToAnalogy/kit-squared](https://github.com/AnAllergyToAnalogy/kit-squared)
- **npm:** [`kit-squared`](https://www.npmjs.com/package/kit-squared)
- **Docs:** the [repo README](https://github.com/AnAllergyToAnalogy/kit-squared#readme) is the source of truth
- **Underlying SDK:** [`@solana/kit`](https://devrels.xyz/articles/solana-kit-modern-web3-javascript)
- **Listed on devrels.xyz:** [Kit² resource page](https://devrels.xyz/resources/kit-kit-squared)

For the slice of Solana that's been quietly wishing the ecosystem stopped assuming React, Kit² is the moment that wish gets answered.
