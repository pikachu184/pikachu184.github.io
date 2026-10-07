const USERNAME = 'pikachu184';
const API = 'https://api.github.com';

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function formatDate(date) {
  if (!date) return 'Recently updated';
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(new Date(date));
}

function projectCard(repo) {
  const demo = repo.homepage && /^https:\/\//i.test(repo.homepage) ? repo.homepage : '';
  const language = repo.language || 'Open source';
  const description = repo.description || 'A public repository by @pikachu184.';
  return `<article class="project-card">
    <div class="project-card-top"><span class="folder-icon" aria-hidden="true">⌘</span><div class="project-links">
      ${demo ? `<a href="${escapeHTML(demo)}" target="_blank" rel="noopener noreferrer" aria-label="Open live demo for ${escapeHTML(repo.name)}">↗</a>` : ''}
      <a href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escapeHTML(repo.name)} on GitHub">⌁</a>
    </div></div>
    <h3>${escapeHTML(repo.name)}</h3><p>${escapeHTML(description)}</p>
    <div class="project-card-bottom"><span class="language"><span class="language-dot" aria-hidden="true"></span>${escapeHTML(language)}</span><span class="repo-date">${escapeHTML(formatDate(repo.updated_at))}</span></div>
  </article>`;
}

async function loadPortfolio() {
  const grid = document.querySelector('#project-grid');
  const note = document.querySelector('#api-note');
  try {
    const headers = { Accept: 'application/vnd.github+json' };
    const [profileResponse, reposResponse] = await Promise.all([
      fetch(`${API}/users/${USERNAME}`, { headers }),
      fetch(`${API}/users/${USERNAME}/repos?sort=updated&per_page=100&type=owner`, { headers })
    ]);
    if (!profileResponse.ok || !reposResponse.ok) throw new Error('GitHub could not load this public profile right now.');

    const [profile, repositories] = await Promise.all([profileResponse.json(), reposResponse.json()]);
    document.querySelector('#profile-name').textContent = profile.name || `@${USERNAME}`;
    document.querySelector('#profile-bio').textContent = profile.bio || 'Open-source projects and public work on GitHub.';
    document.querySelector('#repo-count').textContent = profile.public_repos ?? '—';
    document.querySelector('#follower-count').textContent = profile.followers ?? '—';
    document.querySelector('#following-count').textContent = profile.following ?? '—';

    const projects = repositories.filter((repo) => !repo.fork && !repo.archived).slice(0, 6);
    document.querySelector('#project-total').textContent = String(projects.length).padStart(2, '0');
    if (!projects.length) {
      grid.innerHTML = '<div class="loading-card"><p>No public projects are available to feature yet.</p></div>';
      return;
    }
    grid.innerHTML = projects.map(projectCard).join('');
    note.textContent = 'Repository details are sourced from the public GitHub API.';
  } catch (error) {
    grid.innerHTML = '<div class="loading-card"><p>Projects could not be loaded right now. Visit GitHub to see the public repositories.</p></div>';
    note.textContent = error instanceof Error ? error.message : 'GitHub data is temporarily unavailable.';
    document.querySelector('#project-total').textContent = '—';
  }
}

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('#nav-links');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  navLinks.classList.toggle('is-open', open);
});
navLinks.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    menuToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
  }
});

loadPortfolio();
