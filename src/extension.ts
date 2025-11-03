// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface AcronymDefinition {
  acro: string;
  definition?: string;
  backgroundColor?: string;
  bg?: string;
}

type ConfigType = "json" | "js" | "ts" | "folder";

interface ConfigInfo {
  type: ConfigType;
  path: string;
  directory: string;
}

interface ConfigCacheEntry {
  data: { [key: string]: any };
  mtime: number;
}

let acroDefinitions: { [key: string]: AcronymDefinition } = {};
const decorationTypes: vscode.TextEditorDecorationType[] = [];
let highlightTimeout: NodeJS.Timeout | undefined;
let configReloadTimeout: NodeJS.Timeout | undefined;
const configCache: Map<string, ConfigCacheEntry> = new Map();

/**
 * Check for configuration conflicts at a given directory level
 */
function checkConfigurationConflict(dir: string): string[] {
  const conflicts: string[] = [];
  const configs: { type: ConfigType; path: string }[] = [];

  const jsonPath = path.join(dir, "acros.json");
  const jsPath = path.join(dir, "acros.js");
  const tsPath = path.join(dir, "acros.ts");
  const folderPath = path.join(dir, "acros");

  if (fs.existsSync(jsonPath)) {
    configs.push({ type: "json", path: jsonPath });
  }
  if (fs.existsSync(jsPath)) {
    configs.push({ type: "js", path: jsPath });
  }
  if (fs.existsSync(tsPath)) {
    configs.push({ type: "ts", path: tsPath });
  }
  if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
    configs.push({ type: "folder", path: folderPath });
  }

  if (configs.length > 1) {
    const types = configs.map((c) => c.type).join(", ");
    conflicts.push(`Multiple configurations found at ${dir}: ${types}`);
  }

  return conflicts;
}

/**
 * Find acros configuration by searching:
 * 1. All workspace folders
 * 2. Document's directory and parent directories up to workspace root
 * Supports: acros.json, acros.js, acros.ts, or acros/ folder
 */
function findAcrosConfig(documentUri?: vscode.Uri): ConfigInfo | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  console.log(
    `[AcroSense] Searching for acros configuration in ${workspaceFolders.length} workspace folder(s)`
  );

  // First, try all workspace folders
  for (const folder of workspaceFolders) {
    const dir = folder.uri.fsPath;
    const conflicts = checkConfigurationConflict(dir);
    if (conflicts.length > 0) {
      const message = `AcroSense: Configuration conflict - ${conflicts.join("; ")}. Please remove all but one.`;
      vscode.window.showWarningMessage(message);
      console.warn(`[AcroSense] ⚠️ ${message}`);
      return undefined;
    }

    // Check in priority order
    const jsonPath = path.join(dir, "acros.json");
    const jsPath = path.join(dir, "acros.js");
    const tsPath = path.join(dir, "acros.ts");
    const folderPath = path.join(dir, "acros");

    if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
      console.log(`[AcroSense] Found acros/ folder: ${folderPath}`);
      return { type: "folder", path: folderPath, directory: dir };
    }
    if (fs.existsSync(jsonPath)) {
      console.log(`[AcroSense] Found acros.json: ${jsonPath}`);
      return { type: "json", path: jsonPath, directory: dir };
    }
    if (fs.existsSync(jsPath)) {
      console.log(`[AcroSense] Found acros.js: ${jsPath}`);
      return { type: "js", path: jsPath, directory: dir };
    }
    if (fs.existsSync(tsPath)) {
      console.log(`[AcroSense] Found acros.ts: ${tsPath}`);
      return { type: "ts", path: tsPath, directory: dir };
    }
  }

  // If we have a document, search up from its directory
  if (documentUri) {
    console.log(`[AcroSense] Searching from document: ${documentUri.fsPath}`);
    let currentDir = path.dirname(documentUri.fsPath);
    const workspaceRoots = workspaceFolders.map((f) => f.uri.fsPath);

    while (currentDir && currentDir !== path.dirname(currentDir)) {
      // Don't go above workspace root
      const isInWorkspace = workspaceRoots.some((root) =>
        currentDir.startsWith(root)
      );
      if (!isInWorkspace && workspaceRoots.length > 0) {
        console.log(
          `[AcroSense] Stopped searching at ${currentDir} (outside workspace)`
        );
        break;
      }

      const conflicts = checkConfigurationConflict(currentDir);
      if (conflicts.length > 0) {
        const message = `AcroSense: Configuration conflict - ${conflicts.join("; ")}. Please remove all but one.`;
        vscode.window.showWarningMessage(message);
        console.warn(`[AcroSense] ⚠️ ${message}`);
        return undefined;
      }

      // Check in priority order
      const folderPath = path.join(currentDir, "acros");
      const jsonPath = path.join(currentDir, "acros.json");
      const jsPath = path.join(currentDir, "acros.js");
      const tsPath = path.join(currentDir, "acros.ts");

      if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
        console.log(`[AcroSense] Found acros/ folder: ${folderPath}`);
        return { type: "folder", path: folderPath, directory: currentDir };
      }
      if (fs.existsSync(jsonPath)) {
        console.log(`[AcroSense] Found acros.json: ${jsonPath}`);
        return { type: "json", path: jsonPath, directory: currentDir };
      }
      if (fs.existsSync(jsPath)) {
        console.log(`[AcroSense] Found acros.js: ${jsPath}`);
        return { type: "js", path: jsPath, directory: currentDir };
      }
      if (fs.existsSync(tsPath)) {
        console.log(`[AcroSense] Found acros.ts: ${tsPath}`);
        return { type: "ts", path: tsPath, directory: currentDir };
      }

      // Move up one directory
      currentDir = path.dirname(currentDir);
    }
  }

  console.log(`[AcroSense] No acros configuration found`);
  return undefined;
}

