# Mera Clinic - Brand Identity

## Brand Name

**Mera Clinic**

Urdu: میرا کلینک

### Meaning
"Mera" means "My" in Urdu/Hindi - representing personal ownership and care.

### Tagline

**English**: Your Digital Clinic Register

**Urdu**: آپ کے کلینک کا ڈیجیٹل رجسٹر

## Logo Design

### Concept
Medical cross composed of rounded modules forming a modern healthcare icon.

### Visual Specifications

```
┌─────────────────────────────┐
│        ┌───┐                │
│        │ + │                │
│    ┌───┼───┼───┐            │
│    │ + │ + │ + │            │
│    └───┼───┼───┘            │
│        │ + │                │
│        └───┘                │
└─────────────────────────────┘
```

### Color in Logo
- Primary: #2E7D32 (Green)
- Icon Gradient: #38C6A7 → #0F8B74

### Usage

| Context | Minimum Size | Background |
|---------|--------------|------------|
| Favicon | 16x16 | Transparent |
| App Icon | 32x32 | White |
| Header | 120x40 | Transparent |
| Print | 200x80 | White |

## Brand Style

| Attribute | Description |
|-----------|-------------|
| Modern | Clean, minimalist design with latest UI/UX patterns |
| Minimal | Less clutter, focus on essential elements |
| Trustworthy | Professional, reliable, secure |
| Medical | Healthcare-focused, clean, sterile feel |
| Mobile-first | Touch-friendly, responsive, app-like experience |

## Color Palette

### Primary Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| Primary | #2E7D32 | Main actions, headers, primary buttons |
| Primary Dark | #1B5E20 | Hover states, emphasis |
| Primary Light | #4CAF50 | Highlights, success states |

### Secondary Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| Secondary | #81C784 | Secondary buttons, tags, badges |
| Secondary Dark | #519657 | Secondary hover states |
| Secondary Light | #B2FAB4 | Secondary backgrounds |

### Accent Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| Accent | #1565C0 | Links, information, emphasis |
| Accent Dark | #003C8F | Accent hover |
| Accent Light | #5E92F3 | Accent backgrounds |

### Background Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| Background | #F7FAF8 | Page background |
| Surface | #FFFFFF | Cards, modals |
| Surface Alt | #F5F5F5 | Alternating rows |
| Border | #E0E0E0 | Borders, dividers |

### Semantic Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| Success | #2E7D32 | Success messages, positive states |
| Warning | #F57C00 | Warnings, attention needed |
| Error | #D32F2F | Errors, validation failures |
| Info | #1565C0 | Information, neutral notices |

### Icon Gradient

| Name | Hex Code | Usage |
|------|----------|-------|
| Gradient Start | #38C6A7 | Gradient icons, badges |
| Gradient End | #0F8B74 | Gradient icons, badges |

## Typography

### Primary Font: Inter

Used for: Headings, buttons, navigation, dashboard

| Style | Weight | Size | Line Height |
|-------|--------|------|--------------|
| H1 | 700 | 32px | 1.2 |
| H2 | 700 | 24px | 1.25 |
| H3 | 600 | 20px | 1.3 |
| H4 | 600 | 16px | 1.4 |
| Body | 400 | 14px | 1.5 |
| Small | 400 | 12px | 1.5 |
| Button | 500 | 14px | 1 |

### Urdu Font: Noto Nastaliq Urdu

Used for: Urdu translations, labels, user-facing Urdu content

| Style | Size |
|-------|------|
| Heading | 24px |
| Body | 16px |
| Small | 14px |

### Font CDN

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Layout

### Mobile-First Approach

- Design for mobile first, then scale up
- Touch targets minimum 44px
- Bottom navigation for mobile
- Sidebar navigation for desktop

### Responsive Breakpoints

| Name | Width | Description |
|------|-------|-------------|
| xs | < 640px | Mobile phones |
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

### App-Like Experience

- Bottom tab bar on mobile
- Pull-to-refresh
- Swipe gestures
- Native-feeling transitions
- Offline-friendly UI

## Spacing System

Based on 4px grid:

| Name | Value |
|------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |

## Border Radius

| Name | Value | Usage |
|------|-------|-------|
| sm | 4px | Inputs, small buttons |
| md | 8px | Cards, modals |
| lg | 12px | Large cards |
| full | 9999px | Pills, avatars |

## Shadows

| Name | Value | Usage |
|------|-------|-------|
| sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| md | 0 4px 6px rgba(0,0,0,0.1) | Cards |
| lg | 0 10px 15px rgba(0,0,0,0.1) | Modals, dropdowns |

## Animations

| Name | Duration | Usage |
|------|----------|-------|
| fast | 150ms | Hover states |
| normal | 200ms | Transitions |
| slow | 300ms | Page transitions |

## Direction Support

### LTR (Left-to-Right)
- English interface
- Standard layout

### RTL (Right-to-Left)
- Urdu interface
- Mirrored layout
- Proper text alignment

## Accessibility

- Color contrast ratio minimum 4.5:1
- Focus indicators visible
- Screen reader friendly
- Keyboard navigable
- Touch-friendly targets
