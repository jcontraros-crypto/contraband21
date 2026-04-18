import React, { useMemo, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Appointments } from '../api/appointments';
import { GroceryItems } from '../api/groceryItems';
import { Wants } from '../api/wants';

const pages = {
  calendar: 'Calendar',
  groceries: 'Grocery List',
  wants: 'Wants',
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown Date';
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const groupAppointmentsByDay = (appointments) => {
  return appointments.reduce((groups, appointment) => {
    const key = formatDateKey(appointment.startAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(appointment);
    return groups;
  }, {});
};

function PageButton({ currentPage, pageKey, onClick }) {
  return (
    <button
      className={`nav-button ${currentPage === pageKey ? 'active' : ''}`}
      onClick={() => onClick(pageKey)}
      type="button"
    >
      {pages[pageKey]}
    </button>
  );
}

function CalendarPage() {
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [needsBabysitter, setNeedsBabysitter] = useState(false);
  const [needsHomeBy, setNeedsHomeBy] = useState('');
  const [notes, setNotes] = useState('');

  const { appointments, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('appointments');
    return {
      appointments: Appointments.find({}, { sort: { startAt: 1 } }).fetch(),
      isLoading: !handle.ready(),
    };
  });

  const groupedAppointments = useMemo(
    () => groupAppointmentsByDay(appointments),
    [appointments]
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    Meteor.call(
      'appointments.insert',
      {
        title: title.trim(),
        startAt,
        endAt,
        needsBabysitter,
        needsHomeBy: needsHomeBy.trim(),
        notes: notes.trim(),
      },
      (error) => {
        if (error) {
          alert(error.reason || 'Could not save appointment.');
          return;
        }
        setTitle('');
        setStartAt('');
        setEndAt('');
        setNeedsBabysitter(false);
        setNeedsHomeBy('');
        setNotes('');
      }
    );
  };

  const removeAppointment = (appointmentId) => {
    Meteor.call('appointments.remove', appointmentId);
  };

  return (
    <div className="page-grid">
      <section className="card form-card">
        <h2>Add Appointment</h2>
        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            Appointment
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Doctor, dinner, recital, work event..."
              required
            />
          </label>

          <label>
            Start
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
          </label>

          <label>
            End / expected finish
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={needsBabysitter}
              onChange={(e) => setNeedsBabysitter(e.target.checked)}
            />
            Needs babysitter
          </label>

          <label>
            Need me home by
            <input
              type="text"
              value={needsHomeBy}
              onChange={(e) => setNeedsHomeBy(e.target.value)}
              placeholder="Example: 5:30 PM"
            />
          </label>

          <label>
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="4"
              placeholder="Anything important to remember"
            />
          </label>

          <button type="submit" className="primary-button">Save Appointment</button>
        </form>
      </section>

      <section className="card list-card">
        <div className="section-header">
          <h2>Upcoming</h2>
          <span>{appointments.length} total</span>
        </div>

        {isLoading ? <p>Loading appointments...</p> : null}
        {!isLoading && appointments.length === 0 ? (
          <p>No appointments yet.</p>
        ) : null}

        {!isLoading && Object.entries(groupedAppointments).map(([day, items]) => (
          <div key={day} className="day-group">
            <h3>{day}</h3>
            <div className="stack">
              {items.map((appointment) => (
                <div key={appointment._id} className="list-item appointment-item">
                  <div>
                    <strong>{appointment.title}</strong>
                    <div className="muted">Start: {formatDateTime(appointment.startAt)}</div>
                    {appointment.endAt ? <div className="muted">End: {formatDateTime(appointment.endAt)}</div> : null}
                    {appointment.needsBabysitter ? <div className="pill">Babysitter needed</div> : null}
                    {appointment.needsHomeBy ? <div className="muted">Need home by: {appointment.needsHomeBy}</div> : null}
                    {appointment.notes ? <div className="notes">{appointment.notes}</div> : null}
                  </div>
                  <button type="button" className="delete-button" onClick={() => removeAppointment(appointment._id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function SimpleListPage({ title, subtitle, methodName, removeMethodName, collectionName }) {
  const [text, setText] = useState('');

  const { items, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe(collectionName);
    const collection = collectionName === 'groceryItems' ? GroceryItems : Wants;
    return {
      items: collection.find({}, { sort: { createdAt: -1 } }).fetch(),
      isLoading: !handle.ready(),
    };
  });

  const addItem = (event) => {
    event.preventDefault();
    Meteor.call(methodName, text, (error) => {
      if (error) {
        alert(error.reason || 'Could not add item.');
        return;
      }
      setText('');
    });
  };

  const removeItem = (itemId) => {
    Meteor.call(removeMethodName, itemId);
  };

  return (
    <div className="page-grid single-column">
      <section className="card form-card">
        <h2>{title}</h2>
        <p className="muted intro">{subtitle}</p>
        <form onSubmit={addItem} className="inline-form">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Add to ${title.toLowerCase()}`}
            required
          />
          <button type="submit" className="primary-button">Add</button>
        </form>
      </section>

      <section className="card list-card">
        <div className="section-header">
          <h2>{title}</h2>
          <span>{items.length} items</span>
        </div>

        {isLoading ? <p>Loading...</p> : null}
        {!isLoading && items.length === 0 ? <p>Nothing here yet.</p> : null}

        <div className="stack">
          {items.map((item) => (
            <div key={item._id} className="list-item simple-item">
              <span>{item.text}</span>
              <button type="button" className="delete-button" onClick={() => removeItem(item._id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export const App = () => {
  const [page, setPage] = useState('calendar');

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Family Planner</h1>
          <p>Shared calendar, groceries, and future wants.</p>
        </div>
        <nav className="nav-row">
          <PageButton currentPage={page} pageKey="calendar" onClick={setPage} />
          <PageButton currentPage={page} pageKey="groceries" onClick={setPage} />
          <PageButton currentPage={page} pageKey="wants" onClick={setPage} />
        </nav>
      </header>

      <main>
        {page === 'calendar' ? <CalendarPage /> : null}
        {page === 'groceries' ? (
          <SimpleListPage
            title="Grocery List"
            subtitle="Add things either of you need from the store."
            methodName="groceryItems.insert"
            removeMethodName="groceryItems.remove"
            collectionName="groceryItems"
          />
        ) : null}
        {page === 'wants' ? (
          <SimpleListPage
            title="Wants"
            subtitle="Keep track of things you’d both like to buy eventually."
            methodName="wants.insert"
            removeMethodName="wants.remove"
            collectionName="wants"
          />
        ) : null}
      </main>
    </div>
  );
};
