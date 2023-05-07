// Game Variables
let userInput = false;
let activeShape;
let shapeCounter = 0;
let allRows = [];
let shapes = [];
let score = 0;
let hardDropped = false;
let holdPiece;
let hold = true;
let hasSwappedHold = false;
let level = 0;
let clearedLinesCount = 0;
let speedMS = 1000;
let loopCount = 0;
let incrementLoopCount = false;
let controlsData = JSON.parse(localStorage.getItem("blockGameControls"));
let changeControls = false;
let targetControlChange;

// HTML Elements
const gameBoxEl = document.getElementById("game-box");
const holdEl = document.getElementById("hold");
const nextEl = document.getElementById("next");
const nextPieceEl = document.getElementById("next-piece");
const holdPieceEl = document.getElementById("hold-piece");
const h3El = document.getElementById("h3");
const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const startBtnEl = document.getElementById("btn");
const controlsEl = document.getElementById("controls");
const controlsBoxEl = document.getElementById("controls-box");
const modal = document.getElementById("modal");

// If there are no controls saved in localStorage, update to the default values and save in localStorage.
if (!controlsData) {
    controlsData = {
        leftMoveKey: "ArrowLeft",
        rightMoveKey: "ArrowRight",
        softDropKey: "ArrowDown",
        hardDropKey: "ArrowUp",
        holdPieceKey: "Tab",
        leftRotateKey: "1",
        rightRotateKey: "2"
    }
    localStorage.setItem("blockGameControls", JSON.stringify(controlsData));
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const init = async () => {

    // Populate UI
    await populateGrid();
    await delay(1000);

    // Game loop
    return game();
}

const game = async () => {
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

            // If there is an obstruction for any box of the spawning shape, end the game.
            if (targetBox.classList.length !== 0) {
                return endGame();
            }
        }

        // Display the next shape in the next sub-grid
        displayShape(i === 6 ? nextBag[0].color : currentBag[i + 1].color, "next");

        // Increment shape counter and use that as the shapeId
        shapeCounter++
        shape.updateShapeId(shapeCounter);

        // Set the current shape to the activeShape global variable and start the shape drop.
        activeShape = shape;
        await shapeDrop();

        // The shapeDrop function will be cancelled if the user presses the hold piece key.
        if (!hold) {
            // Reset Piece
            activeShape.populateShape(false);
            activeShape.resetShape(5, 0);

            // If the user swapped pieces with the currently held piece,
            // We don't want to mess with the order of the bag Generation so we decrement i.
            if (holdPiece) {
                currentBag[i] = holdPiece;
                i--;
            }

            // Update the game variables.
            holdPiece = activeShape;
            hold = true;
            hasSwappedHold = true;

            // Display the held shape on the UI
            displayShape(activeShape.color, "hold");

            continue;
        }

        // Update the game variables.
        hardDropped = false;
        hasSwappedHold = false;
        shapes.push(activeShape);

        // Check to see if any rows have been cleared and update the UI accordingly.
        await clearRows();

        // Last iteration requery bag generation.
        if (i == 6) {
            currentBag = nextBag;
            nextBag = bagGeneration();
            i = -1;
        }
    }
}

const shapeDrop = async () => {
    // Update the game variables
    activeShape.populateShape(true);
    userInput = true;
    loopCount = 1;

    // System should consitently drop the activeShape at a rate determined by the current game level.
    // System should stop dropping the piece once it hits a blocker, the user hard drops, or the user decides to hold the piece.
    while (hold && activeShape.canShapeMove(controlsData.softDropKey) && !hardDropped) {

        // When holding a piece, there is a big delay if the speedMS is too high.
        // Split speedMS into quarters and check the hold after each one.
        let quarterSpeed = Math.floor(speedMS / 4);

        for (let i = 0; i < 4; i++) {
            await delay(quarterSpeed);
            if (!hold || hardDropped) {
                return;
            }
        }

        if (activeShape.canShapeMove(controlsData.softDropKey)) {
            activeShape.moveShape(controlsData.softDropKey, false);
        } else {
            break
        }
    }

    // Give users a max of 1000 ms to rotate and move block around once it hits the bottom possible space.
    // Needs some rework
    let count = 0;
    incrementLoopCount = true;
    while (count <= loopCount && loopCount !== 0 && !hardDropped) {
        await delay(100);
        if (activeShape.canShapeMove(controlsData.softDropKey)) {
            if (!hold || hardDropped) {
                return;
            }
            return shapeDrop();
        }
        count++
    }

    // Update Game Variables
    userInput = false;
    incrementLoopCount = false;

    // Update shape's focalBox x and y coordinates.
    let focalBoxIndex = activeShape.getFocalIndex();
    activeShape.x = activeShape.boxes[focalBoxIndex].x
    activeShape.y = activeShape.boxes[focalBoxIndex].y
}

