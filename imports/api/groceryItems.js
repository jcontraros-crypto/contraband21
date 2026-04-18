import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const GroceryItems = new Mongo.Collection('groceryItems');

if (Meteor.isServer) {
  Meteor.publish('groceryItems', function publishGroceryItems() {
    return GroceryItems.find({}, { sort: { createdAt: -1 } });
  });
}

Meteor.methods({
  async 'groceryItems.insert'(text) {
    check(text, String);

    const trimmed = text.trim();
    if (!trimmed) {
      throw new Meteor.Error('invalid-item', 'Item cannot be empty.');
    }

    await GroceryItems.insertAsync({
      text: trimmed,
      createdAt: new Date(),
    });
  },
  async 'groceryItems.remove'(itemId) {
    check(itemId, String);
    await GroceryItems.removeAsync(itemId);
  },
});
