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

// L piece (light-blue) | O piece (yellow) | T piece (magenta) | S piece (green)
// Z piece (red) | J piece (blue) | L piece (orange)
class Shape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    populateShape(show) {
        for (let i = 0; i < this.boxes.length; i++) {
            this.boxes[i].updateDom(show);
        }
    }

    canShapeMove(direction) {
        for (let i = 0; i < this.boxes.length; i++) {

            switch (direction) {
                case "ArrowLeft":
                    if (this.boxes[i].x == 0) {
                        return false
                    }
                    break;
                case "ArrowRight":
                    if (this.boxes[i].x == 9) {
                        return false
                    }
                    break;
                default:
                    if (this.boxes[i].y == 17) {
                        return false
                    }
                    break;
            }
        }

        return true
    }

    moveShape(direction) {

        this.populateShape(false);

        for (let i = 0; i < this.boxes.length; i++) {
            switch (direction) {
                case "ArrowLeft":
                    this.boxes[i].x--
                    break;
                case "ArrowRight":
                    this.boxes[i].x++
                    break;
                case "ArrowDown":
                    this.boxes[i].y++
                    break;
                case "ArrowUp":
                    this.boxes[i].y = 17
                    break;
                default:
                    break;
            }
        }

        this.populateShape(true);
    }

    async shapeGravity() {
        this.populateShape(true);

        while (this.canShapeMove("ArrowDown")) {
            await delay(1000)
            
            // User could reach bottom with arrow keys 
            if (this.canShapeMove("ArrowDown")) {
                this.moveShape("ArrowDown")
            } else {
                break
            }
        }

        return false
    }
}

class L extends Shape {
    constructor(x, y) {
        super(x, y);
        this.color = "light-blue";
        this.focalBox = new Box(x, y, this.color);
        this.boxes = [
            new Box(x - 2, y, this.color),
            new Box(x - 1, y, this.color),
            this.focalBox,
            new Box(x + 1, y, this.color)
        ]
    }
}