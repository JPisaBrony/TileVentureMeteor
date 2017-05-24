import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';

var loadedTextures = [];
var pageLocation = 0;

toastr.options = {
  "positionClass": "toast-top-center",
  "preventDuplicates": true,
  "timeOut": "2000",
}

Template.main.rendered = function() {
    var c = document.getElementById("mainCanvas");
    var w = window.innerWidth;
    var h = window.innerHeight;
    var grid = [];
    var lastSel = {x: -1, y: -1};
    c.width = w;
    c.height = h;
    var ctx = c.getContext("2d");
    
    var img = createImageFromColor("#FFFFFF");

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
    
    $(c).mousemove(function(e) {
        var x = Math.floor(e.pageX / textureSize) * textureSize;
        var y = Math.floor(e.pageY / textureSize) * textureSize;
        if(lastSel.x != x || lastSel.y != y) {
            if(lastSel.x != -1 && lastSel.y != -1)
                ctx.drawImage(grid[Math.floor(lastSel.x/textureSize)][Math.floor(lastSel.y/textureSize)], lastSel.x, lastSel.y);
            drawRectangleBorderInContex(ctx, x + 1, y + 1, textureSize - 2, textureSize - 2);
            lastSel.x = x;
            lastSel.y = y;
        }
    });

    $(c).on("click", function(e) {
        var x = Math.floor(e.pageX / textureSize);
        var y = Math.floor(e.pageY / textureSize);
        if(selectedImage.src != "") {
            Meteor.call('addTile', x, y, selectedImage.src);
            grid[x][y] = selectedImage;
            redrawSection(x, y, 1, 1, x * textureSize, y * textureSize);
            drawRectangleBorderInContex(ctx, (x * textureSize) + 1, (y * textureSize) + 1, textureSize - 2, textureSize - 2);
        } else {
            toastr.error("Select a texture on the left.");
        }
    });
    
    // initial render of all tiles
    img.onload = function() {
        for(i = 0; i < w; i += textureSize) {
            for(j = 0; j < h; j += textureSize) {
                ctx.drawImage(grid[Math.floor(i/textureSize)][Math.floor(j/textureSize)], i, j);
            }
        }
    }

    function newTileAdded(id, fields) {
        if(fields.x != null || fields.y != null) {
            var x = fields.x;
            var y = fields.y;
        } else {
            var item = Grid.findOne({_id: id});
            var x = item.x;
            var y = item.y;
        }
        var img = new Image(textureSize, textureSize);
        img.src = fields.img;
        grid[x][y] = img;
        img.onload = function() {
            ctx.drawImage(grid[x][y], x * textureSize, y * textureSize);
        }
    }

    Grid.find().observeChanges({
        added: newTileAdded,
        changed: newTileAdded
    });
}

Template.main.helpers({
    colorlist: function() {
        return Session.get("color-list");
    }
});

Template.main.events({
    'click #createTexture': function() {
        Modal.show("createTextureModal");
    },
    'click img': function(e) {
        if(lastTextureSel != null)
            lastTextureSel.css("border", "");
        lastTextureSel = $(e.target);
        $(e.target).css("border", "solid");
        var img = new Image(textureSize, textureSize);
        img.src = $(e.target).attr('src');
        selectedImage = img;
    },
    'click #pageFirst': function() {
        var texGrid = $("#texGrid");
        texGrid.empty();
        for(i = 0; i < 20; i++)
            addTexToGrid(loadedTextures[i]);
    },
    'click #pageLeft': function() {
        pageLocation -= 20;
        if(pageLocation < 20)
            pageLocation = 20;
        var texGrid = $("#texGrid");
        texGrid.empty();
        for(i = pageLocation - 20; i < pageLocation; i++)
            addTexToGrid(loadedTextures[i]);
    },
    'click #pageRight': function() {
        if(loadedTextures.length % 20 == 0) {
            pageLocation += 20;
            var texGrid = $("#texGrid");
            texGrid.empty();
            Meteor.subscribe('tiles', pageLocation);
        } else {
            var texGrid = $("#texGrid");
            texGrid.empty();
            for(i = pageLocation; i < loadedTextures.length; i++)
                addTexToGrid(loadedTextures[i]);
        }
    },
    'click #pageLast': function() {
        alert("not functional");
    }
});

function addTexToGrid(fields) {
    var tile = fields.tile;
    var texGrid = $("#texGrid");
    var lastRow = texGrid.children().last();
    var amount = lastRow.children().length;
    var imgHTML = "<img width='32px' height='32px' src=" + tile + "></div>";
    if(amount == 0)
        texGrid.append("<div class='row pad'><div class='col-xs-1'></div><div class='col-xs-2'>" + imgHTML + "</div></div></div>");

    if(amount < 5) {
        lastRow.append("<div class='col-xs-2'>" + imgHTML + "</div></div>");
    }
    else {
        lastRow = lastRow.parent();
        lastRow.append("<div class='row pad'><div class='col-xs-1'></div><div class='col-xs-2'>" + imgHTML + "</div></div></div>");
    }
}

Tiles.find().observeChanges({
    added: function(id, fields) {
        loadedTextures.push(fields);
        addTexToGrid(fields);
    },
});
