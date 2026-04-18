import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Appointments = new Mongo.Collection('appointments');

if (Meteor.isServer) {
  Meteor.publish('appointments', function publishAppointments() {
    return Appointments.find({}, { sort: { startAt: 1 } });
  });
}

Meteor.methods({
  async 'appointments.insert'(appointment) {
    check(appointment, {
      title: String,
      startAt: String,
      endAt: String,
      needsBabysitter: Boolean,
      needsHomeBy: String,
      notes: String,
    });

    await Appointments.insertAsync({
      ...appointment,
      createdAt: new Date(),
    });
  },
  async 'appointments.remove'(appointmentId) {
    check(appointmentId, String);
    await Appointments.removeAsync(appointmentId);
  },
});
