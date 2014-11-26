/// <reference path="references.ts" />
module Timeline {
  class _GameState {
    boards: Board[];
    constructor() {
      this.boards = [];
    }
  }

  // SINGLETON PRIVATE FACTORY METHOD
  export var GameState = new _GameState();

  export class Board {
    allCharacters : Unit[];

    constructor(c: Unit[]) {
      this.allCharacters = c;
    }
  }
}