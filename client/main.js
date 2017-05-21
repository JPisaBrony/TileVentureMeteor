import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import './main.html';

// GLOBALS
var textureSize = 32, i, j;
var selectedImage = new Image(textureSize, textureSize);
var canvas = document.createElement('canvas');
canvas.width = textureSize;
canvas.height = textureSize;
var selCtx = canvas.getContext('2d');
var Grid = new Mongo.Collection("grid");
var Tiles = new Mongo.Collection("tiles");
var lastSelTex = {x: -1, y: -1};
var lastTextureSel = null;

function createImageFromColor(color) {
    var img = new Image(textureSize, textureSize);
    selCtx.rect(0, 0, textureSize, textureSize);
    selCtx.fillStyle = color;
    selCtx.fill();
    img.src = canvas.toDataURL();
    return img;
}

function fillRectangleInContext(ctx, x, y, w, h, color) {
    if(color === "#0")
        color = "#000000";
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function drawRectangleBorderInContex(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.stroke();
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
            var find = Grid.findOne({x: x, y: y});
            if(find == null)
                Grid.insert({x: x, y: y, img: selectedImage.src});
            else
                Grid.update({_id: find._id}, {$set: {img: selectedImage.src}});
            grid[x][y] = selectedImage;
            redrawSection(x, y, 1, 1, x * textureSize, y * textureSize);
            drawRectangleBorderInContex(ctx, (x * textureSize) + 1, (y * textureSize) + 1, textureSize - 2, textureSize - 2);
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
    'click li': function(e) {
        selectedImage = createImageFromColor(this.color);
        var list = $(e.target).parent();
        $(".list-group").each(function(i, v) {
            $(v).find("li").each(function(i, el) {
                $(el).removeClass("active");
            });
        });
        $(e.target).addClass("active");
    },
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
    }
});

Template.createTextureModal.rendered = function() {
    var c = document.getElementById("createTileCanvas");
    var ctx = c.getContext("2d");
    var w = 256;
    var h = 256;
    var size = 32;
    c.width = w;
    c.height = h;
    $(c).css("width", w + "px");
    $(c).css("height", h + "px");
    fillRectangleInContext(ctx, 0, 0, w, h, "#FFFFFF");
    $(c).mousemove(function(e) {
        var x = Math.floor((e.pageX - $(c).offset().left) / size) * size;
        var y = Math.floor((e.pageY - $(c).offset().top) / size) * size;
        if(lastSelTex.x != x || lastSelTex.y != y) {
            if(lastSelTex.x != -1 && lastSelTex.y != -1)
                fillRectangleInContext(ctx, lastSelTex.x, lastSelTex.y, size, size, lastSelTex.color);
            drawRectangleBorderInContex(ctx, x + 1, y + 1, size - 2, size - 2);
            lastSelTex.x = x;
            lastSelTex.y = y;
            var data = ctx.getImageData(x, y, 1, 1).data;
            var color = ((data[0] << 16) | (data[1]) << 8 | data[2]).toString(16);
            lastSelTex.color = "#" + color;
        }
    });
    $(c).on("click", function(e) {
        var size = 32;
        lastSelTex = {x: -1, y: -1};
        var x = Math.floor((e.pageX - $(c).offset().left) / size) * size;
        var y = Math.floor((e.pageY - $(c).offset().top) / size) * size;
        var color = $("#createColor").val();
        fillRectangleInContext(ctx, x, y, size, size, color);
        drawRectangleBorderInContex(ctx, x + 1, y + 1, size - 2, size - 2);
    });
}

Template.createTextureModal.events({
    'click #fill': function() {
        lastSelTex = {x: -1, y: -1};
        var c = document.getElementById("createTileCanvas");
        var ctx = c.getContext("2d");
        var w = c.width;
        var h = c.height;
        var color = $("#createColor").val();
        ctx.rect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.fill();
    },
    'click #save': function() {
        var c = document.getElementById("createTileCanvas");
        var ctx = c.getContext("2d");
        for(i = 0; i < 256; i += 32) {
            for(j = 0; j < 256; j += 32) {
                var data = ctx.getImageData(i, j, 1, 1).data;
                var color = ((data[0] << 16) | (data[1]) << 8 | data[2]).toString(16);
                if(color === "0")
                    color = "000000";
                selCtx.fillStyle = "#" + color;
                selCtx.fillRect(i / 8, j / 8, textureSize / 8, textureSize / 8);
            }
        }
        var tile = canvas.toDataURL();
        Tiles.insert({tile: tile});
    }
});

Tiles.find().observeChanges({
    added: function(id, fields) {
        var tile = fields.tile;
        var texGrid = $("#texGrid");
        var lastRow = texGrid.children().last();
        var amount = lastRow.children().length;
        if(amount == 0)
            texGrid.append("<div class='row pad'><div class='col-xs-1'></div><div class='col-xs-2'><img width='32px' height='32px' src=" + tile + "></div></div></div>");

        if(amount < 5) {
            lastRow.append("<div class='col-xs-2'><img width='32px' height='32px' src=" + tile +"></div></div>");
        }
        else {
            lastRow = lastRow.parent();
            lastRow.append("<div class='row pad'><div class='col-xs-1'></div><div class='col-xs-2'><img width='32px' height='32px' src="+ tile + "></div></div></div>");
        }
    },
});
