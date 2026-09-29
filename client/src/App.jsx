import { useEffect, useMemo, useState } from 'react';
import GoalForm from './features/goals/GoalForm';
import { deleteGoal, fetchGoals, saveGoal, updateGoalProgress } from './features/goals/goalApi';
import { FilterBar, Navbar, Statistics } from './features/goals/PlannerComponents';
import GoalList from './features/goals/GoalList';

const currentYear = new Date().getFullYear();

function App() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [filters, setFilters] = useState({ category: '', quarter: '', status: '' });
  const [editingGoal, setEditingGoal] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyGoalId, setBusyGoalId] = useState('');

  async function loadGoals() {
    setLoading(true);
    setLoadError('');
    try {
      setGoals(await fetchGoals());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  const yearGoals = useMemo(
    () => goals.filter((goal) => Number(goal.year) === Number(selectedYear)),
    [goals, selectedYear]
  );
  const visibleGoals = useMemo(
    () => yearGoals.filter((goal) => (
      (!filters.category || goal.category === filters.category) &&
      (!filters.quarter || goal.quarter === filters.quarter) &&
      (!filters.status || goal.status === filters.status)
    )),
    [yearGoals, filters]
  );
  const years = useMemo(() => {
    const values = new Set([currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2]);
    goals.forEach((goal) => values.add(Number(goal.year)));
    values.add(Number(selectedYear));
    return [...values].sort((left, right) => right - left);
  }, [goals, selectedYear]);

  async function handleSave(goalData) {
    setSaving(true);
    setActionError('');
    try {
      await saveGoal(editingGoal?._id, goalData);
      setIsFormOpen(false);
      setEditingGoal(null);
      await loadGoals();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(goal) {
    if (!window.confirm(`Delete “${goal.title}”? This cannot be undone.`)) return;
    setBusyGoalId(goal._id);
    setActionError('');
    try {
      await deleteGoal(goal._id);
      setGoals((current) => current.filter((item) => item._id !== goal._id));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyGoalId('');
    }
  }

  async function handleProgress(goalId, progress) {
    setBusyGoalId(goalId);
    setActionError('');
    try {
      const updatedGoal = await updateGoalProgress(goalId, progress);
      setGoals((current) => current.map((goal) => goal._id === goalId ? updatedGoal : goal));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyGoalId('');
    }
  }

  function openNewGoal() {
    setActionError('');
    setEditingGoal(null);
    setIsFormOpen(true);
  }

  function openEditGoal(goal) {
    setActionError('');
    setEditingGoal(goal);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setIsFormOpen(false);
    setEditingGoal(null);
  }

  return (
    <div className="app-shell">
      <Navbar onAddGoal={openNewGoal} />
      <main className="main-content">
        <section className="page-heading">
          <div>
            <p className="eyebrow">YOUR YEAR, IN MOTION</p>
            <h1>Make room for what matters.</h1>
            <p className="page-subtitle">A clear view of the goals you are growing into.</p>
          </div>
          <button className="button button-primary heading-add" onClick={openNewGoal} type="button">
            <span aria-hidden="true">+</span> Add a goal
          </button>
        </section>

        <Statistics goals={yearGoals} year={selectedYear} />

        <section className="goals-section" aria-labelledby="goals-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE BIG PICTURE</p>
              <h2 id="goals-heading">Your goals</h2>
            </div>
            <span className="goal-count">{visibleGoals.length} {visibleGoals.length === 1 ? 'goal' : 'goals'}</span>
          </div>

          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            years={years}
          />

          {actionError && (
            <div className="message message-error" role="alert">
              <span>{actionError}</span>
              <button type="button" onClick={() => setActionError('')} aria-label="Dismiss error">Close</button>
            </div>
          )}
          {loadError && (
            <div className="load-error message-error" role="alert">
              <div><strong>We could not load your goals.</strong><p>{loadError}</p></div>
              <button className="button button-secondary" type="button" onClick={loadGoals}>Try again</button>
            </div>
          )}

          <GoalList
            goals={visibleGoals}
            loading={loading}
            failed={Boolean(loadError)}
            hasFilters={Boolean(filters.category || filters.quarter || filters.status)}
            onEdit={openEditGoal}
            onDelete={handleDelete}
            onProgress={handleProgress}
            busyGoalId={busyGoalId}
            onAddGoal={openNewGoal}
          />
        </section>
      </main>

      {isFormOpen && (
        <GoalForm
          goal={editingGoal}
          defaultYear={selectedYear}
          saving={saving}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}
      <footer className="page-footer">Small steps still move you forward.</footer>
    </div>
  );
}

export default App;