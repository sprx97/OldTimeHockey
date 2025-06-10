# Styling Guidelines

This directory contains site-wide styles that can be used across the application.

## Styling Approach

Our project uses a combination of styling approaches, with a preference for CSS Modules. Here are the guidelines for using each approach:

### 1. CSS Modules (Preferred)

CSS Modules provide scoped styling with locally scoped class names, preventing style conflicts between components.

- Use CSS Modules for component-specific styling
- Name your CSS Module files with the `.module.scss` extension
- Place component-specific modules alongside the component (e.g., `ComponentName/componentName.module.scss`)
- Place shared modules in the `styles` directory

Example:
```tsx
import styles from './componentName.module.scss';

function MyComponent() {
  return <div className={styles.container}>Content</div>;
}
```

### 2. Dynamic Styling with CSS Variables

For theme-dependent styling, use CSS variables defined in `:root` or through the theme context.

- Define global CSS variables in `index.css`
- Access them in your CSS modules with `var(--variable-name)`
- For truly dynamic values, use inline styles with values from the theme context

Example:
```scss
.button {
  background-color: var(--primary-color, #fe5900);
}
```

### 3. Inline Styles (Limited Use)

Inline styles should be used only for truly dynamic properties that can't be handled by CSS variables or conditional classes.

- Limit inline styles to properties that change based on component state or props
- Prefer conditional classes over inline styles when possible
- When using inline styles, extract complex style objects into useMemo hooks

Example:
```tsx
<div 
  className={styles.container} 
  style={{ backgroundColor: getThemeColor() }}
>
  Content
</div>
```

### 4. Mantine UI Styling

When using Mantine UI components, follow these guidelines:

- Use the `styles` prop for consistent styling of Mantine components
- Define common Mantine component styles in the theme provider
- Use CSS Modules for custom styling of Mantine components when possible

Example:
```tsx
<Button
  className={styles.button}
  styles={{
    root: {
      backgroundColor: theme.colors.primary,
    },
  }}
>
  Click Me
</Button>
```

## Shared Style Components

### Button Standards

We've established a site-wide standard for buttons with consistent styling, padding, and hover effects.

#### Usage

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

#### Available Button Styles

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

#### Responsive Behavior

On smaller screens (max-width: 576px), buttons will have:
- Reduced padding: 0.7rem 1.5rem
- Smaller font size: 0.9rem

#### Customization

To customize button colors based on theme, use CSS variables:

```css
:root {
  --primary-color: #fe5900;
  --primary-hover-color: #d94c00;
}
```

The button styles will automatically use these variables if available, with fallbacks to default colors.
