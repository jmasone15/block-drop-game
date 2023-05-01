// X goes from 0 - 9
// Y goes from 0 - 17
class Box {
    constructor(x, y, color, shapeId, order) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.shapeId = shapeId;
        this.order = order;
    }

    updateDom(show, target) {
        const row = !target ? document.getElementById(`y${this.y}`) : document.getElementById(`${target}-y${this.y}`);
        const div = row.children[this.x];
        let classes = [this.color, "active"];

        if (show) {
            div.classList.add(...classes);
            div.setAttribute("shapeId", this.shapeId);
        } else {
            div.classList.remove(...classes);
            div.removeAttribute("shapeId");
        }
    }

    canBoxMove(targetX, targetY, direction, ignoreShapeId) {
        let x = this.x;
        let y = this.y;

        if (!targetX || !targetY) {
            switch (direction) {
                case "ArrowLeft":
                    x--
                    break;
                case "ArrowRight":
                    x++
                    break;
                case "ArrowDown":
                    y++
                    break;
                default:
                    break;
            }
        } else {
            x = targetX;
            y = targetY;
        }

        // Blocked by borders
        if (x < 0 || x > 9 || y < 0 || y > 17) {
            return false
        }

        // Blocked by other shape
        const targetRow = document.getElementById(`y${y}`);
        const targetBox = targetRow.children[x];

        if (targetBox.classList.length == 0) {
            return true
        } else {
            // Check to see if next location is owned by box within same shape
            if (targetBox.getAttribute("shapeId") == this.shapeId && !ignoreShapeId) {
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

    populateShape(show, isSmall) {
        for (let i = 0; i < this.boxes.length; i++) {
            this.boxes[i].updateDom(show, isSmall);
        }
    }

    canShapeMove(direction, newPositions) {
        let boxesCanMove;

        if (!direction) {
            boxesCanMove = this.boxes.filter((x, i) => x.canBoxMove(newPositions[i].x, newPositions[i].y, direction));
        } else {
            boxesCanMove = this.boxes.filter(x => x.canBoxMove(null, null, direction));
        }

        return boxesCanMove.length == this.boxes.length
    }

    moveShape(direction) {

        this.populateShape(false);

        if (!this.canShapeMove(direction, [])) {
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

    rotatePiece(num) {

        this.populateShape(false);

        const newPositions = this.getRotatedPositions(num);

        if (this.canShapeMove("", newPositions)) {

            if (num == 1) {
                if (this.position == 1) {
                    this.position = 4
                } else {
                    this.position--
                }
            } else {
                if (this.position == 4) {
                    this.position = 1
                } else {
                    this.position++
                }
            }

            for (let i = 0; i < this.boxes.length; i++) {
                this.boxes[i].x = newPositions[i].x
                this.boxes[i].y = newPositions[i].y
            }
        }

        this.populateShape(true);
    }

    updateShapeId(id) {
        this.shapeId = id

        for (let i = 0; i < this.boxes.length; i++) {
            this.boxes[i].shapeId = this.shapeId
        }
    }

    getFocalIndex() {
        if (this.color === "light-blue" || this.color === "blue" || this.color === "magenta" || this.color === "red") {
            return 2
        } else {
            return 1
        }
    }
}

class I extends Shape {
    constructor(x, y, position, color, shapeId) {
        super(x, y, position, color, shapeId);
        this.color = "light-blue";
        this.focalBox = new Box(x, y, this.color, this.shapeId, 3);
        this.boxes = [
            new Box(x - 2, y, this.color, this.shapeId, 1),
            new Box(x - 1, y, this.color, this.shapeId, 2),
            this.focalBox,
            new Box(x + 1, y, this.color, this.shapeId, 4)
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

                    break;

                case 2:
                    box0.x += -2
                    box0.y++

                    box1.x--

                    box2.y--

                    box3.x++
                    box3.y += -2

                    break;

                case 3:
                    box0.x--
                    box0.y += -2

                    box1.y--

                    box2.x++

                    box3.x += 2
                    box3.y++

                    break;

                default:
                    box0.x += 2
                    box0.y--

                    box1.x++

                    box2.y++

                    box3.x--
                    box3.y += 2

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

                    break;

                case 2:
                    box0.x++
                    box0.y += 2

                    box1.y++

                    box2.x--

                    box3.x += -2
                    box3.y--

                    break;

                case 3:
                    box0.x += -2
                    box0.y++

                    box1.x--

                    box2.y--

                    box3.x++
                    box3.y += -2

                    break;

                default:
                    box0.x--
                    box0.y -= 2

                    box1.y--

                    box2.x++

                    box3.x += 2
                    box3.y++

                    break;
            }
        }

        return [box0, box1, box2, box3]
    }

    resetShape(x, y) {
        this.x = x;
        this.y = y;

        this.focalBox.x = x;
        this.focalBox.y = y;

        this.boxes = [
            new Box(x - 2, y, this.color, this.shapeId, 1),
            new Box(x - 1, y, this.color, this.shapeId, 2),
            this.focalBox,
            new Box(x + 1, y, this.color, this.shapeId, 4)
        ]

        this.position = 1;
    }
}

class J extends Shape {
    constructor(x, y, position, color, shapeId) {
        super(x, y, position, color, shapeId);
        this.color = "blue";
        this.focalBox = new Box(x, y + 1, this.color, this.shapeId, 3);
        this.boxes = [
            new Box(x - 1, y, this.color, this.shapeId, 1),
            new Box(x - 1, y + 1, this.color, this.shapeId, 2),
            this.focalBox,
            new Box(x + 1, y + 1, this.color, this.shapeId, 3)
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
                    box0.y += 2

                    box1.x++
                    box1.y++

                    box3.x--
                    box3.y--

                    break;

                case 2:
                    box0.x -= 2

                    box1.x--
                    box1.y++

                    box3.x++
                    box3.y--

                    break;

                case 3:
                    box0.y -= 2

                    box1.x--
                    box1.y--

                    box3.x++
                    box3.y++

                    break;

                default:
                    box0.x += 2

                    box1.x++
                    box1.y--

                    box3.x--
                    box3.y++

                    break;
            }
        } else {
            switch (this.position) {
                case 1:
                    box0.x += 2

                    box1.x++
                    box1.y--

                    box3.x--
                    box3.y++
                    break;

                case 2:
                    box0.y += 2;

                    box1.x++
                    box1.y++

                    box3.x--
                    box3.y--

                    break;

                case 3:
                    box0.x -= 2

                    box1.x--
                    box1.y++

                    box3.x++
                    box3.y--

                    break;

                default:
                    box0.y -= 2

                    box1.y--
                    box1.x--

                    box3.x++
                    box3.y++

                    break;
            }
        }

        return [box0, box1, box2, box3]
    }

    resetShape(x, y) {
        this.x = x;
        this.y = y;

        this.focalBox.x = x;
        this.focalBox.y = y + 1;

        this.boxes = [
            new Box(x - 1, y, this.color, this.shapeId, 1),
            new Box(x - 1, y + 1, this.color, this.shapeId, 2),
            this.focalBox,
            new Box(x + 1, y + 1, this.color, this.shapeId, 3)
        ]

        this.position = 1;
    }
}

class L extends Shape {
    constructor(x, y, position, color, shapeId) {
        super(x, y, position, color, shapeId);
        this.color = "orange";
        this.focalBox = new Box(x, y + 1, this.color, this.shapeId, 2);
        this.boxes = [
            new Box(x - 1, y + 1, this.color, this.shapeId, 1),
            this.focalBox,
            new Box(x + 1, y + 1, this.color, this.shapeId, 3),
            new Box(x + 1, y, this.color, this.shapeId, 4)
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
                    box0.y++

                    box2.x--
                    box2.y--

                    box3.x -= 2

                    break;

                case 2:
                    box0.x--
                    box0.y++

                    box2.x++
                    box2.y--

                    box3.y -= 2

                    break;

                case 3:
                    box0.x--
                    box0.y--

                    box2.x++
                    box2.y++

                    box3.x += 2

                    break;

                default:
                    box0.x++
                    box0.y--

                    box2.x--
                    box2.y++

                    box3.y += 2

                    break;
            }
        } else {
            switch (this.position) {
                case 1:
                    box0.x++
                    box0.y--

                    box2.x--
                    box2.y++

                    box3.y += 2

                    break;

                case 2:
                    box0.x++
                    box0.y++

                    box2.x--
                    box2.y--

                    box3.x -= 2

                    break;

                case 3:
                    box0.x--
                    box0.y++

                    box2.x++
                    box2.y--

                    box3.y -= 2

                    break;

                default:
                    box0.x--
                    box0.y--

                    box2.x++
                    box2.y++

                    box3.x += 2

                    break;
            }
        }

        return [box0, box1, box2, box3]
    }

    resetShape(x, y) {
        this.x = x;
        this.y = y;

        this.focalBox.x = x;
        this.focalBox.y = y + 1;

        this.boxes = [
            new Box(x - 1, y + 1, this.color, this.shapeId, 1),
            this.focalBox,
            new Box(x + 1, y + 1, this.color, this.shapeId, 3),
            new Box(x + 1, y, this.color, this.shapeId, 4)
        ]

        this.position = 1;
    }
}

class O extends Shape {
    constructor(x, y, position, color, shapeId) {
        super(x, y, position, color, shapeId);
        this.color = "yellow";
        this.focalBox = new Box(x, y, this.color, this.shapeId, 2);
        this.boxes = [
            new Box(x - 1, y, this.color, this.shapeId, 1),
            this.focalBox,
            new Box(x - 1, y + 1, this.color, this.shapeId, 3),
            new Box(x, y + 1, this.color, this.shapeId, 4)
        ]
    }

    getRotatedPositions(num) {
        let box0 = { x: this.boxes[0].x, y: this.boxes[0].y };
        let box1 = { x: this.boxes[1].x, y: this.boxes[1].y };
        let box2 = { x: this.boxes[2].x, y: this.boxes[2].y };
        let box3 = { x: this.boxes[3].x, y: this.boxes[3].y };

        return [box0, box1, box2, box3]
    }

    resetShape(x, y) {
        this.x = x;
        this.y = y;

        this.focalBox.x = x;
        this.focalBox.y = y;

        this.boxes = [
            new Box(x - 1, y, this.color, this.shapeId, 1),
            this.focalBox,
            new Box(x - 1, y + 1, this.color, this.shapeId, 3),
            new Box(x, y + 1, this.color, this.shapeId, 4)
        ]

        this.position = 1;
    }
}

class S extends Shape {
    constructor(x, y, position, color, shapeId) {
        super(x, y, position, color, shapeId);
        this.color = "green";
        this.focalBox = new Box(x, y + 1, this.color, this.shapeId, 2);
        this.boxes = [
            new Box(x - 1, y + 1, this.color, this.shapeId, 1),
            this.focalBox,
            new Box(x, y, this.color, this.shapeId, 3),
            new Box(x + 1, y, this.color, this.shapeId, 4)
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
                    box0.y++

                    box2.x--
                    box2.y++

                    box3.x -= 2

                    break;

                case 2:
                    box0.x--
                    box0.y++

                    box2.x--
                    box2.y--

                    box3.y -= 2

                    break;

                case 3:
                    box0.x--
                    box0.y--

                    box2.x++
                    box2.y--

                    box3.x += 2

                    break;

                default:
                    box0.x++
                    box0.y--

                    box2.x++
                    box2.y++

                    box3.y += 2

                    break;
            }
        } else {
            switch (this.position) {
                case 1:
                    box0.x++
                    box0.y--

                    box2.x++
                    box2.y++

                    box3.y += 2

                    break;

                case 2:
                    box0.x++
                    box0.y++

                    box2.x--
                    box2.y++

                    box3.x -= 2

                    break;

                case 3:
                    box0.x--
                    box0.y++

                    box2.x--
                    box2.y--

                    box3.y -= 2

                    break;

                default:
                    box0.x--
                    box0.y--

                    box2.x++
                    box2.y--

                    box3.x += 2

                    break;
            }
        }

        return [box0, box1, box2, box3]
    }

    resetShape(x, y) {
        this.x = x;
        this.y = y;

        this.focalBox.x = x;
        this.focalBox.y = y + 1;

        this.boxes = [
            new Box(x - 1, y + 1, this.color, this.shapeId, 1),
            this.focalBox,
            new Box(x, y, this.color, this.shapeId, 3),
            new Box(x + 1, y, this.color, this.shapeId, 4)
        ]

        this.position = 1;
    }
}

