// X goes from 0 - 9
// Y goes from 0 - 17
class Box {
    constructor(x, y, color, shapeId) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.shapeId = shapeId;
    }

    updateDom(show) {
        const row = document.getElementById(`y${this.y}`);
        const div = row.children[this.x];

        if (show) {
            div.setAttribute("class", this.color);
            div.setAttribute("shapeId", this.shapeId);
        } else {
            div.removeAttribute("class");
            div.removeAttribute("shapeId");
        }
    }

    canBoxMove(direction) {
        let targetX = this.x;
        let targetY = this.y;

        switch (direction) {
            case "ArrowLeft":
                targetX--
                break;
            case "ArrowRight":
                targetX++
                break;
            case "ArrowDown":
                targetY++
                break;
            default:
                break;
        }

        if (targetX < 0 || targetX > 9 || targetY < 0 || targetY > 17) {
            return false
        }

        const targetRow = document.getElementById(`y${targetY}`);
        const targetBox = targetRow.children[targetX];

        if (targetBox.classList.length == 0) {
            console.log("1");
            return true   
        } else {
            if (targetBox.getAttribute("shapeId") == this.shapeId) {
                console.log("2");
                return true
            } else {
                console.log("3");
                return false
            }
        }
    }
}

// L piece (light-blue) | O piece (yellow) | T piece (magenta) | S piece (green)
// Z piece (red) | J piece (blue) | L piece (orange)
class Shape {
    constructor(x, y, shapeId) {
        this.x = x;
        this.y = y;
        this.position = 1;
        this.color = "";
        this.shapeId = shapeId;
    }

    populateShape(show) {
        for (let i = 0; i < this.boxes.length; i++) {
            this.boxes[i].updateDom(show);
        }
    }

    canShapeMove(direction) {
        const boxesCanMove = this.boxes.filter(x => x.canBoxMove(direction));
        return boxesCanMove.length == 4
    }

    moveShape(direction) {

        this.populateShape(false);

        if (!this.canShapeMove(direction)) {
            this.populateShape(true);
            return
        }

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
                default:
                    break;
            }
        }

        this.populateShape(true);
    }

    async shapeGravity() {
        this.populateShape(true);

        while (this.canShapeMove("ArrowDown")) {
            await delay(500)

            // User could reach bottom with arrow keys 
            if (this.canShapeMove("ArrowDown")) {
                this.moveShape("ArrowDown")
            } else {
                break
            }
        }

        await delay(500)

        while (this.canShapeMove("ArrowDown")) {
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
    constructor(x, y, position, color, shapeId) {
        super(x, y, position, color, shapeId);
        this.color = "light-blue";
        this.focalBox = new Box(x, y, this.color, this.shapeId);
        this.boxes = [
            new Box(x - 2, y, this.color, this.shapeId),
            new Box(x - 1, y, this.color, this.shapeId),
            this.focalBox,
            new Box(x + 1, y, this.color, this.shapeId)
        ]
    }

    rotatePiece(num) {

        this.populateShape(false);

        if (num == 1) {
            switch (this.position) {
                case 1:
                    this.boxes[0].x++
                    this.boxes[0].y += 2

                    this.boxes[1].y++

                    this.boxes[2].x--

                    this.boxes[3].x += -2
                    this.boxes[3].y--

                    this.position = 4
                    break;

                case 2:
                    this.boxes[0].x += -2
                    this.boxes[0].y++

                    this.boxes[1].x--

                    this.boxes[2].y--

                    this.boxes[3].x++
                    this.boxes[3].y += -2

                    this.position--
                    break;

                case 3:
                    this.boxes[0].x--
                    this.boxes[0].y += -2

                    this.boxes[1].y--

                    this.boxes[2].x++

                    this.boxes[3].x += 2
                    this.boxes[3].y++

                    this.position--
                    break;

                default:
                    this.boxes[0].x += 2
                    this.boxes[0].y--

                    this.boxes[1].x++

                    this.boxes[2].y++

                    this.boxes[3].x--
                    this.boxes[3].y += 2

                    this.position--
                    break;
            }
        } else {
            switch (this.position) {
                case 1:
                    this.boxes[0].x += 2
                    this.boxes[0].y--

                    this.boxes[1].x++

                    this.boxes[2].y++

                    this.boxes[3].x--
                    this.boxes[3].y += 2

                    this.position++
                    break;

                case 2:
                    this.boxes[0].x++
                    this.boxes[0].y += 2

                    this.boxes[1].y++

                    this.boxes[2].x--

                    this.boxes[3].x += -2
                    this.boxes[3].y--

                    this.position++
                    break;

                case 3:
                    this.boxes[0].x += -2
                    this.boxes[0].y++

                    this.boxes[1].x--

                    this.boxes[2].y--

                    this.boxes[3].x++
                    this.boxes[3].y += -2

                    this.position++
                    break;

                default:
                    this.boxes[0].x--
                    this.boxes[0].y -= 2

                    this.boxes[1].y--

                    this.boxes[2].x++

                    this.boxes[3].x += 2
                    this.boxes[3].y++

                    this.position = 1
                    break;
            }
        }

        this.populateShape(true);
    }
}