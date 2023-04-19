const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let userInput = false;
let activeShape;

const init = async () => {
    await populateGrid();

    game();
}

const game = async () => {
    activeShape = new L(5, 0);
    activeShape.populateShape(true);

    userInput = true
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
    
    activeShape.moveShape(key)
})

init();