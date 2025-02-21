// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let acroDefinitions: { [key: string]: string } = {};

function loadAcronyms() {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
	if (workspaceFolder) {
		const acronymFilePath = path.join(workspaceFolder, 'acros.json');

		try {
			const data = fs.readFileSync(acronymFilePath, 'utf8');
			acroDefinitions = JSON.parse(data);
			console.log("Acronyms loaded:", acroDefinitions);
		} catch (error) {
			vscode.window.showErrorMessage('Failed to load acronyms.json');
			console.error(error);
		}
	}
}



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	loadAcronyms();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"acrosense" is now active!');

	const hoverProvider = vscode.languages.registerHoverProvider('*', {
		provideHover(document, position) {
			const wordRange = document.getWordRangeAtPosition(position);
			if (!wordRange) return;

			const word = document.getText(wordRange);
			const definition = acroDefinitions[word.toLowerCase()];

			if (definition) {
				return new vscode.Hover(new vscode.MarkdownString(`**${word}**: ${definition}`));
			}
		}


	});

	context.subscriptions.push(hoverProvider);

	// Watch for file changes in acronyms.json and reload acronyms
	vscode.workspace.onDidSaveTextDocument((document) => {
		if (document.uri.fsPath.endsWith('acronyms.json')) {
			loadAcronyms(); // Reload acronyms after save
			highlightAcronyms(); // Reapply highlights
		}
	});


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('acrosense.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from AcroSense!');
	});

	context.subscriptions.push(disposable);
}

function highlightAcronyms() {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const text = editor.document.getText();
		const regex = /\b(\w{2,})\b/g;
		const decorations: vscode.DecorationOptions[] = [];

		let match;
		while ((match = regex.exec(text)) !== null) {
			const acronym = match[1].toLowerCase();
			if (acroDefinitions[acronym]) {
				const startPos = editor.document.positionAt(match.index);
				const endPos = editor.document.positionAt(match.index + match[0].length);
				const range = new vscode.Range(startPos, endPos);
				const decoration = { range };
				decorations.push(decoration);
			}
		}

		const decorationType = vscode.window.createTextEditorDecorationType({
			backgroundColor: 'rgba(255, 255, 0, 0.3)', // yellow highlight
			border: '1px solid yellow',
		});

		editor.setDecorations(decorationType, decorations);
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
