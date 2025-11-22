# Nested Scoping Example

This example demonstrates how AcroSense handles nested configuration scoping, allowing different parts of your codebase to use different acronym sets.

## What's in this example?

- `acros.json` - Root configuration with project-wide acronyms
- `src/acros.json` - Nested configuration with source code-specific acronyms
- `src/utils.js` - File in `src/` directory using `src/acros.json`
- `tests/test.js` - File in `tests/` directory using root `acros.json`

## How scoping works

AcroSense searches for configuration files in this order:

1. **Workspace folders** - Checks all workspace root directories first
2. **Document directory** - Searches up from the current file's directory to the workspace root

The **closest configuration to your document** takes precedence. This means:
- Files in `src/` use `src/acros.json` (if it exists)
- Files in `tests/` use root `acros.json` (since there's no `tests/acros.json`)
- Files at the root use root `acros.json`

## How to use

1. Copy the folder structure to your project
2. Open `src/utils.js` in VS Code - hover over acronyms to see they use `src/acros.json`
3. Open `tests/test.js` in VS Code - hover over acronyms to see they use root `acros.json`

## When to use nested scoping

- **Domain separation**: Different parts of your codebase use different terminology
- **Team organization**: Different teams maintain their own acronym sets
- **Project structure**: You want project-wide acronyms plus module-specific ones
- **Legacy code**: Different parts of the codebase have different naming conventions

## Example scenarios

### Scenario 1: Frontend vs Backend

```
project/
  ├── acros.json              (shared: api, ui, ux)
  ├── frontend/
  │   ├── acros.json          (frontend: react, vue, angular)
  │   └── components.js        (uses frontend/acros.json)
  └── backend/
      ├── acros.json          (backend: orm, dto, repo)
      └── services.js         (uses backend/acros.json)
```

### Scenario 2: Monorepo with multiple packages

```
monorepo/
  ├── acros.json              (shared across all packages)
  ├── packages/
  │   ├── web/
  │   │   ├── acros.json      (web-specific)
  │   │   └── app.js          (uses web/acros.json)
  │   └── api/
  │       ├── acros.json      (api-specific)
  │       └── server.js       (uses api/acros.json)
```

### Scenario 3: Override specific acronyms

```
project/
  ├── acros.json              (api: "Application Programming Interface")
  └── legacy/
      ├── acros.json          (api: "Automated Process Integration")
      └── old-code.js         (uses legacy/acros.json with different meaning)
```

## Important notes

- **No inheritance**: Nested configs don't inherit from parent configs. If you want both root and nested acronyms, you must include them in the nested config.
- **One config per directory**: Only one configuration type can exist per directory level (acros.json OR acros.js OR acros.ts OR acros/ folder).
- **Search stops at first match**: Once a config is found, the search stops. It doesn't continue to look for parent configs.

## Combining root and nested acronyms

If you want files in `src/` to have access to both root and nested acronyms, you can:

1. **Copy root acronyms to nested config** (simple but requires maintenance)
2. **Use folder-based config** with a shared file:
   ```
   src/
     └── acros/
         ├── shared.json      (imported from root)
         └── domain.json      (src-specific)
   ```

