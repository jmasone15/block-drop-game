let userInput = false;
let activeShape;
let shapeCounter = 0;
let gameActive = false;
let allRows = [];
let shapes = [];
let score = 0;
let holdPiece;
let hold = true;
let hasSwappedHold = false;

const gameBoxEl = document.getElementById("game-box");
const holdEl = document.getElementById("hold");
const nextEl = document.getElementById("next");
const nextPieceEl = document.getElementById("next-piece");
const holdPieceEl = document.getElementById("hold-piece");

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const init = async () => {
    await populateGrid();

    await delay(1000);

    return game();
}

const game = async () => {
    gameActive = true;

    // Want to generate current bag and next bag to display pieces in "Next" box
    let currentBag = bagGeneration();
    let nextBag = bagGeneration();

    for (let i = 0; i < currentBag.length; i++) {
        let shape = currentBag[i];

        // Block out
        for (let j = 0; j < shape.boxes.length; j++) {
            const { x, y } = shape.boxes[j];
            let targetRow = document.getElementById(`y${y}`);
            let targetBox = targetRow.children[x];

            if (targetBox.classList.length !== 0) {
                gameActive = false
                break
            }
        }

        if (!gameActive) {
            break
        }

        displayShape(i == 6 ? nextBag[0].color : currentBag[i + 1].color, "next");

        console.log(i == 6 ? nextBag[0] : currentBag[i + 1]);

        shapeCounter++
        shape.updateShapeId(shapeCounter);
        activeShape = shape;

        userInput = true;
        await shapeDrop();
        userInput = false;

        if (!hold) {
            // Reset Piece
            activeShape.populateShape(false);
            activeShape.resetShape(5, 0);

            if (holdPiece) {
                currentBag[i] = holdPiece;
                i--;
            }

            holdPiece = activeShape;
            displayShape(activeShape.color, "hold");
            hold = true;
            hasSwappedHold = true;

            continue;
        }

        hasSwappedHold = false;
        shapes.push(activeShape);

        await clearRows();
        await delay(500);

        // Last iteration requery bag generation.
        if (i == 6) {
            currentBag = nextBag;
            console.log(currentBag);
            nextBag = bagGeneration();
            i = -1;
        }
    }

    return endGame()
}

const shapeDrop = async () => {
    if (!hold) {
        return;
    }

    activeShape.populateShape(true);

    if (!hold) {
        return;
    }

    while (hold && activeShape.canShapeMove("ArrowDown")) {
        await delay(250);

        if (!hold) {
            return;
        }

        if (activeShape.canShapeMove("ArrowDown")) {
            
            if (!hold) {
                return;
            }

            activeShape.moveShape("ArrowDown");

            if (!hold) {
                return;
            }
        } else {
            if (!hold) {
                return;
            }

            break
        }
    }

    if (!hold) {
        return;
    }

    if (activeShape.canShapeMove("ArrowDown")) {

        if (!hold) {
            return;
        }

        return shapeDrop();
    } else {

        if (!hold) {
            return;
        }

        // Set the shape to the focal point
        // Change this to be a method for each shape
        let focalBoxIndex = activeShape.getFocalIndex();

        activeShape.x = activeShape.boxes[focalBoxIndex].x
        activeShape.y = activeShape.boxes[focalBoxIndex].y
    }
}

const displayShape = (color, target) => {
    for (let i = 0; i < 5; i++) {
        const section = document.getElementById(`${target}-y${i}`);

        for (let j = 0; j < section.children.length; j++) {
            section.children[j].setAttribute("class", "small-div");
        }
    }

    let shape;

    switch (color) {
        case "light-blue":
            shape = new I(2, 2);
            break;
        case "yellow":
            shape = new O(2, 1);
            break;
        case "orange":
            shape = new L(2, 1);
            break;
        case "red":
            shape = new Z(2, 1);
            break;
        case "green":
            shape = new S(2, 1);
            break;
        case "magenta":
            shape = new T(2, 1);
            break;
        default:
            shape = new J(2, 1);
            break;
    }

    shape.populateShape(true, target)
}

