/// <reference path="references.ts" />
module Timeline {
  export class Play extends Phaser.State {
    layer: Phaser.TilemapLayer;
    preload() {
      console.log("Preloading Play");
      this.game.load.image("menu-btn", "assets/menu-btn.png");
      this.game.load.tilemap("test-map", "assets/maps/testmap.json", null,
      Phaser.Tilemap.TILED_JSON);
      this.game.load.image("test-tile-set", "assets/maps/test-tile-set.png");
    }

    create() {
      console.log("Creating Play");
      var sprite = this.game.add.sprite(340*SCALE, 50*SCALE, "menu-btn");
      sprite.inputEnabled = true;
      sprite.events.onInputDown.add(() => {this.game.state.start("Menu")}, this);

      var map = this.game.add.tilemap("test-map");
      this.layer = map.createLayer("Tile Layer 1");
      map.addTilesetImage("testset", "test-tile-set");
      this.layer.scale.set(SCALE);
      Phaser.Canvas.setSmoothingEnabled(this.game.context, false);
    }

    update() {

    }
  }
}
