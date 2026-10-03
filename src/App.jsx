import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  Bike,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  Footprints,
  LayoutDashboard,
  Menu,
  Plus,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  Weight,
  X,
  Zap,
} from 'lucide-react'

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const activityOptions = ['Running', 'Cycling', 'Walking', 'Strength', 'Yoga', 'Other']
const metValues = { Running: 9.8, Cycling: 7.5, Walking: 3.8, Strength: 5, Yoga: 2.8, Other: 4 }
const intensityFactors = { Easy: 0.8, Moderate: 1, Hard: 1.2 }
const activityIcons = { Running: Footprints, Cycling: Bike, Walking: Footprints, Strength: Weight, Yoga: Activity, Other: Activity }
const activityColors = { Running: 'coral', Cycling: 'blue', Walking: 'green', Strength: 'gold', Yoga: 'plum', Other: 'green' }

function dateKey(date) {
  const value = new Date(date)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function getWeekDates(reference = new Date()) {
  const monday = new Date(reference)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return weekdays.map((_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date
  })
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return hours ? `${hours}h ${remainder ? `${remainder}m` : ''}`.trim() : `${remainder} min`
}

function formatCaloriesTick(value) {
  return value >= 1000 ? `${Number((value / 1000).toFixed(1))}k` : String(value)
}

function App() {
  const [workouts, setWorkouts] = useState([])
  const [weight, setWeight] = useState(() => Number(localStorage.getItem('stride-weight')) || 70)
  const [goal, setGoal] = useState(() => Number(localStorage.getItem('stride-goal')) || 5)
  const [modalOpen, setModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    fetch('/api/workouts')
      .then((response) => {
        if (!response.ok) throw new Error('Could not connect to your tracker.')
        return response.json()
      })
      .then(setWorkouts)
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    localStorage.setItem('stride-weight', String(weight))
  }, [weight])

  useEffect(() => {
    localStorage.setItem('stride-goal', String(goal))
  }, [goal])

  const referenceDate = new Date()
  referenceDate.setDate(referenceDate.getDate() + weekOffset * 7)
  const weekDates = getWeekDates(referenceDate)
  const weekStart = weekDates[0]
  const weekEnd = weekDates[6]
  const thisWeek = workouts.filter((workout) => {
    const date = new Date(`${workout.date}T00:00:00`)
    return date >= weekStart && date <= weekEnd
  })
  const weekCalories = thisWeek.reduce((sum, workout) => sum + workout.calories, 0)
  const weekMinutes = thisWeek.reduce((sum, workout) => sum + workout.duration, 0)
  const totalSessions = thisWeek.length
  const daysActive = new Set(thisWeek.map((workout) => workout.date)).size
  const chartValues = weekDates.map((date) => thisWeek.filter((workout) => workout.date === dateKey(date)).reduce((sum, workout) => sum + workout.calories, 0))
  const maxCalories = Math.max(500, Math.ceil(Math.max(0, ...chartValues) / 500) * 500)
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  async function addWorkout(details) {
    const response = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...details, weight }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Could not save workout.')
    setWorkouts((current) => [result, ...current])
    setModalOpen(false)
  }

  async function deleteWorkout(id) {
    const response = await fetch(`/api/workouts/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      setError('Could not remove that workout. Try again.')
      return
    }
    setWorkouts((current) => current.filter((workout) => workout.id !== id))
  }

  const latestWorkouts = [...workouts].sort((first, second) => new Date(`${second.date}T00:00:00`) - new Date(`${first.date}T00:00:00`)).slice(0, 5)

  return (
    <div className="app-shell min-h-screen">
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#overview" aria-label="Cabbage Fitness home">
          <span className="brand-mark">
            <svg className="cabbage-glyph" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 27c-2 0-3.5-1.3-4.3-2.8-1.6.8-3.8.3-4.6-1.4-1.8.2-3.4-1.2-3.4-3 0-1.2.6-2.2 1.6-2.8-.9-1.6-.5-3.8 1.3-4.6-.4-1.7.8-3.6 2.5-4 .2-2.1 2.4-3.4 4.3-2.5.7-1.2 2-1.9 3.4-1.9s2.7.7 3.4 1.9c1.9-.9 4.1.4 4.3 2.5 1.7.4 2.9 2.3 2.5 4 1.8.8 2.2 3 1.3 4.6 1 .6 1.6 1.6 1.6 2.8 0 1.8-1.6 3.2-3.4 3-.8 1.7-3 2.2-4.6 1.4C19.5 25.7 18 27 16 27Z" fill="#e5f4bd" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M16 26c-.8-4.4-1.1-8.2 0-13M10 8c1.2 3.1 3.2 5.1 6 5.8 2.8-.7 4.8-2.7 6-5.8M6 16c3.9-.6 7 .6 10 3.8 3-3.2 6.1-4.4 10-3.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="brand-copy"><span>cabbage<span className="brand-period">.</span></span><small>FITNESS</small></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a href="#overview" className="nav-item active" onClick={() => setMobileMenuOpen(false)}><LayoutDashboard size={18} /> Overview</a>
          <a href="#activity" className="nav-item" onClick={() => setMobileMenuOpen(false)}><Activity size={18} /> Activity log</a>
          <a href="#progress" className="nav-item" onClick={() => setMobileMenuOpen(false)}><TrendingUp size={18} /> Progress</a>
        </nav>
        <div className="side-note">
          <span className="note-icon"><Sparkles size={17} /></span>
          <p>Little by little,<br />a little becomes a lot.</p>
          <span className="note-credit">— Tanzanian proverb</span>
          <div className="note-stripe" />
        </div>
        <button className="profile-button" onClick={() => setSettingsOpen(true)}>
          <span className="avatar">S</span>
          <span className="profile-copy"><strong>Your profile</strong><small>Personal settings</small></span>
          <Settings2 size={17} className="profile-settings" />
        </button>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="breadcrumb">Your space <ChevronRight size={14} /> <strong>Overview</strong></div>
          <div className="topbar-actions">
            <span className="today-chip"><span /> {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <button className="button button-dark top-add" onClick={() => setModalOpen(true)}><Plus size={17} /> Log a workout</button>
          </div>
        </header>

        <section className="welcome-row">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" /> YOUR DAILY CHECK-IN</div>
            <h1>Make today <span>count.</span></h1>
            <p className="welcome-copy">A little movement goes a long way. Here's how you're doing.</p>
          </div>
          <div className="week-control" aria-label="Choose week">
            <button className="icon-button" aria-label="Previous week" onClick={() => setWeekOffset((offset) => offset - 1)}><ChevronLeft size={18} /></button>
            <span>{weekLabel}</span>
            <button className="icon-button" aria-label="Next week" onClick={() => setWeekOffset((offset) => Math.min(0, offset + 1))} disabled={weekOffset === 0}><ChevronRight size={18} /></button>
          </div>
        </section>

        {error && <div className="error-banner" role="alert">{error} <button onClick={() => setError('')} aria-label="Dismiss"><X size={16} /></button></div>}

        <section className="stat-grid" aria-label="Weekly summary">
          <article className="stat-card calorie-card">
            <div className="stat-topline"><span className="stat-icon fire-icon"><Flame size={18} /></span><span className="stat-caption">THIS WEEK</span><span className="stat-change"><ArrowUpRight size={14} /> WEEKLY</span></div>
            <div className="stat-value">{weekCalories.toLocaleString()} <span>kcal</span></div>
            <div className="stat-bottom"><span>Estimated energy burned</span><span className="stat-spark">↗</span></div>
          </article>
          <article className="stat-card">
            <div className="stat-topline"><span className="stat-icon time-icon"><Clock3 size={18} /></span><span className="stat-caption">TIME MOVING</span></div>
            <div className="stat-value">{weekMinutes}<span> min</span></div>
            <div className="stat-bottom"><span>{formatDuration(weekMinutes)} total this week</span><span className="stat-spark muted">◷</span></div>
          </article>
          <article className="stat-card">
            <div className="stat-topline"><span className="stat-icon session-icon"><Zap size={18} /></span><span className="stat-caption">SESSIONS</span></div>
            <div className="stat-value">{totalSessions}<span> workouts</span></div>
            <div className="stat-bottom"><span>{daysActive} {daysActive === 1 ? 'day' : 'days'} with movement</span><span className="stat-spark muted">✳</span></div>
          </article>
        </section>

        <section className="content-grid" id="progress">
          <article className="panel chart-panel">
            <div className="panel-heading">
              <div><div className="eyebrow small-eyebrow">YOUR WEEK, IN MOTION</div><h2>Activity overview</h2></div>
              <button className="period-button" onClick={() => setWeekOffset(0)}><CalendarDays size={15} /> This week <ChevronDown size={14} /></button>
            </div>
            <div className="chart-summary"><strong>{weekCalories.toLocaleString()} <span>kcal</span></strong><span className="chart-summary-note">Estimated calories <span className="chart-dot" /></span></div>
            <div className="chart-area" role="img" aria-label={`Weekly estimated calorie chart, ${weekCalories} calories this week`}>
              <div className="chart-y-labels"><span>{formatCaloriesTick(maxCalories)}</span><span>{formatCaloriesTick(maxCalories / 2)}</span><span>0</span></div>
              <div className="chart-plot">
                {[0, 1, 2].map((line) => <div className="chart-grid-line" key={line} style={{ bottom: `${line * 50}%` }} />)}
                <div className="chart-bars">
                  {weekDates.map((date, index) => {
                    const isToday = dateKey(date) === dateKey(new Date())
                    const height = chartValues[index] ? Math.max(5, (chartValues[index] / maxCalories) * 100) : 2
                    return <div className={`bar-column ${isToday ? 'bar-today' : ''}`} key={date.toISOString()}>
                      <div className="bar-value">{chartValues[index] ? chartValues[index] : ''}</div>
                      <div className="bar-track"><div className={`bar-fill ${chartValues[index] ? 'bar-filled' : ''}`} style={{ height: `${height}%` }} /></div>
                      <span className="bar-label">{weekdays[index]}{isToday && <i />}</span>
                    </div>
                  })}
                </div>
              </div>
            </div>
            <div className="chart-footer"><span><span className="legend-dot" /> Daily calories</span><span>Estimates are directional, not a medical measurement.</span></div>
          </article>

          <aside className="goal-panel">
            <div className="goal-orbit orbit-one" /><div className="goal-orbit orbit-two" />
            <div className="goal-header"><span className="goal-icon"><Target size={18} /></span><span>WEEKLY GOAL</span><button className="goal-edit" onClick={() => setSettingsOpen(true)} aria-label="Edit weekly goal"><Settings2 size={16} /></button></div>
            <div className="goal-number">{totalSessions}<span> / {goal}</span></div>
            <div className="goal-caption">workouts completed</div>
            <div className="goal-progress"><span style={{ width: `${Math.min(100, (totalSessions / goal) * 100)}%` }} /></div>
            <div className="goal-foot"><span>{Math.max(0, goal - totalSessions)} to go</span><span>{Math.min(100, Math.round((totalSessions / goal) * 100))}%</span></div>
            <div className="goal-message"><Trophy size={15} /> {totalSessions >= goal ? 'Goal reached. Look at you go!' : totalSessions > 0 ? 'You’re building a good rhythm.' : 'Your next workout starts a streak.'}</div>
          </aside>
        </section>

        <section className="activity-panel panel" id="activity">
          <div className="panel-heading activity-heading">
            <div><div className="eyebrow small-eyebrow">SHOWING UP ADDS UP</div><h2>Recent activity</h2></div>
            <button className="button button-outline" onClick={() => setModalOpen(true)}><Plus size={16} /> Add workout</button>
          </div>
          {loading ? <div className="empty-state"><span className="loading-mark"><Activity size={20} /></span><p>Finding your activity…</p></div> : latestWorkouts.length === 0 ? (
            <div className="empty-state"><span className="empty-mark"><Footprints size={20} /></span><p><strong>Your story starts with one workout.</strong><br />Log a session to see your progress take shape.</p><button className="button button-dark" onClick={() => setModalOpen(true)}><Plus size={16} /> Log your first workout</button></div>
          ) : (
            <div className="workout-list">
              {latestWorkouts.map((workout) => {
                const Icon = activityIcons[workout.activity] || Activity
                return <article className="workout-row" key={workout.id}>
                  <span className={`workout-icon ${activityColors[workout.activity] || 'green'}`}><Icon size={19} /></span>
                  <div className="workout-name"><strong>{workout.activity}</strong><span>{new Date(`${workout.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} <i /> {workout.intensity}</span></div>
                  <div className="workout-duration"><Clock3 size={14} /> {formatDuration(workout.duration)}</div>
                  <div className="workout-calories"><Flame size={15} /> {workout.calories} <span>kcal</span></div>
                  <button className="delete-workout" onClick={() => deleteWorkout(workout.id)} aria-label={`Delete ${workout.activity} workout`}><Trash2 size={16} /></button>
                </article>
              })}
            </div>
          )}
        </section>

        <footer className="footer"><span>CABBAGE FITNESS <i>·</i> EAT, TRAIN, RECOVER</span><span>Progress, not perfection.</span></footer>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <a className="mobile-nav-item selected" href="#overview"><LayoutDashboard size={19} /><span>Home</span></a>
        <a className="mobile-nav-item" href="#activity"><Activity size={19} /><span>Activity</span></a>
        <button className="mobile-add" onClick={() => setModalOpen(true)} aria-label="Log a workout"><Plus size={23} /></button>
        <a className="mobile-nav-item" href="#progress"><TrendingUp size={19} /><span>Progress</span></a>
        <button className="mobile-nav-item" onClick={() => setSettingsOpen(true)}><Settings2 size={19} /><span>Settings</span></button>
      </nav>

      {modalOpen && <WorkoutModal weight={weight} onClose={() => setModalOpen(false)} onSave={addWorkout} />}
      {settingsOpen && <SettingsModal weight={weight} goal={goal} onWeightChange={setWeight} onGoalChange={setGoal} onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}

