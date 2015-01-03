/// <reference path="references.ts" />
module Timeline {
  export class Point {
    x: number;
    y: number;

    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }


  export module GameState {
    export var boards: Board[] = [];
    export var currentBoard: Board = null;
    export var propertyMap = {};
    export var myTeamNumber = 1;
  }

  export class Board {
    allCharacters : Unit[];
    deadCharacters: Unit[];

    constructor(c: Unit[]) {
      this.allCharacters = c;
      this.deadCharacters = [];
    }

    clone(): Board {
      return new Board(this.allCharacters.map((c) => {return c.clone();}));
    }
  }

  export function getUnitAt(p: Point) {
    var characters = GameState.currentBoard.allCharacters;
    for(var i = 0; i < characters.length; i++) {
      if(characters[i].x === p.x && characters[i].y === p.y) return characters[i];
    }

    return null;
  }

  export function isAlly(u: Unit) {
    return u.teamNumber === GameState.myTeamNumber;
  }
}