// Track if ts-node has been registered
let tsNodeRegistered = false;

/**
 * Load a JavaScript or TypeScript module and extract exported object
 */
function loadModule(filePath: string): any {
  try {
    // Check cache first
    const stats = fs.statSync(filePath);
    const cacheKey = filePath;
    const cached = configCache.get(cacheKey);
    if (cached && cached.mtime === stats.mtimeMs) {
      return cached.data;
    }

    let moduleExports: any;

    if (filePath.endsWith(".ts")) {
      // Try to load TypeScript file with ts-node
      if (!tsNodeRegistered) {
        try {
          // Try to find ts-node
          require.resolve("ts-node");
          // Register ts-node
          require("ts-node").register({
            transpileOnly: true,
            compilerOptions: { module: "commonjs", esModuleInterop: true },
          });
          tsNodeRegistered = true;
          console.log("[AcroSense] ts-node registered for TypeScript support");
        } catch (e) {
          const errorMsg = `AcroSense: TypeScript support requires 'ts-node'. Install it with: npm install ts-node (or compile acros.ts to acros.js)`;
          vscode.window.showErrorMessage(errorMsg);
          console.error(`[AcroSense] ❌ ${errorMsg}`);
          throw new Error(errorMsg);
        }
      }
    }

    // Remove from require cache to ensure fresh load
    // Use try-catch in case module hasn't been loaded yet
    try {
      const resolvedPath = require.resolve(filePath);
      if (resolvedPath in require.cache) {
        delete require.cache[resolvedPath];
      }
    } catch (e) {
      // Module not in cache yet or not resolvable, that's fine
    }

    // Try to require the module
    // For TypeScript files, ts-node will handle resolution
    let resolvedPath = filePath;
    try {
      resolvedPath = require.resolve(filePath);
    } catch (e) {
      // If resolution fails (e.g., for .ts files), use the original path
      resolvedPath = filePath;
    }
    
    const module = require(resolvedPath);

    // Handle different export formats
    if (module.default && typeof module.default === "object") {
      // ES module default export
      moduleExports = module.default;
    } else if (typeof module === "object" && module.exports !== undefined && typeof module.exports === "object") {
      // CommonJS module.exports = {...}
      moduleExports = module.exports;
    } else if (typeof module === "object") {
      // The module itself is the export (CommonJS style)
      moduleExports = module;
    } else {
      // Try to merge all named exports
      const keys = Object.keys(module).filter((k) => k !== "default" && k !== "exports");
      if (keys.length > 0) {
        moduleExports = {};
        for (const key of keys) {
          if (typeof module[key] === "object" && module[key] !== null) {
            Object.assign(moduleExports, module[key]);
          }
        }
        if (Object.keys(moduleExports).length === 0) {
          throw new Error("No valid export found. Use 'export default', 'module.exports', or named exports.");
        }
      } else {
        throw new Error("No valid export found. Use 'export default', 'module.exports', or named exports.");
      }
    }

    // Cache the result
    configCache.set(cacheKey, { data: moduleExports, mtime: stats.mtimeMs });

    return moduleExports;
  } catch (error: any) {
    const errorMsg = `Failed to load module ${filePath}: ${error.message}`;
    console.error(`[AcroSense] ❌ ${errorMsg}`, error);
    throw error;
  }
}

