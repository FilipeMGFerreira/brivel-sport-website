# Marketplace shared styles

Reusable variables and mixins for marketplace components. Use in component SCSS via `@use`.

## Usage

In any component under `presentation/`:

```scss
@use '../../styles/marketplace-shared' as mkt;  // from public/listing-list/
@use '../../styles/marketplace-shared' as mkt;   // from admin/listing-form/
@use '../styles/marketplace-shared' as mkt;     // from marketplace-shell/

:host {
  .my-input {
    @include mkt.mkt-input-base;
  }
  color: mkt.$mkt-accent;
}
```

## Contents

- **Variables**: `$mkt-accent`, `$mkt-accent-dark`, `$mkt-bg-dark`, `$mkt-bg-darker`, `$mkt-text-gray`, `$mkt-border`, `$mkt-radius`, `$mkt-radius-sm`, `$mkt-transition`
- **Mixins**: `mkt-input-base`, `mkt-card`, `mkt-btn-primary`, `mkt-btn-outline`, `mkt-badge`, `mkt-page-layout`, `mkt-section-heading`

Values align with `tailwind.config.js` so custom CSS stays consistent with Tailwind classes.
