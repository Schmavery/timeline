/// <reference path="references.ts" />
module Timeline {
  interface Attack {
    damage: number;
    target: Unit;
    trigger: Point;
  }
  export class Unit {
    x: number;
    y: number;
    health: number;
    usedAP: number;
    teamNumber: number;
    moveDistance: number;
    isMoving: boolean;
    nextMovePath: Point[];
    nextAttack: Attack;

    visionRange: number;
    range: number;

    HEALTH: number;
    DAMAGE: number;
    AP: number;
    RANGE: number;

    constructor(teamNumber: number) {
      this.usedAP = 0;
      this.teamNumber = teamNumber;
      this.moveDistance = 0;
      this.x = 0;
      this.y = 0;
      this.isMoving = false;
      this.nextMovePath = [];
      this.visionRange = 6;
    }

    setPosition(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    doAction(pos: {x: number; y: number}): number {
      return;
    }

    clone(){
      // Very hacky yet so beautiful
      var c = new UnitClasses[this.getType()](this.teamNumber);
      c.x = this.x;
      c.y = this.y;
      c.health = this.health;
      c.usedAP = this.usedAP;
      return c;
    }

    getType() {
      return this.constructor.toString().match(/function (\w*)/)[1];
    }

    isDead() {
      return this.health <= 0;
    }
  }

  export class Warrior extends Unit {
    HEALTH = 3;
    DAMAGE = 256;
    AP = 3;
    RANGE = 1;
    constructor(teamNumber: number){
      super(teamNumber);
      this.moveDistance = 5;
      this.health = this.HEALTH;
    }
  }

  export class Mage extends Unit {
    HEALTH = 1;
    DAMAGE = 3;
    AP = 1;
    RANGE = 2;
    constructor(teamNumber: number){
      super(teamNumber);
      this.moveDistance = 2;
      this.health = this.HEALTH;
    }
  }

  export class Archer extends Unit {
    HEALTH = 2;
    DAMAGE = 1;
    AP = 2;
    RANGE = 3;
    constructor(teamNumber: number){
      super(teamNumber);
      this.moveDistance = 3;
      this.health = this.HEALTH;
    }
  }

  export var UnitClasses = {
    "Warrior": Warrior,
    "Archer": Archer,
    "Mage": Mage
  }
}
