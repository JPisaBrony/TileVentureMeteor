import { Meteor } from 'meteor/meteor';

var Grid = new Mongo.Collection("grid");
var Tiles = new Mongo.Collection("tiles");
 
Meteor.startup(() => {   
    Meteor.publish('grid', function() {
        return Grid.find({});
    });

    Meteor.publish('tiles', function(page = 0) {
        return Tiles.find({ "_id": { $ne: "id" }}, { skip: page, limit: 20, sort: { id: 1 } });
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
        var tile = Tiles.findOne({tile: img});
        if(tile == null) {
            var doc = {
                id: incrementCounter(Tiles, 'id'),
                tile: img
            }
            Tiles.insert(doc);
            return true;
        } else {
            return false;
        }
    },
    'totalTiles': function() {
        return Tiles.find().count() - 1;
    }
});
