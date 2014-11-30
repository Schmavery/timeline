/// <reference path="references.ts" />
module Timeline {
  export class Play extends Phaser.State {
    layer: Phaser.TilemapLayer;
    prevTime: number;
    moveArea: {x: number; y: number;}[];
    selectedUnit: Unit;

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
          Display.drawSelected(this.selectedUnit);
          Display.drawMoveArea(this.moveArea);
          console.log(characters[i]);
          return;
        }
      }

      for (var i = 0; i < this.moveArea.length; i++) {
        if(this.moveArea[i].x === X && this.moveArea[i].y === Y) {
          Display.moveUnit(this.selectedUnit, this.moveArea[i], function() {
            console.log("Done");
          });
        }
      }
    }

    onMouseUp(p) {
      // console.log(p.x, p.y);
    }
  }

  function focusOn(board: Board) {
    GameState.currentBoard = board;
    Display.drawBoard(board);
  }

  function getMoveArea(unit: Unit): {x: number; y: number;}[] {
    return [{x: unit.x + 1, y: unit.y},
            {x: unit.x - 1, y: unit.y},
            {x: unit.x, y: unit.y + 1},
            {x: unit.x, y: unit.y - 1}];
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