/**
 * Load acronyms from a folder containing multiple files
 */
function loadFromAcrosFolder(folderPath: string): { [key: string]: any } {
  const merged: { [key: string]: any } = {};
  const duplicateKeys: Set<string> = new Set();
  let defaultBg: string | undefined;

  try {
    const files = fs.readdirSync(folderPath);
    const fileInfos: { path: string; name: string }[] = [];

    // Collect all relevant files
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        if (file.endsWith(".json") || file.endsWith(".js") || file.endsWith(".ts")) {
          fileInfos.push({ path: filePath, name: file });
        }
      }
    }

    // Sort alphabetically for consistent merging order
    fileInfos.sort((a, b) => a.name.localeCompare(b.name));

    for (const fileInfo of fileInfos) {
      try {
        let data: any;

        if (fileInfo.path.endsWith(".json")) {
          // Load JSON file
          const stats = fs.statSync(fileInfo.path);
          const cacheKey = fileInfo.path;
          const cached = configCache.get(cacheKey);
          if (cached && cached.mtime === stats.mtimeMs) {
            data = cached.data;
          } else {
            const content = fs.readFileSync(fileInfo.path, "utf8");
            data = JSON.parse(content);
            configCache.set(cacheKey, { data, mtime: stats.mtimeMs });
          }
        } else {
          // Load JS or TS file
          data = loadModule(fileInfo.path);
        }

        if (data && typeof data === "object") {
          // Extract default bg/backgroundColor from first file only
          if (defaultBg === undefined && (data.bg || data.backgroundColor)) {
            defaultBg = data.bg || data.backgroundColor;
          }

          // Merge data, tracking duplicates
          for (const key of Object.keys(data)) {
            if (key === "bg" || key === "backgroundColor") {
              // Skip root-level bg/backgroundColor when merging from folder
              // We'll use the first one found as the default
              continue;
            }
            if (key in merged && !duplicateKeys.has(key)) {
              duplicateKeys.add(key);
              console.warn(
                `[AcroSense] ⚠️ Duplicate key '${key}' found in ${fileInfo.name}. Later file will override.`
              );
            }
            merged[key] = data[key];
          }
        }
      } catch (error: any) {
        console.error(
          `[AcroSense] ❌ Failed to load ${fileInfo.name}: ${error.message}. Continuing with other files.`
        );
        // Continue loading other files
      }
    }

    // Apply default bg if found
    if (defaultBg !== undefined) {
      merged.bg = defaultBg;
    }

    if (duplicateKeys.size > 0) {
      console.warn(
        `[AcroSense] ⚠️ Found ${duplicateKeys.size} duplicate key(s) in acros/ folder: ${Array.from(duplicateKeys).join(", ")}`
      );
    }
  } catch (error: any) {
    console.error(`[AcroSense] ❌ Failed to read acros/ folder: ${error.message}`);
    throw error;
  }

  return merged;
}

