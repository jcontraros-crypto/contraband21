import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Appointments = new Mongo.Collection('appointments');

if (Meteor.isServer) {
  Meteor.publish('appointments', function publishAppointments() {
    return Appointments.find({}, { sort: { date: 1, startTime: 1, createdAt: 1 } });
  });
}

Meteor.methods({
  async 'appointments.insert'(doc) {
    check(doc, {
      title: String,
      date: String,
      startTime: String,
      endTime: String,
      needsBabysitter: Boolean,
      needsHomeBy: String,
      notes: String,
    });

    await Appointments.insertAsync({
      ...doc,
      createdAt: new Date(),
    });
  },

  async 'appointments.update'(appointmentId, doc) {
    check(appointmentId, String);
    check(doc, {
      title: String,
      date: String,
      startTime: String,
      endTime: String,
      needsBabysitter: Boolean,
      needsHomeBy: String,
      notes: String,
    });

    await Appointments.updateAsync(appointmentId, {
      $set: {
        ...doc,
        updatedAt: new Date(),
      },
    });
  },

  async 'appointments.remove'(appointmentId) {
    check(appointmentId, String);
    await Appointments.removeAsync(appointmentId);
  },
});