class T extends Shape {
    constructor(x, y, position, color, shapeId) {
        super(x, y, position, color, shapeId);
        this.color = "magenta";
        this.focalBox = new Box(x, y + 1, this.color, this.shapeId, 3);
        this.boxes = [
            new Box(x - 1, y + 1, this.color, this.shapeId, 1),
            new Box(x, y, this.color, this.shapeId, 2),
            this.focalBox,
            new Box(x + 1, y + 1, this.color, this.shapeId, 4)
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
                    box0.y++

                    box1.x--
                    box1.y++

                    box3.x--
                    box3.y--
                    break;

                case 2:
                    box0.x--
                    box0.y++

                    box1.x--
                    box1.y--

                    box3.x++
                    box3.y--
                    break;

                case 3:
                    box0.x--
                    box0.y--

                    box1.x++
                    box1.y--

                    box3.x++
                    box3.y++
                    break;

                default:
                    box0.x++
                    box0.y--

                    box1.x++
                    box1.y++

                    box3.x--
                    box3.y++
                    break;
            }
        } else {
            switch (this.position) {
                case 1:
                    box0.x++
                    box0.y--

                    box1.x++
                    box1.y++

                    box3.x--
                    box3.y++
                    break;

                case 2:
                    box0.x++
                    box0.y++

                    box1.x--
                    box1.y++

                    box3.x--
                    box3.y--
                    break;

                case 3:
                    box0.x--
                    box0.y++

                    box1.x--
                    box1.y--

                    box3.x++
                    box3.y--
                    break;

                default:
                    box0.x--
                    box0.y--

                    box1.x++
                    box1.y--

                    box3.x++
                    box3.y++
                    break;
            }
        }

