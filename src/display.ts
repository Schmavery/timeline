/// <reference path="references.ts" />

module Timeline {
  export module Display {
    var spriteMap: {key: Unit; val: Phaser.Sprite}[] = [];

    export function loadSpritesFromObjects(game: Phaser.Game, arr: Unit[]) {
      arr.map((u) => {
        var sprite = game.add.sprite(u.x, u.y, "characters");
        sprite.scale.set(SCALE);
        // sprite.animations.add('moveDown', [0, 1, 2, 3], 10, true);
        pushInMap(spriteMap, u, sprite);
      });
    }

    export function moveObject(unit: Unit, name: string) {
      // var sprite = getFromMap(spriteMap, unit);
      // sprite.play(name);
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