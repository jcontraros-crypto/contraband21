import React, { useMemo, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import {
  Appointments,
  GroceryItems,
  WishlistItems,
} from '/imports/api/collections';

const tabs = ['Calendar', 'Grocery List', 'Wishlist'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatMonthTitle = (date) =>
  date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const formatDateLabel = (dateString) => {
  if (!dateString) return 'No date selected';
  const date = new Date(`${dateString}T00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const appointmentsForDate = (appointments, dateString) =>
  appointments
    .filter((appt) => appt.date === dateString)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

const buildCalendarCells = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells = [];

  for (let i = first.getDay(); i > 0; i -= 1) {
    cells.push(new Date(year, month, 1 - i));
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    const lastCell = cells[cells.length - 1];
    cells.push(new Date(lastCell.getFullYear(), lastCell.getMonth(), lastCell.getDate() + 1));
  }

  return cells;
};

function CalendarPage({ appointments }) {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const todayString = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', date: todayString, time: '', details: '' });

  const cells = useMemo(() => buildCalendarCells(monthDate), [monthDate]);
  const selectedAppointments = appointmentsForDate(appointments, selectedDate);

  const resetForm = (dateString = selectedDate) => {
    setEditingId(null);
    setForm({ title: '', date: dateString, time: '', details: '' });
  };

  const submitAppointment = (e) => {
    e.preventDefault();
    const methodName = editingId ? 'appointments.update' : 'appointments.insert';
    const args = editingId ? [editingId, form] : [form];
    Meteor.call(methodName, ...args, (error) => {
      if (error) {
        alert(error.reason || 'Could not save appointment.');
        return;
      }
      setSelectedDate(form.date);
      resetForm(form.date);
    });
  };

  const startEdit = (appt) => {
    setEditingId(appt._id);
    setForm({
      title: appt.title || '',
      date: appt.date || selectedDate,
      time: appt.time || '',
      details: appt.details || '',
    });
  };

  const removeAppointment = (id) => {
    Meteor.call('appointments.remove', id);
    if (editingId === id) resetForm();
  };

  const moveMonth = (direction) => {
    const next = new Date(monthDate.getFullYear(), monthDate.getMonth() + direction, 1);
    setMonthDate(next);
  };

  return (
    <div className="grid calendar-layout">
      <section className="card">
        <div className="calendar-topbar">
          <div>
            <h2>Calendar</h2>
            <div className="section-intro">Add appointments so you both know what is coming up.</div>
          </div>
          <div className="month-controls">
            <button onClick={() => moveMonth(-1)}>&larr;</button>
            <strong>{formatMonthTitle(monthDate)}</strong>
            <button onClick={() => moveMonth(1)}>&rarr;</button>
          </div>
        </div>

        <div className="calendar-grid">
          {dayNames.map((day) => (
            <div key={day} className="day-name">{day}</div>
          ))}

          {cells.map((date) => {
            const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 10);
            const dayAppointments = appointmentsForDate(appointments, dateString);
            const isOutside = date.getMonth() !== monthDate.getMonth();
            const isSelected = dateString === selectedDate;

            return (
              <button
                type="button"
                key={dateString}
                className={`day-cell ${isOutside ? 'outside' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDate(dateString);
                  setForm((prev) => ({ ...prev, date: dateString }));
                }}
              >
                <div className="day-number">{date.getDate()}</div>
                <div className="day-badges">
                  {dayAppointments.slice(0, 3).map((appt) => (
                    <div className="badge" key={appt._id}>
                      {appt.time ? `${appt.time} ` : ''}{appt.title}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="badge">+{dayAppointments.length - 3} more</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2>{editingId ? 'Edit Appointment' : 'Add Appointment'}</h2>
        <div className="section-intro">Selected day: {formatDateLabel(form.date || selectedDate)}</div>

        <form className="form-grid" onSubmit={submitAppointment}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Pediatrician, date night, work event..."
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>

          <label>
            Time
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </label>

          <label>
            Notes
            <textarea
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="Anything you want the other person to know."
            />
          </label>

          <div className="form-actions">
            <button className="primary-btn" type="submit">
              {editingId ? 'Save Changes' : 'Add Appointment'}
            </button>
            <button className="secondary-btn" type="button" onClick={() => resetForm(selectedDate)}>
              Clear
            </button>
          </div>
        </form>

        <h3 style={{ marginTop: 22 }}>Appointments for {formatDateLabel(selectedDate)}</h3>
        {selectedAppointments.length === 0 ? (
          <div className="empty">No appointments on this date yet.</div>
        ) : (
          <div className="item-list">
            {selectedAppointments.map((appt) => (
              <div className="appt-row" key={appt._id}>
                <div className="appt-main">
                  <strong>{appt.title}</strong>
                  <div className="appt-meta">{appt.time || 'No time set'}</div>
                  {appt.details ? <div className="appt-meta" style={{ marginTop: 6 }}>{appt.details}</div> : null}
                </div>
                <div className="row-actions">
                  <button className="secondary-btn" type="button" onClick={() => startEdit(appt)}>Edit</button>
                  <button className="danger-btn" type="button" onClick={() => removeAppointment(appt._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SimpleListPage({ title, description, items, methodPrefix }) {
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const addItem = (e) => {
    e.preventDefault();
    Meteor.call(`${methodPrefix}.insert`, input, (error) => {
      if (error) {
        alert(error.reason || 'Could not save item.');
        return;
      }
      setInput('');
    });
  };

  const saveEdit = (id) => {
    Meteor.call(`${methodPrefix}.update`, id, editingText, (error) => {
      if (error) {
        alert(error.reason || 'Could not update item.');
        return;
      }
      setEditingId(null);
      setEditingText('');
    });
  };

  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="section-intro">{description}</div>

      <form className="item-form" onSubmit={addItem}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Add to ${title.toLowerCase()}...`}
        />
        <button className="primary-btn" type="submit">Add</button>
      </form>

      {items.length === 0 ? (
        <div className="empty">Nothing here yet.</div>
      ) : (
        <div className="item-list">
          {items.map((item) => (
            <div className="item-row" key={item._id}>
              <div className="item-row-main">
                {editingId === item._id ? (
                  <>
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                    <div className="small-note" style={{ marginTop: 8 }}>Press save to update this item.</div>
                  </>
                ) : (
                  <strong>{item.text}</strong>
                )}
              </div>
              <div className="row-actions">
                {editingId === item._id ? (
                  <>
                    <button className="primary-btn" type="button" onClick={() => saveEdit(item._id)}>Save</button>
                    <button className="secondary-btn" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => {
                      setEditingId(item._id);
                      setEditingText(item.text);
                    }}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="danger-btn"
                  type="button"
                  onClick={() => Meteor.call(`${methodPrefix}.remove`, item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState('Calendar');

  const { isLoading, appointments, groceryItems, wishlistItems } = useTracker(() => {
    const appointmentsSub = Meteor.subscribe('appointments');
    const grocerySub = Meteor.subscribe('groceryItems');
    const wishlistSub = Meteor.subscribe('wishlistItems');

    return {
      isLoading: !appointmentsSub.ready() || !grocerySub.ready() || !wishlistSub.ready(),
      appointments: Appointments.find({}, { sort: { startDate: 1, createdAt: 1 } }).fetch(),
      groceryItems: GroceryItems.find({}, { sort: { createdAt: -1 } }).fetch(),
      wishlistItems: WishlistItems.find({}, { sort: { createdAt: -1 } }).fetch(),
    };
  });

  return (
    <div className="app-shell">
      <header className="header">
        <div className="title-wrap">
          <h1>Family Planner</h1>
          <p>Shared calendar, grocery list, and wishlist for your household.</p>
        </div>
        <nav className="nav">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {isLoading ? (
        <section className="card">Loading...</section>
      ) : (
        <>
          {activeTab === 'Calendar' && <CalendarPage appointments={appointments} />}
          {activeTab === 'Grocery List' && (
            <SimpleListPage
              title="Grocery List"
              description="Add, edit, or remove grocery items as needed."
              items={groceryItems}
              methodPrefix="grocery"
            />
          )}
          {activeTab === 'Wishlist' && (
            <SimpleListPage
              title="Wishlist"
              description="Keep track of things you both want to buy eventually."
              items={wishlistItems}
              methodPrefix="wishlist"
            />
          )}
        </>
      )}
    </div>
  );
}
