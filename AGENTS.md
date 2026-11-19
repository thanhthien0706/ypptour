# UI/UX & FRONTEND DESIGN DIRECTIVES (ANTI-AI AESTHETIC)

When generating UI/UX or frontend code, strictly avoid generic "AI-generated" design patterns (Tailwind slop). Design with the intentionality, restraint, and visual hierarchy of a senior human product designer.

## 1. STRICT PROHIBITIONS (NEVER DO THIS)
- **Color Clichés:** NEVER use default indigo/purple/violet gradients (`from-indigo-500 to-purple-600`), neon cyan glows, or pure `#000000` / `#FFFFFF` backgrounds unless explicitly requested.
- **Emoji Abuse:** NEVER use emojis (🚀, ✨, 💡, 🔥, etc.) as UI icons, bullet points, or section badges. Use clean, uniform SVG icon libraries (e.g., Lucide, Phosphor) with consistent stroke width (`1.5px` or `2px`).
- **Cookie-Cutter Layouts:** NEVER default to repetitive 3-column symmetrical card grids with centered text (`text-center`) for every section.
- **Generic Copywriting:** NEVER use AI buzzwords in placeholder text ("Elevate", "Unleash", "Revolutionize", "Next-Gen", "Seamless", "Empower", "Delve"). Write realistic, concise, domain-specific copy.
- **Over-decoration:** Do not put glassmorphism (`backdrop-blur`), heavy drop shadows (`shadow-xl`), or gradient borders on every container.

## 2. HUMAN-CENTRIC DESIGN PRINCIPLES
- **Intentional Color Palette:** Use a restrained, cohesive palette: a subtly tinted neutral background (e.g., warm off-white `#F9F8F6` or deep charcoal `#111215`), high-contrast ink for primary text, muted slate for secondary text, and ONE deliberate accent color used sparingly for primary CTAs and active states.
- **Typographic Hierarchy:** Pair fonts thoughtfully (e.g., editorial Serif or geometric Display font for headings + clean Sans-serif for body + Monospace for data/tags). Apply tight tracking (`-0.02em` to `-0.03em`) on large headings and generous line-height (`1.6`) on body text. Left-align body copy for readability.
- **Visual Rhythm & Asymmetry:** Vary section structures. Mix editorial split-layouts (text left, visual right), structured Bento grids with varied spans, and clean typographic lists. Use generous whitespace (padding/margins) to let elements breathe.
- **Subtle Craft & Borders:** Prefer crisp `1px` subtle borders (`border-black/10` or `border-white/10`) and soft, multi-layered ambient shadows over heavy default shadows. Maintain concentric border-radius logic (outer container radius > inner element radius).
- **Tactile Micro-interactions:** Include thoughtful `:hover`, `:active`, and `:focus-visible` states (subtle border shifts, slight translate, or crisp color transitions) rather than bouncy, exaggerated animations.

## 3. PRE-OUTPUT SELF-CRITIQUE
Before finalizing any UI code, verify:
1. Does this look like a real, handcrafted brand product rather than a generic SaaS template?
2. Is every visual element (border, shadow, icon, gradient) serving a functional hierarchy purpose?
3. Are the spacing, alignment, and contrast ratios comfortable for human eyes?
