techstack:

Framework: React Native (Expo).

Language: TypeScript (strict).
Animations & Gestures
Animations: Moti (Framer-Motion-style API for React Native) + Reanimated 3+ framer motion
tailwind css


CryptoClips — Frontend Product & Feature Spec (Markdown Source)
Purpose: a single, comprehensive reference for what the React Native app should do on the client side.
Scope: frontend only (UX, UI, behaviors, states, analytics, a11y, performance).
Excludes: backend/storage choices, API designs, timelines, or delivery dates.

1) Product Overview
What it is: A fast, inshorts-style crypto news app with short cards, live price context, simple personalization, alerts, and light gamification (streaks + tokens + rewards).

Primary goals:

Let users scan crypto news quickly.

Help them follow what they care about (coins, categories, sources).

Nudge daily use with streaks/tokens and a friendly rewards catalog.

Keep the experience reliable offline, accessible, and delightfully fast.

2) Core Principles
Speed first: instant content, low jank, fast gestures.

Clarity: short, skimmable cards; predictable interactions.

Trust: clear source visibility; no clickbait UI.

Respect: a11y-ready, low data modes, quiet hours respected.

Privacy: minimal local storage; user-controlled notifications.

3) Personas (lightweight)
The Skimmer: opens several times a day, reads headlines and summaries, reacts quickly.

The Follower: cares about specific coins/sources; sets alerts and bookmarks for later.

The Achiever: returns daily, maintains streak, redeems tokens, shares highlights.

4) Information Architecture
4.1 Navigation Map (Bottom Tabs)
Feed (default)

Search

Alerts

Bookmarks

Profile / Wallet

4.2 Secondary Screens/Flows
Article Viewer (in-app WebView)

Filters Sheet

Rewards Catalog & Redemption

Onboarding (FTUE)

In-app Inbox (optional, for notification history)

Settings (language, region, theme, data saver, notifications help)

5) Screens & Detailed Behaviors
5.1 Feed
Purpose: Short crypto cards with reactions, save, share, and a live price chip.

Header

App brand/logo (tap → top), search icon, streak 🔥 + tokens chip.

Filter Row

Quick chips: All, Bitcoin, Altcoins, DeFi, Regulation, Exchanges, Tech, NFTs…

“More” chip opens Filters Sheet.

Card (reusable component)

Source avatar + name + relative time.

Headline (concise) + 2–3 line summary.

Coin tags (e.g., BTC, ETH) as chips.

Price chip (symbol, last price, 24h%).

Actions: React (bull/bear/neutral), Save, Share, Read more.

Optional thumbnail image (lazy-loaded).

Interactions & States

Pull-to-refresh (refreshes top).

Infinite scroll (cursor-based on the client; no page numbers shown).

View tracking: a card is “viewed” when ≥70% visible for ≥2s (debounced).

Reactions/Save: optimistic UI; shows toast on failure.

Read more: opens Article Viewer (in-app WebView).

Price chip refresh: updates only when the card is visible and at reasonable intervals; shows “Delayed” hint if stale.

Empty/Error/Offline

Empty (new user): “Pick interests” CTA → Filters/Onboarding.

Error: friendly message + retry.

Offline: last cached feed + subtle “Offline” badge; price chip may hide % if unavailable.

Acceptance Criteria

Cards render consistently across device sizes.

Scrolling remains smooth with large lists.

Actions are instantaneous (optimistic), with graceful rollback on failure.

Price chip never causes jank or excessive refresh.

5.2 Filters (Bottom Sheet)
Sections

Categories (multi-select chips).

Coins (multi-select; searchable).

Sources (multi-select; searchable).

Toggles: “High impact only”, “This week”.

Actions

Apply: updates filter state and re-queries feed.

Clear: resets all selections.

Acceptance Criteria

Selections persist locally between app launches.

Applying filters updates feed immediately with a visible confirmation.

Clear returns to “All” without stale UI.

5.3 Search
Layout

Search bar with autosuggest (coins, sources, keywords).

Recent searches (local list) + Trending queries.

Results reuse the standard Card component with query term highlight.

Behaviors

Debounced input; cancel previous query on new input.

