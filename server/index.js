import express from 'express'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = process.env.PORT || 3001
const dataPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data.json')

app.use(express.json())

async function readWorkouts() {
  try {
    const data = await readFile(dataPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

async function saveWorkouts(workouts) {
  await writeFile(dataPath, JSON.stringify(workouts, null, 2))
}

app.get('/api/workouts', async (_request, response) => {
  try {
    response.json(await readWorkouts())
  } catch {
    response.status(500).json({ error: 'Could not load workouts.' })
  }
})

app.post('/api/workouts', async (request, response) => {
  const { activity, duration, intensity, weight, date } = request.body
  const minutes = Number(duration)
  const bodyWeight = Number(weight)
  const metValues = { Running: 9.8, Cycling: 7.5, Walking: 3.8, Strength: 5, Yoga: 2.8, Other: 4 }
  const intensityFactor = { Easy: 0.8, Moderate: 1, Hard: 1.2 }

  if (!metValues[activity] || !Number.isFinite(minutes) || minutes < 1 || minutes > 600 || !Number.isFinite(bodyWeight) || bodyWeight < 20 || bodyWeight > 350 || !intensityFactor[intensity] || !date || Number.isNaN(Date.parse(date))) {
    return response.status(400).json({ error: 'Check the workout details and try again.' })
  }

  try {
    const workout = {
      id: randomUUID(),
      activity,
      duration: minutes,
      intensity,
      weight: bodyWeight,
      date,
      calories: Math.round((metValues[activity] * 3.5 * bodyWeight / 200) * minutes * intensityFactor[intensity]),
    }
    const workouts = await readWorkouts()
    workouts.unshift(workout)
    await saveWorkouts(workouts)
    response.status(201).json(workout)
  } catch {
    response.status(500).json({ error: 'Could not save this workout.' })
  }
})

app.delete('/api/workouts/:id', async (request, response) => {
  try {
    const workouts = await readWorkouts()
    const nextWorkouts = workouts.filter((workout) => workout.id !== request.params.id)
    if (nextWorkouts.length === workouts.length) return response.status(404).json({ error: 'Workout not found.' })
    await saveWorkouts(nextWorkouts)
    response.status(204).end()
  } catch {
    response.status(500).json({ error: 'Could not delete this workout.' })
  }
})

app.listen(port, () => {
  console.log(`Cabbage Fitness API listening on http://localhost:${port}`)
})