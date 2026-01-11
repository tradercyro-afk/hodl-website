# Integrated Diamond Header - Customization Guide

## Structure Overview

The header consists of **three separate components**:

1. **Left pill segment** (rounded on left) - contains HOME, ABOUT, MEMES
2. **Center diamond** - contains logo
3. **Right pill segment** (rounded on right) - contains MISSION, CHART, COMMUNITY

These are laid out in a flex row with a small gap between them, creating the illusion of one integrated component.

---

## How to Adjust Diamond Size

**Location:** `styles.css` - `.nav-diamond`

```css
.nav-diamond {
    width: 100px;  /* Change this */
    height: 100px; /* Keep equal to width for perfect diamond */
}
```

**Important:** Keep width and height equal for a perfect diamond shape.

---

## How to Adjust Gap Between Pill Halves

**Location:** `styles.css` - `.integrated-header`

```css
.integrated-header {
    gap: 8px; /* Increase for more space, decrease for tighter fit */
}
```

**Recommended range:** 4px - 12px

---

## How to Replace the Logo Image

**Location:** `home.html` - diamond section

```html
<div class="nav-diamond">
    <a href="index.html" class="diamond-inner">
        <img src="YOUR_LOGO_HERE.png" alt="Your Logo">
    </a>
</div>
```

Replace `"HODL logo png.png"` with your image path.

---

## How to Adjust Logo Size Inside Diamond

**Location:** `styles.css` - `.diamond-inner img`

```css
.diamond-inner img {
    width: 68%;  /* Increase for larger logo, decrease for smaller */
    height: 68%; /* Keep equal to width */
}
```

**Recommended range:** 60% - 75%

---

## How to Change Border Thickness

**Location:** `styles.css` - both `.nav-segment` and `.diamond-inner`

```css
.nav-segment {
    border: 2px solid var(--neon); /* Change 2px to desired thickness */
}

.diamond-inner {
    border: 2px solid var(--neon); /* Must match nav-segment */
}
```

**Important:** Keep both border values identical for visual consistency.

---

## How to Adjust Glow Intensity

**Location:** `styles.css` - `.nav-segment` filter property

```css
.nav-segment {
    filter: drop-shadow(0 0 15px var(--neon-glow))    /* Inner glow */
            drop-shadow(0 0 30px rgba(9, 186, 242, 0.3)); /* Outer glow */
}
```

Increase pixel values for stronger glow, decrease for subtler effect.

---

## How to Change Colors

**Location:** `styles.css` - `:root` CSS variables

```css
:root {
    --neon: #09BAF2;                    /* Main cyan color */
    --neon-glow: rgba(9, 186, 242, 0.6); /* Glow effect */
    --neon-glow-strong: rgba(9, 186, 242, 0.8); /* Hover glow */
    --bg-dark: #020208;                  /* Dark background */
}
```

Change these values to update the entire theme.

---

## Mobile Responsiveness

On screens **< 768px**, the header automatically:
- Stacks vertically (column layout)
- Puts diamond at top
- Combines into single pill container
- Reduces all sizes proportionally

No additional configuration needed!

---

## Troubleshooting

### "Text overlaps diamond"
- Increase `.nav-segment--left` padding-right
- Increase `.nav-segment--right` padding-left

### "Gap too wide between pill halves"
- Decrease `.integrated-header` gap value

### "Diamond not aligned with pills"
- Diamond uses flexbox centering - check parent `.integrated-header` has `align-items: center`

### "Logo appears rotated/sideways"
- Logo uses `transform: rotate(-45deg)` to counter-rotate the diamond
- Ensure this transform is present on `.diamond-inner img`
