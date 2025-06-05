# Button Styles

This directory contains site-wide styles that can be used across the application.

## Button Standards

We've established a site-wide standard for buttons with consistent styling, padding, and hover effects.

### Usage

Import the button styles in your component:

```tsx
import buttonStyles from '../styles/buttons.module.scss';
```

Then apply the styles to your buttons:

```tsx
<Button className={buttonStyles.primary}>Primary Button</Button>
<Button className={buttonStyles.secondary}>Secondary Button</Button>
```

You can also combine with component-specific styles:

```tsx
<Button className={`${styles.myComponentButton} ${buttonStyles.primary}`}>
  Combined Styles
</Button>
```

### Available Button Styles

1. **Primary Button** (`buttonStyles.primary`)
   - Background color: Black (or theme primary color if using CSS variables)
   - Text color: White
   - Padding: 0.8rem 2rem
   - Font: Anton, sans-serif
   - Text transform: Uppercase
   - Border radius: 0
   - Letter spacing: 0.5px

2. **Secondary Button** (`buttonStyles.secondary`)
   - Background color: Transparent
   - Text color: Black (or theme primary color)
   - Border: 1px solid black (or theme primary color)
   - Padding: 0.8rem 2rem
   - Font: Anton, sans-serif
   - Text transform: Uppercase
   - Border radius: 0
   - Letter spacing: 0.5px

### Responsive Behavior

On smaller screens (max-width: 576px), buttons will have:
- Reduced padding: 0.7rem 1.5rem
- Smaller font size: 0.9rem

### Customization

To customize button colors based on theme, use CSS variables:

```css
:root {
  --primary-color: #fe5900;
  --primary-hover-color: #d94c00;
}
```

The button styles will automatically use these variables if available, with fallbacks to default colors.
