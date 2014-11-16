/// <reference path="references.ts" />
module Timeline {
  export class Menu extends Phaser.State {
    preload() {
      console.log("Preloading Menu");
      this.game.load.image("start-btn", "assets/start-btn.png");
    }

    create() {
      console.log("Creating Menu");
      var sprite = this.game.add.sprite(50, 150, "start-btn");
      sprite.inputEnabled = true;
      sprite.events.onInputDown.add(() => {this.game.state.start("Play")}, this);
    }
  }

  export class Game extends Phaser.Game {
    constructor(width: number, height: number) {
      console.log("Initializing Game object");
      super(width, height, Phaser.CANVAS, "Timeline Game", null);
      this.state.add("Menu", Menu);
      this.state.add("Play", Play);
      this.state.start("Menu");
    }
  }
  var game = new Game(500, 500);
}
