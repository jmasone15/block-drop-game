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

        if (!targetRow) {
            return false
        }

        const targetBox = targetRow.children[targetX];

        if (targetBox.classList.length == 0) {
            return true
        } else {
            if (targetBox.getAttribute("shapeId") == this.shapeId) {
                return true
            } else {
                return false
            }
        }
    }

    canBoxRotate(targetX, targetY) {
        if (targetX < 0 || targetX > 9 || targetY < 0 || targetY > 17) {
            return false
        }

        const targetRow = document.getElementById(`y${targetY}`);

        if (!targetRow) {
            return false
        }

        const targetBox = targetRow.children[targetX];

        if (targetBox.classList.length == 0) {
            return true
        } else {
            if (targetBox.getAttribute("shapeId") == this.shapeId) {
                return true
            } else {
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

    getRotatedPositions(num) {
        let box0 = { x: this.boxes[0].x, y: this.boxes[0].y };
        let box1 = { x: this.boxes[1].x, y: this.boxes[1].y };
        let box2 = { x: this.boxes[2].x, y: this.boxes[2].y };
        let box3 = { x: this.boxes[3].x, y: this.boxes[3].y };

        if (num == 1) {
            switch (this.position) {
                case 1:
                    box0.x++
                    box0.y += 2

                    box1.y++

                    box2.x--

                    box3.x += -2
                    box3.y--

                    this.position = 4
                    break;

                case 2:
                    box0.x += -2
                    box0.y++

                    box1.x--

                    box2.y--

                    box3.x++
                    box3.y += -2

                    this.position--
                    break;

                case 3:
                    box0.x--
                    box0.y += -2

                    box1.y--

                    box2.x++

                    box3.x += 2
                    box3.y++

                    this.position--
                    break;

                default:
                    box0.x += 2
                    box0.y--

                    box1.x++

                    box2.y++

                    box3.x--
                    box3.y += 2

                    this.position--
                    break;
            }
        } else {
            switch (this.position) {
                case 1:
                    box0.x += 2
                    box0.y--

                    box1.x++

                    box2.y++

                    box3.x--
                    box3.y += 2

                    this.position++
                    break;

                case 2:
                    box0.x++
                    box0.y += 2

                    box1.y++

                    box2.x--

                    box3.x += -2
                    box3.y--

                    this.position++
                    break;

                case 3:
                    box0.x += -2
                    box0.y++

                    box1.x--

                    box2.y--

                    box3.x++
                    box3.y += -2

                    this.position++
                    break;

                default:
                    box0.x--
                    box0.y -= 2

                    box1.y--

                    box2.x++

                    box3.x += 2
                    box3.y++

                    this.position = 1
                    break;
            }
        }

        return [box0, box1, box2, box3]
    }

    // If can't rotate because of external bounds, push the shape in the opposite direction and rerun
    canPieceRotate(newPositions) {
        const canBoxesRotate = this.boxes.filter((x, i) => x.canBoxRotate(newPositions[i].x, newPositions[i].y));
        return canBoxesRotate.length == 4
    }

    rotatePiece(num) {

        this.populateShape(false);

        const newPositions = this.getRotatedPositions(num);

        if (this.canPieceRotate(newPositions)) {
            for (let i = 0; i < this.boxes.length; i++) {
                this.boxes[i].x = newPositions[i].x
                this.boxes[i].y = newPositions[i].y
            }
        }


        this.populateShape(true);
    }
}