/**
 * Load acronyms from a single file (JSON, JS, or TS)
 */
function loadFromAcrosFile(filePath: string): { [key: string]: any } {
  if (filePath.endsWith(".json")) {
    const stats = fs.statSync(filePath);
    const cacheKey = filePath;
    const cached = configCache.get(cacheKey);
    if (cached && cached.mtime === stats.mtimeMs) {
      return cached.data;
    }
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);
    configCache.set(cacheKey, { data, mtime: stats.mtimeMs });
    return data;
  } else {
    return loadModule(filePath);
  }
}

/**
 * Normalize acronym definitions:
 * 1. Extract root-level bg/backgroundColor as default
 * 2. Apply default to acronyms without their own color
 * 3. Normalize bg/backgroundColor keys to backgroundColor
 * 4. Support both object format and simple string format
 */
function normalizeAcronyms(raw: { [key: string]: any }): {
  [key: string]: AcronymDefinition;
} {
  const normalized: { [key: string]: AcronymDefinition } = {};
  const defaultColor = raw.bg || raw.backgroundColor || "rgba(255, 255, 0, 0.3)";

  for (const [key, value] of Object.entries(raw)) {
    // Skip special keys
    if (key === "bg" || key === "backgroundColor") {
      continue;
    }

    // Support simple string format: "pp": "Pension Provider"
    if (typeof value === "string") {
      normalized[key.toLowerCase()] = {
        acro: value,
        backgroundColor: defaultColor,
      };
      continue;
    }

    // Support object format: "pp": { "acro": "Pension Provider", ... }
    if (value && typeof value === "object" && value.acro) {
      // Normalize bg/backgroundColor to backgroundColor
      const backgroundColor =
        value.bg || value.backgroundColor || defaultColor;

      normalized[key.toLowerCase()] = {
        acro: value.acro,
        definition: value.definition, // Optional
        backgroundColor,
      };
    }
  }

  return normalized;
}

function loadAcronyms(documentUri?: vscode.Uri) {
  const configInfo = findAcrosConfig(documentUri);

  if (configInfo) {
    try {
      let rawData: { [key: string]: any };

      if (configInfo.type === "folder") {
        rawData = loadFromAcrosFolder(configInfo.path);
      } else {
        rawData = loadFromAcrosFile(configInfo.path);
      }

      acroDefinitions = normalizeAcronyms(rawData);
      const acronymKeys = Object.keys(acroDefinitions);
      console.log(
        `[AcroSense] ✅ Loaded ${acronymKeys.length} acronym(s) from: ${configInfo.path}`
      );
      console.log(`[AcroSense] Loaded acronyms: ${acronymKeys.join(", ")}`);
    } catch (error: any) {
      const errorMessage = `Failed to load configuration from ${configInfo.path}: ${error.message}`;
      vscode.window.showErrorMessage(errorMessage);
      console.error(`[AcroSense] ❌ ${errorMessage}`, error);
    }
  } else {
    // Only show warning if we have workspace folders but no config found
    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      console.warn(
        "[AcroSense] ⚠️ No acros configuration found in workspace folders or document directory"
      );
    }
  }
}

