/// <reference path="references.ts" />

module Timeline {
  export module Display {
    var spriteMap: {key: Unit; val: Phaser.Sprite}[] = [];
    var game = null;
    var selection = null;

    export function cacheGame(g: Phaser.Game) {
      game = g;
    }

    export function loadSpritesFromObjects(arr: Unit[]) {
      arr.map((u) => {
        var sprite = game.add.sprite(SCALE * TILE_SIZE * u.x, SCALE * TILE_SIZE * u.y, "characters");
        sprite.scale.set(SCALE);
        sprite.animations.add('moveDown', [0, 1, 2, 3], 10, true);
        sprite.animations.add('moveUp', [4, 5, 6, 7], 10, true);
        sprite.animations.add('moveRight', [16, 17, 18, 19], 10, true);
        sprite.animations.add('moveLeft ', [20, 21, 22, 23], 10, true);
        sprite.exists = false;
        pushInMap(spriteMap, u, sprite);
      });
    }

    export function moveObject(unit: Unit, name: string) {
      var sprite = getFromMap(spriteMap, unit);
      sprite.play(name);
    }

    export function drawBoard(board: Board) {
      if(selection) selection.destroy();

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

    export function drawSelected(unit: Unit) {
      console.log("Tried to draw but didn't work");
      if(selection) selection.destroy();
      selection = game.add.graphics(0, 0);
      game.world.bringToTop(selection);
      selection.lineStyle(2, 0x00d9ff, 1);
      selection.drawRect(unit.x * TILE_SIZE * SCALE, unit.y * TILE_SIZE * SCALE, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
    }

    export function drawMoveArea(moveArea) {
      selection.beginFill(0xffff33);
      selection.alpha = 0.5;

      for (var i = 0; i < moveArea.length; i++) {
        var square = moveArea[i];

        selection.drawRect(square.x * TILE_SIZE * SCALE, square.y * TILE_SIZE * SCALE, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
      }
    }

    export function moveUnit(unit: Unit, dest: {x: number; y: number;}, callback) {
      selection.destroy();
      // Change the coordinates of the units
      var X = unit.x * TILE_SIZE * SCALE;
      var Y = unit.y * TILE_SIZE * SCALE;
      unit.x = dest.x;
      unit.y = dest.y;

      // Create the tween from the sprite mapped from the unit
      var sprite = getFromMap(spriteMap, unit);
      var tween = game.add.tween(sprite.position);
      // Scale tween
      dest.x *= TILE_SIZE * SCALE;
      dest.y *= TILE_SIZE * SCALE;

      var anim: Phaser.Animation;
      if(dest.x - X < 0) {
        anim = sprite.play("moveLeft");
      } else if (dest.x - X > 0) {
        anim = sprite.play("moveRight");
      } else {
        if(dest.y - Y < 0) {
          anim = sprite.play("moveUp");
        } else {
          anim = sprite.play("moveDown");
        }
      }

      tween.to(dest, 500, Phaser.Easing.Quadratic.Out, true);
      tween.onComplete.add(function() {
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