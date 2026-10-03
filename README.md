# Cabbage Fitness

Eat, Train, Recover.

A responsive fitness tracker built with React, JavaScript, Tailwind CSS, and a Node/Express API.

## Run locally

Install Node.js 20 or newer, then run:

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. The Express API runs on port 3001 and workout data is saved in `server/data.json`.

To try it on an Android phone or iPhone while developing, connect the phone and computer to the same Wi-Fi and open `http://<computer-lan-ip>:5173` on the phone. Allow the development server through the computer's firewall if prompted.

## What's included

- Log running, cycling, walking, strength, yoga, or another workout by date, duration, and effort.
- Review estimated calories, active time, sessions, weekly progress, and recent workouts.
- Set body weight and a weekly workout goal in settings.
- Remove an entry from recent activity.

Calorie estimates use standard MET values adjusted for duration, body weight, and selected effort. They are approximate and not a medical measurement. Workout history is stored in the local server's JSON file; settings are stored in the browser on that device.