// Function for displaying a particular shape one of the side boxes.
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

// Instead of coding 180 individual divs, figured it would look cool to populate them incrementally to simulate "loading up" on the old systems.
// Creates rows and divs for the game grid with a 10 ms delay between each to simulate loading effect.
const populateGrid = async () => {

    await delay(250);

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

    // Next and Hold Box
    for (let i = 0; i < 5; i++) {
        const sectionOne = document.createElement("article");
        sectionOne.setAttribute("id", `next-y${i}`);
        sectionOne.setAttribute("class", `small-row`);
        nextPieceEl.appendChild(sectionOne);

        const sectionTwo = document.createElement("article");
        sectionTwo.setAttribute("id", `hold-y${i}`);
        sectionTwo.setAttribute("class", `small-row`);
        holdPieceEl.appendChild(sectionTwo);

        for (let j = 0; j < 5; j++) {
            const divOne = document.createElement("div");
            divOne.setAttribute("class", "small-div");
            sectionOne.appendChild(divOne);

            const divTwo = document.createElement("div");
            divTwo.setAttribute("class", "small-div");
            sectionTwo.appendChild(divTwo);
        }
    }

    allRows = [...document.getElementsByTagName("section")]
}

// Function to handle the clearing of rows when a piece is placed.
const clearRows = async () => {
    let clearedRows = [];
    let targetYRows = [];

    // Grab the unique y values from the activeShape's boxes.
    // Check to see if a row was cleared by any of those boxesx.
    activeShape.boxes.forEach(box => {
        // Only check unique rows.
        if (!targetYRows.includes(box.y)) {
            const targetY = box.y;

            const row = document.getElementById(`y${targetY}`);
            const childDivs = [...row.children];

            // If row is completely full...
            if (childDivs.every(div => div.classList.length !== 0)) {

                // Update the array variables.
                clearedRows.push(targetY);
                targetYRows.push(targetY);

                // Clear all divs within row.
                childDivs.forEach(div => {
                    div.removeAttribute("class");
                    div.removeAttribute("shapeid");
                });

            }
        }
    });

    // Update every shape on the page to move down but still keep it's form
    if (clearedRows.length > 0) {
        await delay(250);

        // Filter out shapes that have had all of their boxes deleted.
        // Update remaining shapes with remaining boxes.
        let filteredShapes = [];
        shapes.forEach(shape => {
            const filteredBoxes = shape.boxes.filter(box => !clearedRows.includes(box.y));

            if (filteredBoxes.length !== 0) {
                shape.boxes = filteredBoxes
                filteredShapes.push(shape);
            }
        });
        shapes = filteredShapes;

        // Loop over all rows in reverse order (except the bottom one)
        for (let i = 16; i > -1; i--) {

            // If the row loop is not a cleared row...
            if (!clearedRows.includes(i)) {
                // For each box on the board, we want to drop it the appropriate amount based on lines cleared below it.
                shapes.forEach(({ boxes }) => {
                    boxes.forEach((box) => {
                        if (box.y == i) {

                            // Drop the box based on how many lines were cleared below it.
                            box.updateDom(false);
                            box.y += clearedRows.filter(num => num > i).length;
                            box.updateDom(true);

                        }
                    });
                });
            }

        }

        // Update score based on number of lines cleared
        let modifier = 0;
        let levelMod = level == 0 ? 1 : level;
        switch (clearedRows.length) {
            case 4:
                modifier = 800
                break;
            case 3:
                modifier = 500
                break;
            case 2:
                modifier = 300
                break;
            default:
                modifier = 100
                break;
        }

        // Update the game variables
        clearedLinesCount += clearedRows.length;
        score += modifier * levelMod;
        scoreEl.textContent = `Score: ${score}`;

        // Update the game level based on rows cleared
        return updateLevel();
    }
}

