/// <reference path="references.ts" />
module Timeline {
  export var GAME_WIDTH : number = 400;
  export var GAME_HEIGHT: number = 300;
  export var SCALE: number = 2;
  export var TILE_SIZE: number = 16;

  //export var BOARD_SIZE: number = 20;

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
      super(width, height, Phaser.CANVAS, "Timeline Game", null, false, false);


      this.state.add("Menu", Menu);
      this.state.add("Play", Play);

      // TODO: Uncomment for prod
      // this.state.start("Menu");
      this.state.start("Play");
    }
  }

  var game = new Game(GAME_WIDTH * SCALE, GAME_HEIGHT * SCALE);
}