Supports adding filters (same sheet as Feed).

Clear button resets results and keyboard.

Acceptance Criteria

Typing feels responsive; no flicker when suggestions update.

Empty results state suggests helpful alternatives.

Returning to Search preserves the last query (until cleared).

5.4 Article Viewer (In-App WebView)
Header

Back, Share, Open in Browser, Save.

Content

Original article URL inside WebView.

Optional bottom information sheet for source domain and credibility notes.

Behaviors

Track dwell time (start/stop on focus/blur).

Respect system reader settings if later adding Reader Mode.

Acceptance Criteria

Links open reliably without freezing the app.

Share uses native sheets.

Exiting returns to the previous scroll position in Feed/Search.

5.5 Alerts
Sections

News Alerts: breaking, followed topics.

Price Alerts: per-coin thresholds (>, <, ±%).

Digests: daily/weekly time picker and days of week.

UI Elements

Master toggles for each alert type.

Per-alert configuration rows with detail editors in modals/sheets.

OS notification status callout with “Open Settings” link if disabled.

Behaviors

Client-side validation (e.g., percent format, non-negative).

Quiet hours preview with local clock.

Acceptance Criteria

Toggling and editing are intuitive and discoverable.

If OS notifications are off, user sees a clear callout and help link.

All selections persist locally.

5.6 Bookmarks
Layout

List of saved items (newest first).

Quick filters for coin/category/source.

Offline indicator for entries cached for offline reading.

Interactions

Swipe to remove (with undo).

Tap → Article Viewer.

Acceptance Criteria

Saved state survives offline.

Removing a bookmark updates the list instantly.

Offline indicator is accurate.

5.7 Profile / Wallet
Header

Avatar/initials, display name, email/handle (non-editable in v1).

Widgets

Streak: flame icon, current streak, best streak, a friendly subtitle.

Tokens: balance; tap opens Wallet History (ledger list).

Following: coins/categories/sources with “Manage” button.

Settings entry: language/region, theme, data saver, notifications help.

Behaviors

On app open/resume, refresh streak + tokens display.

Wallet History shows recent token events with readable labels.

Acceptance Criteria

Streak and token values never “jump” incorrectly (client trusts latest known values).

Wallet History is scannable and paginated.

Following list is easy to scan and manage.

5.8 Rewards Catalog & Redemption
Catalog

Grid/list of rewards with image, title, token cost, and inventory badge.

Detail

Description, eligibility note, Terms link, “Redeem” button.

Redemption Flow

Confirmation sheet → success screen with fulfillment info (e.g., code) + copy/share.

Acceptance Criteria

“Redeem” button disabled if balance insufficient or inventory gone.

Post-redeem success state is clear, copyable, and storable (locally until dismissed).

Inventory badge updates visually after redemption.

5.9 Onboarding (FTUE)
Flow

Value prop slides (skip allowed).

Pick interests (coins/categories/sources).

Notifications explainer and opt-in (deferred ask best-practice).

Short tutorial on gestures: swipe, react, save, streak/tokens.

Acceptance Criteria

Skipping still sets sane defaults.

Tutorial interactions are quick, can be skipped, and don’t block first use.

After FTUE, user lands on a meaningful Feed.

5.10 Settings
Items

Language & region.

Theme (system / light / dark).

Data saver (defer images on cellular).

Notifications help (OS settings link).

About & Legal (Terms, Privacy, licenses).

Acceptance Criteria

Theme changes apply app-wide without restart.

Data saver clearly affects image loading behavior.

Legal pages open correctly and are readable.

6) Gamification UX (Client-Side)
6.1 Streaks
Definition (UX): A day counts when the user opens the app and views ≥1 new article.

Surfaces:

Feed header chip (🔥 + count)

Profile card (“Day N — keep it going!”)

Optional nudge card on Feed if the user’s typical time is approaching (copy-only nudge).

Edge handling: timezone changes, device clock skew → the UI only displays what it was told last time (no client-side guessing).

Micro-animations: confetti or flame pop once per day when a new day is achieved.

Acceptance Criteria

Streak never increments twice in the same local day.

If the app reopens later the same day, the animation doesn’t replay.