const bagGeneration = () => {
    let pieces = [new I(5, 0), new J(5, 0), new L(5, 0), new O(5, 0), new S(5, 0), new T(5, 0), new Z(5, 0)];

    // Durstendfeld shuffle
    for (var i = pieces.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = pieces[i];
        pieces[i] = pieces[j];
        pieces[j] = temp;
    }

    return pieces
}

const updateLevel = () => {
    const lineTarget = Math.min(100, (level * 1) + 1);

    if (clearedLinesCount >= lineTarget) {
        level++

        // To calculate the milliseconds between piece auto-drop, there was some calculations I did on my end to keep it accurate to the original system.
        // Per the Tetris wikipedia, piece drop speed is determined by how many frames between piece drop (level 1 is 48 frames).
        // To translate this into seconds, I took the frame drop amount and divided it by the frame rate of the original NES system (60 fps).
        // So to determine any level's drop speed, dropSpeed = Math.ceil(frameDrop / 60)
        switch (level) {
            case 1:
                speedMS = 800;
                break;
            case 2:
                speedMS = 717;
                break;
            case 3:
                speedMS = 550;
                break;
            case 4:
                speedMS = 470;
                break;
            case 5:
                speedMS = 384;
                break;
            case 6:
                speedMS = 300;
                break;
            case 7:
                speedMS = 217;
                break;
            case 8:
                speedMS = 134;
                break;
            case 9:
                speedMS = 100;
                break;
            default:
                break;
        }

        if (level > 9 && level < 13) {
            speedMS = 84;
        } else if (level > 12 && level < 16) {
            speedMS = 64;
        } else if (level > 15 && level < 19) {
            speedMS = 50;
        } else if (level > 18 && level < 29) {
            speedMS = 33;
        } else if (level > 28) {
            speedMS = 17;
        }

        levelEl.textContent = `Level: ${level}`
    }

    return;
}

const endGame = async () => {
    userInput = false;

    await delay(250);

    const reversedAllRows = allRows.reverse()

    for (let i = 0; i < reversedAllRows.length; i++) {
        for (let j = 9; j > -1; j--) {
            reversedAllRows[i].children[j].remove();
            await delay(10)
        }
    }

    for (let i = 0; i < reversedAllRows.length; i++) {
        reversedAllRows[i].remove();
    }

    for (let i = 4; i > -1; i--) {
        const rowOne = document.getElementById(`next-y${i}`);
        const rowTwo = document.getElementById(`hold-y${i}`);

        for (let j = 4; j > -1; j--) {
            rowOne.children[j].remove();
            rowTwo.children[j].remove();
        }

        rowOne.remove();
        rowTwo.remove();
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
        allRows = [];
        holdPiece = null;
        level = 0;
        clearedLinesCount = 0;
        speedMS = 1000;

        return init();
    });

    for (let i = 0; i < gameOverElements.length; i++) {
        gameBoxEl.appendChild(gameOverElements[i])
    }
    gameBoxEl.setAttribute("class", "end-game");
}

