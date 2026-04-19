import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const GroceryItems = new Mongo.Collection('groceryItems');

if (Meteor.isServer) {
  Meteor.publish('groceryItems', function publishGroceryItems() {
    return GroceryItems.find({}, { sort: { createdAt: -1 } });
  });
}

if (Meteor.isServer) {
  Meteor.methods({
    async 'groceryItems.insert'(doc) {
      check(doc, {
        name: String,
        notes: String,
      });
  
      await GroceryItems.insertAsync({
        ...doc,
        createdAt: new Date(),
      });
    },
  
    async 'groceryItems.update'(itemId, doc) {
      check(itemId, String);
      check(doc, {
        name: String,
        notes: String,
      });
  
      await GroceryItems.updateAsync(itemId, {
        $set: {
          ...doc,
          updatedAt: new Date(),
        },
      });
    },
  
    async 'groceryItems.remove'(itemId) {
      check(itemId, String);
      await GroceryItems.removeAsync(itemId);
    },
  });
}

