# Advanced Features Example

This example demonstrates advanced AcroSense features including custom colors, extended definitions, and mixed format usage.

## What's in this example?

- `acros.json` - Configuration showing:
  - Global default background color
  - Custom colors per acronym
  - Extended definitions with detailed explanations
  - Mixed string and object formats
- `sample.js` - Sample code demonstrating all features

## Features demonstrated

### 1. Global Default Color

Set a default highlight color for all acronyms using `bg` or `backgroundColor` at the root level:

```json
{
  "bg": "rgba(255, 255, 0, 0.3)"
}
```

All acronyms without their own color will use this default.

### 2. Custom Colors Per Acronym

Override the default color for specific acronyms:

```json
{
  "api": {
    "acro": "Application Programming Interface",
    "backgroundColor": "rgba(100, 200, 255, 0.3)"
  }
}
```

This is useful for:
- **Categorization**: Use different colors for different types of acronyms
- **Visual distinction**: Make important acronyms stand out
- **Team organization**: Different teams use different colors

### 3. Extended Definitions

Provide detailed explanations that appear in hover tooltips:

```json
{
  "api": {
    "acro": "Application Programming Interface",
    "definition": "A set of protocols, routines, and tools for building software applications. APIs define how different software components should interact."
  }
}
```

Extended definitions are helpful for:
- **Complex terms**: Acronyms that need more explanation
- **Context-specific meanings**: When the same acronym means different things
- **Educational purposes**: Helping new team members understand terminology

### 4. Mixed Formats

You can mix simple string format and object format in the same configuration:

```json
{
  "e2e": "End-to-End",
  "api": {
    "acro": "Application Programming Interface",
    "definition": "Extended definition here",
    "backgroundColor": "rgba(100, 200, 255, 0.3)"
  }
}
```

Use simple strings for basic acronyms and objects when you need additional features.

## Color format

Colors can be specified in several formats:

- **RGBA**: `"rgba(255, 255, 0, 0.3)"` (recommended for transparency)
- **RGB**: `"rgb(255, 255, 0)"` (opaque)
- **Hex**: `"#FFFF00"` or `"#FFFF0033"` (with alpha)
- **Named colors**: `"yellow"` (limited browser support)

The alpha channel (transparency) is recommended to avoid obscuring code.

## Best practices

### Color coding strategy

Organize colors by category:

```json
{
  "bg": "rgba(255, 255, 0, 0.3)",
  
  "api": { "acro": "...", "backgroundColor": "rgba(100, 200, 255, 0.3)" },  // APIs - Blue
  "rest": { "acro": "...", "backgroundColor": "rgba(100, 200, 255, 0.3)" },
  
  "ui": { "acro": "...", "backgroundColor": "rgba(255, 150, 200, 0.3)" },  // UI/UX - Pink
  "ux": { "acro": "...", "backgroundColor": "rgba(255, 150, 200, 0.3)" },
  
  "e2e": { "acro": "...", "backgroundColor": "rgba(150, 255, 150, 0.3)" }, // Testing - Green
  "unit": { "acro": "...", "backgroundColor": "rgba(150, 255, 150, 0.3)" }
}
```

### Definition length

Keep definitions concise but informative:
- **Too short**: `"definition": "An API"`
- **Good**: `"definition": "A set of protocols for building software applications"`
- **Too long**: Avoid paragraphs; use the acronym field for the short form

### When to use extended definitions

Use extended definitions for:
- Acronyms that might be ambiguous
- Terms that new team members might not know
- Domain-specific terminology
- Acronyms with multiple possible meanings

Use simple string format for:
- Well-known acronyms (API, UI, UX)
- Self-explanatory terms
- Acronyms used frequently and understood by the team

## Example use cases

### Use case 1: Team onboarding

Use extended definitions to help new team members:

```json
{
  "dto": {
    "acro": "Data Transfer Object",
    "definition": "An object that carries data between processes. In our codebase, DTOs are used to transfer data between the API layer and the service layer."
  }
}
```

### Use case 2: Visual organization

Use colors to visually group related acronyms:

```json
{
  "api": { "acro": "...", "backgroundColor": "rgba(100, 200, 255, 0.3)" },  // All API-related
  "rest": { "acro": "...", "backgroundColor": "rgba(100, 200, 255, 0.3)" },
  "graphql": { "acro": "...", "backgroundColor": "rgba(100, 200, 255, 0.3)" }
}
```

### Use case 3: Legacy code migration

Use different colors to distinguish old and new terminology:

```json
{
  "api": { "acro": "Application Programming Interface", "backgroundColor": "rgba(100, 200, 255, 0.3)" },
  "legacy_api": { "acro": "Legacy API", "backgroundColor": "rgba(200, 200, 200, 0.3)" }
}
```