If streak resets, messaging is empathetic and invites a restart.

6.2 Tokens
Surfaces: Feed header chip (with total), Profile summary, Wallet History list.

Earning moments (UX only): daily open, first reaction of the day, digest completion, share (once/day).

Caps & messaging: if a daily cap is reached, show a subtle banner “Daily token cap reached”.

Acceptance Criteria

Token balance changes trigger a brief, non-blocking celebration.

Ledger entries are human-readable and clearly dated.

No confusing double-adds on rapid actions.

6.3 Rewards
Catalog tiers: low cost (stickers, themes), mid (raffle tickets), high (merch/premium perks).

Redemption UX: confirmation → success with clear fulfillment and secondary actions (copy/share).

Acceptance Criteria

Disabled states make sense (insufficient tokens, sold out).

Success state persists until dismissed; accidental dismissal is recoverable in Wallet History.

7) Personalization (Client-Side UX)
Follow management: lists for coins, categories, sources with add/remove controls and search.

Feed tuning: quick chips prioritize followed content; Filters persist user choices.

Hide/See less: optional long-press menu on a card to “See less from this source” or “Not interested in [topic]”.

Acceptance Criteria

Changes in follow/hide preferences reflect in Feed composition visually (labels/badges).

“Undo” appears after “See less/Hide” actions.

8) Notifications UX (Client-Side)
Types shown to users: breaking news, followed topics, price alerts, digest summaries, rewards updates, streak nudges.

In-app banners: when a notification arrives in foreground, show a small banner; tapping navigates to the relevant screen.

Notification Center (optional): In-app “Inbox” screen listing recent notifications with read/unread state.

Acceptance Criteria

Tapping a notification deep-links to the right place (article, alerts, rewards).

Banners are non-intrusive and dismissible.

If OS notifications are disabled, the app clearly explains how to enable them.

9) Offline, Caching & Data Saver (Client-Side)
Cached feed: last seen items render instantly on open; refresh happens silently.

Bookmarks offline: bookmarked articles (title/summary/image) viewable offline.

Data saver: on cellular, defer images until scroll-in or tap-to-load; on Wi-Fi, load as usual.

Stale indicators: small “Offline” or “Updated Xm ago” hints where appropriate.

Acceptance Criteria

App opens to useful content even with no network.

Image deferral behaves predictably.

No accidental heavy background data use on cellular.

10) Theming, Typography & Accessibility
Themes: Light/Dark/System.

Typography: consistent scale (e.g., Title, Subhead, Body, Caption) with dynamic type support.

Color: accessible contrast for text and key UI (e.g., price up/down, disabled).

Touch Targets: min 44×44 pt; adequate hit slop on icons.

Screen Readers: all icons/buttons have meaningful labels; reading order is logical.

Motion: respect “Reduce motion” OS setting (less parallax/animation).

Acceptance Criteria

No text truncation that hides meaning; multi-line titles wrap gracefully.

Contrast meets WCAG AA for text and controls.

App is navigable with VoiceOver/TalkBack.

11) Component Inventory (Reusable UI)
AppHeader (title, actions, optional chips slot)

FilterChip (selected/disabled states)

TagChip (coin/category)

PriceChip (symbol, price, ±%, Fresh/Stale state)

NewsCard (slots: header, headline/summary, tags, media, actions)

ReactionBar (3 options, optimistic select, percentages)

BookmarkButton (toggle + feedback)

ShareButton

ListEmpty (contextual graphic + copy + CTA)

ListError (retry)

Loader (skeletons/spinners)

Sheet/Modal (Filters, Editors, Confirmations)

Toast/Snackbar

CounterBadge (inventory, unread)

StreakWidget (flame, counts, micro-anim)

TokenBalance (number formatting + delta animation)

WalletEntry (icon, title, amount, timestamp)

RewardCard (image, title, cost, inventory)

Form Controls (text input, number stepper, toggles, pickers)

Each component should define: visual states (default/pressed/disabled), focus/hover/active (where relevant), error/success, loading/placeholder.

12) Copy & Content Guidelines (Client)
Headlines: concise; avoid hype; no ALL CAPS.

Summaries: 2–3 lines; informative; no jargon where possible.

