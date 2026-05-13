const API_BASE = 'http://localhost:8000';
const params = new URLSearchParams(window.location.search);
const choice = params.get('choice');
const choiceTitle = document.getElementById('choiceTitle');
const voteHint = document.getElementById('voteHint');
const winner = document.getElementById('winner');
const resultMessage = document.getElementById('resultMessage');
const resultTable = document.getElementById('resultTable');
const refreshPage = document.getElementById('refreshPage');
const backButton = document.getElementById('backButton');

function showMessage(text, isError = false) {
  resultMessage.textContent = text;
  resultMessage.style.color = isError ? '#f87171' : '#8ef';
}

function renderResults(results) {
  resultTable.innerHTML = '';
  const entries = Object.entries(results);
  if (!entries.length) {
    resultTable.innerHTML = '<p class="message">No votes yet. Be the first one to vote!</p>';
    return;
  }

  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const leading = sorted[0];
  const topCount = leading[1];
  const topOptions = sorted.filter(([, count]) => count === topCount).map(([option]) => option);

  if (choice) {
    const votedOption = choice;
    voteHint.textContent = `Your vote for ${votedOption} is counted. See which option is leading now.`;
  } else {
    voteHint.textContent = 'Live voting results are shown below.';
  }

  if (topOptions.length === 1) {
    winner.innerHTML = `<strong>${topOptions[0]}</strong> is currently winning with ${topCount} vote${topCount === 1 ? '' : 's'}!`;
  } else {
    winner.innerHTML = `<strong>Tie:</strong> ${topOptions.join(', ')} with ${topCount} votes each.`;
  }

  sorted.forEach(([option, count]) => {
    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = `
      <span>${option}</span>
      <strong>${count}</strong>
    `;
    if (choice && option === choice) {
      row.style.borderColor = '#38bdf8';
      row.style.background = 'rgba(56, 189, 248, 0.14)';
    }
    resultTable.appendChild(row);
  });
}

async function fetchResults() {
  try {
    const response = await fetch(`${API_BASE}/results`);
    if (!response.ok) {
      throw new Error('Failed to load results');
    }
    const data = await response.json();
    renderResults(data.results || {});
  } catch (err) {
    showMessage('Unable to load live results. Please try again.', true);
  }
}

refreshPage.addEventListener('click', () => {
  showMessage('Refreshing live results...');
  fetchResults();
});

backButton.addEventListener('click', () => {
  window.location.href = 'index.html';
});

if (choice) {
  choiceTitle.textContent = `You voted for ${choice}`;
} else {
  choiceTitle.textContent = 'Vote completed';
}

fetchResults();
setInterval(fetchResults, 15000);
