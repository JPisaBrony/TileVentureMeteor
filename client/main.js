import { Template } from 'meteor/templating';
import './main.html';

var selectedImage = new Image(16, 16);
var canvas = document.createElement('canvas');
canvas.width = 16;
canvas.height = 16;
var canCtx = canvas.getContext('2d');
canCtx.rect(0, 0, 16, 16);
canCtx.fileSytle = "#FF0000";
canCtx.fill();
selectedImage.src = canvas.toDataURL();

Template.main.rendered = function() {
    var textureSize = 16, i, j;
    var c = document.getElementById("mainCanvas");
    var w = window.innerWidth;
    var h = window.innerHeight;
    var grid = [];
    var lastSel = {x: -1, y: -1};
    c.width = w;
    c.height = h;
    var ctx = c.getContext("2d");
    
    var img = new Image();
    img.src = "sky-01.png";
    var img2 = new Image();
    img2.src = "stone-01.png";

    for(i = 0; i < w+textureSize; i += textureSize) {
        grid[i/textureSize] = [];
        for(j = 0; j < h+textureSize; j += textureSize) {
            grid[Math.floor(i/textureSize)][Math.floor(j/textureSize)] = img;
        }
    }

    function redrawSection(x, y, w, h, lx, ly) {
        for(i = 0; i < w; i++) {
            for(j = 0; j < h; j++) {
                ctx.drawImage(grid[x+i][y+j], lx+i, ly+j); 
            }
        }
    }

    img.onload = function() {
    img2.onload = function() {
    for(i = 0; i < w; i += textureSize) {
        for(j = 0; j < h; j += textureSize) {
            ctx.drawImage(grid[Math.floor(i/textureSize)][Math.floor(j/textureSize)], i, j);
        }
    }
    
    $(document).mousemove(function(e) {
        var x = Math.floor(e.pageX / textureSize) * textureSize;
        var y = Math.floor(e.pageY / textureSize) * textureSize;
        if(lastSel.x != x || lastSel.y != y) {
            //ctx.clearRect(lastSel.x, lastSel.y, textureSize, textureSize);
            if(lastSel.x != -1 && lastSel.y != -1)
                ctx.drawImage(grid[Math.floor(lastSel.x/textureSize)][Math.floor(lastSel.y/textureSize)], lastSel.x, lastSel.y);
                //redrawSection(Math.floor(lastSel.x/textureSize) - 2, Math.floor(lastSel.y/textureSize) - 2, 3, 3, lastSel.x - 1, lastSel.y - 1);
            ctx.beginPath();
            ctx.rect(x + 1, y + 1, textureSize - 2, textureSize - 2);
            ctx.closePath();
            ctx.stroke();
            lastSel.x = x;
            lastSel.y = y;
        }
    });

    $(document).on("click", function(e) {
        var x = Math.floor(e.pageX / textureSize);
        var y = Math.floor(e.pageY / textureSize);
        grid[x][y] = selectedImage;
        redrawSection(x, y, 1, 1, x * textureSize, y * textureSize);
        ctx.beginPath();
        ctx.rect((x * textureSize) + 1, (y * textureSize) + 1, textureSize - 2, textureSize - 2);
        ctx.closePath();
        ctx.stroke();
    });
    }
    }
}

Template.main.helpers({
    colorlist: function() {
        return Session.get("color-list");
    }
});

Template.main.events({
    'click #add': function() {
        var c = $("#color").val();
        var colors = Session.get("color-list");
        if(colors != null) {
            colors.push({color: c});
            Session.set("color-list", colors);
        } else {
            Session.set("color-list", [{color: c}]);
        }
    },
    'click li': function() {
        selectedImage.src = this.color;
        //console.log(this.color);
    }
});
