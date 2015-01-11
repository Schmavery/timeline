/// <reference path="references.ts" />
module Timeline {
  var game = null;
  export module Network {
    var yourID = "1000";
    var opponentID = "2000";
    var accessToken = "";
    var yourName = "Benjamin San Souci";

    var firebase = new Firebase("https://timelinegame.firebaseio.com/");

    firebase.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        yourID = authData[authData.provider].id;
        accessToken = authData[authData.provider].accessToken;
        yourName = authData[authData.provider].displayName;

        var yourFirebase = firebase.child(yourID);
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
              UI.hide();
              startGame(GameState);

              firebase.child(hashID(yourID, opponentID)).on("value", function(snapshot) {
                var val = snapshot.val();
                console.log(val);
              });
            } else {
              UI.popup(val.name, " refused your game request :(");
            }
          }
        });

        // Use the access token to consume the Facebook Graph API
        FB.api('/me/friends', {
          access_token: accessToken
        }, function(res) {
          UI.createFriendsList(res.data, sendPlayRequest);

        });

        FB.api('/me/invitable_friends', {
          access_token: accessToken
        }, function(res2) {
          UI.createAppRequestsList(res2.data, sendRequestToApp);
        });
      }
    }, {
      scope: "email,user_friends"
    });

    function acceptInvitation(id, name, bool) {
      firebase.child(id).child("accepted").update({
        id: yourID,
        name: yourName,
        accepted: bool
      });
      if(bool) {
        opponentID = id;
        UI.hide();

        // The one accepting the request will be player 2 (and therefore will
        // play second)
        GameState.myTeamNumber = 2;
        startGame(GameState);
        firebase.child(hashID(yourID, opponentID)).on("value", function(snapshot) {
          var val = snapshot.val();
          console.log(val);
        });
      }
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
        FB.api(yourID + '/apprequests?fields=id,application,to,from,data,message,action_type,object,created_time&access_token=' + accessToken, function(val) {
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
            id: yourID
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

    function startGame(state) {
      game = new Game(GAME_WIDTH * SCALE, GAME_HEIGHT * SCALE);
      game.play(state);
    }

    export function saveState(callback) {
      firebase.child(hashID(yourID, opponentID)).update(GameState, callback);
    }

    function hashID(id1, id2) {
      return parseInt(id1) < parseInt(id2) ? id1+"-"+id2 : id2+"-"+id1;
    }
  }
}
