import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Wants = new Mongo.Collection('wants');

if (Meteor.isServer) {
  Meteor.publish('wants', function publishWants() {
    return Wants.find({}, { sort: { createdAt: -1 } });
  });
}

Meteor.methods({
  async 'wants.insert'(text) {
    check(text, String);

    const trimmed = text.trim();
    if (!trimmed) {
      throw new Meteor.Error('invalid-item', 'Item cannot be empty.');
    }

    await Wants.insertAsync({
      text: trimmed,
      createdAt: new Date(),
    });
  },
  async 'wants.remove'(itemId) {
    check(itemId, String);
    await Wants.removeAsync(itemId);
  },
});
