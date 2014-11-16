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
    var GameState = (function () {
        function GameState() {
        }
        return GameState;
    })();
    Timeline.GameState = GameState;
})(Timeline || (Timeline = {}));
/// <reference path="references.ts" />
var Timeline;
(function (Timeline) {
    var Play = (function (_super) {
        __extends(Play, _super);
        function Play() {
            _super.apply(this, arguments);
        }
        Play.prototype.preload = function () {
            console.log("Preloading Play");
            this.game.load.image("menu-btn", "assets/menu-btn.png");
        };
        Play.prototype.create = function () {
            var _this = this;
            console.log("Creating Play");
            var sprite = this.game.add.sprite(50, 150, "menu-btn");
            sprite.inputEnabled = true;
            sprite.events.onInputDown.add(function () {
                _this.game.state.start("Menu");
            }, this);
        };
        Play.prototype.update = function () {
        };
        return Play;
    })(Phaser.State);
    Timeline.Play = Play;
})(Timeline || (Timeline = {}));
/// <reference path="references.ts" />
var Timeline;
(function (Timeline) {
    var Menu = (function (_super) {
        __extends(Menu, _super);
        function Menu() {
            _super.apply(this, arguments);
        }
        Menu.prototype.preload = function () {
            console.log("Preloading Menu");
            this.game.load.image("start-btn", "assets/start-btn.png");
        };
        Menu.prototype.create = function () {
            var _this = this;
            console.log("Creating Menu");
            var sprite = this.game.add.sprite(50, 150, "start-btn");
            sprite.inputEnabled = true;
            sprite.events.onInputDown.add(function () {
                _this.game.state.start("Play");
            }, this);
        };
        return Menu;
    })(Phaser.State);
    Timeline.Menu = Menu;
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game(width, height) {
            console.log("Initializing Game object");
            _super.call(this, width, height, Phaser.CANVAS, "Timeline Game", null);
            this.state.add("Menu", Menu);
            this.state.add("Play", Timeline.Play);
            this.state.start("Menu");
        }
        return Game;
    })(Phaser.Game);
    Timeline.Game = Game;
    var game = new Game(500, 500);
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
