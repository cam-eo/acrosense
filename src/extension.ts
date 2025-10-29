// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface AcronymDefinition {
  acro: string;
  definition: string;
  backgroundColor: string;
}

let acroDefinitions: { [key: string]: AcronymDefinition } = {};
const decorationTypes: vscode.TextEditorDecorationType[] = [];
let highlightTimeout: NodeJS.Timeout | undefined;

/**
 * Find acros.json file by searching:
 * 1. All workspace folders
 * 2. Document's directory and parent directories up to workspace root
 */
function findAcrosJson(documentUri?: vscode.Uri): string | undefined {
  // First, try all workspace folders
  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  console.log(
    `[AcroSense] Searching for acros.json in ${workspaceFolders.length} workspace folder(s)`
  );

  for (const folder of workspaceFolders) {
    const filePath = path.join(folder.uri.fsPath, "acros.json");
    console.log(`[AcroSense] Checking workspace folder: ${filePath}`);
    if (fs.existsSync(filePath)) {
      console.log(
        `[AcroSense] Found acros.json in workspace folder: ${filePath}`
      );
      return filePath;
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

      const filePath = path.join(currentDir, "acros.json");
      console.log(`[AcroSense] Checking directory: ${filePath}`);
      if (fs.existsSync(filePath)) {
        console.log(`[AcroSense] Found acros.json: ${filePath}`);
        return filePath;
      }

      // Move up one directory
      currentDir = path.dirname(currentDir);
    }
  }

  console.log(`[AcroSense] No acros.json found`);
  return undefined;
}

function loadAcronyms(documentUri?: vscode.Uri) {
  const acronymFilePath = findAcrosJson(documentUri);

  if (acronymFilePath) {
    try {
      const data = fs.readFileSync(acronymFilePath, "utf8");
      const parsed = JSON.parse(data);
      acroDefinitions = parsed;
      const acronymKeys = Object.keys(parsed);
      console.log(
        `[AcroSense] ✅ Loaded ${acronymKeys.length} acronym(s) from: ${acronymFilePath}`
      );
      console.log(`[AcroSense] Loaded acronyms: ${acronymKeys.join(", ")}`);
    } catch (error) {
      const errorMessage = `Failed to load acros.json from ${acronymFilePath}: ${error}`;
      vscode.window.showErrorMessage(errorMessage);
      console.error(`[AcroSense] ❌ ${errorMessage}`, error);
    }
  } else {
    // Only show warning if we have workspace folders but no acros.json found
    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      console.warn(
        "[AcroSense] ⚠️ No acros.json found in workspace folders or document directory"
      );
    }
  }
}

function getAcronymsForDocument(document: vscode.TextDocument): {
  [key: string]: AcronymDefinition;
} {
  // Reload acronyms for this specific document to get the right acros.json
  const documentDefs: { [key: string]: AcronymDefinition } = {};
  const acronymFilePath = findAcrosJson(document.uri);

  if (acronymFilePath) {
    try {
      const data = fs.readFileSync(acronymFilePath, "utf8");
      const parsed = JSON.parse(data);
      Object.assign(documentDefs, parsed);
      console.log(
        `[AcroSense] Loaded acronyms for ${document.fileName}: ${Object.keys(
          documentDefs
        ).join(", ")}`
      );
    } catch (error) {
      console.error(
        `[AcroSense] ❌ Failed to parse acros.json for ${document.fileName}:`,
        error
      );
      vscode.window.showErrorMessage(
        `AcroSense: Invalid JSON in acros.json - ${error}`
      );
    }
  } else {
    console.log(`[AcroSense] No acros.json found for ${document.fileName}`);
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

      const word = document.getText(wordRange);
      // Get acronyms specific to this document's location
      const docAcronyms = getAcronymsForDocument(document);
      const acronymDef = docAcronyms[word.toLowerCase()];

      if (acronymDef) {
        return new vscode.Hover(
          new vscode.MarkdownString(
            `**${acronymDef.acro}**: ${acronymDef.definition}`
          )
        );
      }
    },
  });

  context.subscriptions.push(hoverProvider);

  // Watch for file changes in acros.json and reload acronyms
  vscode.workspace.onDidSaveTextDocument((document) => {
    if (document.uri.fsPath.endsWith("acros.json")) {
      // Reload from the saved file's location
      loadAcronyms(document.uri);
      highlightAcronyms(); // Reapply highlights
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
    const regex = /\b(\w{2,})\b/g;

    // Group decorations by background color
    const decorationsByColor: { [color: string]: vscode.DecorationOptions[] } =
      {};
    let foundCount = 0;

    let match;
    while ((match = regex.exec(text)) !== null) {
      const acronym = match[1].toLowerCase();
      const acronymDef = docAcronyms[acronym];
      if (acronymDef) {
        foundCount++;
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(
          match.index + match[0].length
        );
        const range = new vscode.Range(startPos, endPos);
        const decoration = { range };

        const color = acronymDef.backgroundColor ?? "rgba(255, 255, 0, 0.3)";
        if (!decorationsByColor[color]) {
          decorationsByColor[color] = [];
        }
        decorationsByColor[color].push(decoration);
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
  // Clear any pending highlight timeout
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
  }
}
