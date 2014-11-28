/// <reference path="references.ts" />
module Timeline {
  export module Display {
    var map = new Map<Unit, Phaser.Sprite>();

    export function loadSpritesFromObjects(game: Phaser.Game, arr: Unit[]) {
      arr.map((u) => {
        var sprite = game.add.sprite(u.x, u.y, "characters");
        sprite.scale.set(SCALE);
        sprite.animations.add('moveDown', [0, 1, 2, 3], 10, true);
        // sprite.play('move');
        map = map.set(u, sprite);
      });
    }

    export function moveObject(unit: Unit, name: string) {
      var sprite = map.get(unit);
      sprite.play(name);
    }
  }
}