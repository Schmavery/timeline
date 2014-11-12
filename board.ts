/// <reference path="references.ts" />
module Timeline {
  export interface BoardPos {
    x: number;
    y: number;
  }

  export interface ScreenPos {
    x: number;
    y: number;
  }

  export class Board {
    units : Unit[];
  }
}
