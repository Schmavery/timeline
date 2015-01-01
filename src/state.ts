/// <reference path="references.ts" />
module Timeline {
  // class _GameState {
  //   boards: Board[];
  //   currentBoard: Board;
  //   constructor() {
  //     this.boards = [];
  //   }
  // }

  export module GameState {
    export var boards: Board[] = [];
    export var currentBoard: Board = null;
    export var propertyMap = {};
  }

  // SINGLETON PRIVATE FACTORY METHOD
  // export var GameState = new _GameState();

  export class Board {
    allCharacters : Unit[];

    constructor(c: Unit[]) {
      this.allCharacters = c;
    }

    clone(): Board {
      return new Board(this.allCharacters.map((c) => {return c.clone();}));
    }
  }
}
