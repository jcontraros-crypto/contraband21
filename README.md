# Family Planner Meteor App

A simple shared household app with three pages:
- Calendar
- Grocery List
- Wishlist

## Run locally

```bash
meteor npm install
meteor run
```

Then open `http://localhost:3000`.

## Deploy notes

This app uses Meteor's default Mongo collection behavior. In local development, Meteor starts Mongo automatically. In production, make sure `MONGO_URL` is configured.
