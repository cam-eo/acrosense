# 🧠 AcroSense — See Through the Jargon

**AcroSense** is a VS Code extension that highlights acronyms (or anything you want really...) in your code and shows their meaning instantly on hover.

![Demo](images/acrosense-demo.gif)

## 🚀 Quick Start

1. Install from the VS Code Marketplace (once published).
2. Add an `acros.json` file at your project root:
   ```json
   {
     "api": "Application Programming Interface",
     "bc": "Best Case",
     "e2e": "End-to-End"
   }
   ```
3. Hover over any acronym inside your code to view its definition.

## ⚙️ Features

- Hover tooltips for any acronym in your project-defined glossary
- Automatic reload on save of configuration files
- Clean, subtle inline highlighting
- Works across all VS Code languages
- Support for JSON, JavaScript, TypeScript, and folder-based configurations
- Nested scoping for project-specific acronyms

## 📝 Configuration Methods

AcroSense supports multiple ways to define your acronyms. The extension searches for configuration files in the following priority order:

1. **`acros/` folder** (highest priority)
2. **`acros.json`**
3. **`acros.js`**
4. **`acros.ts`** (lowest priority)

Only one configuration type should exist per directory level. If multiple are found, AcroSense will show a warning.

### JSON Configuration (`acros.json`)

The simplest way to define acronyms. Place an `acros.json` file at your project root or in any subdirectory.

**Simple string format:**
```json
{
  "api": "Application Programming Interface",
  "bc": "Best Case",
  "e2e": "End-to-End"
}
```

**Object format with optional fields:**
```json
{
  "api": {
    "acro": "Application Programming Interface",
    "definition": "A set of protocols and tools for building software applications",
    "backgroundColor": "rgba(255, 255, 0, 0.3)"
  },
  "bc": "Best Case",
  "bg": "rgba(255, 255, 0, 0.3)"
}
```

### JavaScript Configuration (`acros.js`)

Use JavaScript when you need dynamic acronym generation or want to compute definitions programmatically.

**CommonJS export:**
```javascript
module.exports = {
  api: "Application Programming Interface",
  bc: "Best Case",
  e2e: "End-to-End"
};
```

**ES Module default export:**
```javascript
export default {
  api: "Application Programming Interface",
  bc: "Best Case"
};
```

**Named exports (merged):**
```javascript
export const common = {
  api: "Application Programming Interface"
};

export const testing = {
  e2e: "End-to-End"
};
```

### TypeScript Configuration (`acros.ts`)

TypeScript configuration requires the `ts-node` package to be installed in your project:

```bash
npm install ts-node
# or
pnpm add ts-node
```

**Example `acros.ts`:**
```typescript
export default {
  api: "Application Programming Interface",
  bc: "Best Case",
  e2e: {
    acro: "End-to-End",
    definition: "Testing methodology that validates the entire system"
  }
};
```

### Folder-Based Configuration (`acros/`)

Organize acronyms across multiple files in an `acros/` folder. Files are merged alphabetically, with later files overriding earlier ones for duplicate keys.

**Example structure:**
```
acros/
  ├── common.json
  ├── domain.json
  └── testing.js
```

Files can be JSON, JavaScript, or TypeScript. The first file's `bg` or `backgroundColor` becomes the global default.

### Nested Scoping

AcroSense searches for configuration files in this order:

1. **Workspace folders** - Checks all workspace root directories
2. **Document directory** - Searches up from the current file's directory to the workspace root

The **closest configuration to your document** takes precedence. This allows you to:
- Define project-wide acronyms at the root
- Override with domain-specific acronyms in subdirectories
- Use different acronyms for different parts of your codebase

**Example:**
```
project/
  ├── acros.json          (project-wide acronyms)
  ├── src/
  │   ├── acros.json      (src-specific acronyms)
  │   └── utils.js        (uses src/acros.json)
  └── tests/
      └── test.js         (uses root acros.json)
```

### Acronym Definition Formats

Acronyms can be defined in two formats:

**Simple string:**
```json
{
  "api": "Application Programming Interface"
}
```

**Object with optional fields:**
```json
{
  "api": {
    "acro": "Application Programming Interface",
    "definition": "Optional extended description",
    "backgroundColor": "rgba(255, 255, 0, 0.3)"
  }
}
```

**Global default color:**
Set `bg` or `backgroundColor` at the root level to apply a default highlight color to all acronyms:
```json
{
  "bg": "rgba(255, 255, 0, 0.3)",
  "api": "Application Programming Interface"
}
```

## 📚 Usage Examples

Comprehensive examples demonstrating each configuration method are available in the [`examples/`](./examples/) directory:

- **[01-simple-json](./examples/01-simple-json/)** - Basic JSON configuration with simple string format
- **[02-simple-js](./examples/02-simple-js/)** - JavaScript configuration using CommonJS exports
- **[03-typescript](./examples/03-typescript/)** - TypeScript configuration with ES modules
- **[04-folder-based](./examples/04-folder-based/)** - Organizing acronyms across multiple files
- **[05-nested-scoping](./examples/05-nested-scoping/)** - Demonstrating nested configuration scoping
- **[06-advanced-features](./examples/06-advanced-features/)** - Custom colors, mixed formats, and extended definitions

Each example includes sample code and a README explaining when and how to use that configuration method.

## 🤝 Contributing

See **README_DEV.md** for developer setup and contribution workflow.

## 🗒️ Roadmap

- [ ] Performance improvements
- [ ] Case sensitivity toggle
- [ ] Excluded files list
- [ ] Search glossary via Command Palette
- [ ] Workspace-shared glossary sync
- [ ] Custom highlight theme settings

Built with ❤️ by WrighterLabs  
MIT License
