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


  export var layer; // Sorryyyyyy it's temporary?  I need it in isVisible()!

  export var GameState = {
    boards: [],
    currentBoard: null,
    propertyMap: {},
    myTeamNumber: 1
  };

  export class Board {
    allCharacters : Unit[];
    deadCharacters: Unit[];

    constructor(c: Unit[]) {
      this.allCharacters = c;
      this.deadCharacters = [];
    }

    clone(): Board {
      var b = new Board(this.allCharacters.map((c) => {return c.clone();}));
      b.deadCharacters = (this.deadCharacters.map((c) => {return c.clone();}));
      return b;
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
