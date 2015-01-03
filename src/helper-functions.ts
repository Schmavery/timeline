/// <reference path="references.ts" />
module Timeline {
  // Has side effects. Will set unit.nextAttack to null
  export function dealDamage(unit: Unit) {
    unit.nextAttack.target.health -= unit.DAMAGE;
    if(unit.nextAttack.target.isDead()) {
      Display.drawDeath(unit.nextAttack.target);
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


  // Returns a path from the start to the end within the given space
  export function findPath(space, start, end): Point[] {
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
    // console.log("findPath: End is unreachable");
    return [];
  }

  export function findNeighbours(space: Point[], p: Point) {
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

  export function isNear(p1, p2, radius?) {
    radius = radius || 1;
    var dx = Math.abs(p2.x - p1.x);
    var dy = Math.abs(p2.y - p1.y);
    return dx + dy <= radius;
  }

  export function hashPoint(p) {
    return "" + p.x + "." + p.y;
  }

  export function comparePoints(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }

  export function remove(arr, el, f) {
    var max = arr.length;
    var i = 0;
    for (; i < max; i++){
      if(f(arr[i], el)) break;
    }
    arr.splice(i, 1);
  }

  export function removeFrom(arr, el, f) {
    var max = arr.length;
    var i = 0;
    for (; i < max; i++){
      if(f(arr[i], el)) break;
    }
    arr.splice(i, arr.length);
  }

  export function contains(coll, el, f) {
    return find(coll, el, f) !== null;
  }

  export function find(coll, el, f) {
    var max = coll.length;
    for (var i = 0; i < max; ++i){
      if(f(coll[i], el)) {
        return coll[i];
      }
    }

    return null;
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



  export function partial(fn: Function, ...args: any[]) {
    var slice = Array.prototype.slice;
    var stored_args = slice.call(arguments, 1);
    return function () {
      var new_args = slice.call(arguments);
      var args = stored_args.concat(new_args);
      return fn.apply(null, args);
    };
  }
}