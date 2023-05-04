# Block Drop Game

### Page Load
    1. On initial load of the page, the user should see a home page with a start button, control options, and a high score tracker.
    2. When the user clicks the "start" button, the current home page should be hidden and the game grid should be populated.
    3. After the game grid is populated, the game can start after a one second delay.

###  Controls Manager
    1. When the user clicks the "Controls" button, the user should be taken to a page with the current game controls.
    2. The current game controls will be displayed, each with a button to change the individual controls.
    3. When the user clicks the "Change" button for an individual control, a modal pops up that allows them to press the desired key.
    4. The pressed key should then update to control they wanted to change.
    5. All controls will persist past refresh with localStorage.
    6. On page-load, the system will query localStorage to grab any saved controls. The data will be saved into the controlsData variable.
    7. The controlsData variable will be referenced throughout the application so that the correct key is being listened to.

### Game
    1. To start the game, the system will generate two bags of pieces to pull from.
        1. A bag is a randomized order of the seven possible pieces with no repeats.
        2. The bag contains all seven piece classes initialized with the start location on the game grid.
        3. The game will loop through these pieces and then re-generate the bag so that there is not too big of a gap between any piece repeat.
        4. We generate two bags because we need to display the next piece to the user. We can't do that if the next bag has not been generated yet.
    2. The system will then loop over the generated bags and spit out pieces.
        1. Check is if the piece that is being spawned at the top of the screen can actually be placed.
            - If a piece cannot be placed on the board, it is considered a "block out" and the loop is broken.
        2. Update the "next" piece in the appropriate box.
        3. Increment the shapeCounter variable and update the shape Class.
            - We do this to give shapes a shapeId (purpose described later)
        4. Once the shape is updated, it will be saved into a global variable (activeShape) for use in other funcitons or event listeners.
        5. The shapeDrop() function is called (async).
            - Populate the shape on the game grid and set userInput to true.
            - while loop that runs if hold variable is true and the activeShape can move down.
                - Split the speedMS variable into fourths.
                - Run a loop four times that delays by a speedMS fourth and checks to see if the user has pressed the hold key.
                    - The reason for this is because if the user clicks the hold piece key, we don't want the system to wait the entire 800ms or so until it switches out the piece.
                    - Therefore, we check in quarters to see if the piece should be swapped out and the loop cancelled.
                - The system will check again to see if the shape can move down.
                    - If true the shape if dropped one y level.
                    - Else it will break the while loop.
            - Once the shape hits a stopping point, we want to allow the user a buffer window to rotate or move around in case they got stuck on a shape towards the top.
                - The system will wait a maximum of 1000ms for the user to rotate or move the piece they placed (if possible).
                - If the user does not input any commands during this waiting period, the shape will be locked in place in 250ms.
                - Every command the user enters, the system will add an additional 250ms until it reaches 1000ms.
                - If at any time the shape has more room under it to continue dropping, the entire shapeDrop() function will be reset.
            - Once the shape is locked into place, userInput is set to false and the shape's focalBox is updated with it's new coordinates.
        6. After the shapeDrop function completes, the system will check if the user decided to hold the falling piece.
            - If true, the system hides the shape from the game grid resets the piece to it's original coordinates.
            - If there is already a piece currently being held, the system will set it to be the activeShape and decrement the loop counter.
            - Set the activeShape to the holdPiece variable.
            - Update the side box with the held shape piece and undo the hold boolean.
            - The system will also set the hasSwappedHold variable to true. This prevents the user from infintely switching from activeShape to the held piece.
            - The loop will then continue with activeShape as:
                - The next piece in the iteration (if holdPiece was previously null)
                - The previously held piece (if holdPiece was not null)
        7. Push the activeShape to the existing shapes array.
        8. The clearRows() function is called async.
            - System will create an empty clearedRows array variable and loop over all of the rows on the game grid.
                - If any of the rows have blocks in all of the individual cells, the row index will be added to the clearedRows array and the row will be cleared of CSS.
            - If there are any clearedRows:
                - Increment the clearedLinesCount game variable.
                - Loop through all of the shapes currently on the grid (held in the shapes game variable)
                    - If any shapes have boxes that were in the clearedRows array, remove them and update the shapes array.
                - Remove any shapes from the shapes array that has all boxes cleared and update the array.
                - Loop over all of the rows in the game grid (except the last one)
                    - If the line is a cleared row, skip it.
                    - For every shape/box on the grid, move it down based on how many lines were cleared below it.
                        - This should be dynamic in case the cleared line have gaps in between.
                - Update the score for clearing lines. (move to separate function)
                - Update the level based on the number of cleared lines. 
        9. Delay the game by the speedMS variable.
        10. If it's the last iteration in the loop:
            - Set the currentBag to the nextBag.
            - Re-generate the nextBag variable.
            - set the increment counter to -1 (will be 0 because of re-loop);
                - Doing this sets the for loop to run infintely until the user "blocks out". The purpose of this is to display the "next" piece.
                - Might be better with a while loop.
    3. The game ends once the user "blocks out".
        - Set the userInput game variable to false.
        - Un-populate the grid.
        - Show the game over elements
            - Title
            - Score
            - Play again button w/ Event Listener
        - If user clicks play again:
            - Reset game variables
            - Return to 1.

