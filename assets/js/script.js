const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// X goes from 0 - 9
// Y goes from 0 - 17
class Box {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    targetDiv() {
        const row = document.getElementById(`y${this.y}`);
        return row.children[this.x]
    }

    updateDom(show) {
        const div = this.targetDiv();

        if (show) {
            div.setAttribute("class", this.color);
        } else {
            div.removeAttribute("class");
        }
    }

    async gravity() {
        this.updateDom(true);

        await delay(100)

        while (this.y < 17) {
            this.updateDom(false)
            this.y++
            this.updateDom(true)
            await delay(50)
        }
    }
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

    const newBox = new Box(4, 0, "magenta");
    await newBox.gravity();
}

populateGrid();