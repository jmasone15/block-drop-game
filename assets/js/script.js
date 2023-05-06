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

            if (targetBox.classList.length !== 0) {
                return endGame();
            }
        }

        // Display the next shape in the next sub-grid
        displayShape(i == 6 ? nextBag[0].color : currentBag[i + 1].color, "next");

        // Increment shape counter and use that as the shapeId
        shapeCounter++
        shape.updateShapeId(shapeCounter);

        // Set the current shape to the activeShape global variabel and start the shape drop.
        activeShape = shape;
        await shapeDrop();

        // The shapeDrop function will be cancelled if the user presses the hold piece key.
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

        hardDropped = false;
        hasSwappedHold = false;
        shapes.push(activeShape);

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
    activeShape.populateShape(true);
    userInput = true;
    loopCount = 1;

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

    // Set the shape to the focal point
    // Change this to be a method for each shape
    userInput = false;
    incrementLoopCount = false;
    let focalBoxIndex = activeShape.getFocalIndex();

    activeShape.x = activeShape.boxes[focalBoxIndex].x
    activeShape.y = activeShape.boxes[focalBoxIndex].y
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

const clearRows = async () => {
    let clearedRows = [];
    let targetYRows = [];

    for (let i = 0; i < activeShape.boxes.length; i++) {
        if (!targetYRows.includes(activeShape.boxes[i].y)) {
            targetYRows.push(activeShape.boxes[i].y)
        }
    }
    
    for (let i = 0; i < targetYRows.length; i++) {
        const row = document.getElementById(`y${targetYRows[i]}`);
        const childDivs = Array.from(row.children);

        // If row is full
        // might be better with an every method
        if (childDivs.filter(div => div.classList.length !== 0).length == 10) {

            clearedRows.push(targetYRows[i]);

            // Remove attributes from all blocks
            for (let j = 0; j < childDivs.length; j++) {

                childDivs[j].removeAttribute("class");
                childDivs[j].removeAttribute("shapeid");

            }
        }
    }

    // Update every shape on the page to move down but still keep it's form
    if (clearedRows.length > 0) {
        await delay(250);

        clearedLinesCount += clearedRows.length;

        shapes.forEach(shape => {
            const filteredBoxes = shape.boxes.filter(box => !clearedRows.includes(box.y));
            shape.boxes = filteredBoxes
        });

        const filteredShapes = shapes.filter(shape => {
            return shape.boxes.length !== 0
        });

        shapes = filteredShapes


        // Loop over all rows in reverse order (except the bottom one)
        for (let i = 16; i > -1; i--) {
            // If the row loop is a cleared row, skip.
            if (clearedRows.includes(i)) {
                continue
            } else {
                // For each box on the board, we want to drop it the appropriate amount based on lines cleared.
                shapes.forEach(({ boxes }) => {
                    boxes.forEach((box) => {
                        if (box.y == i) {
                            // Drop the box based on how many lines were cleared below it.
                            let dropAmount = clearedRows.filter(num => num > i).length;

                            box.updateDom(false);
                            box.y += dropAmount;
                            box.updateDom(true);
                        }
                    });
                });
            }
        }

        let modifier = 0;
        let levelMod = level;
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

        if (level == 0) {
            levelMod = 1
        }

        score += modifier * levelMod;
        scoreEl.textContent = `Score: ${score}`
        updateLevel();
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
    if (e.target == modal) {
        modal.style.display = "none";
    }
});