class Unit {
  pos: {x: number; y: number};
  health: number;
  usedAP: number;
  owner: number;

  HEALTH: number;
  DAMAGE: number;
  AP: number;
  RANGE: number;

  constructor(ownerId: number) {
    health = HEALTH;
    usedAP = 0;
    owner = ownerId;
  }

  doAction(pos: {x: number; y: number}): number {
    return;
  }

}

class Warrior extends Unit {
  HEALTH = 3;
  DAMAGE = 2;
  AP = 3;
  RANGE = 1;
  constructor(ownerId: number){ super(ownerId); }
}

class Mage extends Unit {
  HEALTH = 1;
  DAMAGE = 3;
  AP = 1;
  RANGE = 2;
  constructor(ownerId: number){ super(ownerId); }
}

class Archer extends Unit {
  HEALTH = 2;
  DAMAGE = 1;
  AP = 2;
  RANGE = 3;
  constructor(ownerId: number){ super(ownerId); }
}
