# AcroSense Development Guide

## Prerequisites

Will just include these in initial setup

- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/) package manager
- VS Code with the following extensions:
  - `esbuild Problem Matchers` (connor4312.esbuild-problem-matchers)
  - `Extension Test Runner` (ms-vscode.extension-test-runner) - for running tests
  - `ESLint` (dbaeumer.vscode-eslint) - recommended

## Initial Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Install the extension [esbuild Problem Matcher](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
3. The extension is configured to auto-activate on startup (`onStartupFinished`)

## Running the Extension

### Development/Debugging

1. **Press F5** to launch the Extension Development Host

   - This automatically runs the `watch` task (compiles TypeScript and bundles with esbuild)
   - Opens a new VS Code window (Extension Development Host) with your extension loaded
   - Watch mode automatically rebuilds on file changes

2. **In the Extension Development Host window:**
   - Create or open a folder with an `acros.json` file
   - Open any file containing acronyms defined in `acros.json`
   - Acronyms should be highlighted and show definitions on hover

### Debug Console

Check the Debug Console (View → Debug Console) for extension logs:

- `[AcroSense] Extension activated!` - confirms extension loaded
- `[AcroSense] Searching for acros.json...` - file discovery logs
- `[AcroSense] ✅ Loaded X acronym(s)...` - successful acronym loading
- Error messages if `acros.json` is invalid or can't be found

## Available Scripts

- `pnpm run compile` - Type check, lint, and build once
- `pnpm run watch` - Watch mode: runs `watch:esbuild` and `watch:tsc` in parallel
- `pnpm run package` - Production build (for publishing)
- `pnpm run check-types` - Type check only
- `pnpm run lint` - Run ESLint
- `pnpm run test` - Run tests (requires `watch-tests` to be running)
- `pnpm run watch-tests` - Watch and compile tests

## Testing Your Extension

### Manual Testing

1. In the Extension Development Host window, create or open a folder
2. Create `acros.json` in the folder root:
   ```json
   {
     "tpp": {
       "acro": "Transferring Pension Provider",
       "definition": "The pension provider that is transferring the pension value.",
       "backgroundColor": "rgba(255, 255, 0, 0.3)"
     }
   }
   ```
3. Create a test file (e.g., `test.js`) and type acronyms like `tpp`
4. You should see:
   - Yellow highlighting on `tpp`
   - Hover tooltip showing the full acronym and definition

### Running Tests

1. Start test watcher: `Cmd+Shift+P` → "Tasks: Run Task" → `watch-tests`
2. Open Testing view and click "Run Test" or press `Cmd+; A`

## How It Works

- **File Discovery**: Extension searches for `acros.json` in:
  - All workspace folders
  - Document's directory and parent directories (up to workspace root)
- **Hover Provider**: Registered for all file types (`*`)
- **Highlighting**: Automatically highlights acronyms with custom background colors
- **Auto-reload**: Watches for `acros.json` file changes and reloads acronyms

## Troubleshooting

- **No logs in Debug Console?** Make sure activation events are set (`onStartupFinished` in `package.json`)
- **Can't find acros.json?** Check Debug Console for search logs. Ensure file is in workspace root or document's directory tree
- **JSON parse errors?** Verify `acros.json` is valid JSON. Check for incomplete values like `"rgba(255, 255, 0, 0."`
- **Highlights not showing?** Check Debug Console for acronym loading messages. Ensure acronym keys match exactly (case-insensitive)
- **F5 shows task picker?** Select "npm: watch" - VS Code will remember your choice
