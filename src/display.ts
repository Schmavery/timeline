/// <reference path="references.ts" />

module Timeline {
  export module Display {
    var unitsToFrameNumber = {
      "Warrior": 0,
      "Archer": 32,
      "Mage": 0
    }

    var movePathMap: {key: Unit; val: Phaser.Graphics}[] = [];
    var spriteMap: {key: Unit; val: Phaser.Sprite}[] = [];

    var fogOfWar: Phaser.Graphics = null;
    var game: Phaser.Game = null;
    var map: Phaser.Tilemap = null;
    var moveArea: Phaser.Graphics = null;

    export function init(g: Phaser.Game, m: Phaser.Tilemap) {
      game = g;
      map = m;

      moveArea = game.add.graphics(0, 0);
      moveArea.alpha = 0.5;

      fogOfWar = game.add.graphics(0, 0);
      fogOfWar.alpha = 0.5;
    }

    export function loadSpritesFromObjects(arr: Unit[]) {
      arr.map((u) => {
        var sprite = game.add.sprite(SCALE * TILE_SIZE * u.x, SCALE * TILE_SIZE * u.y, "characters", 0);
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
        pushInMap(movePathMap, u, game.add.graphics(0, 0));
      });
    }

    export function moveObject(unit: Unit, name: string) {
      var sprite = getFromMap(spriteMap, unit);
      sprite.play(name);
    }

    export function drawBoard(board: Board) {
      moveArea.clear();

      // Hide all the other sprites
      for (var i = 0; i < spriteMap.length; i++) {
        spriteMap[i].val.exists = false;
      }
      for (var i = 0; i < movePathMap.length; i++) {
        movePathMap[i].val.clear();
      }
      // for (var i = 0; i < GameState.boards.length; i++) {
      //   for (var j = 0; j < GameState.boards[i].allCharacters.length; j++) {
      //     var c = GameState.boards[i].allCharacters[j];

      //   }
      //   spriteMap[i].val.exists = false;
      // }

      // Enable the ones from the board
      for (var i = 0; i < board.allCharacters.length; i++) {
        var c = board.allCharacters[i];
        var sprite = getFromMap(spriteMap, c);
        sprite.exists = true;
        if(c.nextMovePath.length > 0) {
          Display.drawMovePath(c);
        }
      }

      drawFogOfWar();
    }

