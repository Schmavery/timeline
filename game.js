var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="references.ts" />
var Timeline;
(function (Timeline) {
    var Unit = (function () {
        function Unit(ownerId) {
            this.health = this.HEALTH;
            this.usedAP = 0;
            this.owner = ownerId;
        }
        Unit.prototype.doAction = function (pos) {
            return;
        };
        return Unit;
    })();
    Timeline.Unit = Unit;
    var Warrior = (function (_super) {
        __extends(Warrior, _super);
        function Warrior(ownerId) {
            _super.call(this, ownerId);
            this.HEALTH = 3;
            this.DAMAGE = 2;
            this.AP = 3;
            this.RANGE = 1;
        }
        return Warrior;
    })(Unit);
    Timeline.Warrior = Warrior;
    var Mage = (function (_super) {
        __extends(Mage, _super);
        function Mage(ownerId) {
            _super.call(this, ownerId);
            this.HEALTH = 1;
            this.DAMAGE = 3;
            this.AP = 1;
            this.RANGE = 2;
        }
        return Mage;
    })(Unit);
    Timeline.Mage = Mage;
    var Archer = (function (_super) {
        __extends(Archer, _super);
        function Archer(ownerId) {
            _super.call(this, ownerId);
            this.HEALTH = 2;
            this.DAMAGE = 1;
            this.AP = 2;
            this.RANGE = 3;
        }
        return Archer;
    })(Unit);
    Timeline.Archer = Archer;
})(Timeline || (Timeline = {}));
/// <reference path="references.ts" />
var Timeline;
(function (Timeline) {
    var Board = (function () {
        function Board() {
        }
        return Board;
    })();
    Timeline.Board = Board;
})(Timeline || (Timeline = {}));
/// <reference path="references.ts" />
var Timeline;
(function (Timeline) {
    var GameState = (function () {
        function GameState() {
        }
        return GameState;
    })();
})(Timeline || (Timeline = {}));
