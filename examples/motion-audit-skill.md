### Publish on SKL (fill `/new` with these)

| Field | Value |
| --- | --- |
| **Title** | Motion audit: find bad UI motion |
| **Slug** | *(optional — leave blank to auto-generate)* |
| **Summary** | Step-by-step pass to spot janky animation, layout thrashing, and accessibility issues in a web app, with concrete fixes. |
| **Tags** | motion, animation, accessibility, performance, css, framer-motion |
| **Category** | design |
| **Version** | 1.0.0 |

Paste everything **from the next heading down** into the skill editor as the main markdown (or delete this section after copying).

---

# Motion audit: find bad UI motion

Use this skill on a **web app codebase** (React/Next/Vue/vanilla). Goal: list what’s wrong with **motion** and **how to fix it**—not to redesign the product.

## 1. Map where motion lives

Search the repo for:

- `framer-motion`, `motion`, `animate`, `transition`, `keyframes`, `@keyframes`
- `requestAnimationFrame`, `setInterval` that touch the DOM
- CSS: `transform`, `opacity`, `filter`, `width`, `height`, `top`, `left`, `margin`, `box-shadow` in transitions

Write down **each animated surface** (modal, drawer, page transition, hover, list reorder).

## 2. Accessibility: reduced motion

- Ensure **`prefers-reduced-motion`** is respected (CSS `@media (prefers-reduced-motion: reduce)` or JS `matchMedia`).
- If using Framer Motion: provide **`reducedMotion="user"`** (or equivalent) on the root `MotionConfig`, or disable non-essential motion when the query matches.

**Bad:** Animations always run at full strength.  
**Fix:** Swap to instant or cross-fade; shorten durations; remove parallax.

## 3. Performance: what not to animate

Animating these on every frame often **hurts** (layout/paint):

- `width`, `height`, `top`, `left`, `right`, `bottom`
- `margin`, `padding`, `border`
- `box-shadow`, `filter` (heavy blurs)

**Prefer:** `transform` (e.g. `translate`, `scale`) and `opacity` for movement and fades.

**Bad:** Transitioning `height` for an accordion on large content.  
**Fix:** `transform: scaleY` on a wrapper with `overflow: hidden`, or CSS `grid-template-rows` 0fr→1fr pattern, or measure once and animate max-height in a controlled way.

## 4. Layout thrashing

**Bad:** In a scroll or rAF loop: read `offsetHeight` / `getBoundingClientRect`, then write styles, repeat many times per frame.

**Fix:** Batch reads, then writes; use **`transform`** for scroll-linked effects; avoid synchronous layout reads inside hot paths.

## 5. React / Framer Motion specifics

- **`layout`** / **`layoutId`**: can be expensive on big trees; use only where shared-element transitions are worth the cost.
- **`AnimatePresence`**: ensure **stable `key`s**; avoid mounting hundreds of motion nodes at once.
- Prefer **`initial` / `animate`** with **`will-change: transform, opacity`** sparingly; remove `will-change` after animation ends if possible.

## 6. CSS transitions

- Keep durations **short** for UI chrome (often **150–300ms**); avoid >500ms for hovers unless intentional.
- Use **`ease-out`** for things entering the viewport; **`ease-in`** for exits (or a single custom cubic-bezier).

## 7. Output format (what you produce)

Deliver:

1. **Inventory** — list of animated UI pieces and files/lines (approximate).
2. **Issues** — each with **severity** (blocker / major / minor).
3. **Fixes** — concrete change (e.g. “replace `transition: height` with …”).
4. **Verify** — how to confirm (Chrome Performance panel, `prefers-reduced-motion` test, Lighthouse).

Stay factual; if the repo doesn’t use Framer Motion, don’t invent it—stick to what you find.
