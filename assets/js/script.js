const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

    const boxOne = new Box(4, 0, "magenta");
    const boxTwo = new Box(4, 0, "blue");
    await boxOne.gravity();
    await boxTwo.gravity();
}

populateGrid();