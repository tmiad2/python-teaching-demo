import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"
import {python} from "@codemirror/lang-python"
import { oneDark } from "@codemirror/theme-one-dark";

const doc = `
from urllib.parse import urlparse, urlunparse

def solution(s):
    pass
`

editor = new EditorView({
    doc,
    extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
                        python(), oneDark
    ],
    parent: document.querySelector("#editor")
})

const output = document.getElementById("output");

function addToOutput(s) {
    if(s == null){
        return;
    }
    output.value = output.value+  s + "\n";
    output.scrollTop = output.scrollHeight;
}

output.value = "Initializing...\n";
// init Pyodide
async function main() {
    let pyodide = await loadPyodide();
    pyodide.setStdout({ batched: (msg) => addToOutput(msg) });
    await pyodide.loadPackage("requests")
    output.value += "Ready!\n";
    pyodide.runPython(`
import unittest
class TestStringMethods(unittest.TestCase):
    def runTest(self):
        self.assertEqual(solution('https://www.twitter.com'), 'https://www.x.com')
        self.assertEqual(solution('https://witter.com'),'https://witter.com')
        self.assertEqual(solution('https://www.netflitwitter.com'),'https://www.netflitwitter.com')
        self.assertEqual(solution('https://twitter.com.gmail.com'),'https://twitter.com.gmail.com')
test = TestStringMethods()
`)
    return pyodide;
}
let pyodideReadyPromise = main();

async function evaluatePython() {
    let pyodide = await pyodideReadyPromise;
    output.value = ""
    try {
        let output = pyodide.runPython(editor.state.doc.toString());
        addToOutput(output);
        pyodide.runPython(`
solved = False
res = test()
if res.wasSuccessful():
    solved = True
    print("PASSED!")
else:
    print(res)
    for fail in res.failures:
        print(fail[1])
    for error in res.errors:
        print(error)
`)
        let solved = pyodide.globals.get("solved");
        if(solved){
            document.getElementById("editor").disabled = true;
            document.getElementById("run").disabled = true;
            var buttonNext = document.createElement("a");
            var body = document.getElementsByTagName("body")[0];
            buttonNext.innerHTML = "Next";
            buttonNext.href='./problem2.html'
            buttonNext.style.width = '200px'; // setting the width to 200px
            buttonNext.style.height = '200px'; // setting the height to 200px
            buttonNext.style.background = 'teal'; // setting the background color to teal
            buttonNext.style.color = 'white'; // setting the color to white
            buttonNext.style.fontSize = '20px'; // setting the font size to 20px
            document.getElementById("run").replaceWith(buttonNext);
        }
    } catch (err) {
        addToOutput(err);
    }
}

document.getElementById("run").onclick = evaluatePython;
