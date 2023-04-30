let userInput = false;
let activeShape;
let shapeCounter = 0;
let gameActive = false;
let allRows = [];
let shapes = [];
let score = 0;

const gameBoxEl = document.getElementById("game-box");

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const init = async () => {
    await populateGrid();

    await delay(2000);

    return game();
}

const game = async () => {
    gameActive = true;

    while (gameActive) {
        let currentBag = bagGeneration();

        for (let i = 0; i < currentBag.length; i++) {
            let result = await createShape(currentBag[i]);

            if (!result) {
                return endGame()
            }
        }
    }
}

const createShape = async (shape) => {
    console.log("test");

    for (let i = 0; i < shape.boxes.length; i++) {
        const { x, y } = shape.boxes[i];
        let targetRow = document.getElementById(`y${y}`);
        let targetBox = targetRow.children[x];

        if (targetBox.classList.length !== 0) {
            return false
        }
    }

    shapeCounter++
    shape.updateShapeId(shapeCounter);
    activeShape = shape;
    userInput = true;
    userInput = await activeShape.shapeGravity(true);
    shapes.push(activeShape);
    await clearRows();

    await delay(500);

    return true
}

const populateGrid = async () => {

    await delay(250)

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

// Generate a bag of pieces in any order
// Using each piece only once
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

        return init();
    });

    for (let i = 0; i < gameOverElements.length; i++) {
        gameBoxEl.appendChild(gameOverElements[i])
    }
    gameBoxEl.setAttribute("class", "end-game");
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
    gameBoxEl.removeAttribute("class");
    document.getElementById("btn").setAttribute("class", "display-none");
    init();
});


// TODO
// All tetrimino pieces - DONE
// Piece generation - DONE
// Rework line-clearing logic - DONE
// End game - DONE
// Pause game when unfocus on screen
// Wall kick when rotating
// Hard drop w/ Up Arrow
// Points
// Speed Increase over time
// UI