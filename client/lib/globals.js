textureSize = 32;
i = 0;
j = 0;
selectedImage = new Image(textureSize, textureSize);
canvas = document.createElement('canvas');
canvas.width = textureSize;
canvas.height = textureSize;
selCtx = canvas.getContext('2d');
Grid = new Mongo.Collection("grid");
Tiles = new Mongo.Collection("tiles");
lastSelTex = {x: -1, y: -1};
lastTextureSel = null;
Meteor.subscribe('grid');
Meteor.subscribe('tiles');
numberOfTextures = 0;
totalTiles = 0;
Meteor.call("totalTiles", function(err, data) {
    totalTiles = data;
});
