var editor = ace.edit("editor");

editor.setTheme("ace/theme/textmate");
editor.session.setMode("ace/mode/python");
editor.setShowPrintMargin(false);
editor.setFontSize(14);

if(localStorage.code) {
    editor.session.setValue(localStorage.code);
} else {
    localStorage.code = "" +
`from js import console

noStroke()

# position of the car
x = 10

lastMillis = millis()

def draw():
    global x, lastMillis
    
    background(151, 244, 247)
    
    # draw the car body
    fill(255, 0, 115)
    rect(x, 200, 100, 20)
    rect(x + 15, 178, 70, 40)
    
    # draw the wheels
    fill(77, 66, 66)
    ellipse(x + 25, 221, 24, 24)
    ellipse(x + 75, 221, 24, 24)
    
    x = x + 1
`;
}

editor.session.on('change', function() {
    localStorage.code = editor.getValue();
});

var p5instance;
var eventNames = ['draw', 'keyPressed', 'keyReleased', 'keyTyped', 'mouseMoved', 'mouseDragged',
                  'mousePressed', 'mouseReleased', 'mouseClicked', 'doubleClicked', 'mouseWheel'];

function sliceOffLastArgumentWrapper(func) {
    return function(/*...*/) {
        Array.prototype.pop.call(arguments);
        return func.apply(this, arguments);
    };
}

function runCode() {
    if(p5instance) p5instance.remove(); // destroy the last instance
    
    var code = editor.getValue();

    var sketch = pyodide.globals;

    var sketchInit = function(p) {
        p.setup = function() {
            p.createCanvas(400, 400);
        }

        for(var eventName of eventNames) {
            p[eventName] = (function() {
                if(pyodide.globals[this.eventName] && typeof pyodide.globals[this.eventName] === "function") {
                    pyodide.globals[this.eventName]();
                }
            }).bind({
                eventName: eventName
            });
        }
    };

    p5instance = new p5(sketchInit, 'output');

    for(var p5Value in p5instance) {
        switch(typeof p5instance[p5Value]) {
            case "function":
                pyodide.globals[p5Value] = sliceOffLastArgumentWrapper(p5instance[p5Value].bind(p5instance));
            break;
            default:
                pyodide.globals[p5Value] = p5instance[p5Value];
        }

        
    }

    pyodide.runPython(code);
}
