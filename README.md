# Block Drop Game

- Page Load
    1. On initial load of the page, the user should see a home page with a start button, control options, and a high score tracker.
    2. When the user clicks the "start" button, the current home page should be hidden and the game grid should be populated.
    3. After the game grid is populated, the game can start after a one second delay.

-  Controls Manager
    1. When the user clicks the "Controls" button, the user should be taken to a page with the current game controls.
    2. The current game controls will be displayed, each with a button to change the individual controls.
    3. When the user clicks the "Change" button for an individual control, a modal pops up that allows them to press the desired key.
    4. The pressed key should then update to control they wanted to change.
    5. All controls will persist past refresh with localStorage.
    6. On page-load, the system will query localStorage to grab any saved controls. The data will be saved into the controlsData variable.

- Game
    1. To start the game, the system will generate two bags of pieces to pull from.
        1. A bag is a randomized order of the seven possible pieces with no repeats.
        2. The bag contains all seven piece classes initialized with the start location on the game grid.
        3. The game will loop through these pieces and then re-generate the bag so that there is not too big of a gap between any piece repeat.
        4. We generate two bags because we need to display the next piece to the user. We can't do that if the next bag has not been generated yet.
    2. The system will then loop over the first bag and spit out pieces.
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
                - Grab the minimum row number from the list of rows cleared
        9. Delay the game by the speedMS variable.
        10. If it's the last iteration in the loop:
            - Set the currentBag to the nextBag.
            - Re-generate the nextBag variable.
            - set the increment counter to -1 (will be 0 because of re-loop);
                - Doing this sets the for loop to run infintely until the user "blocks out". The purpose of this is to display the "next" piece.
                - Might be better with a while loop.

- End Game

- Grid

- Classes

- Game Variables
    1. userInput - If false, the event listeners will be turned off.
    2. activeShape - Holds current active shape during gameplay.
    3. shapeCounter - Numerical counter of how many shapes have dropped. Used for shapeId of shape/box class.