function WorkoutModal({ weight, onClose, onSave }) {
  const [activity, setActivity] = useState('Running')
  const [duration, setDuration] = useState('30')
  const [intensity, setIntensity] = useState('Moderate')
  const [date, setDate] = useState(dateKey(new Date()))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const calories = duration && Number(duration) > 0
    ? Math.round((metValues[activity] * 3.5 * weight / 200) * Number(duration) * intensityFactors[intensity])
    : 0

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({ activity, duration: Number(duration), intensity, date })
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal workout-modal" role="dialog" aria-modal="true" aria-labelledby="workout-title">
      <div className="modal-heading"><div><div className="eyebrow small-eyebrow">A MOMENT FOR YOU</div><h2 id="workout-title">Log a workout</h2></div><button className="icon-button close-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
      <form onSubmit={handleSubmit}>
        <label className="field-label">Activity</label>
        <div className="activity-picker">
          {activityOptions.map((option) => {
            const OptionIcon = activityIcons[option]
            return <button type="button" key={option} className={`activity-option ${activity === option ? 'activity-selected' : ''}`} onClick={() => setActivity(option)}><OptionIcon size={18} /><span>{option}</span></button>
          })}
        </div>
        <div className="form-two-col">
          <label className="field-label">Duration <span className="input-suffix-wrap"><input className="text-input" type="number" min="1" max="600" value={duration} onChange={(event) => setDuration(event.target.value)} required /><span>min</span></span></label>
          <label className="field-label">Date <input className="text-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        </div>
        <label className="field-label">How did it feel?</label>
        <div className="intensity-picker">
          {['Easy', 'Moderate', 'Hard'].map((option) => <button type="button" key={option} onClick={() => setIntensity(option)} className={intensity === option ? 'intensity-selected' : ''}>{option}{intensity === option && <Check size={14} />}</button>)}
        </div>
        <div className="estimate-box"><span className="estimate-icon"><Flame size={17} /></span><div><strong>~{calories.toLocaleString()} kcal</strong><small>Estimated burn · based on {weight} kg body weight</small></div><span className="estimate-tag">ESTIMATE</span></div>
        <p className="estimate-note">Calorie estimates use activity intensity and standard MET values. Actual burn varies by person.</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="modal-actions"><button type="button" className="button button-text" onClick={onClose}>Cancel</button><button className="button button-dark" type="submit" disabled={saving || !duration || Number(duration) < 1}>{saving ? 'Saving…' : 'Save workout'} <ArrowUpRight size={16} /></button></div>
      </form>
    </section>
  </div>
}

