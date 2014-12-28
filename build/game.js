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
            this.moveDistance = 0;
            this.x = 0;
            this.y = 0;
            this.isMoving = false;
            this.nextMovePath = [];
        }
        Unit.prototype.setPosition = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Unit.prototype.doAction = function (pos) {
            return;
        };
        Unit.prototype.clone = function () {
            // Very hacky yet so beautiful
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
            this.moveDistance = 5;
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
            this.moveDistance = 2;
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
            this.moveDistance = 3;
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
            this.moveArea = [];
            this.prevTime = 0;
            this.game.input.keyboard.onUpCallback = this.onKeyUp.bind(this);
            this.game.input.keyboard.onDownCallback = this.onKeyDown.bind(this);
        };
        Play.prototype.create = function () {
            console.log("Creating Play");
            var sprite = this.game.add.sprite(340 * Timeline.SCALE, 50 * Timeline.SCALE, "menu-btn");
            sprite.inputEnabled = true;
            sprite.events.onInputDown.add(this.playTurn.bind(this), this);
            var map = this.game.add.tilemap("test-map");
            this.layer = map.createLayer("Tile Layer 1");
            map.addTilesetImage("testset", "test-tile-set");
            this.layer.scale.set(Timeline.SCALE);
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
            var shouldStopHere = false;
            for (var i = 0; i < characters.length; i++) {
                if (characters[i].x === X && characters[i].y === Y && !characters[i].isMoving) {
                    this.moveArea = getMoveArea(characters[i], characters[i].moveDistance);
                    this.selectedUnit = characters[i];
                    Timeline.Display.drawMoveArea(this.moveArea);
                    Timeline.Display.drawMovePath(this.selectedUnit);
                    console.log(characters[i]);
                    shouldStopHere = true;
                }
            }
            if (shouldStopHere)
                return;
            for (var i = 0; i < this.moveArea.length; i++) {
                var clickedCell = this.moveArea[i];
                if (clickedCell.x === X && clickedCell.y === Y) {
                    if (contains(this.selectedUnit.nextMovePath, clickedCell, comparePoints)) {
                        removeFrom(this.selectedUnit.nextMovePath, clickedCell, comparePoints);
                        Timeline.Display.drawMovePath(this.selectedUnit);
                        break;
                    }
                    var lastCellInPath = this.selectedUnit.nextMovePath.length > 0 ? this.selectedUnit.nextMovePath[this.selectedUnit.nextMovePath.length - 1] : this.selectedUnit;
                    if (!isNear(clickedCell, lastCellInPath)) {
                        var tmp = findPath(this.moveArea, lastCellInPath, clickedCell);
                        // this.selectedUnit.nextMovePath = this.selectedUnit.nextMovePath.concat(tmp.slice(0, this.selectedUnit.moveDistance - this.selectedUnit.nextMovePath.length));
                        this.selectedUnit.nextMovePath = this.selectedUnit.nextMovePath.concat(tmp);
                    }
                    else {
                        this.selectedUnit.nextMovePath.push(clickedCell);
                    }
                    Timeline.Display.drawMovePath(this.selectedUnit);
                }
            }
        };
        Play.prototype.onMouseUp = function (p) {
            // console.log(p.x, p.y);
        };
        Play.prototype.onKeyUp = function (e) {
            if (e.keyCode === 32) {
                this.playTurn();
            }
        };
        Play.prototype.onKeyDown = function (e) {
            // for (var i in e){
            //   console.log(i, ":", e[i]);
            // }
        };
        Play.prototype.playTurn = function () {
            var characters = Timeline.GameState.currentBoard.allCharacters;
            var max = characters.length;
            for (var i = 0; i < max; i++) {
                if (characters[i].nextMovePath.length > 1 && !characters[i].isMoving) {
                    characters[i].isMoving = true;
                    // Remove the empty callback when figured out the optional type
                    // in TS
                    Timeline.Display.moveUnitAlongPath(characters[i], characters[i].nextMovePath, function (u) {
                        // reset isMoving so we can select the unit again
                        u.isMoving = false;
                        u.nextMovePath = [];
                    });
                }
            }
        };
        return Play;
    })(Phaser.State);
    Timeline.Play = Play;
    // Returns a path from the start to the end within the given space
    function findPath(space, start, end) {
        var openSet = [start];
        var closedSet = [];
        var cameFrom = {};
        var gScore = {};
        var fScore = {};
        gScore[hashPoint(start)] = 0;
        for (var i in space) {
            gScore[hashPoint(space[i])] = Infinity;
        }
        fScore[hashPoint(start)] = gScore[hashPoint(start)] + heuristicEstimate(start, end);
        while (openSet.length > 0) {
            var cur = openSet.reduce(function (acc, val) {
                if (fScore[hashPoint(val)] < fScore[hashPoint(acc)])
                    return val;
                return acc;
            });
            // we've reached the end, we're all goods
            if (comparePoints(cur, end)) {
                return constructPath(cameFrom, end);
            }
            remove(openSet, cur, comparePoints);
            closedSet.push(cur);
            var allNeighbours = findNeighbours(space, cur);
            for (var i in allNeighbours) {
                var neighbour = allNeighbours[i];
                if (contains(closedSet, neighbour, comparePoints))
                    continue;
                var tentativeGScore = gScore[hashPoint(cur)] + heuristicEstimate(cur, neighbour);
                if (!contains(openSet, neighbour, comparePoints) || tentativeGScore < gScore[hashPoint(neighbour)]) {
                    cameFrom[hashPoint(neighbour)] = cur;
                    gScore[hashPoint(neighbour)] = tentativeGScore;
                    fScore[hashPoint(neighbour)] = gScore[hashPoint(neighbour)] + heuristicEstimate(neighbour, end);
                    if (!contains(openSet, neighbour, comparePoints)) {
                        openSet.push(neighbour);
                    }
                }
            }
        }
        // We haven't reached the end, it's unreachable
        console.log("findPath: End is unreachable");
        return [];
    }
    function findNeighbours(space, p) {
        var ret = [];
        for (var i in space) {
            var cur = space[i];
            if (hashPoint(cur) !== hashPoint(p) && isNear(cur, p))
                ret.push(cur);
        }
        return ret;
    }
    function constructPath(cameFrom, end) {
        var cur = end;
        var path = [cur];
        while (cameFrom[hashPoint(cur)] !== undefined) {
            cur = cameFrom[hashPoint(cur)];
            path.push(cur);
        }
        //remove the last (which is the person itself)
        path.pop();
        return path.reverse();
    }
    function heuristicEstimate(p1, p2) {
        return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
    }
    function isNear(p1, p2) {
        return (p1.x === p2.x + 1 && p1.y === p2.y) || (p1.x === p2.x - 1 && p1.y === p2.y) || (p1.y === p2.y + 1 && p1.x === p2.x) || (p1.y === p2.y - 1 && p1.x === p2.x);
    }
    function hashPoint(p) {
        return "" + p.x + p.y + ":" + p.y + p.x;
    }
    function comparePoints(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    }
    function remove(arr, el, f) {
        var max = arr.length;
        var i = 0;
        for (; i < max; i++) {
            if (f(arr[i], el))
                break;
        }
        arr.splice(i, 1);
    }
    function removeFrom(arr, el, f) {
        var max = arr.length;
        var i = 0;
        for (; i < max; i++) {
            if (f(arr[i], el))
                break;
        }
        arr.splice(i, arr.length);
    }
    function contains(coll, el, f) {
        var max = coll.length;
        for (var i = 0; i < max; ++i) {
            if (f(coll[i], el)) {
                return true;
            }
        }
        return false;
    }
    function focusOn(board) {
        Timeline.GameState.currentBoard = board;
        Timeline.Display.drawBoard(board);
    }
    function getMoveArea(center, max) {
        var moveArea = [];
        for (var i = 1; i <= max; i++) {
            moveArea.push({ x: center.x, y: center.y + i });
            moveArea.push({ x: center.x, y: center.y - i });
            moveArea.push({ x: center.x + i, y: center.y });
            moveArea.push({ x: center.x - i, y: center.y });
            for (var j = 1; j <= max - i; j++) {
                moveArea.push({ x: center.x + i, y: center.y + j });
                moveArea.push({ x: center.x + i, y: center.y - j });
                moveArea.push({ x: center.x - i, y: center.y + j });
                moveArea.push({ x: center.x - i, y: center.y - j });
            }
        }
        return moveArea;
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
    function partial(fn) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var slice = Array.prototype.slice;
        var stored_args = slice.call(arguments, 1);
        return function () {
            var new_args = slice.call(arguments);
            var args = stored_args.concat(new_args);
            return fn.apply(null, args);
        };
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
        var movePathMap = [];
        var spriteMap = [];
        var game = null;
        var moveArea = null;
        var movePath = null;
        function cacheGame(g) {
            game = g;
            moveArea = game.add.graphics(0, 0);
            // moveArea.lineStyle(2, 0x00d9ff, 1);
            moveArea.alpha = 0.5;
            // movePath = game.add.graphics(0, 0);
            moveArea.movePath = 0.5;
        }
        Display.cacheGame = cacheGame;
        function loadSpritesFromObjects(arr) {
            arr.map(function (u) {
                var sprite = game.add.sprite(Timeline.SCALE * Timeline.TILE_SIZE * u.x, Timeline.SCALE * Timeline.TILE_SIZE * u.y, "characters");
                sprite.scale.set(Timeline.SCALE);
                sprite.animations.add('moveLeft', [20, 21, 22, 23], 10, true);
                sprite.animations.add('doneMovingLeft', [20], 10, true);
                sprite.animations.add('moveDown', [0, 1, 2, 3], 10, true);
                sprite.animations.add('doneMovingDown', [0], 10, true);
                sprite.animations.add('moveUp', [4, 5, 6, 7], 10, true);
                sprite.animations.add('doneMovingUp', [4], 10, true);
                sprite.animations.add('moveRight', [16, 17, 18, 19], 10, true);
                sprite.animations.add('doneMovingRight', [16], 10, true);
                sprite.exists = false;
                pushInMap(spriteMap, u, sprite);
                pushInMap(movePathMap, u, game.add.graphics(0, 0));
            });
        }
        Display.loadSpritesFromObjects = loadSpritesFromObjects;
        function moveObject(unit, name) {
            var sprite = getFromMap(spriteMap, unit);
            sprite.play(name);
        }
        Display.moveObject = moveObject;
        function drawBoard(board) {
            moveArea.clear();
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
        // export function drawSelected(unit: Unit) {
        //   if(moveArea) moveArea.destroy();
        //   moveArea = game.add.graphics(0, 0);
        //   game.world.bringToTop(moveArea);
        //   moveArea.lineStyle(2, 0x00d9ff, 1);
        //   // moveArea.drawRect(unit.x * TILE_SIZE * SCALE, unit.y * TILE_SIZE * SCALE, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
        // }
        function drawMoveArea(area) {
            moveArea.clear();
            game.world.bringToTop(moveArea);
            moveArea.lineStyle(2, 0x00d9ff, 1);
            moveArea.beginFill(0xffff33);
            for (var i = 0; i < area.length; i++) {
                var square = area[i];
                moveArea.drawRect(square.x * Timeline.TILE_SIZE * Timeline.SCALE, square.y * Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE);
            }
            moveArea.endFill();
        }
        Display.drawMoveArea = drawMoveArea;
        function drawMovePath(unit) {
            __drawMovePath(unit.nextMovePath, getFromMap(movePathMap, unit));
        }
        Display.drawMovePath = drawMovePath;
        function __drawMovePath(path, movePath) {
            movePath.clear();
            game.world.bringToTop(movePath);
            movePath.lineStyle(2, 0x00d9ff, 1);
            movePath.beginFill(0xff0033);
            movePath.alpha = 0.5;
            for (var i = 0; i < path.length; i++) {
                var square = path[i];
                movePath.drawRect(square.x * Timeline.TILE_SIZE * Timeline.SCALE, square.y * Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE);
            }
            movePath.endFill();
        }
        function moveUnitAlongPath(unit, path, callback) {
            moveArea.clear();
            getFromMap(movePathMap, unit).clear();
            var loop = function (arr, j) {
                if (j >= arr.length) {
                    // var sprite = getFromMap(spriteMap, unit);
                    // var anim = sprite.play("idle");
                    // console.log(anim);
                    // anim.complete();
                    return callback(unit);
                }
                Display.moveUnit(unit, arr[j], function () {
                    loop(arr, j + 1);
                });
            };
            loop(path, 0);
        }
        Display.moveUnitAlongPath = moveUnitAlongPath;
        function moveUnit(unit, dest, callback) {
            // Change the coordinates of the units
            var X = unit.x * Timeline.TILE_SIZE * Timeline.SCALE;
            var Y = unit.y * Timeline.TILE_SIZE * Timeline.SCALE;
            var clonedDest = {
                x: dest.x,
                y: dest.y
            };
            unit.x = clonedDest.x;
            unit.y = clonedDest.y;
            // Create the tween from the sprite mapped from the unit
            var sprite = getFromMap(spriteMap, unit);
            var tween = game.add.tween(sprite.position);
            // Scale tween
            clonedDest.x *= Timeline.TILE_SIZE * Timeline.SCALE;
            clonedDest.y *= Timeline.TILE_SIZE * Timeline.SCALE;
            var anim;
            var direction = "Left";
            if (clonedDest.x - X < 0) {
                anim = sprite.play("moveLeft");
                direction = "Left";
            }
            else if (clonedDest.x - X > 0) {
                anim = sprite.play("moveRight");
                direction = "Right";
            }
            else {
                if (clonedDest.y - Y < 0) {
                    anim = sprite.play("moveUp");
                    direction = "Up";
                }
                else {
                    anim = sprite.play("moveDown");
                    direction = "Down";
                }
            }
            tween.to(clonedDest, 500, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(function () {
                anim.complete();
                anim = sprite.play("doneMoving" + direction);
                anim.complete();
                callback();
            }, this);
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