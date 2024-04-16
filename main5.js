import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"
import {python} from "@codemirror/lang-python"
import { oneDark } from "@codemirror/theme-one-dark";

const doc = `
def solution(s):
    out = set()
    return out
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
            "(3 + 4) * 2 - (foo(5) / bar)",
            "sqrt(9) + (max(3, 7) - min(5, 2))",
            "(x + y) * (foo(z) / bar)",
            "a+5+6+b*(6+a)",
            "(factorial(5) + fibonacci(8)) / (3 * abs(-7))",
            "foo(bar(3) + baz(2), qux())",
            "sin(cos(PI / 4)) + log(sqrt(25))",
            "max(min(x, y), abs(z)) / fact_orial2(fibonacci(8))",
            "sqrt(exp(log(10))) - pow(2, pow(3, 2))",
            "abs(ceil(3)) * floor(sqrt(16))",
        ]
        res = [
            set(['foo']),
            set(['sqrt', 'max', 'min']),
            set(['foo']),
            set([]),
            set(['factorial','fibonacci', 'abs']),
            set(['foo', 'bar','baz','qux']),
            set(['sin','cos','log','sqrt']),
            set(['max','min','abs','fact_orial2','fibonacci']),
            set(['sqrt','exp','log','pow']),
            set(['abs','ceil','floor','sqrt'])

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
