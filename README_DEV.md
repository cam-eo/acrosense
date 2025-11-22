# 🛠️ AcroSense Developer Guide

This guide helps contributors, maintainers, and curious developers get started quickly.

## 📦 Prerequisites

- Node.js + pnpm  
- VS Code  
- `vsce` (for packaging)  
- Git  

## 🏗 Project Structure

```
acrosense/
 ├─ src/
 │   └─ extension.ts
 ├─ dist/
 ├─ package.json
 ├─ acros.json (example)
 └─ README.md
```

## ▶️ Run the Extension Locally

1. Install deps:  
   ```bash
   pnpm install
   ```

2. Start dev mode with auto‑build:  
   ```bash
   pnpm run watch
   ```

3. Press **F5** in VS Code to launch the *Extension Development Host*.

4. Open any project inside the Dev Host window and test acronym hover.

## 🧪 Testing

Compile tests:
```bash
pnpm run compile-tests
```

Run them:
```bash
pnpm test
```

## 🚀 Publishing

1. Login:  
   ```bash
   vsce login <publisher>
   ```

2. Package:  
   ```bash
   vsce package
   ```

3. Publish:  
   ```bash
   vsce publish
   ```

## 📥 Contribution Workflow

1. Fork the repo  
2. Create a feature branch  
3. Run `pnpm run watch` to develop  
4. Submit a PR with a screenshot of your change  

Thanks for contributing ❤️
