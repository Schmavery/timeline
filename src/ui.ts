module Timeline {
  export module UI {
    var startGameButton = $("#start-game");
    var playAgainstFriendsButton = $("#play-against-friends");
    var currentGamesList = $("#current-games");
    var requestList = $("#request-list");
    var friendsList = $("#friends-list");
    var popupDiv = $("#popup");
    var menu = $("#menu");

    export function createFriendsList(friends, callback) {
      var allRows = friends.map((x) => row(x.name, partial(callback, x.id, x.name)));
      allRows.map((x) => friendsList.append(x));
    }

    export function createAppRequestsList(friendsToRequest, callback) {
      var allRows = friendsToRequest.map((x) => row(x.name, partial(callback, x.id, x.name)));
      allRows.map((x) => requestList.append(x));
    }

    export function hide() {
      menu.hide();
    }

    export function popup(...args : any[]) {
      var txt = "";
      var callback = null;
      args.map((x) => {
        if(typeof x === "function") {
          callback = x;
          return;
        }
        if(typeof x === "object") {
          txt += JSON.stringify(x);
        } else {
          txt += x;
        }

      });
      var div = document.createElement("div");
      div.textContent = txt;
      div.style.opacity = '1.0';
      div.style.border = "1px solid black";
      div.style.padding = "10px";
      div.style.margin = "5px";
      if(callback) {
        var div2 = document.createElement("span");
        div2.textContent = "yes";
        div2.style.cursor = "pointer";
        div2.onclick = () => {
          $(div).remove();
          callback(true);
        };
        div2.onmouseenter = () => div2.style.color = "red";
        div2.onmouseleave = () => div2.style.color = "black";

        var div3 = document.createElement("span");
        div3.textContent = " / ";

        var div4 = document.createElement("span");
        div4.textContent = "no";
        div4.style.cursor = "pointer";
        div4.onclick = () => {
          $(div).remove();
          callback(false);
        };
        div4.onmouseenter = () => div4.style.color = "red";
        div4.onmouseleave = () => div4.style.color = "black";

        var div5 = document.createElement("span");
        div5.style.cssFloat = "right";

        div5.appendChild(div2);
        div5.appendChild(div3);
        div5.appendChild(div4);
        div.appendChild(div5);
      } else {
        $(div).animate({opacity: 0}, 4000, () => $(div).remove());
      }
      popupDiv.append(div);
    }

    function row(txt, onclick) {
      var d = document.createElement("td");
      var parent = document.createElement("tr");
      d.onclick = onclick;
      d.textContent = txt;
      d.style.cursor = "pointer";
      d.style.border = "1px solid black";
      d.style.padding = "10px";
      d.onmouseenter = partial(onMouseEnter, d);
      d.onmouseleave = partial(onMouseLeave, d);
      parent.appendChild(d);
      return parent;
    }
    function onMouseLeave(obj) {
      obj.style.border = "1px solid black";
    }
    function onMouseEnter(obj) {
      obj.style.border = "2px solid blue";
    }

  }
}