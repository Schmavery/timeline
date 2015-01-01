/// <reference path="references.ts" />
module Timeline {
  export class Play extends Phaser.State {
    layer: Phaser.TilemapLayer;
    prevTime: number;
    moveArea: {x: number; y: number;}[];
    selectedUnit: Unit;
    keyboard: Phaser.Keyboard;

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

      //console.log(this.layer);
      var tileset = map.tilesets[map.getTilesetIndex('testset')];
      for (var i = 0; i < map.width; i++){
        for (var j = 0; j < map.height; j++){
          var tile = map.getTile(i, j, "Tile Layer 1");
          if (Object.keys(tile.properties).length !== 0){
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

      var maybeCharacter = find(characters, clickedCell, comparePoints);
      if(maybeCharacter) {
        this.selectedUnit = maybeCharacter;
        console.log(maybeCharacter);
      } else if(this.selectedUnit) {
        if(contains(this.selectedUnit.nextMovePath, clickedCell, comparePoints)) {
          removeFrom(this.selectedUnit.nextMovePath, clickedCell, comparePoints);
        } else if(contains(this.moveArea, clickedCell, comparePoints)) {
          var lastCellInPath = this.selectedUnit.nextMovePath.length > 0 ?
                               this.selectedUnit.nextMovePath[this.selectedUnit.nextMovePath.length - 1] :
                               this.selectedUnit;

          if(!isNear(clickedCell, lastCellInPath)) {
            var tmp = findPath(this.moveArea, lastCellInPath, clickedCell);
            this.selectedUnit.nextMovePath = this.selectedUnit.nextMovePath.concat(tmp.slice(0, this.selectedUnit.moveDistance - this.selectedUnit.nextMovePath.length));
          } else {
            if(this.selectedUnit.nextMovePath.length < this.selectedUnit.moveDistance) {
              this.selectedUnit.nextMovePath.push(clickedCell);
            }
          }
        }
      }
      if(this.selectedUnit) {
        this.moveArea = getMoveArea(this.selectedUnit.nextMovePath.length > 0 ? this.selectedUnit.nextMovePath[this.selectedUnit.nextMovePath.length - 1] : this.selectedUnit, this.selectedUnit.moveDistance - this.selectedUnit.nextMovePath.length);
      }
      Display.drawMoveArea(this.moveArea);
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
      for (var i = 0; i < max; i++){
        if(!characters[i].isMoving && characters[i].nextMovePath.length > 1) {
          characters[i].isMoving = true;
          // Remove the empty callback when figured out the optional type
          // in TS
          Display.moveUnitAlongPath(characters[i], characters[i].nextMovePath, function(u) {
            // reset isMoving so we can select the unit again
            u.isMoving = false;
            u.nextMovePath = [];
          });
        }
      }
    }
  }


  // Returns a path from the start to the end within the given space
  function findPath(space, start, end): {x: number; y: number;}[] {
    var openSet = [start];
    var closedSet = [];
    var cameFrom = {};
    var gScore = {};
    var fScore = {};
    gScore[hashPoint(start)] = 0;
    for (var i in space){
      gScore[hashPoint(space[i])] = Infinity;
    }
    fScore[hashPoint(start)] = gScore[hashPoint(start)] + heuristicEstimate(start, end);

    while(openSet.length > 0) {
      var cur = openSet.reduce(function(acc, val) {
        if(fScore[hashPoint(val)] < fScore[hashPoint(acc)]) return val;
        return acc;
      });


      // we've reached the end, we're all goods
      if(comparePoints(cur, end)) {
        return constructPath(cameFrom, end);
      }

      remove(openSet, cur, comparePoints);
      closedSet.push(cur);

      var allNeighbours = findNeighbours(space, cur);
      for (var i in allNeighbours){
        var neighbour = allNeighbours[i];
        if(contains(closedSet, neighbour, comparePoints)) continue;

        var tentativeGScore = gScore[hashPoint(cur)] + heuristicEstimate(cur, neighbour);
        if(!contains(openSet, neighbour, comparePoints) || tentativeGScore < gScore[hashPoint(neighbour)]) {

          cameFrom[hashPoint(neighbour)] = cur;

          gScore[hashPoint(neighbour)] = tentativeGScore;
          fScore[hashPoint(neighbour)] = gScore[hashPoint(neighbour)] + heuristicEstimate(neighbour, end);
          if(!contains(openSet, neighbour, comparePoints)) {
            openSet.push(neighbour);
          }
        }
      }
    }

    // We haven't reached the end, it's unreachable
    console.log("findPath: End is unreachable");
    return [];
  }

  function findNeighbours(space, p) {
    var ret = [];
    // console.log(space);
    for (var i in space){
      var cur = space[i];
      if(hashPoint(cur) !== hashPoint(p) && isNear(cur, p)) ret.push(cur);
    }
    return ret;
  }

  function constructPath(cameFrom, end: {x: number; y: number;}) {
    var cur = end;
    var path = [cur];
    while(cameFrom[hashPoint(cur)] !== undefined) {
      cur = cameFrom[hashPoint(cur)];
      path.push(cur);
    }

    //remove the last (which is the person itself)
    path.pop();
    return path.reverse();
  }

  function heuristicEstimate(p1, p2) {
    return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y)*(p2.y - p1.y));
  }

  function isNear(p1, p2) {
    return (p1.x === p2.x + 1 && p1.y === p2.y) ||
           (p1.x === p2.x - 1 && p1.y === p2.y) ||
           (p1.y === p2.y + 1 && p1.x === p2.x) ||
           (p1.y === p2.y - 1 && p1.x === p2.x);
  }

  function hashPoint(p) {
    return "" + p.x + p.y + ":" + p.y + p.x;
  }

  function comparePoints(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }

  function remove(arr, el, f) {
    var max = arr.length;
    var i = 0;
    for (; i < max; i++){
      if(f(arr[i], el)) break;
    }
    arr.splice(i, 1);
  }

  function removeFrom(arr, el, f) {
    var max = arr.length;
    var i = 0;
    for (; i < max; i++){
      if(f(arr[i], el)) break;
    }
    arr.splice(i, arr.length);
  }

  function contains(coll, el, f) {
    var max = coll.length;
    for (var i = 0; i < max; ++i){
      if(f(coll[i], el)) {
        return true;
      }
    }

    return false;
  }

  function find(coll, el, f) {
    var max = coll.length;
    for (var i = 0; i < max; ++i){
      if(f(coll[i], el)) {
        return coll[i];
      }
    }

    return null;
  }

  function focusOn(board: Board) {
    GameState.currentBoard = board;
    Display.drawBoard(board);
  }

  function getMoveArea(center: {x: number; y: number;}, max: number): {x: number; y: number;}[] {
    var moveArea = [];
    for(var i = 1; i <= max; i++) {
      moveArea.push({x: center.x, y: center.y + i});
      moveArea.push({x: center.x, y: center.y - i});
      moveArea.push({x: center.x + i, y: center.y});
      moveArea.push({x: center.x - i, y: center.y});

      for (var j = 1; j <= max - i; j++){
        moveArea.push({x: center.x + i, y: center.y + j});
        moveArea.push({x: center.x + i, y: center.y - j});
        moveArea.push({x: center.x - i, y: center.y + j});
        moveArea.push({x: center.x - i, y: center.y - j});
      }
    }
    return moveArea;
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



  function partial(fn: Function, ...args: any[]) {
    var slice = Array.prototype.slice;
    var stored_args = slice.call(arguments, 1);
    return function () {
      var new_args = slice.call(arguments);
      var args = stored_args.concat(new_args);
      return fn.apply(null, args);
    };
  }
}
