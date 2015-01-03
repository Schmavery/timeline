/// <reference path="references.ts" />
module Timeline {
  // Has side effects. Will set unit.nextAttack to null
  export function dealDamage(unit: Unit) {
    unit.nextAttack.target.health -= unit.DAMAGE;
    if(unit.nextAttack.target.isDead()) {
      Display.drawDeath(unit.nextAttack.target);
      GameState.currentBoard.deadCharacters.push(unit.nextAttack.target);
      var index =
        GameState.currentBoard.allCharacters.indexOf(unit.nextAttack.target);
      GameState.currentBoard.allCharacters.splice(index, 1);
    }

    unit.nextAttack = null;
  }

  export function getLastMove(unit: Unit) {
    return unit.nextMovePath.length > 0 ? unit.nextMovePath[unit.nextMovePath.length - 1] : unit;
  }

  export function findNearbyEnemies(unit: Unit) {
    var characters = GameState.currentBoard.allCharacters;
    var cell = getLastMove(unit);
    var arr = [];
    for(var i = 0; i < characters.length; i++) {
      var c = characters[i];
      if(!isAlly(c) && isNear(cell, c, unit.RANGE) && isVisible(c)) arr.push(c);
    }
    return arr;
  }

  export function focusOn(board: Board) {
    GameState.currentBoard = board;
    Display.drawBoard(board);
  }

  export function getMoveArea(center: Point, max: number): Point[] {
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

  export function createGameObjectFromLayer(layerName: string, map: Phaser.Tilemap): Unit[] {
    var arr = map.objects[layerName];
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
      var character = new UnitClasses[arr[i].properties.type](parseInt(arr[i].properties.teamNumber));
      character.setPosition(~~(arr[i].x / TILE_SIZE), ~~(arr[i].y/TILE_SIZE) - 1);
      ret.push(character);
    }

    return ret;
  }
}