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
        Meteor.call("addTexture", tile, function(err, resp) {
            if(resp == false)
                toastr.error("Texture exists.");
            else
                Modal.hide("createTextureModal");
        });
    }
});
