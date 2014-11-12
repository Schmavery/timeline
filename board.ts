import State = require("state");
import Unit = require("unit");

export interface BoardPos {
  x: number;
  y: number;
}

export interface ScreenPos {
  x: number;
  y: number;
}

export class Board {
  units : Unit.Unit[];
}
