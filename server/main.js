import { Meteor } from 'meteor/meteor';

var Grid = new Mongo.Collection("grid");
var Tiles = new Mongo.Collection("tiles");
 
Meteor.startup(() => {   
    Meteor.publish('grid', function() {
        return Grid.find({});
    });

    Meteor.publish('tiles', function(page = 0) {
        return Tiles.find({}, {skip: page, limit: 20});
    });
});

Meteor.methods({
    'addTile': function(x, y, img) {
        var find = Grid.findOne({x: x, y: y});
        if(find == null)
            Grid.insert({x: x, y: y, img: img});
        else
            Grid.update({_id: find._id}, {$set: {img: img}});
    },
    'addTexture': function(img) {
        Tiles.insert({tile: img});
    }
});
