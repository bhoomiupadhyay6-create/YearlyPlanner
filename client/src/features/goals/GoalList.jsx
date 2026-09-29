import { useEffect, useState } from 'react';
import { ProgressBar } from './PlannerComponents';

function GoalCard({ goal, onEdit, onDelete, onProgress, busy }) {
  const [draftProgress, setDraftProgress] = useState(goal.progress || 0);

  useEffect(() => setDraftProgress(goal.progress || 0), [goal.progress]);

  const statusClass = goal.status.toLowerCase().replaceAll(' ', '-');
  const categoryClass = goal.category.toLowerCase();

  return (
    <article className="goal-card">
      <div className="goal-card-topline">
        <span className={`category-tag category-${categoryClass}`}>{goal.category}</span>
        <div className="goal-actions">
          <button type="button" onClick={() => onEdit(goal)} aria-label={`Edit ${goal.title}`}>Edit</button>
          <button type="button" className="delete-action" onClick={() => onDelete(goal)} disabled={busy} aria-label={`Delete ${goal.title}`}>Delete</button>
        </div>
      </div>
      <div className="goal-title-row">
        <h3>{goal.title}</h3>
        <span className={`status-tag status-${statusClass}`}>{goal.status}</span>
      </div>
      {goal.description && <p className="goal-description">{goal.description}</p>}
      <p className="goal-period">{goal.year} <span aria-hidden="true">/</span> {goal.quarter}</p>

      <div className="progress-area">
        <div className="progress-label"><span>Progress</span><strong>{draftProgress}%</strong></div>
        <ProgressBar progress={draftProgress} />
        <div className="progress-controls">
          <input
            aria-label={`Progress for ${goal.title}`}
            type="range"
            min="0"
            max="100"
            step="1"
            value={draftProgress}
            onChange={(event) => setDraftProgress(Number(event.target.value))}
            disabled={busy}
          />
          <button
            type="button"
            className="save-progress"
            onClick={() => onProgress(goal._id, draftProgress)}
            disabled={busy || draftProgress === (goal.progress || 0)}
          >
            {busy ? 'Saving…' : 'Update'}
          </button>
        </div>
      </div>

      {goal.milestones?.length > 0 && (
        <div className="milestones">
          <h4>Milestones <span>{goal.milestones.length}</span></h4>
          <ul>{goal.milestones.map((milestone, index) => <li key={`${milestone}-${index}`}>{milestone}</li>)}</ul>
        </div>
      )}
    </article>
  );
}

function GoalList({ goals, loading, failed, hasFilters, onEdit, onDelete, onProgress, busyGoalId, onAddGoal }) {
  if (loading) {
    return <div className="loading-state" role="status"><span className="loading-mark" /> Loading your goals…</div>;
  }
  if (failed) return null;

  if (goals.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-illustration" aria-hidden="true"><span>01</span><i /><b /></div>
        <h3>{hasFilters ? 'No goals match these filters' : 'A fresh page for your year'}</h3>
        <p>{hasFilters ? 'Try another life area, quarter, or status.' : 'Start with one thing you would be glad to make time for.'}</p>
        {!hasFilters && <button className="button button-primary" type="button" onClick={onAddGoal}>Add your first goal</button>}
      </div>
    );
  }

  return (
    <div className="goal-grid">
      {goals.map((goal) => (
        <GoalCard
          key={goal._id}
          goal={goal}
          onEdit={onEdit}
          onDelete={onDelete}
          onProgress={onProgress}
          busy={busyGoalId === goal._id}
        />
      ))}
    </div>
  );
}

export default GoalList;