    export function drawFogOfWar() {
      fogOfWar.clear();
      fogOfWar.beginFill(0x000000);
      var characters = GameState.currentBoard.allCharacters;
      for(var k = 0; k < characters.length; k++) {
        var sprite = getFromMap(spriteMap, characters[k]);
        sprite.exists = false;
      }
      for(var i = 0; i < map.width; i++) {
        for(var j = 0; j < map.height; j++) {
          if(!isVisible({x: i, y: j})) {
            fogOfWar.drawRect(i * TILE_SIZE * SCALE, j * TILE_SIZE * SCALE, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
          } else {
            var sprite = getFromMap(spriteMap, getUnitAt(new Point(i, j)));
            if(sprite) sprite.exists = true;
          }
        }
      }
      fogOfWar.endFill();
    }

    export function drawMoveArea(area: Point[]) {
      moveArea.clear();

      game.world.bringToTop(moveArea);
      moveArea.lineStyle(2, 0x00d9ff, 1);
      moveArea.beginFill(0xffff33);

      for (var i = 0; i < area.length; i++) {
        var square = area[i];

        moveArea.drawRect(square.x * TILE_SIZE * SCALE, square.y * TILE_SIZE * SCALE, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
      }

      moveArea.endFill();
    }

    export function drawMovePath(unit: Unit) {
      if(!unit) return;
      var path = unit.nextMovePath;
      var movePath = getFromMap(movePathMap, unit);
      movePath.clear();

      game.world.bringToTop(movePath);
      movePath.lineStyle(2, 0x00d9ff, 1);
      movePath.beginFill(0x00ff33);
      movePath.alpha = 0.5;

      for (var i = 0; i < path.length; i++) {
        var square = path[i];

        movePath.drawRect(square.x * TILE_SIZE * SCALE, square.y * TILE_SIZE * SCALE, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
      }

      movePath.endFill();

      if(unit.nextAttack) {
        movePath.lineStyle(5, 0xff0000, 1);
        movePath.moveTo((unit.nextAttack.trigger.x * TILE_SIZE + TILE_SIZE / 2) * SCALE, (unit.nextAttack.trigger.y * TILE_SIZE + TILE_SIZE / 2) * SCALE);
        movePath.lineTo((unit.nextAttack.target.x * TILE_SIZE + TILE_SIZE / 2) * SCALE, (unit.nextAttack.target.y * TILE_SIZE + TILE_SIZE / 2) * SCALE);
      }
    }

    export function moveUnitAlongPath(unit: Unit, callback) {
      moveArea.clear();
      getFromMap(movePathMap, unit).clear();
      var path = unit.nextMovePath;

      for(var i = 0; i < path.length; i++) {
        var c = getUnitAt(path[i]);
        if(c && !isAlly(c)) {
          path = path.slice(0, i - c.RANGE < 0 ? 0 : i - c.RANGE);
          unit.nextMovePath = path;
          var lastCell = getLastMove(unit);
          unit.nextAttack = {damage: unit.DAMAGE, target: c, trigger: lastCell};
          break;
        }
      }
      var loop = function(arr, j) {
        if(j >= arr.length) {
          // var sprite = getFromMap(spriteMap, unit);
          // var anim = sprite.play("idle");
          // console.log(anim);
          // anim.complete();
          return callback(unit);
        }
        Display.moveUnit(unit, arr[j], function() {
          if(unit.nextAttack && comparePoints(unit.nextAttack.trigger, arr[j])) {
            console.log("Attacking", unit.nextAttack);
            drawAttack(unit, () => {
              loop(arr, j+1);
            });
            return;
          }
          loop(arr, j+1);
        });
      };
      loop(path, 0);
    }

    function drawAttack(unit: Unit, callback) {
      var sprite = getFromMap(spriteMap, unit);
      var tween = game.add.tween(sprite.position);
      var clonedDest = {
        x: unit.nextAttack.target.x * TILE_SIZE * SCALE,
        y: unit.nextAttack.target.y * TILE_SIZE * SCALE
      }
      tween.to(clonedDest, 400, Phaser.Easing.Exponential.In, true);
      tween.onComplete.add(function() {
        var emitter = game.add.emitter(unit.nextAttack.target.x * TILE_SIZE * SCALE, unit.nextAttack.target.y * TILE_SIZE * SCALE, unit.nextAttack.damage);

        //  Here we're passing an array of image keys. It will pick one at
        // random when emitting a new particle.
        emitter.makeParticles(['-1']);

        emitter.setYSpeed(50,100);
        emitter.setXSpeed(-10,10);
        emitter.setRotation(0,0);
        // emitter.setAll('body.allowGravity', true);
        emitter.start(false, 500);
        emitter.update();
        var tween2 = game.add.tween(sprite.position);
        var clonedDest2 = {
          x: unit.x * TILE_SIZE * SCALE,
          y: unit.y * TILE_SIZE * SCALE
        }
        tween2.to(clonedDest2, 400, Phaser.Easing.Exponential.Out, true);
        tween2.onComplete.add(function() {
          unit.nextAttack = null;
          callback();
        }, this);
      }, this);
    }

    export function drawTargetableEnemies(nearbyEnemies: Point[]) {
      moveArea.beginFill(0xff0000);
      for(var i = 0; i < nearbyEnemies.length; i++) {
         moveArea.drawRect(nearbyEnemies[i].x * TILE_SIZE * SCALE, nearbyEnemies[i].y * TILE_SIZE * SCALE, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
      }

      moveArea.endFill();
    }

    export function moveUnit(unit: Unit, dest: Point, callback) {
      // Change the coordinates of the units
      var X = unit.x * TILE_SIZE * SCALE;
      var Y = unit.y * TILE_SIZE * SCALE;
      var clonedDest = {
        x: dest.x,
        y: dest.y
      }
      unit.x = clonedDest.x;
      unit.y = clonedDest.y;

      drawFogOfWar();

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