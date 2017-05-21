import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    var Grid = new Mongo.Collection("grid");
    var Tiles = new Mongo.Collection("tiles");
});
