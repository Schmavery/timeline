/// <reference path="references.ts" />
module Timeline {
  export class Play extends Phaser.State {
    layer: Phaser.TilemapLayer;
    prevTime: number;
    moveArea: {x: number; y: number;}[];
    selectedUnit: Unit;
    currentMovePath: {x: number; y: number;}[];

    preload() {
      console.log("Preloading Play");
      Display.cacheGame(this.game);

      this.game.load.image("menu-btn", "assets/menu-btn.png");
      this.game.load.tilemap("test-map", "assets/maps/testmap.json", null,
      Phaser.Tilemap.TILED_JSON);
      this.game.load.image("test-tile-set", "assets/maps/test-tile-set.png");

      this.game.load.spritesheet("characters", "assets/maps/people.png", 16, 16, 50);

      this.game.input.mouse.mouseWheelCallback = mouseWheelCallback.bind(this);
      this.game.input.onDown.add(this.onMouseDown, this);
      this.game.input.onUp.add(this.onMouseUp, this);
    }

    create() {
      console.log("Creating Play");

      var sprite = this.game.add.sprite(340*SCALE, 50*SCALE, "menu-btn");
      sprite.inputEnabled = true;
      sprite.events.onInputDown.add(() => {this.game.state.start("Menu")}, this);

      var map = this.game.add.tilemap("test-map");
      this.layer = map.createLayer("Tile Layer 1");
      map.addTilesetImage("testset", "test-tile-set");
      this.layer.scale.set(SCALE);

      this.moveArea = [];
      this.currentMovePath = [];
      this.prevTime = 0;

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

    onMouseDown(p) {
      var characters = GameState.currentBoard.allCharacters;
      var X = ~~(p.x / (SCALE * TILE_SIZE));
      var Y = ~~(p.y / (SCALE * TILE_SIZE));
      for (var i = 0; i < characters.length; i++){
        if(characters[i].x === X && characters[i].y === Y) {
          this.moveArea = getMoveArea(characters[i]);
          this.selectedUnit = characters[i]
          this.currentMovePath = [];
          // Display.drawSelected(this.selectedUnit);
          Display.drawMoveArea(this.moveArea);

          console.log(characters[i]);
          return;
        }
      }

      for (var i = 0; i < this.moveArea.length; i++) {
        var clickedCell = this.moveArea[i];
        if(clickedCell.x === X && clickedCell.y === Y) {
          if(contains(this.currentMovePath, clickedCell, comparePoints)) {
            removeFrom(this.currentMovePath, clickedCell, comparePoints);
            Display.drawMovePath(this.currentMovePath);
            return;
          }

          var last = this.currentMovePath.length > 0 ? this.currentMovePath[this.currentMovePath.length - 1] : this.selectedUnit;
          if(!isNear(clickedCell, last)) break;

          this.currentMovePath.push(clickedCell);
          Display.drawMovePath(this.currentMovePath);

          if(this.currentMovePath.length >= 3) {
            var loop = function(arr, j) {
              if(j >= arr.length) return;
              Display.moveUnit(this.selectedUnit, arr[j], function() {
                loop(arr, j+1);
              });
            }.bind(this);
            loop(this.currentMovePath, 0);
          }
        }
      }
    }

    onMouseUp(p) {
      // console.log(p.x, p.y);
    }
  }

  function isNear(p1, p2) {
    return (p1.x === p2.x + 1 && p1.y === p2.y) ||
           (p1.x === p2.x - 1 && p1.y === p2.y) ||
           (p1.y === p2.y + 1 && p1.x === p2.x) ||
           (p1.y === p2.y - 1 && p1.x === p2.x);
  }

  function comparePoints(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }

  function removeFrom(arr, el, f) {
    var max = arr.length;
    var i = 0;
    for (; i < max; i++){
      if(f(arr[i], el)) break;
    }
    arr.splice(i, arr.length);
  }

  function contains(arr, el, f) {
    var max = arr.length;
    for (var i = 0; i < max; i++){
      if(f(arr[i], el)) {
        return true;
      }
    }

    return false;
  }

  function focusOn(board: Board) {
    GameState.currentBoard = board;
    Display.drawBoard(board);
  }

  function getMoveArea(unit: Unit): {x: number; y: number;}[] {
    return [{x: unit.x + 1, y: unit.y},
            {x: unit.x + 1, y: unit.y + 1},
            {x: unit.x + 1, y: unit.y - 1},
            {x: unit.x + 2, y: unit.y},
            {x: unit.x + 3, y: unit.y},
            {x: unit.x + 2, y: unit.y + 1},
            {x: unit.x + 2, y: unit.y - 1},
            {x: unit.x - 1, y: unit.y},
            {x: unit.x - 1, y: unit.y + 1},
            {x: unit.x - 1, y: unit.y - 1},
            {x: unit.x - 2, y: unit.y},
            {x: unit.x - 3, y: unit.y},
            {x: unit.x - 2, y: unit.y + 1},
            {x: unit.x - 2, y: unit.y - 1},
            {x: unit.x, y: unit.y + 1},
            {x: unit.x, y: unit.y + 2},
            {x: unit.x, y: unit.y + 3},
            {x: unit.x + 1, y: unit.y + 2},
            {x: unit.x - 1, y: unit.y + 2},
            {x: unit.x, y: unit.y - 1},
            {x: unit.x, y: unit.y - 2},
            {x: unit.x, y: unit.y - 3},
            {x: unit.x + 1, y: unit.y - 2},
            {x: unit.x - 1, y: unit.y - 2}];
  }

  function mouseWheelCallback(event) {
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

  function createGameObjectFromLayer(layerName: string, map: Phaser.Tilemap): Unit[] {
    var arr = map.objects[layerName];
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
      var character = new UnitClasses[arr[i].properties.type]();
      character.setPosition(~~(arr[i].x / TILE_SIZE), ~~(arr[i].y/TILE_SIZE) - 1);
      ret.push(character);
    }

    return ret;
  }
}