function getAcronymsForDocument(document: vscode.TextDocument): {
  [key: string]: AcronymDefinition;
} {
  // Reload acronyms for this specific document to get the right config
  const documentDefs: { [key: string]: AcronymDefinition } = {};
  const configInfo = findAcrosConfig(document.uri);

  if (configInfo) {
    try {
      let rawData: { [key: string]: any };

      if (configInfo.type === "folder") {
        rawData = loadFromAcrosFolder(configInfo.path);
      } else {
        rawData = loadFromAcrosFile(configInfo.path);
      }

      const normalized = normalizeAcronyms(rawData);
      Object.assign(documentDefs, normalized);
      console.log(
        `[AcroSense] Loaded acronyms for ${document.fileName}: ${Object.keys(
          documentDefs
        ).join(", ")}`
      );
    } catch (error: any) {
      console.error(
        `[AcroSense] ❌ Failed to parse configuration for ${document.fileName}:`,
        error
      );
      vscode.window.showErrorMessage(
        `AcroSense: Invalid configuration - ${error.message}`
      );
    }
  } else {
    console.log(`[AcroSense] No acros configuration found for ${document.fileName}`);
  }

  // Fall back to global definitions if no document-specific ones found
  return Object.keys(documentDefs).length > 0 ? documentDefs : acroDefinitions;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Load acronyms - will search all workspace folders
  loadAcronyms();

  // Initial highlight if there's an active editor
  if (vscode.window.activeTextEditor) {
    // Load acronyms for the active document
    loadAcronyms(vscode.window.activeTextEditor.document.uri);
    highlightAcronyms();
  }

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("[AcroSense] Extension activated!");

  const hoverProvider = vscode.languages.registerHoverProvider("*", {
    provideHover(document, position) {
      const wordRange = document.getWordRangeAtPosition(position);
      if (!wordRange) {
        return;
      }

      const identifier = document.getText(wordRange);
      const identifierLower = identifier.toLowerCase();
      
      // Get acronyms specific to this document's location
      const docAcronyms = getAcronymsForDocument(document);
      
      // Get cursor position within the identifier
      const cursorOffset = position.character - wordRange.start.character;
      
      // Find all acronyms that match within this identifier at the cursor position
      // Store both the definition and the matched text
      const matchingAcronyms: { def: AcronymDefinition; matchedText: string }[] = [];
      
      for (const [acronymKey, acronymDef] of Object.entries(docAcronyms)) {
        const acronymLower = acronymKey.toLowerCase();
        
        // Find all occurrences of this acronym within the identifier
        let searchStart = 0;
        while (true) {
          const index = identifierLower.indexOf(acronymLower, searchStart);
          if (index === -1) {
            break;
          }
          
          const acronymStart = index;
          const acronymEnd = index + acronymKey.length;
          
          // Check if cursor is within this acronym match
          if (cursorOffset >= acronymStart && cursorOffset < acronymEnd) {
            // Capture the actual matched text from the identifier (preserving case)
            const matchedText = identifier.substring(acronymStart, acronymEnd);
            matchingAcronyms.push({ def: acronymDef, matchedText });
            break; // Found a match, no need to check other occurrences of same acronym
          }
          
          searchStart = index + 1;
        }
      }

      if (matchingAcronyms.length > 0) {
        // Stack all matching definitions vertically
        // Show matched text in parentheses only when there are multiple matches (stacked)
        const isStacked = matchingAcronyms.length > 1;
        const hoverContent = matchingAcronyms
          .map(({ def, matchedText }) => {
            const displayText = isStacked ? `**${def.acro}** (${matchedText})` : `**${def.acro}**`;
            if (def.definition) {
              return `${displayText}: ${def.definition}`;
            } else {
              return displayText;
            }
          })
          .join("\n\n");
        
        return new vscode.Hover(new vscode.MarkdownString(hoverContent));
      }
    },
  });

  context.subscriptions.push(hoverProvider);

  // Watch for file changes in config files and reload acronyms
  vscode.workspace.onDidSaveTextDocument((document) => {
    const filePath = document.uri.fsPath;
    const fileName = path.basename(filePath);
    const dirName = path.basename(path.dirname(filePath));

    // Check if it's a config file
    if (
      fileName === "acros.json" ||
      fileName === "acros.js" ||
      fileName === "acros.ts" ||
      (dirName === "acros" && (fileName.endsWith(".json") || fileName.endsWith(".js") || fileName.endsWith(".ts")))
    ) {
      // Invalidate cache for this file
      configCache.delete(filePath);

      // Invalidate require cache if it's a JS/TS file
      if (fileName.endsWith(".js") || fileName.endsWith(".ts")) {
        try {
          const resolvedPath = require.resolve(filePath);
          if (resolvedPath in require.cache) {
            delete require.cache[resolvedPath];
          }
        } catch (e) {
          // File not in require cache, that's fine
        }
      }

      // Debounce reloads (300ms)
      if (configReloadTimeout) {
        clearTimeout(configReloadTimeout);
      }
      configReloadTimeout = setTimeout(() => {
        // Reload from the saved file's location
        loadAcronyms(document.uri);
        highlightAcronyms(); // Reapply highlights
      }, 300);
    }
  });

  // Watch for editor changes to reload acronyms and reapply highlights
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      // Reload acronyms for the new document's location
      loadAcronyms(editor.document.uri);
      highlightAcronyms();
    }
  });

  // Watch for document changes to update highlights (debounced for performance)
  vscode.workspace.onDidChangeTextDocument(() => {
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
    }
    highlightTimeout = setTimeout(() => {
      highlightAcronyms();
    }, 300); // Debounce to 300ms
  });

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "acrosense.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from AcroSense!");
    }
  );

  context.subscriptions.push(disposable);
}