Source attribution: always visible; tap opens domain info.

Price formatting: consistent decimals; prefix signs for change (±).

Microcopy: empathetic, brief (“Saved”, “Removed”, “Try again”).

Gamification tone: positive, non-judgmental (“Nice streak!”).

13) Client Analytics (Events & Conventions)
Naming: area_action (snake_case), keep payloads small and non-PII.

Core Events

Feed: feed_impression, card_view, card_react, card_share, card_bookmark, read_more_open

Filters/Search: filters_open, filters_apply, filters_clear, search_query, search_result_click, search_no_results

Alerts: alerts_open, alerts_toggle, price_alert_create, digest_time_set

Bookmarks: bookmark_open, bookmark_remove, bookmark_offline_read

Profile/Wallet: profile_open, wallet_open, wallet_history_view

Rewards: rewards_open, reward_view, reward_redeem_attempt, reward_redeem_success

Gamification: streak_shown, token_earned (type, amount)

Notifications UX: push_open, inapp_banner_tap

Tech health: api_latency_bucket (client-measured), feed_fetch_error, realtime_connected

Attribution fields: screen name, device/OS, app version, connectivity (wifi/cellular), time since app open.

Acceptance Criteria

Events fire exactly once per user action.

No PII in payloads.

Event loss handled gracefully offline (queued, retried).

14) Client Performance Targets
App open → first card visible: feels instant on a warm open; cold open within a reasonable threshold on mid-tier devices.

Scroll FPS: maintains smoothness in long lists.

Image strategy: thumbnails first, full images as needed; no layout shift.

Battery: avoid excessive background work; throttle price updates to visible items.

Acceptance Criteria

No noticeable UI hitching during quick scrolls.

Long sessions (100+ cards) don’t cause memory crashes on low-end devices.

15) Client Security & Privacy
Local storage: only non-sensitive prefs and caches; clear on logout.

WebView: disable unnecessary features; show domain clearly; avoid third-party cookies when possible.

Permissions: ask with context; allow “Not now”; show where to change later.

Safety: protect users from accidental taps (confirm on destructive actions).

Acceptance Criteria

App continues to work with permissions denied (with reduced features).

Clear in-app guidance for enabling notifications if user wants them.

16) QA & Acceptance (By Feature)
Feed & Cards:

Cards render consistently; images lazy-load; actions are optimistic; view tracking is debounced and reliable.

Filters:

Multi-select works; clear resets; applied state reflected in Feed.

Search:

Debounce works; suggestions appear; canceling in-flight requests doesn’t flicker; empty state helpful.

Article Viewer:

WebView loads reliably; share works; back returns to same scroll position.

Alerts:

Toggles persist; editors validate input; OS disabled state is detected and surfaced.

Bookmarks:

Save/remove works; offline copies view; swipe to remove with undo.

Profile/Wallet:

Streak/token displays are accurate; wallet history is readable; manage follows is intuitive.

Rewards:

Catalog loads; redemption flow is clear; success state displays fulfillment with copy/share; disabled states behave correctly.

Onboarding:

Skippable; preferences saved; landing on a useful Feed.

Settings:

Theme toggles instantly; data saver changes image behavior; legal pages open.

17) Nice-to-Have (Post-MVP, Client-Side)
Reader Mode in Article Viewer (if permitted by source).

Comments (threaded, report/hide UI).

Leaderboards (opt-in alias; weekly reset).

Crypto Calendar view (UI only; shows coin events).

Trend widgets (mini charts; compact and low-frequency).

18) Glossary (UI Terms)
Card: The primary news unit shown in Feed/Search.

Chip: A small, rounded filter/tag UI element.

Price Chip: Compact display of a coin’s last price and 24h change.

Streak: Consecutive days the user opened the app and viewed ≥1 new card.

Tokens: Soft currency earned in-app, redeemable for rewards.

Rewards: Items or perks users can claim with tokens.

Digest: A scheduled summary of stories (shown as a concept in client UI).

End of Frontend Spec
This document intentionally avoids backend specifics and timelines. It defines the complete client experience—what users see, the components you’ll build, how screens behave, and the quality bar to accept each feature. 
