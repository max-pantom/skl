---
name: terminal-ui-style-replicator
description: Use when asked to recreate the SKLX CLI docs / terminal UI style: hard-edged dark terminal surfaces, mono-heavy typography, restrained amber hover accents, believable command-console structure, and responsive keyboard-first documentation layouts.
---

# Terminal UI Style Replicator

Build interfaces in the style of the SKLX CLI docs page.

## Core look

- Use a near-black background: flat, not glossy.
- Keep the whole surface dark, not just inner cards.
- Use hard edges and straight borders. No rounded cards unless the existing product already depends on them.
- Typography should be mostly mono, compact, medium-to-bold weight.
- Accent color is restrained amber and should mostly appear on hover, focus, or active state.
- Default text color should be cool light gray, not bright white.
- Avoid decorative gradients, soft glassmorphism, oversized shadows, and “dashboard” card clutter.

## Layout rules

- Make the screen feel like a terminal or operator console, not a marketing page.
- Prefer one primary bounded surface with internal dividers.
- Use panel splits, rails, command lists, status strips, logs, and metadata rows.
- Keep structure believable:
  - command index
  - active command area
  - status line
  - notes/help text
  - keyboard hints
- Avoid generic hero-copy sections above the interface unless explicitly requested.

## Styling rules

- Borders: thin, visible, low-contrast white/gray lines.
- Radius: zero or extremely small.
- Text:
  - labels: uppercase, tiny, tracked out
  - body: small, dense, readable
  - commands: mono, medium/bold
- Color hierarchy:
  - base background: `#090909` to `#0d0d0d`
  - panels: slightly lifted but still dark
  - text: muted gray
  - emphasis: white
  - accent: amber only for interaction or selection
- Hover states should feel like terminal state changes, not button animations.

## Interaction rules

- Commands should feel selectable, inspectable, and copyable.
- Copy affordances should look like inline terminal text, not glossy buttons.
- Keyboard hints should be visible but quiet.
- Selected rows should look active through contrast and border/background shifts, not loud fills.
- Make the UI feel keyboard-first even if mouse works.

## Believability rules

When designing a fake or static terminal/TUI:
- Include plausible status labels such as `STATUS ONLINE`, `INPUT READY`, `ROW 03`, `MODE DOCS`.
- Use concise system-like wording.
- Avoid fake terminal noise that says nothing.
- Every visible line should imply an actual workflow.

## Responsive behavior

On mobile:
- Stack panels vertically.
- Let the page scroll normally.
- Convert wide command indexes into horizontal rails if needed.
- Allow long commands to wrap.
- Remove nonessential visual noise before shrinking the font too far.

## Avoid

- pastel colors
- large rounded marketing cards
- multiple bright accent colors
- oversized hero sections
- center-everything landing-page aesthetics
- fake cyberpunk clutter
- glows everywhere
- useless terminal gibberish

## Output standard

When asked to implement this style:
1. Make the page mostly dark from edge to edge.
2. Build one primary terminal surface first.
3. Use mono-heavy typography and hard dividers.
4. Add only one restrained accent color.
5. Make the active command/content area feel operational.
6. Ensure mobile does not overflow horizontally.

## Quick reference tokens

- dark terminal
- hard borders
- mono-heavy
- compact text
- believable TUI
- amber hover only
- keyboard-first
- command surface
- status strip
- no rounded dashboard cards