function highlightAcronyms() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    // Dispose of previous decoration types
    decorationTypes.forEach((type) => type.dispose());
    decorationTypes.length = 0;

    // Get acronyms specific to this document's location
    const docAcronyms = getAcronymsForDocument(editor.document);
    const acronymCount = Object.keys(docAcronyms).length;

    if (acronymCount === 0) {
      console.log(
        `[AcroSense] No acronyms loaded for document: ${editor.document.fileName}`
      );
      return;
    }

    console.log(
      `[AcroSense] Highlighting in: ${editor.document.fileName} (${acronymCount} acronym(s) available)`
    );

    const text = editor.document.getText();
    // Find all identifiers (words) in the code
    const identifierRegex = /\b\w+\b/g;

    // Group decorations by background color
    const decorationsByColor: { [color: string]: vscode.DecorationOptions[] } =
      {};
    let foundCount = 0;

    let match;
    while ((match = identifierRegex.exec(text)) !== null) {
      const identifier = match[0];
      const identifierStart = match.index;
      const identifierLower = identifier.toLowerCase();

      // Search for all acronyms within this identifier
      for (const [acronymKey, acronymDef] of Object.entries(docAcronyms)) {
        const acronymLower = acronymKey.toLowerCase();
        
        // Find all occurrences of this acronym within the identifier
        let searchStart = 0;
        while (true) {
          const index = identifierLower.indexOf(acronymLower, searchStart);
          if (index === -1) {
            break;
          }

          foundCount++;
          const acronymStart = identifierStart + index;
          const acronymEnd = acronymStart + acronymKey.length;
          
          const startPos = editor.document.positionAt(acronymStart);
          const endPos = editor.document.positionAt(acronymEnd);
          const range = new vscode.Range(startPos, endPos);
          const decoration = { range };

          const color = acronymDef.backgroundColor ?? "rgba(255, 255, 0, 0.3)";
          if (!decorationsByColor[color]) {
            decorationsByColor[color] = [];
          }
          decorationsByColor[color].push(decoration);

          // Move search start past this match
          searchStart = index + 1;
        }
      }
    }

    if (foundCount > 0) {
      console.log(
        `[AcroSense] Found and highlighting ${foundCount} acronym occurrence(s)`
      );
    }

    // Apply decorations for each unique background color
    Object.entries(decorationsByColor).forEach(([color, decorations]) => {
      const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: color,
        border: `1px solid ${color}`,
      });
      decorationTypes.push(decorationType);
      editor.setDecorations(decorationType, decorations);
    });
  }
}

// This method is called when your extension is deactivated
export function deactivate() {
  // Clean up decoration types
  decorationTypes.forEach((type) => type.dispose());
  decorationTypes.length = 0;
  // Clear any pending timeouts
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
  }
  if (configReloadTimeout) {
    clearTimeout(configReloadTimeout);
  }
  // Clear cache
  configCache.clear();
}