function SettingsModal({ weight, goal, onWeightChange, onGoalChange, onClose }) {
  const [weightDraft, setWeightDraft] = useState(String(weight))
  const [goalDraft, setGoalDraft] = useState(String(goal))

  function saveSettings() {
    onWeightChange(Math.max(20, Math.min(350, Number(weightDraft) || weight)))
    onGoalChange(Math.max(1, Math.min(21, Number(goalDraft) || goal)))
    onClose()
  }

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-heading"><div><div className="eyebrow small-eyebrow">TUNED TO YOU</div><h2 id="settings-title">Your settings</h2></div><button className="icon-button close-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
      <p className="settings-intro">Personalize your calorie estimates and weekly target.</p>
      <label className="field-label">Body weight <span className="input-suffix-wrap"><input className="text-input" type="number" min="20" max="350" value={weightDraft} onChange={(event) => setWeightDraft(event.target.value)} /><span>kg</span></span></label>
      <p className="settings-hint">Used only to estimate calories. Stored on this device.</p>
      <label className="field-label goal-field">Weekly workout goal <span className="input-suffix-wrap"><input className="text-input" type="number" min="1" max="21" value={goalDraft} onChange={(event) => setGoalDraft(event.target.value)} /><span>sessions</span></span></label>
      <button className="button button-dark settings-done" onClick={saveSettings}>Done <Check size={16} /></button>
    </section>
  </div>
}

export default App