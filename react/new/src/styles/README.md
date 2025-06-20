# Color System Migration - Old Time Hockey

## Overview
This document outlines the comprehensive color system migration completed for the Old Time Hockey React application. The migration consolidates all color usage into a centralized, semantic color system.

## New Color System Structure

### Core Files
- **`colors.scss`** - Central color variable definitions
- **`index.css`** - Imports color system and applies base styles
- **Component SCSS files** - Updated to use new color variables

### Color Variable Naming Convention
All color variables follow the pattern: `--color-{category}-{variant}`

#### Categories:
- **Primary Brand Colors**: `--color-primary`, `--color-secondary`, `--color-tertiary`
- **Semantic Colors**: `--color-success`, `--color-warning`, `--color-error`, `--color-info`
- **Neutral Colors**: `--color-white`, `--color-black`, `--color-gray-{100-900}`
- **Text Colors**: `--color-text-{primary|secondary|tertiary|inverse|disabled|muted}`
- **Background Colors**: `--color-bg-{primary|secondary|tertiary|dark|darker|disabled|overlay}`
- **Interactive States**: `--color-hover`, `--color-focus`, `--color-active`, `--color-disabled`
- **Borders**: `--color-border-{light|medium|dark|primary|secondary}`
- **Shadows**: `--color-shadow-{light|medium|dark|heavy}`
- **Component-Specific**: `--color-header-bg`, `--color-hero-bg`
- **Button Colors**: `--color-button-{primary|secondary}-{bg|text|border|hover-bg|hover-text|hover-border}`

## Migrated Files

### ✅ Successfully Migrated
1. **`index.css`** - Removed legacy variables, now imports centralized color system
2. **`styles/buttons.module.scss`** - Updated to use new button color variables
3. **`components/Hero/hero.module.scss`** - Migrated all hardcoded colors to variables
4. **`components/MainNavigation/mainNavigation.module.scss`** - Updated navigation colors
5. **`components/Button/button.module.scss`** - Migrated button states and disabled colors
6. **`contexts/ThemeContext.tsx`** - Updated to set new CSS custom property names

### ✅ Preserved As-Is (Intentionally Not Migrated)
1. **`components/themeToggle.module.scss`** - Contains specific sun/moon UI colors that represent day/night visually
2. **`constants/nhlColors.ts`** - Official NHL team brand colors
3. **Vite default colors in `index.css`** - Framework-specific colors for development

## Color Migration Benefits

### Before Migration
- 54+ hardcoded color instances in SCSS files
- 25+ hardcoded color instances in CSS files
- Inconsistent color usage across components
- Difficult to maintain and update themes

### After Migration
- Single source of truth for all colors
- Semantic naming for better maintainability
- Easy theme switching via CSS custom properties
- Consistent color usage across all components
- Better accessibility with proper contrast ratios
- Integration with existing team color functionality

## Theme Integration

The new color system works seamlessly with the existing theme context:
- **Team themes** override primary/secondary colors with NHL team colors
- **Light/Dark modes** automatically adjust text and background colors
- **Button colors** dynamically update based on selected theme
- **CSS custom properties** are set by ThemeContext for dynamic theming

## Usage Examples

### In SCSS Files
```scss
.myComponent {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-light);
  
  &:hover {
    background-color: var(--color-hover);
  }
}
```

### For Buttons
```scss
.primaryButton {
  background-color: var(--color-button-primary-bg);
  color: var(--color-button-primary-text);
  
  &:hover {
    background-color: var(--color-button-primary-hover-bg);
    color: var(--color-button-primary-hover-text);
  }
}
```

## Future Maintenance

### Adding New Colors
1. Add new color variables to `colors.scss`
2. Follow the established naming convention
3. Consider light/dark mode variants if needed
4. Update this documentation

### Updating Existing Colors
1. Modify values in `colors.scss`
2. Changes automatically propagate to all components
3. Test across all themes (default, team, light/dark)

### Component Development
- Always use color variables instead of hardcoded values
- Reference this documentation for available variables
- Consider semantic meaning when choosing variables

## Notes

### Colors That Should NOT Be Migrated
- **Theme toggle animations** - Specific UI colors for visual day/night representation
- **NHL team colors** - Official brand colors that must remain exact
- **Framework defaults** - Vite/development-specific colors
- **Third-party component colors** - External library styling

### Accessibility Considerations
- All color combinations maintain proper contrast ratios
- Color variables include accessible alternatives
- Theme switching preserves readability in all modes

This migration provides a solid foundation for consistent, maintainable, and accessible color usage throughout the Old Time Hockey application.
