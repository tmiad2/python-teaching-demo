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
            "We encountered a frak in the system, but it should be fixed shortly.",
            "I found a slitch that allows us to bypass the security protocol.",
            "Ignore that smaz on the screen, it's just a minor glitch.",
            "The VR headset is acting frit again; I might need to recalibrate it.",
            "Let me snaff that file from the server real quick.",
            "Don't worry about the sproff, it's just a temporary hiccup.",
            "The data transfer rate was incredible; it was like a blitz of information.",
            "I'll scrog these files into a more organized format for easier access.",
            "We encountered a snirt during the upload process, but it's nothing major.",
            "I'll skrump these large files to save space on the server."
        ]
        clean_sentences = [
            "We encountered a **** in the system, but it should be fixed shortly.",
            "I found a ****** that allows us to bypass the security protocol.",
            "Ignore that **** on the screen, it's just a minor glitch.",
            "The VR headset is acting **** again; I might need to recalibrate it.",
            "Let me ***** that file from the server real quick.",
            "Don't worry about the ******, it's just a temporary hiccup.",
            "The data transfer rate was incredible; it was like a ***** of information.",
            "I'll ***** these files into a more organized format for easier access.",
            "We encountered a ***** during the upload process, but it's nothing major.",
            "I'll ****** these large files to save space on the server."
        ]
        for i in range(len(test_sentences)):
            print("Input: ", test_sentences[i])
            print("Expected Output: ", res[i])
            self.assertEqual(solution(test_sentences[i]), res[i])
            print("PASSED")


test = TestStringMethods()

NAS_strings =['bytebite', 'frak', 'slitch', 'smaz', 'frit', 'snaff', 'blitz', 'holostriders', 'sproff', 'scrog','snirt', 'skrump']

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
            buttonNext.href='./problem4.html'
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
