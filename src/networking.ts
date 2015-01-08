/// <reference path="references.ts" />
module Timeline {
  export module Network {
    var firebase = new Firebase("https://timelinegame.firebaseio.com");

    var yourID = "10";
    var opponent = "20";
    firebase.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
      }
    });
    export function saveState(callback) {
      var obj = {};
      obj[hashID(yourID, opponent)] = GameState;
      firebase.push(obj, callback);
    }

    function hashID(id1, id2) {
      return parseInt(id1) < parseInt(id2) ? id1+"-"+id2 : id2+"-"+id1;
    }
  }
}
