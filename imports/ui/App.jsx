import React, { useMemo, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Appointments } from '../api/appointments';
import { GroceryItems } from '../api/groceryItems';
import { WishlistItems } from '../api/wishlistItems';

const tabs = ['Calendar', 'Grocery List', 'Wishlist'];

const blankAppointment = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  needsBabysitter: false,
  needsHomeBy: '',
  notes: '',
};

const blankListItem = {
  name: '',
  notes: '',
};

function callMethod(name, ...args) {
  return new Promise((resolve, reject) => {
    Meteor.call(name, ...args, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

function SectionShell({ title, subtitle, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {subtitle ? <p className="meta">{subtitle}</p> : null}
      {children}
    </div>
  );
}

function CalendarPage() {
  const [form, setForm] = useState(blankAppointment);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const { ready, appointments } = useTracker(() => {
    const handle = Meteor.subscribe('appointments');
    return {
      ready: handle.ready(),
      appointments: Appointments.find({}, { sort: { date: 1, startTime: 1, createdAt: 1 } }).fetch(),
    };
  });

  const grouped = useMemo(() => {
    return appointments.reduce((acc, item) => {
      acc[item.date] = acc[item.date] || [];
      acc[item.date].push(item);
      return acc;
    }, {});
  }, [appointments]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.date) {
      setError('Please add at least a title and date.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      needsBabysitter: form.needsBabysitter,
      needsHomeBy: form.needsHomeBy,
      notes: form.notes.trim(),
    };

    try {
      if (editingId) {
        await callMethod('appointments.update', editingId, payload);
      } else {
        await callMethod('appointments.insert', payload);
      }
      setForm(blankAppointment);
      setEditingId(null);
    } catch (err) {
      setError(err.reason || err.message || 'Something went wrong.');
    }
  };

  const editItem = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || '',
      date: item.date || '',
      startTime: item.startTime || '',
      endTime: item.endTime || '',
      needsBabysitter: Boolean(item.needsBabysitter),
      needsHomeBy: item.needsHomeBy || '',
      notes: item.notes || '',
    });
  };

  const removeItem = async (id) => {
    setError('');
    try {
      await callMethod('appointments.remove', id);
      if (editingId === id) {
        setForm(blankAppointment);
        setEditingId(null);
      }
    } catch (err) {
      setError(err.reason || err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="grid two-col">
      <SectionShell title={editingId ? 'Edit appointment' : 'Add appointment'} subtitle="Keep important dates, times, and reminders in one place.">
        <form className="form-grid" onSubmit={submit}>
          <label className="label">
            Title
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <div className="form-grid two">
            <label className="label">
              Date
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
            <label className="label">
              Need to be home by
              <input className="input" type="time" value={form.needsHomeBy} onChange={(e) => setForm({ ...form, needsHomeBy: e.target.value })} />
            </label>
          </div>
          <div className="form-grid two">
            <label className="label">
              Start time
              <input className="input" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </label>
            <label className="label">
              End time
              <input className="input" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </label>
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={form.needsBabysitter} onChange={(e) => setForm({ ...form, needsBabysitter: e.target.checked })} />
            Need a babysitter
          </label>
          <label className="label">
            Notes
            <textarea className="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          {error ? <div className="meta" style={{ color: '#dc2626' }}>{error}</div> : null}
          <div className="actions">
            <button className="btn" type="submit">{editingId ? 'Save changes' : 'Add appointment'}</button>
            {editingId ? (
              <button className="btn secondary" type="button" onClick={() => { setEditingId(null); setForm(blankAppointment); setError(''); }}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </SectionShell>

      <SectionShell title="Upcoming appointments" subtitle={ready ? `${appointments.length} total appointment${appointments.length === 1 ? '' : 's'}` : 'Loading...'}>
        <div className="list">
          {!ready ? <div className="empty">Loading appointments...</div> : null}
          {ready && appointments.length === 0 ? <div className="empty">No appointments yet.</div> : null}
          {Object.keys(grouped).map((date) => (
            <div key={date} className="item">
              <h3 style={{ marginTop: 0 }}>{date}</h3>
              <div className="list">
                {grouped[date].map((item) => (
                  <div key={item._id} className="item">
                    <div className="item-header">
                      <div>
                        <p className="item-title">{item.title}</p>
                        <div className="meta">
                          {item.startTime || item.endTime ? `${item.startTime || '—'} to ${item.endTime || '—'}` : 'No time set'}
                        </div>
                        {item.needsHomeBy ? <div className="meta">Need home by: {item.needsHomeBy}</div> : null}
                        {item.needsBabysitter ? <div className="meta">Babysitter needed</div> : null}
                        {item.notes ? <div className="meta">{item.notes}</div> : null}
                      </div>
                      <div className="actions">
                        <button className="btn secondary" type="button" onClick={() => editItem(item)}>Edit</button>
                        <button className="btn danger" type="button" onClick={() => removeItem(item._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}

function EditableListPage({ title, subtitle, methodBase, collection, subscriptionName }) {
  const [form, setForm] = useState(blankListItem);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const { ready, items } = useTracker(() => {
    const handle = Meteor.subscribe(subscriptionName);
    return {
      ready: handle.ready(),
      items: collection.find({}, { sort: { createdAt: -1 } }).fetch(),
    };
  });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Please enter a name.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      notes: form.notes.trim(),
    };

    try {
      if (editingId) {
        await callMethod(`${methodBase}.update`, editingId, payload);
      } else {
        await callMethod(`${methodBase}.insert`, payload);
      }
      setForm(blankListItem);
      setEditingId(null);
    } catch (err) {
      setError(err.reason || err.message || 'Something went wrong.');
    }
  };

  const removeItem = async (id) => {
    setError('');
    try {
      await callMethod(`${methodBase}.remove`, id);
      if (editingId === id) {
        setEditingId(null);
        setForm(blankListItem);
      }
    } catch (err) {
      setError(err.reason || err.message || 'Something went wrong.');
    }
  };

  const editItem = (item) => {
    setEditingId(item._id);
    setForm({ name: item.name || '', notes: item.notes || '' });
  };

  return (
    <div className="grid two-col">
      <SectionShell title={editingId ? `Edit ${title.slice(0, -1).toLowerCase()}` : `Add to ${title.toLowerCase()}`} subtitle={subtitle}>
        <form className="form-grid" onSubmit={submit}>
          <label className="label">
            Name
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="label">
            Notes
            <textarea className="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          {error ? <div className="meta" style={{ color: '#dc2626' }}>{error}</div> : null}
          <div className="actions">
            <button className="btn" type="submit">{editingId ? 'Save changes' : 'Add item'}</button>
            {editingId ? (
              <button className="btn secondary" type="button" onClick={() => { setEditingId(null); setForm(blankListItem); setError(''); }}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </SectionShell>

      <SectionShell title={title} subtitle={ready ? `${items.length} item${items.length === 1 ? '' : 's'}` : 'Loading...'}>
        <div className="list">
          {!ready ? <div className="empty">Loading...</div> : null}
          {ready && items.length === 0 ? <div className="empty">Nothing here yet.</div> : null}
          {items.map((item) => (
            <div className="item" key={item._id}>
              <div className="item-header">
                <div>
                  <p className="item-title">{item.name}</p>
                  {item.notes ? <div className="meta">{item.notes}</div> : null}
                </div>
                <div className="actions">
                  <button className="btn secondary" type="button" onClick={() => editItem(item)}>Edit</button>
                  <button className="btn danger" type="button" onClick={() => removeItem(item._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState('Calendar');

  return (
    <div className="app-shell">
      <div className="header">
        <h1>Family Planner</h1>
        <p>A simple shared place for appointments, grocery needs, and future buys.</p>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} type="button" onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Calendar' ? <CalendarPage /> : null}
      {activeTab === 'Grocery List' ? (
        <EditableListPage
          title="Grocery List"
          subtitle="Add items you need from the store and update them anytime."
          methodBase="groceryItems"
          collection={GroceryItems}
          subscriptionName="groceryItems"
        />
      ) : null}
      {activeTab === 'Wishlist' ? (
        <EditableListPage
          title="Wishlist"
          subtitle="Keep track of things you both want to buy eventually."
          methodBase="wishlistItems"
          collection={WishlistItems}
          subscriptionName="wishlistItems"
        />
      ) : null}
    </div>
  );
}
