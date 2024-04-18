import { EditorState } from "@codemirror/state";
import { highlightSelectionMatches } from "@codemirror/search";
import {
  indentWithTab,
  history,
  defaultKeymap,
  historyKeymap,
} from "@codemirror/commands";
import {
  StreamLanguage,
  syntaxTree,
  foldGutter,
  foldService,
  indentOnInput,
  indentUnit,
  bracketMatching,
  foldKeymap,
  syntaxHighlighting,
  defaultHighlightStyle,
} from "@codemirror/language";
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
  EditorView,
} from "@codemirror/view";
import { basicSetup } from 'codemirror'
import {lintGutter, linter} from "@codemirror/lint"

// Theme
import { oneDark } from "@codemirror/theme-one-dark";
// import { githubLight } from "@uiw/codemirror-theme-github";

// Language
// import { javascript } from "@codemirror/lang-javascript";
import { yaml } from "@codemirror/legacy-modes/mode/yaml"
// import { yaml } from "@codemirror/lang-yaml";
import parser from "js-yaml";

const yamlLinter = linter((view) => {
  let diagnostics = [];
  try {
    parser.load(view.state.doc);
  } catch (e) {
    var loc = e.mark;
    var from = loc ? loc.position : 0;
    var to = from;
    var severity = "error";
    diagnostics.push({
      from: from,
      to: to,
      message: e.message,
      severity: severity,
    });
  }
  return diagnostics;
});

const foldingOnIndent = foldService.of((state, from, to) => {
    const line = state.doc.lineAt(from) // First line
    const lines = state.doc.lines // Number of lines in the document
    const indent = line.text.search(/\S|$/) // Indent level of the first line
    let foldStart = from // Start of the fold
    let foldEnd = to // End of the fold

    // Check the next line if it is on a deeper indent level
    // If it is, check the next line and so on
    // If it is not, go on with the foldEnd
    let nextLine = line
    while (nextLine.number < lines) {
        nextLine = state.doc.line(nextLine.number + 1) // Next line
        const nextIndent = nextLine.text.search(/\S|$/) // Indent level of the next line

        // If the next line is on a deeper indent level, add it to the fold
        if (nextIndent > indent) {
            foldEnd = nextLine.to // Set the fold end to the end of the next line
        } else {
            break // If the next line is not on a deeper indent level, stop
        }
    }

    // If the fold is only one line, don't fold it
    if (state.doc.lineAt(foldStart).number === state.doc.lineAt(foldEnd).number) {
        return null
    }

    // Set the fold start to the end of the first line
    // With this, the fold will not include the first line
    foldStart = line.to

    // Return a fold that covers the entire indent level
    return { from: foldStart, to: foldEnd }
})

function createEditorState(initialContents, options = {}) {
  let extensions = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    // history(),
    // foldGutter(),
    drawSelection(),
    indentUnit.of("  "),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      indentWithTab,
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
    ]),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    basicSetup,
    StreamLanguage.define(yaml),
    lintGutter(),
    yamlLinter,
    foldingOnIndent
  ];

  if (options.oneDark) extensions.push(oneDark);

  return EditorState.create({
    doc: initialContents,
    extensions,
  });
}

function createEditorView(state, parent) {
  return new EditorView({ state, parent });
}

export { createEditorState, createEditorView };
