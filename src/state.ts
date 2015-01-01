/// <reference path="references.ts" />
module Timeline {
  export interface Point {
    x: number;
    y: number;
  }
  export module GameState {
    export var boards: Board[] = [];
    export var currentBoard: Board = null;
    export var propertyMap = {};
  }

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
