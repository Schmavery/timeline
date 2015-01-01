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
        function Unit(teamNumber) {
            this.health = this.HEALTH;
            this.usedAP = 0;
            this.teamNumber = teamNumber;
            this.moveDistance = 0;
            this.x = 0;
            this.y = 0;
            this.isMoving = false;
            this.nextMovePath = [];
            this.visionRange = 4;
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
            var c = new Timeline.UnitClasses[this.getType()](this.teamNumber);
            c.x = this.x;
            c.y = this.y;
            c.health = this.health;
            c.usedAP = this.usedAP;
            return c;
        };
        Unit.prototype.getType = function () {
            return this.constructor.toString().match(/function (\w*)/)[1];
        };
        return Unit;
    })();
    Timeline.Unit = Unit;
    var Warrior = (function (_super) {
        __extends(Warrior, _super);
        function Warrior(teamNumber) {
            _super.call(this, teamNumber);
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
        function Mage(teamNumber) {
            _super.call(this, teamNumber);
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
        function Archer(teamNumber) {
            _super.call(this, teamNumber);
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
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    })();
    Timeline.Point = Point;
    var GameState;
    (function (GameState) {
        GameState.boards = [];
        GameState.currentBoard = null;
        GameState.propertyMap = {};
        GameState.myTeamNumber = 1;
    })(GameState = Timeline.GameState || (Timeline.GameState = {}));
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
    function getUnitAt(p) {
        var characters = GameState.currentBoard.allCharacters;
        for (var i = 0; i < characters.length; i++) {
            if (characters[i].x === p.x && characters[i].y === p.y)
                return characters[i];
        }
        return null;
    }
    Timeline.getUnitAt = getUnitAt;
    function isAlly(u) {
        return u.teamNumber === GameState.myTeamNumber;
    }
    Timeline.isAlly = isAlly;
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
            this.game.canvas.oncontextmenu = function (e) {
                e.preventDefault();
            };
            var sprite = this.game.add.sprite(340 * Timeline.SCALE, 50 * Timeline.SCALE, "menu-btn");
            sprite.inputEnabled = true;
            sprite.events.onInputDown.add(this.playTurn.bind(this), this);
            var map = this.game.add.tilemap("test-map");
            this.layer = map.createLayer("Tile Layer 1");
            map.addTilesetImage("testset", "test-tile-set");
            this.layer.scale.set(Timeline.SCALE);
            // Init the display
            Timeline.Display.init(this.game, map);
            //console.log(this.layer);
            var tileset = map.tilesets[map.getTilesetIndex('testset')];
            for (var i = 0; i < map.width; i++) {
                for (var j = 0; j < map.height; j++) {
                    var tile = map.getTile(i, j, "Tile Layer 1");
                    var props = tile.properties;
                    if (Object.keys(props).length !== 0) {
                        for (var key in props) {
                            if (typeof props[key] !== "string")
                                continue;
                            if (props[key].toLowerCase() === "true")
                                props[key] = true;
                            else if (props[key].toLowerCase() === "false")
                                props[key] = false;
                            else if (!isNaN(props[key]))
                                props[key] = parseInt(props[key]);
                        }
                        Timeline.GameState.propertyMap[hashPoint({ x: i, y: j })] = tile.properties;
                    }
                }
            }
            console.log(Timeline.GameState.propertyMap);
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
        Play.prototype.onMouseDown = function (mouse) {
            var characters = Timeline.GameState.currentBoard.allCharacters;
            var clickedCell = {
                x: ~~(mouse.x / (Timeline.SCALE * Timeline.TILE_SIZE)),
                y: ~~(mouse.y / (Timeline.SCALE * Timeline.TILE_SIZE))
            };
            // maybeCharacter will be equal to the selected character if
            // clickedCell is a cell that contains a character
            // if not, we'll check if the user clicked on a movePath cell or a
            // moveArea cell to either add to the path, or remove from the path
            var maybeCharacter = find(characters, clickedCell, comparePoints);
            if (maybeCharacter)
                console.log(maybeCharacter.isMoving);
            if (maybeCharacter && Timeline.isAlly(maybeCharacter) && !maybeCharacter.isMoving) {
                this.selectedUnit = maybeCharacter;
                console.log(maybeCharacter);
            }
            else if (this.selectedUnit) {
                if (contains(this.selectedUnit.nextMovePath, clickedCell, comparePoints)) {
                    removeFrom(this.selectedUnit.nextMovePath, clickedCell, comparePoints);
                }
                else if (contains(this.moveArea, clickedCell, comparePoints)) {
                    var lastCellInPath = this.selectedUnit.nextMovePath.length > 0 ? this.selectedUnit.nextMovePath[this.selectedUnit.nextMovePath.length - 1] : this.selectedUnit;
                    if (!isNear(clickedCell, lastCellInPath)) {
                        var tmp = findPath(this.moveArea, lastCellInPath, clickedCell);
                        this.selectedUnit.nextMovePath = this.selectedUnit.nextMovePath.concat(tmp.slice(0, this.selectedUnit.moveDistance - this.selectedUnit.nextMovePath.length));
                    }
                    else {
                        if (this.selectedUnit.nextMovePath.length < this.selectedUnit.moveDistance) {
                            this.selectedUnit.nextMovePath.push(clickedCell);
                        }
                    }
                }
                else {
                    var lastCellInPath = this.selectedUnit.nextMovePath.length > 0 ? this.selectedUnit.nextMovePath[this.selectedUnit.nextMovePath.length - 1] : this.selectedUnit;
                    if (maybeCharacter && !Timeline.isAlly(maybeCharacter) && isNear(maybeCharacter, lastCellInPath, this.selectedUnit.RANGE)) {
                        this.selectedUnit.nextAttack = { damage: this.selectedUnit.DAMAGE, target: maybeCharacter, trigger: lastCellInPath };
                        console.log("Will attack", this.selectedUnit.nextAttack);
                    }
                    else {
                        this.selectedUnit = null;
                        this.moveArea = [];
                    }
                }
            }
            if (this.selectedUnit) {
                this.moveArea = getMoveArea(this.selectedUnit.nextMovePath.length > 0 ? this.selectedUnit.nextMovePath[this.selectedUnit.nextMovePath.length - 1] : this.selectedUnit, this.selectedUnit.moveDistance - this.selectedUnit.nextMovePath.length);
            }
            Timeline.Display.drawMoveArea(this.moveArea);
            Timeline.Display.drawMovePath(this.selectedUnit);
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
                if (!characters[i].isMoving && characters[i].nextMovePath.length > 0) {
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
            this.selectedUnit = null;
            this.moveArea = [];
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
        // for (var s in space){
        //   gScore[hashPoint(space[s])] = Infinity;
        // }
        fScore[hashPoint(start)] = gScore[hashPoint(start)] + heuristicEstimate(start, end);
        while (openSet.length > 0) {
            var cur = openSet[0];
            for (var i = 1; i < openSet.length; i++) {
                if (fScore[hashPoint(openSet[i])] < fScore[hashPoint(cur)])
                    cur = openSet[i];
            }
            // we've reached the end, we're all goods
            if (comparePoints(cur, end)) {
                return constructPath(cameFrom, end);
            }
            remove(openSet, cur, comparePoints);
            closedSet.push(cur);
            var allNeighbours = findNeighbours(space, cur);
            for (var n in allNeighbours) {
                var neighbour = allNeighbours[n];
                if (contains(closedSet, neighbour, comparePoints))
                    continue;
                var tentativeGScore = gScore[hashPoint(cur)] + heuristicEstimate(cur, neighbour);
                var neighbourHash = hashPoint(neighbour);
                if (!contains(openSet, neighbour, comparePoints) || tentativeGScore < gScore[neighbourHash]) {
                    cameFrom[neighbourHash] = cur;
                    gScore[neighbourHash] = tentativeGScore;
                    fScore[neighbourHash] = gScore[neighbourHash] + heuristicEstimate(neighbour, end);
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
        return [
            { x: p.x + 1, y: p.y },
            { x: p.x - 1, y: p.y },
            { x: p.x, y: p.y + 1 },
            { x: p.x, y: p.y - 1 },
        ].filter(function (x) {
            return contains(space, x, comparePoints);
        });
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
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p1.y);
    }
    function isNear(p1, p2, radius) {
        radius = radius || 1;
        var dx = Math.abs(p2.x - p1.x);
        var dy = Math.abs(p2.y - p1.y);
        return dx + dy <= radius;
    }
    function hashPoint(p) {
        return "" + p.x + "." + p.y;
    }
    function comparePoints(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    }
    Timeline.comparePoints = comparePoints;
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
        return find(coll, el, f) !== null;
    }
    function find(coll, el, f) {
        var max = coll.length;
        for (var i = 0; i < max; ++i) {
            if (f(coll[i], el)) {
                return coll[i];
            }
        }
        return null;
    }
    function focusOn(board) {
        Timeline.GameState.currentBoard = board;
        Timeline.Display.drawBoard(board);
    }
    function getMoveArea(center, max) {
        var moveArea = [];
        for (var i = 1; i <= max; i++) {
            checkAddTile(moveArea, { x: center.x, y: center.y + i });
            checkAddTile(moveArea, { x: center.x, y: center.y - i });
            checkAddTile(moveArea, { x: center.x + i, y: center.y });
            checkAddTile(moveArea, { x: center.x - i, y: center.y });
            for (var j = 1; j <= max - i; j++) {
                checkAddTile(moveArea, { x: center.x + i, y: center.y + j });
                checkAddTile(moveArea, { x: center.x + i, y: center.y - j });
                checkAddTile(moveArea, { x: center.x - i, y: center.y + j });
                checkAddTile(moveArea, { x: center.x - i, y: center.y - j });
            }
        }
        var tmp = [];
        for (var i = 0; i < moveArea.length; i++) {
            if (findPath(moveArea, center, moveArea[i]).length > 0)
                tmp.push(moveArea[i]);
        }
        return tmp;
    }
    function checkAddTile(moveArea, tile) {
        var prop1 = Timeline.GameState.propertyMap[hashPoint(tile)];
        if (prop1 && prop1.collision)
            return;
        var c = Timeline.getUnitAt(tile);
        if (c && !Timeline.isAlly(c) && isVisible(c))
            return;
        moveArea.push(tile);
    }
    function isVisible(point) {
        var characters = Timeline.GameState.currentBoard.allCharacters;
        for (var i = 0; i < characters.length; i++) {
            var c = characters[i];
            if (!Timeline.isAlly(c))
                continue;
            if (isNear(c, point, c.visionRange))
                return true;
        }
        return false;
    }
    Timeline.isVisible = isVisible;
    function mouseWheelCallback(event) {
        event.preventDefault();
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
            var character = new Timeline.UnitClasses[arr[i].properties.type](parseInt(arr[i].properties.teamNumber));
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
        var unitsToFrameNumber = {
            "Warrior": 0,
            "Archer": 32,
            "Mage": 0
        };
        var movePathMap = [];
        var spriteMap = [];
        var fogOfWar = null;
        var game = null;
        var map = null;
        var moveArea = null;
        function init(g, m) {
            game = g;
            map = m;
            moveArea = game.add.graphics(0, 0);
            moveArea.alpha = 0.5;
            fogOfWar = game.add.graphics(0, 0);
            fogOfWar.alpha = 0.5;
        }
        Display.init = init;
        function loadSpritesFromObjects(arr) {
            arr.map(function (u) {
                var sprite = game.add.sprite(Timeline.SCALE * Timeline.TILE_SIZE * u.x, Timeline.SCALE * Timeline.TILE_SIZE * u.y, "characters", 0);
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
            for (var i = 0; i < movePathMap.length; i++) {
                movePathMap[i].val.clear();
            }
            for (var i = 0; i < board.allCharacters.length; i++) {
                var c = board.allCharacters[i];
                var sprite = getFromMap(spriteMap, c);
                sprite.exists = true;
                if (c.nextMovePath.length > 0) {
                    Display.drawMovePath(c);
                }
            }
            drawFogOfWar();
        }
        Display.drawBoard = drawBoard;
        function drawFogOfWar() {
            fogOfWar.clear();
            fogOfWar.beginFill(0x000000);
            var characters = Timeline.GameState.currentBoard.allCharacters;
            for (var k = 0; k < characters.length; k++) {
                var sprite = getFromMap(spriteMap, characters[k]);
                sprite.exists = false;
            }
            for (var i = 0; i < map.width; i++) {
                for (var j = 0; j < map.height; j++) {
                    if (!Timeline.isVisible({ x: i, y: j })) {
                        fogOfWar.drawRect(i * Timeline.TILE_SIZE * Timeline.SCALE, j * Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE);
                    }
                    else {
                        var sprite = getFromMap(spriteMap, Timeline.getUnitAt(new Timeline.Point(i, j)));
                        if (sprite)
                            sprite.exists = true;
                    }
                }
            }
            fogOfWar.endFill();
        }
        Display.drawFogOfWar = drawFogOfWar;
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
            if (!unit)
                return;
            var path = unit.nextMovePath;
            var movePath = getFromMap(movePathMap, unit);
            movePath.clear();
            game.world.bringToTop(movePath);
            movePath.lineStyle(2, 0x00d9ff, 1);
            movePath.beginFill(0x00ff33);
            movePath.alpha = 0.5;
            for (var i = 0; i < path.length; i++) {
                var square = path[i];
                movePath.drawRect(square.x * Timeline.TILE_SIZE * Timeline.SCALE, square.y * Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE, Timeline.TILE_SIZE * Timeline.SCALE);
            }
            movePath.endFill();
            if (unit.nextAttack) {
                movePath.lineStyle(5, 0xff0000, 1);
                movePath.moveTo((unit.nextAttack.trigger.x * Timeline.TILE_SIZE + Timeline.TILE_SIZE / 2) * Timeline.SCALE, (unit.nextAttack.trigger.y * Timeline.TILE_SIZE + Timeline.TILE_SIZE / 2) * Timeline.SCALE);
                movePath.lineTo((unit.nextAttack.target.x * Timeline.TILE_SIZE + Timeline.TILE_SIZE / 2) * Timeline.SCALE, (unit.nextAttack.target.y * Timeline.TILE_SIZE + Timeline.TILE_SIZE / 2) * Timeline.SCALE);
            }
        }
        Display.drawMovePath = drawMovePath;
        function __drawMovePath(path, movePath) {
        }
        function moveUnitAlongPath(unit, path, callback) {
            moveArea.clear();
            getFromMap(movePathMap, unit).clear();
            for (var i = 0; i < path.length; i++) {
                var c = Timeline.getUnitAt(path[i]);
                if (c && !Timeline.isAlly(c)) {
                    path = path.slice(0, i - c.RANGE < 0 ? 0 : i - c.RANGE);
                    var lastCell = path.length > 0 ? path[path.length - 1] : unit;
                    unit.nextAttack = { damage: unit.DAMAGE, target: c, trigger: lastCell };
                    break;
                }
            }
            var loop = function (arr, j) {
                if (j >= arr.length) {
                    // var sprite = getFromMap(spriteMap, unit);
                    // var anim = sprite.play("idle");
                    // console.log(anim);
                    // anim.complete();
                    return callback(unit);
                }
                if (unit.nextAttack && Timeline.comparePoints(unit.nextAttack.trigger, arr[j])) {
                    console.log("Attacking", unit.nextAttack);
                    unit.nextAttack = null;
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
            drawFogOfWar();
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