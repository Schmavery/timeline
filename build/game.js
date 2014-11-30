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
        function Unit(isAlly) {
            this.health = this.HEALTH;
            this.usedAP = 0;
            this.isAlly = isAlly;
            this.x = 0;
            this.y = 0;
        }
        Unit.prototype.setPosition = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Unit.prototype.doAction = function (pos) {
            return;
        };
        Unit.prototype.clone = function () {
            console.log();
            var c = new Timeline.UnitClasses[this.constructor.toString().match(/function (\w*)/)[1]](this.isAlly);
            c.x = this.x;
            c.y = this.y;
            c.health = this.health;
            c.usedAP = this.usedAP;
            return c;
        };
        return Unit;
    })();
    Timeline.Unit = Unit;
    var Warrior = (function (_super) {
        __extends(Warrior, _super);
        function Warrior(isAlly) {
            _super.call(this, isAlly);
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
        function Mage(isAlly) {
            _super.call(this, isAlly);
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
        function Archer(isAlly) {
            _super.call(this, isAlly);
            this.HEALTH = 2;
            this.DAMAGE = 1;
            this.AP = 2;
            this.RANGE = 3;
        }
        return Archer;
    })(Unit);
    Timeline.Archer = Archer;
    Timeline.UnitClasses = {
        "Warrior": Warrior,
        "Archer": Archer,
        "Mage": Mage
    };
})(Timeline || (Timeline = {}));
/// <reference path="references.ts" />
var Timeline;
(function (Timeline) {
    // class _GameState {
    //   boards: Board[];
    //   currentBoard: Board;
    //   constructor() {
    //     this.boards = [];
    //   }
    // }
    var GameState;
    (function (GameState) {
        GameState.boards = [];
        GameState.currentBoard = null;
    })(GameState = Timeline.GameState || (Timeline.GameState = {}));
    // SINGLETON PRIVATE FACTORY METHOD
    // export var GameState = new _GameState();
    var Board = (function () {
        function Board(c) {
            this.allCharacters = c;
        }
        Board.prototype.clone = function () {
            return new Board(this.allCharacters.map(function (c) {
                return c.clone();
            }));
        };
        return Board;
    })();
    Timeline.Board = Board;
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
            Timeline.Display.cacheGame(this.game);
            this.game.load.image("menu-btn", "assets/menu-btn.png");
            this.game.load.tilemap("test-map", "assets/maps/testmap.json", null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image("test-tile-set", "assets/maps/test-tile-set.png");
            this.game.load.spritesheet("characters", "assets/maps/people.png", 16, 16, 50);
            this.game.input.mouse.mouseWheelCallback = mouseWheelCallback.bind(this);
            this.game.input.onDown.add(this.onMouseDown, this);
            this.game.input.onUp.add(this.onMouseUp, this);
        };
        Play.prototype.create = function () {
            var _this = this;
            console.log("Creating Play");
            var sprite = this.game.add.sprite(340 * Timeline.SCALE, 50 * Timeline.SCALE, "menu-btn");
            sprite.inputEnabled = true;
            sprite.events.onInputDown.add(function () {
                _this.game.state.start("Menu");
            }, this);
            var map = this.game.add.tilemap("test-map");
            this.layer = map.createLayer("Tile Layer 1");
            map.addTilesetImage("testset", "test-tile-set");
            this.layer.scale.set(Timeline.SCALE);
            this.moveArea = [];
            this.prevTime = 0;
            var characters = createGameObjectFromLayer("Characters", map);
            var board = new Timeline.Board(characters);
            Timeline.GameState.boards.push(board);
            Timeline.Display.loadSpritesFromObjects(characters);
            focusOn(board);
            var newBoard = board.clone();
            Timeline.GameState.boards.push(newBoard);
            newBoard.allCharacters[0].x = 0;
            newBoard.allCharacters[1].y = 5;
            newBoard.allCharacters[2].x = 5;
            newBoard.allCharacters[2].y = 5;
            Timeline.Display.loadSpritesFromObjects(newBoard.allCharacters);
            focusOn(newBoard);
        };
        Play.prototype.update = function () {
        };
        Play.prototype.splitGame = function (board) {
            var newBoard = board.clone();
            Timeline.GameState.boards.push(newBoard);
            Timeline.Display.loadSpritesFromObjects(newBoard.allCharacters);
            focusOn(newBoard);
        };
        Play.prototype.onMouseDown = function (p) {
            var characters = Timeline.GameState.currentBoard.allCharacters;
            var X = ~~(p.x / (Timeline.SCALE * Timeline.TILE_SIZE));
            var Y = ~~(p.y / (Timeline.SCALE * Timeline.TILE_SIZE));
            for (var i = 0; i < characters.length; i++) {
                if (characters[i].x === X && characters[i].y === Y) {
                    this.moveArea = getMoveArea(characters[i]);
                    this.selectedUnit = characters[i];
                    Timeline.Display.drawSelected(this.selectedUnit);
                    Timeline.Display.drawMoveArea(this.moveArea);
                    console.log(characters[i]);
                    return;
                }
            }
            for (var i = 0; i < this.moveArea.length; i++) {
                if (this.moveArea[i].x === X && this.moveArea[i].y === Y) {
                    Timeline.Display.moveUnit(this.selectedUnit, this.moveArea[i], function () {
                        console.log("Done");
                    });
                }
            }
        };
        Play.prototype.onMouseUp = function (p) {
            // console.log(p.x, p.y);
        };
        return Play;
    })(Phaser.State);
    Timeline.Play = Play;
    function focusOn(board) {
        Timeline.GameState.currentBoard = board;
        Timeline.Display.drawBoard(board);
    }
    function getMoveArea(unit) {
        return [{ x: unit.x + 1, y: unit.y }, { x: unit.x - 1, y: unit.y }, { x: unit.x, y: unit.y + 1 }, { x: unit.x, y: unit.y - 1 }];
    }
    function mouseWheelCallback(event) {
        var curTime = Date.now();
        if (curTime - this.prevTime < 600) {
            return;
        }
        this.prevTime = curTime;
        var delta = this.game.input.mouse.wheelDelta;
        // console.log("delta:", delta);
        Timeline.GameState.currentBoard = Timeline.GameState.boards[(Timeline.GameState.boards.indexOf(Timeline.GameState.currentBoard) + delta + Timeline.GameState.boards.length) % Timeline.GameState.boards.length];
        Timeline.Display.drawBoard(Timeline.GameState.currentBoard);
    }
    function createGameObjectFromLayer(layerName, map) {
        var arr = map.objects[layerName];
        var ret = [];
        for (var i = 0; i < arr.length; i++) {
            var character = new Timeline.UnitClasses[arr[i].properties.type]();
            character.setPosition(~~(arr[i].x / Timeline.TILE_SIZE), ~~(arr[i].y / Timeline.TILE_SIZE) - 1);
            ret.push(character);
        }
        return ret;
    }
})(Timeline || (Timeline = {}));
/// <reference path="references.ts" />
var Timeline;
(function (Timeline) {
    Timeline.GAME_WIDTH = 400;
    Timeline.GAME_HEIGHT = 300;
    Timeline.SCALE = 2;
    Timeline.TILE_SIZE = 16;
    //export var BOARD_SIZE: number = 20;
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
            _super.call(this, width, height, Phaser.CANVAS, "Timeline Game", null, false, false);
            this.state.add("Menu", Menu);
            this.state.add("Play", Timeline.Play);
            // TODO: Uncomment for prod
            // this.state.start("Menu");
            this.state.start("Play");
        }
        return Game;
    })(Phaser.Game);
    Timeline.Game = Game;
    var game = new Game(Timeline.GAME_WIDTH * Timeline.SCALE, Timeline.GAME_HEIGHT * Timeline.SCALE);
})(Timeline || (Timeline = {}));
/// <reference path="references.ts" />
var Timeline;
(function (Timeline) {
    var Display;
    (function (Display) {
        var spriteMap = [];
        var game = null;
        var selection = null;
        function cacheGame(g) {
            game = g;
        }
        Display.cacheGame = cacheGame;
        function loadSpritesFromObjects(arr) {
            arr.map(function (u) {
                var sprite = game.add.sprite(Timeline.SCALE * Timeline.TILE_SIZE * u.x, Timeline.SCALE * Timeline.TILE_SIZE * u.y, "characters");
                sprite.scale.set(Timeline.SCALE);
                sprite.animations.add('moveDown', [0, 1, 2, 3], 10, true);
                sprite.exists = false;
                pushInMap(spriteMap, u, sprite);
            });
        }
        Display.loadSpritesFromObjects = loadSpritesFromObjects;
        function moveObject(unit, name) {
            var sprite = getFromMap(spriteMap, unit);
            sprite.play(name);
        }
        Display.moveObject = moveObject;
        function drawBoard(board) {
            if (selection)
                selection.destroy();
            for (var i = 0; i < spriteMap.length; i++) {
                spriteMap[i].val.exists = false;
            }
            for (var i = 0; i < board.allCharacters.length; i++) {
                var c = board.allCharacters[i];
                var sprite = getFromMap(spriteMap, c);
                sprite.exists = true;
            }
        }
        Display.drawBoard = drawBoard;
        function drawSelected(unit) {
            console.log("Tried to draw but didn't work");
            if (selection)
                selection.destroy();
            selection = game.add.graphics(0, 0);
            game.world.bringToTop(selection);
            selection.lineStyle(2, 0x00d9ff, 1);
            selection.drawRect(unit.x * Timeline.TILE_SIZE * Timeline.SCALE, unit.y * Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE);
        }
        Display.drawSelected = drawSelected;
        function drawMoveArea(moveArea) {
            selection.beginFill(0xffff33);
            selection.alpha = 0.5;
            for (var i = 0; i < moveArea.length; i++) {
                var square = moveArea[i];
                selection.drawRect(square.x * Timeline.TILE_SIZE * Timeline.SCALE, square.y * Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE);
            }
        }
        Display.drawMoveArea = drawMoveArea;
        function moveUnit(unit, dest, callback) {
            selection.destroy();
            // Change the coordinates of the units
            unit.x = dest.x;
            unit.y = dest.y;
            // Create the tween from the sprite mapped from the unit
            var tween = game.add.tween(getFromMap(spriteMap, unit).position);
            // Scale tween
            dest.x *= Timeline.TILE_SIZE * Timeline.SCALE;
            dest.y *= Timeline.TILE_SIZE * Timeline.SCALE;
            tween.to(dest, 500, Phaser.Easing.Quadratic.Out, true);
            tween.onComplete.add(callback, this);
        }
        Display.moveUnit = moveUnit;
        function getFromMap(map, key) {
            for (var i = 0; i < map.length; i++) {
                if (map[i].key === key) {
                    return map[i].val;
                }
            }
            return null;
        }
        function pushInMap(map, key, val) {
            for (var i = 0; i < map.length; i++) {
                if (map[i].key === key) {
                    map[i].val = val;
                    return;
                }
            }
            map.push({ key: key, val: val });
        }
    })(Display = Timeline.Display || (Timeline.Display = {}));
})(Timeline || (Timeline = {}));
//# sourceMappingURL=game.js.map