const populateGrid = async () => {

    await delay(250)

    // Main grid
    for (let i = 0; i < 18; i++) {
        const section = document.createElement("section");
        section.setAttribute("id", `y${i}`);

        gameBoxEl.appendChild(section);

        for (let j = 0; j < 10; j++) {
            const div = document.createElement("div");
            section.appendChild(div);
            await delay(10)
        }
    }

    holdEl.removeAttribute("class");
    nextEl.removeAttribute("class");

    // Next Box
    for (let i = 0; i < 5; i++) {
        const section = document.createElement("article");
        section.setAttribute("id", `next-y${i}`);
        section.setAttribute("class", `small-row`);
        nextPieceEl.appendChild(section);

        for (let j = 0; j < 5; j++) {
            const div = document.createElement("div");
            div.setAttribute("class", "small-div");
            section.appendChild(div);
        }
    }

    // Hold Box
    for (let i = 0; i < 5; i++) {
        const section = document.createElement("article");
        section.setAttribute("id", `hold-y${i}`);
        section.setAttribute("class", `small-row`);
        holdPieceEl.appendChild(section);

        for (let j = 0; j < 5; j++) {
            const div = document.createElement("div");
            div.setAttribute("class", "small-div");
            section.appendChild(div);
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

        shapes = filteredShapes

        for (let i = Math.min(...clearedRows); i > -1; i--) {
            shapes.forEach(({ boxes }) => {
                boxes.forEach((box) => {
                    if (box.y == i) {
                        box.updateDom(false);
                        box.y += clearedRows.length;
                        box.updateDom(true);
                    }
                });
            });
        }
    }
}

const bagGeneration = () => {
    let pieces = [new I(5, 0), new J(5, 0), new L(5, 0), new O(5, 0), new S(5, 0), new T(5, 0), new Z(5, 0)];
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

const endGame = async () => {
    userInput = false;

    await delay(250);

    for (let i = 17; i > -1; i--) {
        const row = document.getElementById(`y${i}`);

        for (let j = 9; j > -1; j--) {
            row.children[j].remove();
            await delay(10)
        }
    }

    for (let i = 0; i < 18; i++) {
        document.getElementById(`y${i}`).remove();
    }

    await delay(250);

    const gameOverElements = [document.createElement("h1"), document.createElement("p"), document.createElement("button")];

    gameOverElements[0].textContent = "Game Over!";
    gameOverElements[1].textContent = `Final Score: ${score}`;
    gameOverElements[2].textContent = "Play Again?";

    gameOverElements[2].addEventListener("click", () => {
        gameBoxEl.removeAttribute("class");
        for (let i = 0; i < gameOverElements.length; i++) {
            gameBoxEl.removeChild(gameOverElements[i]);
        }

        shapes = [];
        shapeCounter = 0;
        score = 0;

        return init();
    });

    for (let i = 0; i < gameOverElements.length; i++) {
        gameBoxEl.appendChild(gameOverElements[i])
    }
    gameBoxEl.setAttribute("class", "end-game");
}

document.addEventListener("keydown", (e) => {
    let key = e.key;

    if (!userInput) {
        return
    }

    if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowDown" || key === "ArrowUp") {
        activeShape.moveShape(key)
    } else if (key == 1 || key == 2) {
        activeShape.rotatePiece(key)
    } else if (key === "Tab") {
        e.preventDefault();
        if (!hasSwappedHold) {
            hold = false;
        }
    }
});

document.getElementById("btn").addEventListener("click", () => {
    gameBoxEl.removeAttribute("class");
    document.getElementById("btn").setAttribute("class", "display-none");
    init();
});


// TODO
// All tetrimino pieces - DONE
// Piece generation - DONE
// Rework line-clearing logic - DONE
// End game - DONE
// Next Piece - DONE
// Hold piece - DONE
// Wall kick when rotating
// Hard drop w/ Up Arrow
// Points
// Speed Increase over time
// UI