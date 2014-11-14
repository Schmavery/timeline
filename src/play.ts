/// <reference path="references.ts" />
module Timeline {
  export class Play extends Phaser.State {
    preload() {
      console.log("Preloading Play");
      this.game.load.image("menu-btn", "../assets/menu-btn.png");
    }

    create() {
      console.log("Creating Play");
      var sprite = this.game.add.sprite(50, 150, "menu-btn");
      sprite.inputEnabled = true;
      sprite.events.onInputDown.add(() => {this.game.state.start("Menu")}, this);
    }

    update() {

    }
  }
}
