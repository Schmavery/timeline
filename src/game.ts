/// <reference path="references.ts" />
module Timeline {
  class Game extends Phaser.Game{
    constructor(width: number, height: number) {
      console.log("Initializing Game object");
      super(width, height, Phaser.CANVAS, "Timeline Game", null);
    }
  }
  var game = new Game(500, 500);
}