### Grid
- The grid is composed of 18 `<section>` elements. Each `<section>` is a flex box row with 10 individual `<div>` columns. Each one of these `<div>` elements have no CSS classes associated with them.
- When a box is populated on the page, it doesn't actually replace the `<div>` instead it updates the div to the class or the box color. The box knows how to target the correct div because of an x and y coordinate in box Class and the element's id.
- The boxes are given the appearance of moving by having timed events occur on the page. 
    - For example, if a box needs to move down one row, Cell [x: 5, y: 6] will remove any classes from it and Cell [x: 5, y: 7] will have classes added.
- There are two smaller grids on either sides of the main game grid, these boxes are used for displaying the next piece as well as the currently held piece.

### Classes
    - Box Class
        1. Each box has an x and y coordinate that relate to the game grid (x is 0-9 | y is 0-17)
        2. Boxes also have a color to be used to update the <div> element's class.
        3. To identify the box's parent shape, each box will also have a shapeId property.
    - Box Methods
        1. updateDom()
            1. The updateDom method will either show or hide the box from a specific <div>.
            2. The target row will be found by querying the element by id with the id being the box's y value. 
            3. The target cell will be found by using the box's x value to index the target row's children array.
            4. Then the target cell will either be given a class to show (based on the box color) or remove a class to hide.
            5. This method is also used for displaying a box in the Next or Hold sub-grids (determined by the target parameter).
        2. canBoxMove()
            1. The purpose of this method is to check if the current box class can move to a new location.
            2. The method first creates temp variables for x and y which will be used for checking (we don't want to edit the class properties).
            3. If the new location of x or y falls outside the scope of the grid, the method returns false.
            4. If the target cell of the current box is blocked by another box, the method returns false.
                - EXCEPT if the target cell is occupied by a box with the same shapeId, then the method returns true
    - Shape Class
        1. Each shape is essentially a collection of four boxes as well as some overall shape attributes.
        2. Shapes have their own x and y values as well, which are not used on the page but more for reference for the x and y values of the child Boxes.
        3. Shapes also have a position property for rotations, a color for box CSS classes, and a shapeId for the child boxes.
    - Shape Child Classes
        1. Each shape type is an extended child class of the parent Shape class.
        2. Pieces include I, J, L, O, S, T, and Z. Each piece has it's own unique color and box layout.
    - Shape Methods
        1. The populateShape() method essentially just loops over all of the boxes the shape contains and runs the updateDom() Box method.
            - Can be used for game grid or sub-grids.
        2. The canShapeMove() method is similar to the populateShape() method where it loops over all of the boxes and runs the canBoxMove() method for each.
            - Returns true only if all boxes can move
        3. The moveShape() method is what is called when a shape needs to move in a particular direction.
            - First we check to see if the shape can move in the target direction, if false then end the function.
            - Second we un-populate the shape from the game grid.
            - Next we loop over all of the boxes and update their coordinates accordingly.
            - Then we re-populate the shape.
            - Then we use the count variable to calculate the score.
            - Finally we return the score.
        4. rotatePiece()
            - This method is used when a piece needs to rotate based off of user input.
            - First step is to determine the new coordinates of the child boxes (calls getRotatedPositions() method)
            - Next there is a check to see if the piece will be rotated out of bounds
                - If true, the system will try to execute a wall kick (wallKick() method).
            - If the shape can move to the new rotated location, it will un-populate the shape, update the coordinates of the boxes, and then re-populate the shape.
        5. updateShapeId()
            - This method loops over all the boxes and updates the shapeId accordingly.
        6. getFocalIndex()
            - The focal box index is not the same for each shape. This method returns the index based on the color property.
        7. wallKick()
            - If the user tries to rotate a piece and that rotation would put any of the piece boxes out of bounds, this method will run.
            - Depending on which wall the rotating piece is breaking, the method will loop over all of the boxes and update them to move in the opposite direction.
        8. hardDrop()
            - This method is essentially just a while loop that will move the shape down until it can no longer move.
            - It also keep track of how many rows it moves down for the score and returns that value
    - Shape Child Methods
        1. getRotatedPositions()
            - This method determines the new location of all individual piece boxes when rotating.
            - The method needs to be a the Shape Child class because of each shape's unqiue order and rotation focal point.
        2. resetShape()
            - This method resets the shape to it's original position as well as all of it's child boxes.

### Game Variables
- userInput - If false, the event listeners will be turned off.
- activeShape - Holds current active shape during gameplay.
- shapeCounter - Numerical counter of how many shapes have dropped. Used for shapeId of shape/box class.
- allRows - Holds all of the grid row HTML elements
- shapes - Holds all active shapes currently on the grid
- score - Keeps track of the user's score
- holdPiece - Shape class that is currently being held.
- hold - Boolean if the user has clicked the "hold piece" button.
- hasSwappedHold - Boolean if the user has already swapped out the a hold piece this turn.
- level - Current level of the game.
- clearedLinesCount - Amount of lines the user has cleared for determining when to level up.
- speedMS - The speed of the shape dropping in milliseconds.
- loopCount - Increment variable used for when the piece hits the bottom but user is still moving.
- incrementLoopCount - Boolean to increment the loopCount variable
- controlsData - Holds the controls the user has chosen.
- changeControls - Boolean to change the event listener to listen for the user input of controls.
- targetControlChange - Text variable to tell the system which control the user wants to change.