const API_URL = import.meta.env.VITE_API_URL || '/api/goals';

async function request(path = '', options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export async function fetchGoals() {
  const data = await request();
  return data.goals;
}

export async function saveGoal(goalId, goalData) {
  const data = await request(goalId ? `/${goalId}` : '', {
    method: goalId ? 'PATCH' : 'POST',
    body: JSON.stringify(goalData)
  });
  return data.goal;
}

export async function updateGoalProgress(goalId, progress) {
  const data = await request(`/${goalId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ progress })
  });
  return data.goal;
}

export async function deleteGoal(goalId) {
  return request(`/${goalId}`, { method: 'DELETE' });
}