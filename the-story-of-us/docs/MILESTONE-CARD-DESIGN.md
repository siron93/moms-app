# Milestone Card Design in Timeline

## Overview
Milestone cards in the timeline have two distinct layouts depending on whether they include a photo or not.

## 1. Milestone Card Without Photo
A compact card with:
- **Green background** (rgba(16, 185, 129, 0.08))
- **Milestone icon** from assets (48x48) on the left
- **Title and content** on the right
- Special data display (e.g., first word in quotes)

## 2. Milestone Card With Photo
A more prominent layout featuring:
- **Full-width photo** (240px height)
- **Floating milestone badge** overlay (top-right corner)
  - White circular background with shadow
  - Milestone icon inside (40x40)
- **Content section** below with green-tinted background
  - Larger title (24px, Playfair Bold)
  - Special data in highlighted container (e.g., first word)
  - Description text

## Special Milestone Features

### First Word
- Shows the actual word in a special quote container
- Larger font size (32px) with Caveat font
- Green-tinted background bubble

### Future Special Milestones
Can easily add special displays for:
- **First Steps**: Location, surface type
- **First Tooth**: Which tooth, symptoms
- **First Solid Food**: What food, reaction

## Visual Hierarchy
1. Photo milestones are most prominent
2. Special data (like first word) gets highlighted treatment
3. Regular milestones have subtle green styling
4. All milestone cards have date badges above them

## Technical Implementation
- Uses `OptimizedImage` component for smart local/cloud loading
- Milestone icons are imported from shared `milestoneImages.ts`
- Responsive layout adapts to content
- Shadow effects for depth and visual interest