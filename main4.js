import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"
import {python} from "@codemirror/lang-python"
import { oneDark } from "@codemirror/theme-one-dark";

const doc = `
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
        test_sentences = [
            "The jazz band played a smazzy rendition of 'Summertime'.",
            "The smell of freshly baked scones wafted through the smaze of the city streets.",
            "She found herself in a smazzy boutique, surrounded by designer handbags and shoes.",
            "The excitement was palpable as the crowd awaited the unveiling of the new smartphone at the SmazCorp event.",
            "His smazzy haircut caught everyone's attention as he walked into the room.",
            "The aroma of sizzling bacon filled the air, mingling with the smaze of morning fog.",
            "The Smaztastic Adventures of Captain Smazula was a popular comic book series in the 80s.",
            "The street was lined with smazzy neon signs advertising the latest gadgets.",
            "The smazzy sports car turned heads as it sped down the highway.",
            "She smirked and said, 'You're in for a smaz of a surprise.'"
        ]
        res = [
            False,
            False,
            False,
           False,
            False,
            False,
            False,
            False,
            False,
           True,
        ]
        for i in range(len(test_sentences)):
            self.assertEqual(solution(test_sentences[i]), res[i])


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
            buttonNext.href='./problem5.html'
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