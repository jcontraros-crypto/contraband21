import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Appointments = new Mongo.Collection('appointments');
export const GroceryItems = new Mongo.Collection('groceryItems');
export const WishlistItems = new Mongo.Collection('wishlistItems');

const ensureText = (value, fieldName) => {
  check(value, String);
  if (!value.trim()) {
    throw new Meteor.Error('validation-error', `${fieldName} is required.`);
  }
};

if (Meteor.isServer) {
  Meteor.publish('appointments', function publishAppointments() {
    return Appointments.find({}, { sort: { startDate: 1, createdAt: 1 } });
  });

  Meteor.publish('groceryItems', function publishGroceryItems() {
    return GroceryItems.find({}, { sort: { createdAt: -1 } });
  });

  Meteor.publish('wishlistItems', function publishWishlistItems() {
    return WishlistItems.find({}, { sort: { createdAt: -1 } });
  });
}

Meteor.methods({
  'appointments.insert'(payload) {
    check(payload, {
      title: String,
      date: String,
      time: String,
      details: String,
    });

    ensureText(payload.title, 'Title');
    ensureText(payload.date, 'Date');

    Appointments.insert({
      title: payload.title.trim(),
      date: payload.date,
      time: payload.time.trim(),
      details: payload.details.trim(),
      startDate: `${payload.date}T${payload.time || '00:00'}`,
      createdAt: new Date(),
    });
  },

  'appointments.update'(appointmentId, payload) {
    check(appointmentId, String);
    check(payload, {
      title: String,
      date: String,
      time: String,
      details: String,
    });

    ensureText(payload.title, 'Title');
    ensureText(payload.date, 'Date');

    Appointments.update(appointmentId, {
      $set: {
        title: payload.title.trim(),
        date: payload.date,
        time: payload.time.trim(),
        details: payload.details.trim(),
        startDate: `${payload.date}T${payload.time || '00:00'}`,
      },
    });
  },

  'appointments.remove'(appointmentId) {
    check(appointmentId, String);
    Appointments.remove(appointmentId);
  },

  'grocery.insert'(text) {
    ensureText(text, 'Item');
    GroceryItems.insert({
      text: text.trim(),
      createdAt: new Date(),
    });
  },

  'grocery.update'(itemId, text) {
    check(itemId, String);
    ensureText(text, 'Item');
    GroceryItems.update(itemId, {
      $set: { text: text.trim() },
    });
  },

  'grocery.remove'(itemId) {
    check(itemId, String);
    GroceryItems.remove(itemId);
  },

  'wishlist.insert'(text) {
    ensureText(text, 'Item');
    WishlistItems.insert({
      text: text.trim(),
      createdAt: new Date(),
    });
  },

  'wishlist.update'(itemId, text) {
    check(itemId, String);
    ensureText(text, 'Item');
    WishlistItems.update(itemId, {
      $set: { text: text.trim() },
    });
  },

  'wishlist.remove'(itemId) {
    check(itemId, String);
    WishlistItems.remove(itemId);
  },
});
