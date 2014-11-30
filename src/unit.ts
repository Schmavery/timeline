/// <reference path="references.ts" />
module Timeline {
  export class Unit {
    x: number;
    y: number;
    health: number;
    usedAP: number;
    isAlly: number;

    HEALTH: number;
    DAMAGE: number;
    AP: number;
    RANGE: number;

    constructor(isAlly: number) {
      this.health = this.HEALTH;
      this.usedAP = 0;
      this.isAlly = isAlly;
      this.x = 0;
      this.y = 0;
    }

    setPosition(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    doAction(pos: {x: number; y: number}): number {
      return;
    }

    clone(){
      console.log();
      var c = new UnitClasses[this.constructor.toString().match(/function (\w*)/)[1]](this.isAlly);
      c.x = this.x;
      c.y = this.y;
      c.health = this.health;
      c.usedAP = this.usedAP;
      return c;
    }

  }

  export class Warrior extends Unit {
    HEALTH = 3;
    DAMAGE = 2;
    AP = 3;
    RANGE = 1;
    constructor(isAlly: number){
      super(isAlly);
    }
  }

  export class Mage extends Unit {
    HEALTH = 1;
    DAMAGE = 3;
    AP = 1;
    RANGE = 2;
    constructor(isAlly: number){
      super(isAlly);
    }
  }

  export class Archer extends Unit {
    HEALTH = 2;
    DAMAGE = 1;
    AP = 2;
    RANGE = 3;
    constructor(isAlly: number){
      super(isAlly);
    }
  }

  export var UnitClasses = {
    "Warrior": Warrior,
    "Archer": Archer,
    "Mage": Mage
  }
}
