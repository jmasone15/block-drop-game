const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let userInput = false;
let activeShape;
let shapeCounter = 0;
let gameActive = false;

const init = async () => {
    await populateGrid();

    game();
}

const game = async () => {
    gameActive = true;

    while (gameActive) {
        await createShape();
    }
}

const createShape = async () => {
    shapeCounter++
    activeShape = new L(5, 0, shapeCounter);
    userInput = true;
    userInput = await activeShape.shapeGravity();
    await delay(1000)
}

const populateGrid = async () => {

    await delay(1000)

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


init();