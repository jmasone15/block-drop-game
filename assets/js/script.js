const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const populateGrid = async () => {

    await delay(1000)

    for (let i = 0; i < 18; i++) {
        const section = document.createElement("section");

        document.getElementById("game-box").appendChild(section);
        
        for (let i = 0; i < 10; i++) {
            const div = document.createElement("div");
            section.appendChild(div);
            await delay(10)
        }
    }
}

populateGrid()