        return [box0, box1, box2, box3]
    }

    resetShape(x, y) {
        this.x = x;
        this.y = y;

        this.focalBox.x = x;
        this.focalBox.y = y + 1;

        this.boxes = [
            new Box(x - 1, y + 1, this.color, this.shapeId, 1),
            new Box(x, y, this.color, this.shapeId, 2),
            this.focalBox,
            new Box(x + 1, y + 1, this.color, this.shapeId, 4)
        ]

        this.position = 1;
    }
}

class Z extends Shape {
    constructor(x, y, position, color, shapeId) {
        super(x, y, position, color, shapeId);
        this.color = "red";
        this.focalBox = new Box(x, y + 1, this.color, this.shapeId, 3);
        this.boxes = [
            new Box(x - 1, y, this.color, this.shapeId, 1),
            new Box(x, y, this.color, this.shapeId, 2),
            this.focalBox,
            new Box(x + 1, y + 1, this.color, this.shapeId, 4)
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
                    box0.y += 2

                    box1.x--
                    box1.y++

                    box3.x--
                    box3.y--
                    break;

                case 2:
                    box0.x -= 2

                    box1.x--
                    box1.y--

                    box3.x++
                    box3.y--
                    break;

                case 3:
                    box0.y -= 2

                    box1.x++
                    box1.y--

                    box3.x++
                    box3.y++
                    break;

                default:
                    box0.x += 2

                    box1.x++
                    box1.y++

                    box3.x--
                    box3.y++
                    break;
            }
        } else {
            switch (this.position) {
                case 1:
                    box0.x += 2

                    box1.x++
                    box1.y++

                    box3.x--
                    box3.y++
                    break;

                case 2:
                    box0.y += 2

                    box1.x--
                    box1.y++

                    box3.x--
                    box3.y--
                    break;

                case 3:
                    box0.x -= 2

                    box1.x--
                    box1.y--

                    box3.x++
                    box3.y--
                    break;

                default:
                    box0.y -= 2

                    box1.x++
                    box1.y--

                    box3.x++
                    box3.y++
                    break;
            }
        }

        return [box0, box1, box2, box3]
    }

    resetShape(x, y) {
        this.x = x;
        this.y = y;

        this.focalBox.x = x;
        this.focalBox.y = y + 1;

        this.boxes = [
            new Box(x - 1, y, this.color, this.shapeId, 1),
            new Box(x, y, this.color, this.shapeId, 2),
            this.focalBox,
            new Box(x + 1, y + 1, this.color, this.shapeId, 4)
        ]

        this.position = 1;
    }
}