# UI/UX Style Guide: Israeli Election App

This style guide defines the visual language, design system tokens, and interactive guidelines for the Israeli Election App. The visual direction is based on a **Clean Neo-Brutalist** aesthetic ("The Ballot Box"), balancing editorial objectivity with a highly interactive, tactile soul.

---

## 1. Visual Philosophy & Design Principles

*   **Objective Clarity**: Strict grids, readable typography, and structured layouts represent the platform's non-partisan, objective stance.
*   **Tactile Feedback (The Soul)**: Micro-animations, responsive hover shifts, and layered depth make the interface feel alive and interactive.
*   **Geometric Boldness**: Solid borders, strong offset shadows, and structural divisions.
*   **NO Emojis (Visual Purity)**: NO EMOJIS UNLESS I SAY SO. Emojis clash with the clean editorial typography and the objective design language. Instead, use clean SVG icons, CSS styling, or simple monochrome text-based typography symbols (like `✕` or `✓`) only when strictly necessary.

---

## 2. Color Palette

*   **Primary Background**: Cream / Off-White (`#F8F7F3`)
    *   Creates a warm, editorial, book-like paper background instead of a clinical cold white.
*   **Primary Text & Borders**: Deep Charcoal / Ink Black (`#121212`)
    *   Used for all text, component borders, and solid shadows.
*   **Primary Accents**:
    *   **Electric Cyan (`#00E5FF`)**: High-priority interactive elements, highlights, and selection indicators.
    *   **Vibrant Cobalt (`#2979FF`)**: Secondary interactive states, buttons, and neutral action categories.
*   **Alert / Critical Accent**:
    *   **Coral Red (`#FF5252`)**: Warning states, errors, or clashing stance indicators.

---

## 3. Typography

To accommodate bilingual layouts (Hebrew & English) and match the artsy, neo-brutalist character of the application, we use a custom **Vintage Slab & Serif** typography pairing:

*   **Headings (Display)**: `Suez One` (Hebrew) / `Fraunces` (English)
    *   *Character*: A chunky, heavy, print-press styling combining Suez One (Hebrew slab-serif) and Fraunces (soft English newspaper serif). Gives the headers a retro poster and newspaper feel.
*   **Body & UI Text**: `Heebo` (Hebrew) / `Outfit` (English)
    *   *Character*: Highly readable, modern, friendly geometric sans-serif that balances the heavy header fonts.
*   **UI Metadata & Labels**: `Space Mono` (Monospace)
    *   *Character*: Clean monospace used for button text, numbers, metrics, and metadata labels.

---

## 4. Components & Styling Tokens

### Borders
*   Main Cards/Containers: `3px solid #121212`
*   Small Inputs/Badges: `2px solid #121212`
*   Border Radius: `0px` (sharp, geometric) or `4px` (subtle softening, but maintaining a blocky structure).

### Dotted Background Grid Pattern
A subtle, spaced dot pattern applied to major page containers or section headers to give texture without cluttering content:
```css
.dotted-background {
  background-color: #F8F7F3;
  background-image: radial-gradient(#121212 1px, transparent 1px);
  background-size: 24px 24px;
}
```

### Shadows & Dotted Shadows
Neo-brutalist offset shadows are typically solid, but dotted halftone shadows are used on primary buttons or main feature cards to add graphic character.
*   **Solid Offset Shadow**:
    ```css
    .box-shadow-solid {
      box-shadow: 6px 6px 0px 0px #121212;
    }
    ```
*   **Dotted / Halftone Pattern Shadow**:
    Implemented using a background-image linear/radial gradient fallback, or an inline SVG mask layer to create a retro print halftone effect behind floating components.
*   **Tactile Hover State**:
    When hovering over a card or button, it shifts offset and the shadow adapts, giving a physically clickable feeling:
    ```css
    .interactive-card {
      transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      transform: translate(0px, 0px);
      box-shadow: 6px 6px 0px 0px #121212;
    }
    .interactive-card:hover {
      transform: translate(-3px, -3px);
      box-shadow: 9px 9px 0px 0px #121212;
    }
    ```

---

## 5. UI Elements Layout Rules

*   **Quiz Flow**: 
    *   **Structure**: A tactile, center-aligned card deck stack showing the current question card on top, with offset edges behind it to indicate a stack of upcoming questions.
    *   **Top Card Contents**:
        *   **Header**: Monospace metadata displaying the question count (e.g., `QUESTION 3 OF 12`) and a high-contrast category badge (e.g., `SECURITY & DEFENSE` with a background of `#00E5FF` electric cyan).
        *   **Body**: Bold, editorial-style question text using modern sans-serif typography.
        *   **Choices**: A vertical stack of pill/box options. The active/hovered choice button is filled with electric cyan (`#00E5FF`) and offset with a thick solid black shadow (`box-shadow: 4px 4px 0px #121212`).
    *   **Animations**: Fluid transition as cards are answered (sliding/swiping off-screen or fading out to reveal the next card in the stack).
*   **Result Screen**: Clean top section displaying the closest matched party. Below it, a split screen with a two-column grid showing aligned agendas on one side and misaligned agendas on the other.
*   **Language Switcher**:
    *   **Layout Stability**: Language switcher buttons must stay in a fixed, stable location (e.g. absolutely positioned header container or rigid dimensions) and must never shift, resize, or move when the user toggles the language.

---

## 6. Information Architecture & Content Distribution

*   **Single Element per Info-Point**: To avoid redundancy and visual clutter, each key information point or identifier (such as the application title or main headings) must appear only once on any given view or screen.
    *   *Example*: If the application title `"Elections 2026: Stance Alignment"` is displayed in the sticky header, it must not be repeated inside the welcome/main menu card on the same page. A distinct welcoming header should be used instead.

