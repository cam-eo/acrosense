# Folder-Based Configuration Example

This example demonstrates organizing acronyms across multiple files in an `acros/` folder.

## What's in this example?

- `acros/` folder containing:
  - `common.json` - Common acronyms used across the project
  - `domain.json` - Domain-specific acronyms (API-related)
  - `testing.js` - Testing-related acronyms in JavaScript format
- `sample.js` - Sample code demonstrating how all merged acronyms work

## How it works

When AcroSense finds an `acros/` folder, it:
1. Reads all `.json`, `.js`, and `.ts` files in the folder
2. Merges them alphabetically by filename
3. Later files override earlier ones for duplicate keys
4. Uses the first file's `bg` or `backgroundColor` as the global default

## How to use

1. Create an `acros/` folder in your project root
2. Copy the example files into it
3. Open `sample.js` in VS Code
4. Hover over any of the acronyms to see their definitions

## When to use this method

- You have many acronyms and want to organize them by category
- Different team members maintain different acronym sets
- You want to mix JSON and JavaScript/TypeScript files
- You need to split acronyms for better maintainability
- You want to version control acronyms separately

## File organization strategies

**By domain:**
```
acros/
  ├── frontend.json
  ├── backend.json
  └── database.json
```

**By team:**
```
acros/
  ├── team-a.json
  ├── team-b.json
  └── shared.json
```

**By technology:**
```
acros/
  ├── api.json
  ├── testing.json
  └── infrastructure.json
```

## Merging behavior

Files are merged in alphabetical order. If `common.json` and `domain.json` both define `api`, the definition from `domain.json` will be used (since "domain" comes after "common" alphabetically).

To control merge order, use numbered prefixes:
```
acros/
  ├── 01-common.json    (loaded first)
  ├── 02-domain.json     (loaded second, can override common)
  └── 03-testing.json    (loaded third, can override both)
```

## Global default color

The first file's `bg` or `backgroundColor` becomes the global default. In this example, `common.json` sets `"bg": "rgba(255, 255, 0, 0.3)"`, which applies to all acronyms unless they specify their own color.

