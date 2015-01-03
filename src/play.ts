/// <reference path="references.ts" />
module Timeline {
  export class Play extends Phaser.State {
    layer: Phaser.TilemapLayer;
    prevTime: number;
    moveArea: Point[];
    selectedUnit: Unit;
    keyboard: Phaser.Keyboard;

    preload() {
      console.log("Preloading Play");

      this.game.load.image("menu-btn", "assets/menu-btn.png");
      this.game.load.image("-1", "assets/-1.png");
      this.game.load.image("-10", "assets/-10.png");
      this.game.load.image("-100", "assets/-100.png");
      this.game.load.tilemap("test-map", "assets/maps/testmap.json", null,
      Phaser.Tilemap.TILED_JSON);
      this.game.load.image("test-tile-set", "assets/maps/test-tile-set.png");

      this.game.load.spritesheet("characters", "assets/maps/people.png", 16, 16, 50);

      this.game.input.mouse.mouseWheelCallback = this.mouseWheelCallback.bind(this);
      this.game.input.onDown.add(this.onMouseDown, this);
      this.game.input.onUp.add(this.onMouseUp, this);

      this.moveArea = [];
      this.prevTime = 0;

      this.game.input.keyboard.onUpCallback = this.onKeyUp.bind(this);
      this.game.input.keyboard.onDownCallback = this.onKeyDown.bind(this);
    }

    create() {
      console.log("Creating Play");
      this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

      var sprite = this.game.add.sprite(340*SCALE, 50*SCALE, "menu-btn");
      sprite.inputEnabled = true;
      sprite.events.onInputDown.add(this.playTurn.bind(this), this);

      var map = this.game.add.tilemap("test-map");
      this.layer = map.createLayer("Tile Layer 1");
      map.addTilesetImage("testset", "test-tile-set");
      this.layer.scale.set(SCALE);

      // Init the display
      Display.init(this.game, map);

      //console.log(this.layer);
      var tileset = map.tilesets[map.getTilesetIndex('testset')];
      for (var i = 0; i < map.width; i++){
        for (var j = 0; j < map.height; j++){
          var tile = map.getTile(i, j, "Tile Layer 1");
          var props = tile.properties;
          if (Object.keys(props).length !== 0){
            for (var key in props){
              if (typeof props[key] !== "string") continue;
              if (props[key].toLowerCase() === "true") props[key] = true;
              else if (props[key].toLowerCase() === "false") props[key] = false;
              else if (!isNaN(props[key])) props[key] = parseInt(props[key]);
            }
            GameState.propertyMap[hashPoint({x:i, y:j})] = tile.properties;
          }
        }
      }
      console.log(GameState.propertyMap);

      var characters = createGameObjectFromLayer("Characters", map);
      var board = new Board(characters);
      GameState.boards.push(board);
      Display.loadSpritesFromObjects(characters);

      focusOn(board);

      var newBoard = board.clone();
      GameState.boards.push(newBoard);
      newBoard.allCharacters[0].x = 0;
      newBoard.allCharacters[1].y = 5;
      newBoard.allCharacters[2].x = 5;
      newBoard.allCharacters[2].y = 5;
      Display.loadSpritesFromObjects(newBoard.allCharacters);
      focusOn(newBoard);
    }

    update() {

    }


    splitGame(board: Board) {
      var newBoard = board.clone();
      GameState.boards.push(newBoard);
      Display.loadSpritesFromObjects(newBoard.allCharacters);
      focusOn(newBoard);
    }

