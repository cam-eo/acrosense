# TypeScript Configuration Example

This example demonstrates configuring AcroSense using a TypeScript file.

## What's in this example?

- `acros.ts` - A TypeScript file exporting acronym definitions using ES module default export
- `package.json` - Shows the required `ts-node` dependency
- `sample.ts` - Sample TypeScript code demonstrating how acronyms are highlighted

## Prerequisites

TypeScript configuration requires `ts-node` to be installed in your project:

```bash
npm install ts-node
# or
pnpm add ts-node
# or
yarn add ts-node
```

## How to use

1. Install dependencies: `npm install` (or `pnpm install`)
2. Copy `acros.ts` to your project root
3. Open `sample.ts` in VS Code
4. Hover over any of the acronyms to see their definitions

## When to use this method

- You're working in a TypeScript project
- You want type safety for your acronym definitions
- You prefer TypeScript's syntax and tooling
- You want to leverage TypeScript features like interfaces and types

## Export formats supported

AcroSense supports multiple TypeScript export formats:

**ES Module default export (this example):**
```typescript
export default {
  api: "Application Programming Interface"
};
```

**CommonJS export:**
```typescript
module.exports = {
  api: "Application Programming Interface"
};
```

**Named exports (merged):**
```typescript
export const common = {
  api: "Application Programming Interface"
};

export const testing = {
  e2e: "End-to-End"
};
```

## Type safety example

You can define interfaces for type safety:

```typescript
interface AcronymDefinition {
  acro: string;
  definition?: string;
  backgroundColor?: string;
}

const acronyms: Record<string, string | AcronymDefinition> = {
  api: "Application Programming Interface",
  e2e: {
    acro: "End-to-End",
    definition: "Testing methodology"
  }
};

export default acronyms;
```

## Troubleshooting

If you see an error about `ts-node` not being found:
- Make sure `ts-node` is installed in your project (not just globally)
- Check that your `package.json` includes `ts-node` in `devDependencies`
- Restart VS Code after installing `ts-node`

