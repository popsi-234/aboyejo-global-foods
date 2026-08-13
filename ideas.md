# Aboyejo Global Foods — Design Direction

## Source findings

The supplied archive contains 16 tall PNG screenshots rather than isolated product photographs. The strongest visual cues are an ivory paper-like base, deep forest-green feature panels, high-contrast serif headlines, compact uppercase navigation, subtle gold accents, rounded image frames, and editorial sectioning with generous whitespace. The screenshots are treated as visual reference material; the final site will use generated supporting imagery and only the supplied assets that remain useful as authentic visual proof, rather than placing full-page screenshots into the content.

The reviewed reference screens reinforce a light editorial commerce layout with a forest-green navigation state, rounded hero imagery, simple product shelves, and occasional full-width green story bands. A few embedded food and souvenir photographs can be cropped from the supplied screens and reused as supporting gallery moments; the screenshots themselves will not be shown as hero content.

## Three initial approaches

### Theme Name: Quiet Harvest Editorial
Very Brief Intro: A warm, high-end editorial system for a family food brand: tactile surfaces, serif storytelling, and calm product confidence. It makes premium feel human rather than glossy.
Probability: 0.08

### Theme Name: Market Table Modernism
Very Brief Intro: A brighter, more conversational direction built around modular product labels, cropped market photography, and energetic blocks of color. It would feel approachable and contemporary.
Probability: 0.04

### Theme Name: Botanical Archive
Very Brief Intro: A heritage-led visual language pairing restrained botanical linework with museum-like captions and archival pacing. It would emphasize provenance and occasion over commerce.
Probability: 0.06

## Selected approach: Quiet Harvest Editorial

### Design Movement
Contemporary African editorial minimalism, borrowing the discipline of Swiss-style publishing and the tactility of independent food magazines without copying any existing brand or publication.

### Core Principles
1. **Warm restraint:** Keep the palette quiet and let material, copy, and photography carry the emotion.
2. **Narrative asymmetry:** Use split compositions, offset cards, and side rails rather than a centered stack of identical modules.
3. **Proof over polish:** Present the food, packaging, and process plainly; premium comes from editing, spacing, and craft.
4. **Purposeful texture:** Use fine rules, paper grain, and controlled glass surfaces sparingly so the interface feels made, not decorated.

### Color Philosophy
Deep forest green is the grounding color: it signals trust, leaves, and the calm of a family-run pantry. Warm cream and ivory create the paper-like field where the story can breathe. Natural beige keeps product imagery honest, charcoal protects readability, and muted gold appears only as a small harvest note for warmth and distinction. The ownable signature color is **Aboyejo Forest — `#0A3B2E`**.

### Layout Paradigm
An editorial journey with a wide reading rail and a secondary margin rail for chapter markers, sizes, and micro-labels. Hero and story sections use asymmetric 5/7 splits, while products sit in a staggered shelf instead of a uniform card grid. Full-bleed green interruptions reset pace between light sections.

### Signature Elements
1. Fine hairline rules with small uppercase chapter labels such as `01 / THE GRAIN`.
2. A recurring gold harvest line that underlines emphasis and becomes a progress motif near the story rail.
3. Softly rounded image windows paired with quiet, caption-like metadata rather than loud badges.

### Interaction Philosophy
Interactions should feel like turning a page or lifting a pouch from a shelf: a little depth, a short glide, and a clear response. Hover states reveal one useful detail; buttons press with a small physical scale change; mobile interactions stay direct and thumb-friendly.

### Animation
Use Framer Motion for short scroll reveals, staggered product entrances, image mask reveals, and small parallax shifts on the hero image. Keep movement under 300ms where possible, use opacity and transform only, and disable non-essential motion under `prefers-reduced-motion`. Avoid loops except for a barely perceptible floating grain mark in the hero.

### Typography System
Use **Cormorant Garamond** for display headlines, chapter titles, and italic emphasis; use **DM Sans** for body copy, labels, navigation, buttons, and product metadata. Display type should be large and breathable, body text should sit around 16–18px on desktop and 15–16px on mobile, and uppercase labels should use generous tracking rather than heavier weight.

### Brand Essence
Aboyejo Global Foods is premium Garri Ijebu and custom celebration packaging for people who want Nigerian food heritage to arrive with care, clarity, and modern presence. **Warm, exacting, rooted.**

### Brand Voice
Headlines are short, sensory, and assured. CTAs are direct without sounding transactional. Microcopy should explain the next step plainly and never invent proof points, prices, awards, locations, or testimonials.

Example lines:

> Made for the pantry. Remembered at the table.

> Pack the occasion with something people already love.

### Wordmark & Logo
Use a restrained `Aboyejo Global` wordmark set in Cormorant Garamond, paired with a bold abstract grain-and-woven-loop mark. The mark should work alone in the mobile header and favicon; the wordmark should remain typographic and never be converted into a generated image.

### Signature Brand Color
**Aboyejo Forest — `#0A3B2E`**
