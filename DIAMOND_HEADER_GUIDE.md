# Diamond Gem Header - Customization Guide

## ✨ Overview
Your header now features a **true diamond gem silhouette** using CSS `clip-path` polygon, creating a classic gemstone outline with a flat top, angled shoulders, and pointed bottom.

---

## 🔧 Key Customizations

### 1. **Adjust Diamond Size**
Edit in `styles.css`:
```css
.diamond-gem {
    width: 110px;  /* Change this */
    height: 110px; /* Change this */
}
```
💡 Keep width and height similar for best proportions.

---

### 2. **Change Diamond Shape**
Edit the `clip-path` polygon points in `styles.css`:
```css
.gem-container {
    clip-path: polygon(
        20% 18%,  /* Top-left corner */
        80% 18%,  /* Top-right corner */
        100% 40%, /* Right shoulder */
        50% 100%, /* Bottom point */
        0% 40%    /* Left shoulder */
    );
}
```

**How to adjust:**
- **Flatter top:** Move top corners (18%) closer to 0%
- **Sharper point:** Move bottom point (100%) closer to 100%
- **Wider shoulders:** Increase shoulder x-values (0% and 100%)
- **Narrower diamond:** Bring top corners closer together (adjust 20% and 80%)

---

### 3. **Adjust Gap Between Pills and Diamond**
Edit in `styles.css`:
```css
.gem-header {
    gap: 12px; /* Change this value */
}
```
- **Smaller gap:** Use 8px for tighter spacing
- **Larger gap:** Use 16px for more breathing room

---

### 4. **Change Logo Image**
In `home.html`, replace the image source:
```html
<img src="HODL logo png.png" alt="HODL Logo" class="gem-logo">
```
Change `"HODL logo png.png"` to your new image path.

---

### 5. **Adjust Logo Size Inside Diamond**
Edit in `styles.css`:
```css
.gem-logo {
    width: 60%;  /* Change this */
    height: 60%; /* Change this */
}
```
- **Larger logo:** Use 70-75%
- **Smaller logo (more padding):** Use 50-55%

---

### 6. **Change Border Thickness**
Edit the first `inset` box-shadow in `styles.css`:
```css
.gem-container {
    box-shadow: 
        inset 0 0 0 2px var(--neon), /* Change the 2px value */
        /* ... other shadows ... */
}
```
- **Thicker border:** Use 3px or 4px
- **Thinner border:** Use 1px

---

### 7. **Adjust Glow Intensity**
Edit box-shadow values in `styles.css`:
```css
.gem-container {
    box-shadow: 
        inset 0 0 0 2px var(--neon),
        0 0 20px var(--neon-glow),      /* Outer glow - increase blur (20px) */
        0 0 40px rgba(9, 186, 242, 0.4), /* Extended glow */
        inset 0 0 30px rgba(9, 186, 242, 0.05); /* Inner glass effect */
}
```

**Brighter glow:**
```css
0 0 30px var(--neon-glow),
0 0 60px rgba(9, 186, 242, 0.6),
```

---

## 📱 Responsive Behavior

- **Desktop (>1024px):** Pills on left/right, diamond in center gap
- **Tablet (768-1024px):** Smaller diamond, reduced gap
- **Mobile (<768px):** Stacked vertically, diamond on top, single border container

---

## 🎨 Color Customization

All colors use CSS variables defined in `:root`:
```css
:root {
    --neon: #09BAF2;           /* Main cyan color */
    --neon-glow: rgba(9, 186, 242, 0.6);  /* Glow effect */
    --neon-glow-strong: rgba(9, 186, 242, 0.8); /* Hover glow */
    --bg-dark: #020208;        /* Dark background */
}
```

Change these values to customize your color scheme.

---

## ⚙️ Technical Notes

### Why clip-path instead of rotation?
- **True gem silhouette:** Creates the classic diamond outline with flat top and pointed bottom
- **Better control:** Adjust individual points for custom shapes
- **Cleaner integration:** No rotation math needed for inner content

### Border technique
Since `clip-path` clips borders, we use `box-shadow inset` to create the border effect:
```css
box-shadow: inset 0 0 0 2px var(--neon); /* Creates 2px border */
```

### Logo clipping
The logo is automatically clipped to the diamond bounds because it's inside a clipped container.

---

## 🚀 Quick Reference

| What to Change | Where | Default Value |
|----------------|-------|---------------|
| Diamond size | `.diamond-gem` | 110px × 110px |
| Diamond shape | `.gem-container clip-path` | 5-point polygon |
| Gap width | `.gem-header gap` | 12px |
| Logo size | `.gem-logo width/height` | 60% |
| Border thickness | `.gem-container inset shadow` | 2px |
| Glow intensity | `.gem-container box-shadow` | 20px blur |

---

**Created:** January 11, 2026  
**Header Type:** Gem Diamond with Clip-Path Polygon
