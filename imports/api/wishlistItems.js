import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const WishlistItems = new Mongo.Collection('wishlistItems');

if (Meteor.isServer) {
  Meteor.publish('wishlistItems', function publishWishlistItems() {
    return WishlistItems.find({}, { sort: { createdAt: -1 } });
  });
}

if (Meteor.isServer) {
  Meteor.methods({
    async 'wishlistItems.insert'(doc) {
      check(doc, {
        name: String,
        notes: String,
      });
  
      await WishlistItems.insertAsync({
        ...doc,
        createdAt: new Date(),
      });
    },
  
    async 'wishlistItems.update'(itemId, doc) {
      check(itemId, String);
      check(doc, {
        name: String,
        notes: String,
      });
  
      await WishlistItems.updateAsync(itemId, {
        $set: {
          ...doc,
          updatedAt: new Date(),
        },
      });
    },
  
    async 'wishlistItems.remove'(itemId) {
      check(itemId, String);
      await WishlistItems.removeAsync(itemId);
    },
  });
}

