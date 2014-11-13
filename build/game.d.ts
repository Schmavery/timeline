declare module Timeline {
    class Unit {
        pos: {
            x: number;
            y: number;
        };
        health: number;
        usedAP: number;
        owner: number;
        HEALTH: number;
        DAMAGE: number;
        AP: number;
        RANGE: number;
        constructor(ownerId: number);
        doAction(pos: {
            x: number;
            y: number;
        }): number;
    }
    class Warrior extends Unit {
        HEALTH: number;
        DAMAGE: number;
        AP: number;
        RANGE: number;
        constructor(ownerId: number);
    }
    class Mage extends Unit {
        HEALTH: number;
        DAMAGE: number;
        AP: number;
        RANGE: number;
        constructor(ownerId: number);
    }
    class Archer extends Unit {
        HEALTH: number;
        DAMAGE: number;
        AP: number;
        RANGE: number;
        constructor(ownerId: number);
    }
}
declare module Timeline {
}
declare module Timeline {
    interface BoardPos {
        x: number;
        y: number;
    }
    interface ScreenPos {
        x: number;
        y: number;
    }
    class Board {
        units: Unit[];
    }
}
