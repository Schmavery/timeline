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
      if(maybeCharacter) console.log(maybeCharacter.isMoving);
      if(maybeCharacter && isAlly(maybeCharacter) && !maybeCharacter.isMoving) {
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
        } else {
          var lastCellInPath = this.selectedUnit.nextMovePath.length > 0 ?
                               this.selectedUnit.nextMovePath[this.selectedUnit.nextMovePath.length - 1] :
                               this.selectedUnit;
          if(maybeCharacter && !isAlly(maybeCharacter) && isNear(maybeCharacter, lastCellInPath, this.selectedUnit.RANGE)) {
            this.selectedUnit.nextAttack = {damage:this.selectedUnit.DAMAGE, target: maybeCharacter, trigger: lastCellInPath};
            console.log("Will attack", this.selectedUnit.nextAttack);
          } else{
            this.selectedUnit = null;
            this.moveArea = [];
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
      for (var i = 0; i < max; i++) {
        if(!characters[i].isMoving && characters[i].nextMovePath.length > 0) {
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
      this.selectedUnit = null;
      this.moveArea = [];
    }
  }


  // Returns a path from the start to the end within the given space
  function findPath(space, start, end): Point[] {
    var openSet = [start];
    var closedSet = [];
    var cameFrom = {};
    var gScore = {};
    var fScore = {};
    gScore[hashPoint(start)] = 0;
    // for (var s in space){
    //   gScore[hashPoint(space[s])] = Infinity;
    // }
    fScore[hashPoint(start)] = gScore[hashPoint(start)] + heuristicEstimate(start, end);

    while(openSet.length > 0) {
      var cur = openSet[0];
      for(var i = 1; i < openSet.length; i++) {
        if(fScore[hashPoint(openSet[i])] < fScore[hashPoint(cur)]) cur = openSet[i];
      }

      // we've reached the end, we're all goods
      if(comparePoints(cur, end)) {
        return constructPath(cameFrom, end);
      }

      remove(openSet, cur, comparePoints);
      closedSet.push(cur);

      var allNeighbours = findNeighbours(space, cur);
      for (var n in allNeighbours){
        var neighbour = allNeighbours[n];
        if(contains(closedSet, neighbour, comparePoints)) continue;

        var tentativeGScore = gScore[hashPoint(cur)] + heuristicEstimate(cur, neighbour);
        var neighbourHash = hashPoint(neighbour);
        if(!contains(openSet, neighbour, comparePoints) || tentativeGScore < gScore[neighbourHash]) {

          cameFrom[neighbourHash] = cur;

          gScore[neighbourHash] = tentativeGScore;
          fScore[neighbourHash] = gScore[neighbourHash] + heuristicEstimate(neighbour, end);
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

  function findNeighbours(space: Point[], p: Point) {
    return [
      {x: p.x + 1, y: p.y},
      {x: p.x - 1, y: p.y},
      {x: p.x, y: p.y + 1},
      {x: p.x, y: p.y - 1},
    ].filter((x) => {return contains(space, x, comparePoints)});
  }

  function constructPath(cameFrom, end: Point) {
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
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p1.y);
  }

  function isNear(p1, p2, radius?) {
    radius = radius || 1;
    var dx = Math.abs(p2.x - p1.x);
    var dy = Math.abs(p2.y - p1.y);
    return dx + dy <= radius;
  }

  function hashPoint(p) {
    return "" + p.x + "." + p.y;
  }

  export function comparePoints(p1, p2) {
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
    return find(coll, el, f) !== null;
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

  function getMoveArea(center: Point, max: number): Point[] {
    var moveArea = [];
    for(var i = 1; i <= max; i++) {
      checkAddTile(moveArea, {x: center.x, y: center.y + i});
      checkAddTile(moveArea, {x: center.x, y: center.y - i});
      checkAddTile(moveArea, {x: center.x + i, y: center.y});
      checkAddTile(moveArea, {x: center.x - i, y: center.y});

      for (var j = 1; j <= max - i; j++){
        checkAddTile(moveArea, {x: center.x + i, y: center.y + j});
        checkAddTile(moveArea, {x: center.x + i, y: center.y - j});
        checkAddTile(moveArea, {x: center.x - i, y: center.y + j});
        checkAddTile(moveArea, {x: center.x - i, y: center.y - j});
      }
    }
    var tmp = [];
    for(var i=0; i<moveArea.length; i++) {
      if(findPath(moveArea, center, moveArea[i]).length > 0) tmp.push(moveArea[i]);
    }
    return tmp;
  }

  function checkAddTile(moveArea, tile: Point) {
    var prop1 = GameState.propertyMap[hashPoint(tile)];
    if(prop1 && prop1.collision) return;

    var c = getUnitAt(tile);
    if(c && !isAlly(c) && isVisible(c)) return;

    moveArea.push(tile);
  }

  export function isVisible(point: Point) {
    var characters = GameState.currentBoard.allCharacters;
    for(var i = 0; i < characters.length; i++) {
      var c = characters[i];
      if(!isAlly(c)) continue;
      if(isNear(c, point, c.visionRange)) return true;
    }

    return false;
  }

  function mouseWheelCallback(event) {
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

  function createGameObjectFromLayer(layerName: string, map: Phaser.Tilemap): Unit[] {
    var arr = map.objects[layerName];
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
      var character = new UnitClasses[arr[i].properties.type](parseInt(arr[i].properties.teamNumber));
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