const populateControlsBox = () => {
    for (let i = 0; i < 7; i++) {
        const controlSection = document.createElement("section");
        const controlP = document.createElement("p");
        const controlSpan = document.createElement("p");
        const controlButton = document.createElement("button");
        if (i !== 6) {
            controlSection.setAttribute("class", "border-bottom-dashed");
        }

        controlButton.textContent = "Change";

        switch (i) {
            case 0:
                controlP.innerHTML = "<b>Left Move:</b>";
                controlSpan.textContent = controlsData.leftMoveKey;
                controlSpan.setAttribute("id", "leftMoveKey");
                break;
            case 1:
                controlP.innerHTML = "<b>Right Move:</b>";
                controlSpan.textContent = controlsData.rightMoveKey;
                controlSpan.setAttribute("id", "rightMoveKey");
                break;
            case 2:
                controlP.innerHTML = "<b>Soft Drop:</b>";
                controlSpan.textContent = controlsData.softDropKey;
                controlSpan.setAttribute("id", "softDropKey");
                break;
            case 3:
                controlP.innerHTML = "<b>Hard Drop:</b>";
                controlSpan.textContent = controlsData.hardDropKey;
                controlSpan.setAttribute("id", "hardDropKey");
                break;
            case 4:
                controlP.innerHTML = "<b>Left Rotate:</b>";
                controlSpan.textContent = controlsData.leftRotateKey;
                controlSpan.setAttribute("id", "leftRotateKey");
                break;
            case 5:
                controlP.innerHTML = "<b>Right Rotate:</b>";
                controlSpan.textContent = controlsData.rightRotateKey;
                controlSpan.setAttribute("id", "rightRotateKey");
                break;
            default:
                controlP.innerHTML = "<b>Hold Piece:</b>";
                controlSpan.textContent = controlsData.holdPieceKey;
                controlSpan.setAttribute("id", "holdPieceKey");
                break;
        }

        controlsBoxEl.appendChild(controlSection);
        controlSection.appendChild(controlP);
        controlSection.appendChild(controlSpan);
        controlSection.appendChild(controlButton);

        controlButton.addEventListener("click", changeControlKey)
    }
}

const changeControlKey = (event) => {
    const controlTarget = event.target.previousElementSibling.previousElementSibling.textContent;
    modal.style.display = "block";

    switch (controlTarget) {
        case "Left Move:":
            targetControlChange = "leftMoveKey";
            break;
        case "Right Move:":
            targetControlChange = "rightMoveKey";
            break;
        case "Soft Drop:":
            targetControlChange = "softDropKey";
            break;
        case "Hard Drop:":
            targetControlChange = "hardDropKey";
            break;
        case "Left Rotate:":
            targetControlChange = "leftRotateKey";
            break;
        case "Right Rotate:":
            targetControlChange = "rightRotateKey";
            break;
        default:
            targetControlChange = "holdPieceKey";
            break;
    }

}

document.addEventListener("keydown", (e) => {
    let key = e.key === " " ? "Space" : e.key;

    if (modal.style.display === "block") {
        e.preventDefault();
        controlsData[targetControlChange] = key;
        document.getElementById(targetControlChange).textContent = key;
        localStorage.setItem("blockGameControls", JSON.stringify(controlsData));
        modal.style.display = "none";
    }

    if (!userInput) {
        return
    }

    if (key === controlsData.leftMoveKey || key === controlsData.rightMoveKey || key === controlsData.softDropKey || key === controlsData.hardDropKey) {
        const totalRows = activeShape.moveShape(key, true);

        if (key === controlsData.hardDropKey) {
            hardDropped = true;
            userInput = false;
            loopCount = 0;
        } else if (incrementLoopCount && loopCount < 10) {
            loopCount++
        }

        if (totalRows !== 0) {
            score += totalRows
            scoreEl.textContent = `Score: ${score}`
        }

    } else if (key == controlsData.leftRotateKey) {
        activeShape.rotatePiece(1);
    } else if (key == controlsData.rightRotateKey) {
        activeShape.rotatePiece(2);
    } else if (key === controlsData.holdPieceKey) {
        e.preventDefault();
        if (!hasSwappedHold) {
            hold = false;
        }
    }
});
startBtnEl.addEventListener("click", () => {
    gameBoxEl.removeAttribute("class");
    h3El.removeAttribute("class");
    startBtnEl.setAttribute("class", "display-none");
    controlsEl.setAttribute("class", "display-none");
    init();
});
controlsEl.addEventListener("click", () => {
    if (changeControls) {
        controlsEl.textContent = "Controls";
        startBtnEl.classList.remove("display-none");
        controlsBoxEl.classList.add("display-none");
        changeControls = false;
    } else {
        controlsEl.textContent = "Go Back";
        startBtnEl.classList.add("display-none");
        controlsBoxEl.classList.remove("display-none");
        changeControls = true;

        if (document.getElementById("leftMoveKey") === null) {
            populateControlsBox();
        }
    }
});
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});