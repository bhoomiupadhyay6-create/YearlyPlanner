import { useEffect, useState } from 'react';

const categories = ['Career', 'Health', 'Finance', 'Personal', 'Learning'];
const quarters = ['Q1', 'Q2', 'Q3', 'Q4', 'All Year'];

function GoalForm({ goal, defaultYear, saving, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Personal', year: defaultYear,
    quarter: 'All Year', milestones: ''
  });

  useEffect(() => {
    setForm({
      title: goal?.title || '',
      description: goal?.description || '',
      category: goal?.category || 'Personal',
      year: goal?.year || defaultYear,
      quarter: goal?.quarter || 'All Year',
      milestones: (goal?.milestones || []).join('\n')
    });
  }, [goal, defaultYear]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      ...form,
      year: Number(form.year),
      milestones: form.milestones.split('\n').map((item) => item.trim()).filter(Boolean)
    });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="goal-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">A GOOD PLACE TO BEGIN</p>
            <h2 id="form-title">{goal ? 'Shape this goal' : 'Add a new goal'}</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close form">X</button>
        </div>
        <form className="goal-form" onSubmit={handleSubmit}>
          <label className="field field-full">
            <span>Goal title</span>
            <input name="title" value={form.title} onChange={updateField} placeholder="What would you like to make happen?" required maxLength="120" autoFocus />
          </label>
          <label className="field field-full">
            <span>Description <em>Optional</em></span>
            <textarea name="description" value={form.description} onChange={updateField} placeholder="Add a little context or a reason to come back to" rows="3" />
          </label>
          <div className="form-row">
            <label className="field">
              <span>Life area</span>
              <select name="category" value={form.category} onChange={updateField}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Year</span>
              <input name="year" type="number" min="1900" max="2200" value={form.year} onChange={updateField} required />
            </label>
          </div>
          <label className="field field-full">
            <span>Time of year</span>
            <select name="quarter" value={form.quarter} onChange={updateField}>
              {quarters.map((quarter) => <option key={quarter}>{quarter}</option>)}
            </select>
          </label>
          <label className="field field-full">
            <span>Milestones <em>One per line</em></span>
            <textarea name="milestones" value={form.milestones} onChange={updateField} placeholder={'Choose a first step\nSet a date to check in'} rows="3" />
          </label>
          <div className="form-actions">
            <button className="button button-secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : goal ? 'Save changes' : 'Create goal'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default GoalForm;