    onMouseDown(mouse) {
      var characters = GameState.currentBoard.allCharacters;
      var clickedCell = {
        x: ~~(mouse.x / (SCALE * TILE_SIZE)),
        y: ~~(mouse.y / (SCALE * TILE_SIZE))
      };

      // maybeCharacter will be equal to the selected character if
      // clickedCell is a cell that contains a character
      // if not, we'll check if the user clicked on a movePath cell or a
      // moveArea cell to either add to the path, or remove from the path
      var maybeCharacter = find(characters, clickedCell, comparePoints);
      if(maybeCharacter && isAlly(maybeCharacter) && !maybeCharacter.isMoving && maybeCharacter !== this.selectedUnit) {
        this.selectedUnit = maybeCharacter;
        console.log(maybeCharacter);
      } else if(this.selectedUnit) {
        if(contains(this.selectedUnit.nextMovePath, clickedCell, comparePoints)) {
          var removedCells = removeFrom(this.selectedUnit.nextMovePath, clickedCell, comparePoints);
          if(this.selectedUnit.nextAttack && contains(removedCells, this.selectedUnit.nextAttack.trigger, comparePoints)) {
            this.selectedUnit.nextAttack = null;
          }
        } else if(contains(this.moveArea, clickedCell, comparePoints)) {
          var lastCellInPath = getLastMove(this.selectedUnit);

          if(!isNear(clickedCell, lastCellInPath)) {
            var tmp = findPath(this.moveArea, lastCellInPath, clickedCell);
            this.selectedUnit.nextMovePath = this.selectedUnit.nextMovePath.concat(tmp.slice(0, this.selectedUnit.moveDistance - this.selectedUnit.nextMovePath.length));
          } else {
            if(this.selectedUnit.nextMovePath.length < this.selectedUnit.moveDistance) {
              this.selectedUnit.nextMovePath.push(clickedCell);
            }
          }
        } else {
          var lastCellInPath = getLastMove(this.selectedUnit);

          if(maybeCharacter && !isAlly(maybeCharacter) && isNear(maybeCharacter, lastCellInPath, this.selectedUnit.RANGE)) {
            this.selectedUnit.nextAttack = {damage:this.selectedUnit.DAMAGE, target: maybeCharacter, trigger: lastCellInPath};
            console.log("Will attack", this.selectedUnit.nextAttack);
          } else{
            // Don't deselect a character if you clicked on an enemy
            if(!maybeCharacter) {
              this.selectedUnit = null;
              this.moveArea = [];
            }
          }
        }
      }

      var targetableEnemies = [];
      // If we selected a unit
      if(this.selectedUnit) {
        this.moveArea = getMoveArea(this.selectedUnit.nextMovePath.length > 0 ? this.selectedUnit.nextMovePath[this.selectedUnit.nextMovePath.length - 1] : this.selectedUnit, this.selectedUnit.moveDistance - this.selectedUnit.nextMovePath.length);
        targetableEnemies = findNearbyEnemies(this.selectedUnit);
      }

      Display.drawMoveArea(this.moveArea);
      Display.drawTargetableEnemies(targetableEnemies);
      Display.drawMovePath(this.selectedUnit);
    }

    onMouseUp(p) {
      // console.log(p.x, p.y);
    }

    onKeyUp(e) {
      if(e.keyCode === 32) {
        this.playTurn();
      }
    }

    onKeyDown(e) {
      // for (var i in e){
      //   console.log(i, ":", e[i]);
      // }
    }

    playTurn() {
      var characters = GameState.currentBoard.allCharacters;
      var max = characters.length;
      for (var i = 0; i < max; i++) {
        if(!characters[i].isMoving) {
          characters[i].isMoving = true;
          // Remove the empty callback when figured out the optional type
          // in TS
          Display.moveUnitAlongPath(characters[i], function(u) {
            // reset isMoving so we can select the unit again
            u.isMoving = false;
            u.nextMovePath = [];
          });
        }
      }
      this.selectedUnit = null;
      this.moveArea = [];
    }
    mouseWheelCallback(event) {
      event.preventDefault();
      var curTime = Date.now();
      if(curTime - this.prevTime < 600) {
        return;
      }
      this.prevTime = curTime;

      var delta = this.game.input.mouse.wheelDelta;
      // console.log("delta:", delta);
      GameState.currentBoard = GameState.boards
          [(GameState.boards.indexOf(GameState.currentBoard) + delta + GameState.boards.length) % GameState.boards.length]
      Display.drawBoard(GameState.currentBoard);
    }
  }

}
