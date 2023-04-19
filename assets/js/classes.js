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

    isTouching() {

        if (this.y < 17) {
            const nextRow = document.getElementById(`y${this.y + 1}`);
            const targetDiv = nextRow.children[this.x];
            return targetDiv.classList.length > 0
        }
        
        return true
    }

    async gravity() {
        this.updateDom(true);

        await delay(100);

        while (!this.isTouching()) {
            this.updateDom(false)
            this.y++
            this.updateDom(true)
            await delay(50)
        }
        
    }
}