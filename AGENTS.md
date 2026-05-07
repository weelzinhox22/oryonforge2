<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-rules -->
# IMPORTANT: NEXT.JS VERSION RULES

This project uses a newer version of Next.js with breaking changes and updated conventions.

Before writing code:
- Read relevant docs inside:
  `node_modules/next/dist/docs/`
- Respect deprecations.
- Prefer modern App Router patterns.
- Avoid legacy APIs and outdated conventions.

<!-- END:nextjs-agent-rules -->

# ORYON FORGE — PRODUCT & DESIGN RULES

━━━━━━━━━━━━━━━━━━━
1. PRODUCT VISION
━━━━━━━━━━━━━━━━━━━

ORYON FORGE is a mobile-first fitness social platform.

Users:
- join challenges
- track activities
- accumulate points
- compare rankings
- monitor progress

The application should feel:
- modern
- clean
- premium
- organized
- realistic

The product must resemble:
- Strava
- WHOOP
- Nike Run Club
- Nike Training Club

Avoid:
- futuristic cyberpunk aesthetics
- gamer interfaces
- exaggerated UI concepts
- Dribbble-style overdesign

The priority is:
REAL PRODUCT EXPERIENCE.

━━━━━━━━━━━━━━━━━━━
2. COLOR SYSTEM
━━━━━━━━━━━━━━━━━━━

ONLY use these colors:

### Background
- `#000000`

### Primary Accent
- `#CCCC00`

### Primary Text
- `#F0F0F6`

### Secondary Text
- `#606070`

NEVER introduce:
- green neon
- blue accents
- purple accents
- random vibrant colors

The visual identity is:
BLACK + GOLD ONLY.

━━━━━━━━━━━━━━━━━━━
3. DESIGN PRINCIPLES
━━━━━━━━━━━━━━━━━━━

The interface must prioritize:
- clarity
- spacing
- readability
- usability
- hierarchy

The UI should feel:
- calm
- confident
- premium
- intentional

Avoid:
- excessive glow
- excessive gradients
- too many badges
- exaggerated effects
- overdecorated layouts

Less effects.
More product.

━━━━━━━━━━━━━━━━━━━
4. MOBILE-FIRST RULES
━━━━━━━━━━━━━━━━━━━

The application is primarily used on mobile devices.

All screens must:
- feel like native apps
- use realistic mobile spacing
- avoid dead space
- maintain natural scrolling

Avoid:
- centered landing-page layouts
- giant empty sections
- oversized hero areas

━━━━━━━━━━━━━━━━━━━
5. LAYOUT & HIERARCHY
━━━━━━━━━━━━━━━━━━━

Every screen should contain:
- clear primary action
- organized sections
- strong visual hierarchy
- consistent spacing

The eye flow should naturally guide:
1. Main information
2. Secondary information
3. Actions

Do not overload the interface.

━━━━━━━━━━━━━━━━━━━
6. TYPOGRAPHY
━━━━━━━━━━━━━━━━━━━

Use:
- Rajdhani

Headers:
- uppercase
- bold
- subtle letter spacing

Do not exaggerate typography sizes.

━━━━━━━━━━━━━━━━━━━
7. COMPONENT RULES
━━━━━━━━━━━━━━━━━━━

Components must:
- be reusable
- feel consistent
- follow the same spacing system
- use consistent border radius

Cards should:
- be simple
- clean
- easy to scan
- information-focused

Avoid:
- cards inside cards
- unnecessary complexity
- decorative overload

━━━━━━━━━━━━━━━━━━━
8. BUTTON RULES
━━━━━━━━━━━━━━━━━━━

Primary buttons should:
- stand out clearly
- use gold accent
- feel tactile
- be easy to identify

Avoid:
- giant floating buttons
- excessive shadows
- exaggerated glow

━━━━━━━━━━━━━━━━━━━
9. ICONOGRAPHY
━━━━━━━━━━━━━━━━━━━

Icons must be:
- minimal
- modern
- consistent
- outline-based when possible

Avoid:
- random icon styles
- generic gamer symbols
- decorative icon overload

━━━━━━━━━━━━━━━━━━━
10. TERMINOLOGY STANDARDS (MANDATORY)
━━━━━━━━━━━━━━━━━━━

1. **NO GAMIFICATION TERMS**: NEVER use terms like "guerreiros", "forjar", "forja", "batalha", or any medieval/fantasy metaphor.
2. **COMMON LANGUAGE**: Use normal, professional, and direct language. Use "usuários", "membros", "criar grupo", "plataforma", "desafio", etc.

Language should be:
- direct
- modern
- professional

━━━━━━━━━━━━━━━━━━━
11. MOTION RULES
━━━━━━━━━━━━━━━━━━━

Animations should be:
- subtle
- smooth
- functional

Use:
- soft transitions
- hover states
- press feedback

Avoid:
- exaggerated animations
- distracting movement
- cartoon motion

━━━━━━━━━━━━━━━━━━━
12. FIDELITY RULES
━━━━━━━━━━━━━━━━━━━

When the USER provides a screenshot:

- prioritize fidelity
- preserve hierarchy
- preserve spacing logic
- preserve composition

Do not reinterpret the layout unless explicitly requested.

━━━━━━━━━━━━━━━━━━━
13. CODE QUALITY
━━━━━━━━━━━━━━━━━━━

Generated code must:
- be production-ready
- be componentized
- use clean architecture
- avoid duplicated UI logic
- maintain consistency

Use:
- reusable components
- organized Tailwind classes
- scalable structure

━━━━━━━━━━━━━━━━━━━
14. FINAL QUALITY STANDARD
━━━━━━━━━━━━━━━━━━━

Every screen must feel:
- realistic
- clean
- premium
- production-ready

The application should look like:
“a real fitness product used daily by real users.”

━━━━━━━━━━━━━━━━━━━
15. DATABASE RULES
━━━━━━━━━━━━━━━━━━━

The base schema lives in:
- `supabase/schema.sql`

This file is the FOUNDATION.
NEVER overwrite or modify it.

When adding new features:
- Create a SEPARATE migration file in `supabase/migrations/`
- Name format: `YYYYMMDD_description.sql`
- Example: `20260506_add_activity_rules.sql`

Each migration must:
- be self-contained
- use IF NOT EXISTS / IF EXISTS when safe
- include comments explaining what it adds
- not break existing data

The `bancodedados.sql` file is the
reference documentation for the DB structure.
Keep it updated when schema changes.