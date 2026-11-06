const root = document.documentElement;
const active = document.querySelector('#activeTheme');
const swatches = document.querySelector('#swatches');

document.addEventListener('cc:theme', event => {
  const { id, palette } = event.detail || {};
  if (!id || !palette) return;

  if (active) active.textContent = (event.detail.label || String(id).replaceAll('-', ' ')).toUpperCase();

  if (swatches) {
    const keys = ['acid_green', 'hot_pink', 'purple', 'cyan', 'orange', 'red'];
    swatches.replaceChildren(...keys.map(key => {
      const dot = document.createElement('i');
      dot.title = key;
      dot.style.backgroundColor = `#${palette[key] || '000000'}`;
      return dot;
    }));
  }
});

document.addEventListener('cc:themes-ready', event => {
  const { total = 612, mashups = 12, families = 50 } = event.detail || {};
  const schemaVersion = document.querySelector('#schemaVersion');
  const themeCount = document.querySelector('#themeCount');
  const themeSummary = document.querySelector('#themeSummary');
  if (schemaVersion) schemaVersion.textContent = '1';
  if (themeCount) themeCount.textContent = String(total);
  if (themeSummary) themeSummary.textContent = `${total - mashups} SOURCE THEMES / ${families} FAMILIES / ${mashups} SIGNATURE MASHUPS`;
});

const brand=document.querySelector('.brand');if(!matchMedia('(prefers-reduced-motion:reduce)').matches){let phase=0;setInterval(()=>{phase=(phase+1+Math.floor(Math.random()*5))%6;brand.dataset.brandPhase=phase},4700)}window.addEventListener('pointermove',e=>{root.style.setProperty('--x',`${e.clientX}px`);root.style.setProperty('--y',`${e.clientY}px`)},{passive:true});

const ORG='cybercoretech';const coreRepos=['cybercore','cyberdeck','cybermeta','cyberplug','cyberterm'];const syncStatus=document.querySelector('#repoSyncStatus');const repoCount=document.querySelector('#repoCount');const discovered=document.querySelector('#discoveredRepos');const liveStats=document.querySelector('#liveStats');const refreshButton=document.querySelector('#refreshRepos');
const safe=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const since=date=>{const seconds=Math.max(1,Math.floor((Date.now()-new Date(date).getTime())/1000));if(seconds<60)return `${seconds}S AGO`;const minutes=Math.floor(seconds/60);if(minutes<60)return `${minutes}M AGO`;const hours=Math.floor(minutes/60);if(hours<48)return `${hours}H AGO`;return `${Math.floor(hours/24)}D AGO`};
function orderedRepos(repos){return [...repos].sort((a,b)=>{const ai=coreRepos.indexOf(a.name),bi=coreRepos.indexOf(b.name);if(ai>=0||bi>=0)return (ai<0?99:ai)-(bi<0?99:bi);return new Date(b.updated_at)-new Date(a.updated_at)})}
function renderDiscovered(repos){const extra=repos.filter(repo=>!coreRepos.includes(repo.name));discovered.innerHTML=extra.length?extra.map(repo=>`<a class="discovered-repo" href="${safe(repo.html_url)}" target="_blank" rel="noreferrer"><strong>${safe(repo.name).toUpperCase()}</strong><small>${safe(repo.description||'New Cybercore Tech repository surface.')}</small><b>${safe(repo.language||'MULTI-LANGUAGE')} · ${since(repo.updated_at)}</b></a>`).join(''):'<p class="live-empty">No additional public repositories discovered yet. New organization repositories will appear here automatically.</p>'}
function renderLiveStats(repos){liveStats.innerHTML=repos.length?orderedRepos(repos).map(repo=>`<article class="live-stat-card"><div class="live-meta"><span>${safe(repo.visibility||'public').toUpperCase()} / ${safe(repo.language||'MULTI').toUpperCase()}</span><strong>${since(repo.pushed_at||repo.updated_at)}</strong></div><a href="${safe(repo.html_url)}" target="_blank" rel="noreferrer">${safe(repo.name).toUpperCase()} ↗</a><p class="repo-desc">${safe(repo.description||'No repository description published yet.')}</p><div class="stat-line"><span><b>${repo.stargazers_count??0}</b>STARS</span><span><b>${repo.forks_count??0}</b>FORKS</span><span><b>${repo.open_issues_count??0}</b>ISSUES</span></div></article>`).join(''):'<p class="live-empty">No public repositories returned.</p>';repoCount.textContent=`${repos.length} PUBLIC REPOSITORIES`}
async function loadLiveRepos(){syncStatus.textContent='SYNCING GITHUB REGISTRY…';refreshButton.disabled=true;try{const response=await fetch(`https://api.github.com/orgs/${ORG}/repos?type=public&sort=updated&per_page=100`,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}});if(!response.ok)throw new Error(`GitHub API ${response.status}`);const repos=(await response.json()).filter(repo=>!repo.private&&!repo.archived);renderDiscovered(repos);renderLiveStats(repos);syncStatus.textContent=`SYNCED ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}`}catch(error){syncStatus.textContent='REGISTRY UNAVAILABLE';if(!liveStats.children.length||liveStats.querySelector('.live-empty'))liveStats.innerHTML=`<p class="live-empty">Live registry unavailable: ${safe(error.message)}. The curated Cybercore surface remains available.</p>`}finally{refreshButton.disabled=false}}
refreshButton.addEventListener('click',loadLiveRepos);loadLiveRepos();setInterval(loadLiveRepos,300000);
