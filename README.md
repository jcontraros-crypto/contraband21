# Family Planner Meteor App

A simple shared app for two people with:

- Calendar / appointments
- Grocery list
- Wants list

## Features

- No accounts required
- Shared data through Meteor + MongoDB
- Add and delete appointments
- Add and delete grocery items
- Add and delete wants
- Mobile-friendly layout

## Run it

1. Install Meteor if you do not already have it.
2. Open a terminal in this project folder.
3. Run:

```bash
meteor npm install
meteor run
```

The app should open at:

```bash
http://localhost:3000
```

## Use it on both phones/computers

Run Meteor with a host binding, for example:

```bash
meteor run --settings settings.json --port 3000 --mobile-server http://YOUR-COMPUTER-IP:3000
```

For basic home-network testing, even this is often enough:

```bash
meteor run --port 3000
```

Then open the app from another device using your computer's local IP address, such as:

```text
http://192.168.1.25:3000
```

## Notes

- Data is stored in the app's Mongo database.
- There is no login system in this version.
- This is intentionally simple and easy to modify later.


## Deployment note

This package uses Meteor 3-compatible async collection writes on the server (`insertAsync` / `removeAsync`).
