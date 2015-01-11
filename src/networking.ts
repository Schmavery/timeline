/// <reference path="references.ts" />
module Timeline {
  var game = null;
  export module Network {
    var opponentID = "2000";
    var accessToken = "";
    var yourName = "Benjamin San Souci";
    var opponentName = "Benjamin San Souci";

    var firebase = new Firebase("https://timelinegame.firebaseio.com/");

    firebase.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        GameState.myID = authData[authData.provider].id;
        accessToken = authData[authData.provider].accessToken;
        yourName = authData[authData.provider].displayName;

        var yourFirebase = firebase.child(GameState.myID);
        yourFirebase.update({
          connected: true,
          invite: {},
          accepted: {}
        });

        yourFirebase.child("invite").on("value", function(snapshot) {
          var val = snapshot.val();
          if(val) {
            UI.popup(val.name + ": " + val.message, partial(acceptInvitation, val.id, val.name));
          }
        });

        yourFirebase.child("accepted").on("value", function(snapshot) {
          var val = snapshot.val();
          if(val) {
            // If the opponent accepted the game request we set its ID and we
            // start the game
            if(val.accepted) {
              UI.popup(val.name, " accepted your game request");
              opponentID = val.id;
              opponentName = val.name;
              UI.hide();

              // TODO: load game here
              startGame();

              var obj = {};
              obj[opponentID] = opponentName;
              yourFirebase.child("allOpponents").update(obj);
              firebase.child(hashID(GameState.myID, opponentID)).on("value", function(snapshot) {
                if(val.myID !== GameState.myID) {
                  console.log("Your turn");
                } else {
                  console.log("His turn");
                }
              });
            } else {
              UI.popup(val.name, " refused your game request :(");
            }
          }
        });


        // We do the next two requests in parallel but not the one for friends
        // because we want to remove friends in the list against which we're
        // already playing a game
        FB.api('/me/invitable_friends', {
          access_token: accessToken
        }, function(res2) {
          UI.createAppRequestsList(res2.data, sendRequestToApp);
        });

        yourFirebase.child("allOpponents").once("value", function(snapshot) {
          var val = snapshot.val();
          if(val) {
            var arr = [];
            for(var prop in val) {
              if(val.hasOwnProperty(prop)) {
                arr.push({
                  id: prop,
                  name: val[prop]
                });
              }
            }

            UI.createCurrentGames(arr, resumeCurrentGame);
          }

          FB.api('/me/friends', {
            access_token: accessToken
          }, function(res) {
            if(val) {
              res.data = res.data.filter((x) => {
                if(val[x.id]) return false;
                return true;
              });
            }
            UI.createFriendsList(res.data, sendPlayRequest);
          });
        });
      }
    }, {
      scope: "email,user_friends"
    });

    function resumeCurrentGame(id, name) {
      opponentID = id;
      opponentName = name;
      UI.hide();

      // firebase.child(hashID(GameState.myID, opponentID)).once("value", function(snapshot) {
      //   var val = snapshot.val();
      //   console.log(val);
      // });
      // Adding callback for receiving new moves from the opponent
      firebase.child(hashID(GameState.myID, opponentID)).on("value", function(snapshot) {
        var val = snapshot.val();

        // TODO: load game here
        startGame();

        if(val.myID !== GameState.myID) {
          console.log("Your turn");
        } else {
          console.log("His turn");
        }
        console.log("New move from opponent", val);
      });
    }

    function acceptInvitation(id, name, bool) {
      firebase.child(id).child("accepted").update({
        id: GameState.myID,
        name: yourName,
        accepted: bool
      });
      if(bool) {
        opponentID = id;
        opponentName = name;
        UI.hide();

        // The one accepting the request will be player 2 (and therefore will
        // play second)
        GameState.myTeamNumber = 2;

        // TODO: load game here
        startGame();

        var obj = {};
        obj[opponentID] = opponentName;
        firebase.child(GameState.myID).child("allOpponents").update(obj);

        // Adding callback for receiving new moves from the opponent
        firebase.child(hashID(GameState.myID, opponentID)).on("value", function(snapshot) {
          var val = snapshot.val();
          console.log("New move from opponent", val);
          playOpponentTurn(val);
        });
      }
    }

    function playOpponentTurn(state) {
      GameState = state;
      console.log(state);
      // var chars = GameState.currentBoard.allCharacters;
      // var max = chars.length;
      // for (var i = 0; i < max; i++) {
      //   if(!chars[i].isMoving) {
      //     chars[i].isMoving = true;
      //     // Remove the empty callback when figured out the optional type
      //     // in TS
      //     Display.moveUnitAlongPath(chars[i], function(u) {
      //       // reset isMoving so we can select the unit again
      //       u.isMoving = false;
      //       u.nextMovePath = [];
      //     });
      //   }
      // }
      // this.selectedUnit = null;
      // this.moveArea = [];
    }

    function checkURL(callback) {
      var p = document.createElement('a');
      p.href = window.location.href;
      var allGetElements = [];
      if (p.search.length > 0){
        allGetElements = p.search.substring(1).split("&");
      }

      var data = {};
      allGetElements.map(function(val) {
        var tmp = val.split("=");
        data[tmp[0]] = tmp[1];
      });

      // To annoy typescript
      if(data["request_ids"]) {
        FB.api('me/apprequests?fields=id,application,to,from,data,message,action_type,object,created_time&access_token=' + accessToken, function(val) {
          console.log(val.data);
          callback();
          // This will be used to get the profile picture
          // g.opponentID = parseInt(val.data[0].from.id);
          // g.opponentName = val.data[0].from.name;
          // g.concatID = (g.userID < g.opponentID) ? "" + g.userID + g.opponentID : "" + g.opponentID + g.userID;

          // var query = new Parse.Query(g.ParseGameBoard);
          // query.equalTo("concatID", g.concatID);
          // query.find({
          //   success: function(results) {
          //     if(results.length === 0) {
          //       console.log("No board found");
          //       // No data found, so load a new game.
          //       startGame();
          //       return;
          //     }
          //     if(results.length > 1) {
          //       // LOL
          //       console.log("Too many boards found");
          //     }
          //     startGame(results[0], _.partial(clearEvent, val.data[0].id));
          //   },
          //   error: function(error) {
          //     console.log("Error when querying parse");
          //   }
          // });
        });
      }
    }

    function sendPlayRequest(id, name) {
      firebase.child(id).once("value", function(snapshot) {
        var val = snapshot.val();
        if(val.connected) {
          firebase.child(id).child("invite").update({
            message: "Hey do you want to play?",
            name: yourName,
            id: GameState.myID
          });
        } else {
          FB.ui({method: 'apprequests',
            to: id,
            title: 'Timeline',
            message: 'Try Timeline!',
          }, partial(requestCallback, id, name));
        }
      });
      UI.popup("Game request sent to " + name);
    }

    function sendRequestToApp(id, name) {
      FB.ui({method: 'apprequests',
        to: id,
        title: 'Timeline',
        message: 'Try Timeline!',
      }, partial(requestCallback, id, name));
    }

    function requestCallback(id, name) {
      console.log("request successful", id);
      UI.popup("Invitation sent to " + name);
    }

    function startGame() {
      game = new Game(GAME_WIDTH * SCALE, GAME_HEIGHT * SCALE);
      game.play();
    }

    export function saveState(callback) {
      firebase.child(hashID(GameState.myID, opponentID)).update(GameState, callback);
    }

    function hashID(id1, id2) {
      return parseInt(id1) < parseInt(id2) ? id1+"-"+id2 : id2+"-"+id1;
    }
  }
}
