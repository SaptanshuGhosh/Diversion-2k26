function loadTasks(){try{return JSON.parse(localStorage.getItem('topranker_tasks')||'[]')}catch{return[]}}
function saveTasks(arr){localStorage.setItem('topranker_tasks',JSON.stringify(arr))}
function todayDate(){const d=new Date();d.setHours(0,0,0,0);return d}

function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getLatestAssignment() {
    const assignments = JSON.parse(localStorage.getItem('SmartEdu_Assignments') || '[]');
    return assignments.length > 0 ? assignments[assignments.length - 1] : null;
}

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // Stop current speech
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 1.0;
  msg.pitch = 1.0;
  window.speechSynthesis.speak(msg);
}

function enrichTask(t){
  const due=new Date(t.deadline);
  const today=todayDate();
  const daysLeft=Math.ceil((due-today)/86400000);
  const startDate=new Date(today);
  startDate.setDate(today.getDate()+Number(t.daysRequired||1));
  const lateRisk=startDate>due;
  const urgency=daysLeft<=0?100:Math.max(0,10-daysLeft);
  const score=(lateRisk?50:0)+urgency*3+Number(t.weight||5)*2+(daysLeft<0?20:0);
  const status=t.completed?'done':daysLeft<0?'overdue':lateRisk?'at-risk':daysLeft<=3?'urgent':'on-track';
  return{...t,daysLeft,lateRisk,score,status};
}

function prioritizeTasks(list){
  return list.map(enrichTask).sort((a,b)=>{
    if(a.completed&&!b.completed)return 1;
    if(!a.completed&&b.completed)return-1;
    return b.score-a.score;
  });
}

const STATUS_MAP={
  overdue:{color:'#FF3D6B',label:'Overdue'},
  'at-risk':{color:'#F5C842',label:'At Risk'},
  urgent:{color:'#FF7B3A',label:'Urgent'},
  'on-track':{color:'#00E5A0',label:'On Track'},
  done:{color:'#555A7A',label:'Done'},
};

function formatDate(str){
  return new Date(str).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}

function esc(str){
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.addEventListener('DOMContentLoaded',()=>{
  const page=window.location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-link').forEach(a=>{
    if(a.getAttribute('href')===page)a.classList.add('active');
  });
});

/* ─── Session / Auth ──────────────────────────────────────────── */
const SMARTEDU_SESSION_KEY = 'SmartEdu_Session';

function getSession() {
  try { return JSON.parse(localStorage.getItem(SMARTEDU_SESSION_KEY) || 'null'); } catch { return null; }
}

function requireLogin() {
  const s = getSession();
  if (!s || !s.loggedIn) { window.location.href = 'login.html'; return null; }
  return s;
}

function logout() {
  localStorage.removeItem(SMARTEDU_SESSION_KEY);
  window.location.href = 'login.html';
}

/* ─── Inject logout button + user chip into every header nav ─── */
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  // Active nav link
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  // Inject logout UI
  const nav = document.querySelector('header nav');
  if (!nav) return;

  const s = getSession();
  const name = s ? (s.name || s.username || 'User') : null;
  const role = s ? s.role : null;

  const chip = document.createElement('div');
  chip.className = 'logout-chip';
  chip.innerHTML = `
    ${name ? `<span class="user-chip">${role === 'teacher' ? '📋' : '🎒'} ${escStr(name)}</span>` : ''}
    <button class="logout-btn" onclick="logout()" title="Sign out">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      Sign Out
    </button>`;
  nav.appendChild(chip);

  // Inject styles once
  if (!document.getElementById('logout-styles')) {
    const style = document.createElement('style');
    style.id = 'logout-styles';
    style.textContent = `
      .logout-chip { display:flex; align-items:center; gap:8px; margin-left:8px; }
      .user-chip {
        padding:5px 12px; border-radius:8px;
        background:var(--accent-dim); border:1px solid rgba(91,110,248,.25);
        color:var(--accent2); font-family:var(--font-m); font-size:11.5px; font-weight:500;
        white-space:nowrap; max-width:120px; overflow:hidden; text-overflow:ellipsis;
      }
      .logout-btn {
        display:inline-flex; align-items:center; gap:5px;
        padding:6px 13px; border-radius:8px;
        border:1px solid var(--border); background:transparent;
        color:var(--muted); font-family:var(--font-b); font-weight:600;
        font-size:12px; cursor:pointer; transition:all .2s; white-space:nowrap;
      }
      .logout-btn:hover { border-color:var(--red); color:var(--red); background:rgba(255,61,107,.07); }
      @media(max-width:768px) { .user-chip { display:none; } .logout-btn span { display:none; } }
    `;
    document.head.appendChild(style);
  }
});

function escStr(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ─── Role guard ──────────────────────────────────────────────── */
/**
 * Call on pages that should only be accessible by one role.
 * requireRole('teacher') on teacher-only pages,
 * requireRole('student') on student-only pages.
 * Redirects to index.html with an error param if role doesn't match.
 */
function requireRole(expectedRole) {
  const s = requireLogin(); // also checks login
  if (!s) return null;      // requireLogin already redirected
  if (s.role !== expectedRole) {
    window.location.href = 'index.html?accessDenied=' + expectedRole;
    return null;
  }
  return s;
}
