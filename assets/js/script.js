let userInput = false;
let activeShape;
let shapeCounter = 0;
let gameActive = false;
let allRows = [];
let shapes = [];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const init = async () => {
    await populateGrid();

    game();
}

const game = async () => {
    gameActive = true;

    while (gameActive) {
        let currentBag = bagGeneration();

        for (let i = 0; i < currentBag.length; i++) {
            await createShape(currentBag[i])
        }
    }
}

const createShape = async (shape) => {
    shapeCounter++
    activeShape = eval(`new ${shape}(5, 0, ${shapeCounter})`);
    userInput = true;
    userInput = await activeShape.shapeGravity(true);
    shapes.push(activeShape);
    await clearRows();

    await delay(500);
}

const populateGrid = async () => {

    await delay(250)

    for (let i = 0; i < 18; i++) {
        const section = document.createElement("section");
        section.setAttribute("id", `y${i}`);

        document.getElementById("game-box").appendChild(section);

        for (let j = 0; j < 10; j++) {
            const div = document.createElement("div");
            section.appendChild(div);
            await delay(10)
        }
    }

    allRows = [...document.getElementsByTagName("section")]
}

const clearRows = async () => {
    let clearedRows = [];

    for (let i = 0; i < allRows.length; i++) {
        const childDivs = Array.from(allRows[i].children);

        // If row is full
        if (childDivs.filter(div => div.classList.length !== 0).length == 10) {

            clearedRows.push(i);

            // Remove attributes from all blocks
            for (let j = 0; j < childDivs.length; j++) {

                childDivs[j].removeAttribute("class");
                childDivs[j].removeAttribute("shapeid");

            }
        }
    }

    // Update every shape on the page to move down but still keep it's form
    if (clearedRows.length > 0) {

        await delay(500)

        shapes.forEach(shape => {
            const filteredBoxes = shape.boxes.filter(box => !clearedRows.includes(box.y));
            shape.boxes = filteredBoxes
        });

        const filteredShapes = shapes.filter(shape => {
            return shape.boxes.length !== 0
        });

        console.log(filteredShapes);

        shapes = filteredShapes

        // Can't move entire shape, in case the shape has been broken up by a cleared line
        shapes.forEach(({ boxes }) => {
            boxes.forEach(box => {
                if (box.canBoxMove(null, null, "ArrowDown")) {
                    box.updateDom(false);
                    box.y++
                    box.updateDom(true);
                }
            })
        });
    }
}

// Generate a bag of pieces in any order
// Using each piece only once
const bagGeneration = () => {
    let pieces = ["I", "J", "L", "O", "S", "T", "Z"];
    let bag = [];

    for (let i = 0; i < pieces.length; i++) {
        let position = Math.floor(Math.random() * 7);

        if (bag.includes(position)) {
            i--
            continue;
        } else {
            bag.push(position)
        }
    }

    return bag.map(x => pieces[x])
}

document.addEventListener("keydown", ({ key }) => {
    if (!userInput) {
        return
    }

    if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowDown" || key === "ArrowUp") {
        activeShape.moveShape(key)
    } else if (key == 1 || key == 2) {
        activeShape.rotatePiece(key)
    }
});

document.getElementById("btn").addEventListener("click", () => {
    document.getElementById("game-box").removeAttribute("class");
    document.getElementById("btn").setAttribute("class", "display-none");
    init();
});


// TODO
// All tetrimino pieces - DONE
// Piece generation - DONE
// Rework line-clearing logic
// End game
// Wall kick when rotating
// Hard drop w/ Up Arrow
// Points
// Speed Increase over time
// UI