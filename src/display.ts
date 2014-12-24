/// <reference path="references.ts" />

module Timeline {
  export module Display {
    var spriteMap: {key: Unit; val: Phaser.Sprite}[] = [];
    var game = null;
    var moveArea = null;
    var movePath = null;

    export function cacheGame(g: Phaser.Game) {
      game = g;

      moveArea = game.add.graphics(0, 0);
      // moveArea.lineStyle(2, 0x00d9ff, 1);
      moveArea.alpha = 0.5;

      movePath = game.add.graphics(0, 0);
      moveArea.movePath = 0.5;
    }

    export function loadSpritesFromObjects(arr: Unit[]) {
      arr.map((u) => {
        var sprite = game.add.sprite(SCALE * TILE_SIZE * u.x, SCALE * TILE_SIZE * u.y, "characters");
        sprite.scale.set(SCALE);
        sprite.animations.add('moveLeft', [20, 21, 22, 23], 10, true);
        sprite.animations.add('doneMovingLeft', [20], 10, true);
        sprite.animations.add('moveDown', [0, 1, 2, 3], 10, true);
        sprite.animations.add('doneMovingDown', [0], 10, true);
        sprite.animations.add('moveUp', [4, 5, 6, 7], 10, true);
        sprite.animations.add('doneMovingUp', [4], 10, true);
        sprite.animations.add('moveRight', [16, 17, 18, 19], 10, true);
        sprite.animations.add('doneMovingRight', [16], 10, true);
        sprite.exists = false;
        pushInMap(spriteMap, u, sprite);
      });
    }

    export function moveObject(unit: Unit, name: string) {
      var sprite = getFromMap(spriteMap, unit);
      sprite.play(name);
    }

    export function drawBoard(board: Board) {
      moveArea.clear();
      movePath.clear();

      // Hide all the other sprites
      for (var i = 0; i < spriteMap.length; i++) {
        spriteMap[i].val.exists = false;
      }

      // Enable the ones from the board
      for (var i = 0; i < board.allCharacters.length; i++) {
        var c = board.allCharacters[i];
        var sprite = getFromMap(spriteMap, c);
        sprite.exists = true;
      }
    }

    // export function drawSelected(unit: Unit) {
    //   if(moveArea) moveArea.destroy();

    //   moveArea = game.add.graphics(0, 0);
    //   game.world.bringToTop(moveArea);
    //   moveArea.lineStyle(2, 0x00d9ff, 1);
    //   // moveArea.drawRect(unit.x * TILE_SIZE * SCALE, unit.y * TILE_SIZE * SCALE, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
    // }

    export function drawMoveArea(area: {x: number; y: number;}[]) {
      moveArea.clear();
      movePath.clear();

      game.world.bringToTop(moveArea);
      moveArea.lineStyle(2, 0x00d9ff, 1);
      moveArea.beginFill(0xffff33);

      for (var i = 0; i < area.length; i++) {
        var square = area[i];

        moveArea.drawRect(square.x * TILE_SIZE * SCALE, square.y * TILE_SIZE * SCALE, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
      }

      moveArea.endFill();
    }

    export function drawMovePath(path: {x: number; y: number;}[]) {
      movePath.clear();
      game.world.bringToTop(movePath);
      movePath.beginFill(0xff0033);
      movePath.alpha = 0.5;

      for (var i = 0; i < path.length; i++) {
        var square = path[i];

        movePath.drawRect(square.x * TILE_SIZE * SCALE, square.y * TILE_SIZE * SCALE, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
      }

      movePath.endFill();
    }

    export function moveUnitAlongPath(unit: Unit, path: {x: number; y: number;}[], callback) {
      moveArea.clear();
      movePath.clear();

      var loop = function(arr, j) {
        if(j >= arr.length) {
          // var sprite = getFromMap(spriteMap, unit);
          // var anim = sprite.play("idle");
          // console.log(anim);
          // anim.complete();
          return callback(unit);
        }
        Display.moveUnit(unit, arr[j], function() {
          loop(arr, j+1);
        });
      };
      loop(path, 0);
    }

    export function moveUnit(unit: Unit, dest: {x: number; y: number;}, callback) {
      // Change the coordinates of the units
      var X = unit.x * TILE_SIZE * SCALE;
      var Y = unit.y * TILE_SIZE * SCALE;
      var clonedDest = {
        x: dest.x,
        y: dest.y
      }
      unit.x = clonedDest.x;
      unit.y = clonedDest.y;

      // Create the tween from the sprite mapped from the unit
      var sprite = getFromMap(spriteMap, unit);
      var tween = game.add.tween(sprite.position);
      // Scale tween
      clonedDest.x *= TILE_SIZE * SCALE;
      clonedDest.y *= TILE_SIZE * SCALE;

      var anim: Phaser.Animation;
      var direction = "Left";
      if(clonedDest.x - X < 0) {
        anim = sprite.play("moveLeft");
        direction = "Left";
      } else if (clonedDest.x - X > 0) {
        anim = sprite.play("moveRight");
        direction = "Right";
      } else {
        if(clonedDest.y - Y < 0) {
          anim = sprite.play("moveUp");
          direction = "Up";
        } else {
          anim = sprite.play("moveDown");
          direction = "Down";
        }
      }

      tween.to(clonedDest, 500, Phaser.Easing.Linear.None, true);
      tween.onComplete.add(function() {
        anim.complete();
        anim = sprite.play("doneMoving" + direction);
        anim.complete();
        callback();
      }, this);
    }

    function getFromMap(map, key) {
      for (var i = 0; i < map.length; i++){
        if(map[i].key === key) {
          return map[i].val;
        }
      }

      return null;
    }

    function pushInMap(map, key, val) {
      for (var i = 0; i < map.length; i++){
        if(map[i].key === key) {
          map[i].val = val;
          return;
        }
      }

      map.push({key: key, val: val});
    }
  }
}