const API_BASE = 'http://localhost:8000';
const optionsContainer = document.getElementById('options');
const message = document.getElementById('message');

async function fetchOptions() {
  const res = await fetch(`${API_BASE}/options`);
  const data = await res.json();
  return data.options || [];
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? '#f87171' : '#8ef';
}

function disableVoteButtons(disabled) {
  optionsContainer.querySelectorAll('button').forEach((button) => {
    button.disabled = disabled;
    button.style.cursor = disabled ? 'not-allowed' : 'pointer';
  });
}

function redirectToResult(option) {
  window.location.href = `result.html?choice=${encodeURIComponent(option)}`;
}

async function submitVote(option) {
  try {
    showMessage(`Voting for ${option}...`);
    disableVoteButtons(true);

    const response = await fetch(`${API_BASE}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option }),
    });

    if (!response.ok) {
      const error = await response.json();
      showMessage(error.detail || 'Failed to submit vote.', true);
      disableVoteButtons(false);
      return;
    }

    const result = await response.json();
    showMessage(`Your vote for ${result.option} is queued! Redirecting to results...`);
    setTimeout(() => redirectToResult(result.option), 600);
  } catch (err) {
    showMessage('Backend unreachable. Start the stack and retry.', true);
    disableVoteButtons(false);
  }
}

function renderOptions(options) {
  optionsContainer.innerHTML = '';
  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-button';
    button.textContent = option;
    button.onclick = () => submitVote(option);
    optionsContainer.appendChild(button);
  });
}

async function loadOptions() {
  try {
    const options = await fetchOptions();
    renderOptions(options);
  } catch (err) {
    showMessage('Unable to load options.', true);
  }
}

loadOptions();
