const categories = ['Career', 'Health', 'Finance', 'Personal', 'Learning'];
const quarters = ['Q1', 'Q2', 'Q3', 'Q4', 'All Year'];
const statuses = ['Not Started', 'In Progress', 'Achieved', 'Deferred'];

function Navbar({ onAddGoal }) {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Yearly Planner home">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>yearly<span className="brand-light">planner</span></span>
      </a>
      <div className="topbar-right">
        <span className="topbar-note">A little progress, every day</span>
        <button className="button button-primary topbar-add" type="button" onClick={onAddGoal}>+ <span>New goal</span></button>
      </div>
    </header>
  );
}

function Statistics({ goals, year }) {
  const stats = [
    { label: 'Total goals', value: goals.length, tone: 'total' },
    { label: 'Not started', value: goals.filter((goal) => goal.status === 'Not Started').length, tone: 'not-started' },
    { label: 'In progress', value: goals.filter((goal) => goal.status === 'In Progress').length, tone: 'in-progress' },
    { label: 'Achieved', value: goals.filter((goal) => goal.status === 'Achieved').length, tone: 'achieved' },
    { label: 'Deferred', value: goals.filter((goal) => goal.status === 'Deferred').length, tone: 'deferred' }
  ];

  return (
    <section className="statistics" aria-label={`${year} goal statistics`}>
      {stats.map((stat, index) => (
        <article className={`stat-item stat-${stat.tone}`} key={stat.label}>
          <div className="stat-top"><span>{stat.label}</span><i aria-hidden="true" /></div>
          <strong>{stat.value}</strong>
          {index === 0 && <span className="stat-caption">for {year}</span>}
        </article>
      ))}
    </section>
  );
}

function FilterBar({ filters, onFiltersChange, selectedYear, onYearChange, years }) {
  function updateFilter(event) {
    onFiltersChange((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function clearFilters() {
    onFiltersChange({ category: '', quarter: '', status: '' });
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="filter-bar">
      <label className="filter-field year-field">
        <span>Year</span>
        <select value={selectedYear} onChange={(event) => onYearChange(Number(event.target.value))}>
          {years.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
      <span className="filter-divider" aria-hidden="true" />
      <label className="filter-field">
        <span>Life area</span>
        <select name="category" value={filters.category} onChange={updateFilter}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
      </label>
      <label className="filter-field">
        <span>Quarter</span>
        <select name="quarter" value={filters.quarter} onChange={updateFilter}>
          <option value="">All quarters</option>
          {quarters.map((quarter) => <option key={quarter}>{quarter}</option>)}
        </select>
      </label>
      <label className="filter-field">
        <span>Status</span>
        <select name="status" value={filters.status} onChange={updateFilter}>
          <option value="">All statuses</option>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </label>
      {hasFilters && <button className="clear-filters" type="button" onClick={clearFilters}>Clear filters</button>}
    </div>
  );
}

function ProgressBar({ progress }) {
  return (
    <div className="progress-track" role="progressbar" aria-label="Goal progress" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
      <span style={{ width: `${progress}%` }} />
    </div>
  );
}

export { FilterBar, Navbar, ProgressBar, Statistics };