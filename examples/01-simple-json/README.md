# Simple JSON Configuration Example

This example demonstrates the simplest way to configure AcroSense using a JSON file.

## What's in this example?

- `acros.json` - A simple JSON file with acronym definitions using the string format
- `sample.js` - Sample code demonstrating how acronyms are highlighted and shown on hover

## How to use

1. Copy `acros.json` to your project root
2. Open `sample.js` in VS Code
3. Hover over any of the acronyms (api, bc, e2e, wc, ui, ux) to see their definitions

## When to use this method

- You want the simplest possible configuration
- Your acronyms are static and don't need dynamic generation
- You prefer JSON for its simplicity and readability
- You don't need TypeScript type checking for your acronyms

## Acronym format

In this example, acronyms are defined as simple key-value pairs:

```json
{
  "api": "Application Programming Interface"
}
```

This is equivalent to the object format:
```json
{
  "api": {
    "acro": "Application Programming Interface"
  }
}
```

