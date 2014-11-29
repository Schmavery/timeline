/// <reference path="references.ts" />

module Timeline {
  export module Display {
    var spriteMap: {key: Unit; val: Phaser.Sprite}[] = [];
    var game = null;
    var graphics = null;

    export function cacheGame(g: Phaser.Game) {
      game = g;
      graphics = game.add.graphics(0, 0);
    }

    export function loadSpritesFromObjects(arr: Unit[]) {
      arr.map((u) => {
        var sprite = game.add.sprite(SCALE * TILE_SIZE * u.x, SCALE * TILE_SIZE * u.y, "characters");
        sprite.scale.set(SCALE);
        sprite.animations.add('moveDown', [0, 1, 2, 3], 10, true);
        sprite.exists = false;
        pushInMap(spriteMap, u, sprite);
      });
    }

    export function moveObject(unit: Unit, name: string) {
      var sprite = getFromMap(spriteMap, unit);
      sprite.play(name);
    }

    export function drawBoard(board: Board) {
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
      graphics.beginFill(0x181818);
      graphics.lineStyle(5, 0x00d9ff, 1);
      graphics.drawRect(unit.x * TILE_SIZE, unit.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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