// ───────────── 서버 동기화 (로그인 없이 동기화 코드) ─────────────
// 로컬 우선: 모든 기록은 먼저 이 기기(localStorage)에 저장되고, 변경이 생기면
// 잠시 뒤 Firestore 문서 sync/{코드} 로 업로드된다. 다른 기기는 같은 코드로 받아온다.
// - 원격이 더 새것이고 이 기기에 올리지 않은 변경이 없으면 → 원격으로 교체 (삭제도 반영)
// - 둘 다 바뀌었으면(오프라인 동시 사용 등) → 합친 뒤 업로드
(function () {
  'use strict';
  const CFG = window.SYNC_CONFIG || {};
  const ready = !!(CFG.projectId && CFG.apiKey);
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const CODE_LEN = 20;
  const DEVICE_ONLY = ['voice', 'resume'];

  store.sync = store.sync || null;         // {code, updatedAt, dirty, lastOk}
  let pushTimer = null, pushing = false, again = false, applying = false;
  let status = 'idle';                     // idle | syncing | ok | offline | error

  const docUrl = code => `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(CFG.projectId)}/databases/(default)/documents/sync/${code}?key=${encodeURIComponent(CFG.apiKey)}`;
  const fmt = code => code.replace(/(.{5})(?=.)/g, '$1-');
  const norm = s => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').split('').filter(c => ALPHA.includes(c)).join('');
  function newCode() {
    const a = new Uint8Array(CODE_LEN); crypto.getRandomValues(a);
    return Array.from(a, b => ALPHA[b % ALPHA.length]).join('');
  }

  // 올릴 데이터: 기기 전용 값(목소리, 재생 위치, 동기화 상태)은 제외
  function payload() {
    const settings = Object.assign({}, S); DEVICE_ONLY.forEach(k => delete settings[k]);
    const d = {mastered: store.mastered, mine: store.mine, dayDone: store.dayDone, quiz: store.quiz, notes: store.notes, backupAt: store.backupAt, settings};
    return JSON.stringify(d);
  }
  async function fetchRemote(code) {
    const r = await fetch(docUrl(code), {cache: 'no-store'});
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json(), f = j.fields || {};
    return {data: JSON.parse(f.json ? f.json.stringValue : '{}'), updatedAt: +(f.updatedAt ? f.updatedAt.integerValue : 0)};
  }
  async function putRemote(code, json, updatedAt) {
    const body = {fields: {json: {stringValue: json}, updatedAt: {integerValue: String(updatedAt)}, device: {stringValue: navigator.userAgent.slice(0, 80)}}};
    const r = await fetch(docUrl(code), {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
    if (!r.ok) throw new Error('HTTP ' + r.status);
  }

  function persistQuiet() { applying = true; try { save(); } finally { applying = false; } }
  function replaceWith(d) {
    ['mastered', 'mine', 'dayDone', 'quiz'].forEach(k => { store[k] = d[k] || {}; });
    store.notes = Array.isArray(d.notes) ? d.notes : [];
    if (d.backupAt) store.backupAt = Math.max(store.backupAt || 0, d.backupAt);
    if (d.settings) Object.keys(d.settings).forEach(k => { if (!DEVICE_ONLY.includes(k) && k in S) S[k] = d.settings[k]; });
  }
  function applyRemote(remote) {
    if (store.sync.dirty) mergeStore(remote.data); else replaceWith(remote.data);
    store.sync.updatedAt = remote.updatedAt;
    persistQuiet();
    if (typeof refreshAll === 'function') refreshAll();
  }

  function setStatus(s) { status = s; render(); }

  async function push() {
    if (!ready || !store.sync) return;
    if (pushing) { again = true; return; }
    pushing = true; setStatus('syncing');
    const code = store.sync.code;
    try {
      const remote = await fetchRemote(code);
      if (!store.sync || store.sync.code !== code) return;
      if (remote && remote.updatedAt > (store.sync.updatedAt || 0)) applyRemote(remote);
      const v = Math.max(Date.now(), remote ? remote.updatedAt + 1 : 0);
      await putRemote(code, payload(), v);
      if (!store.sync || store.sync.code !== code) return;
      store.sync.updatedAt = v; store.sync.dirty = false; store.sync.lastOk = Date.now();
      persistQuiet(); setStatus('ok');
    } catch (e) {
      setStatus(navigator.onLine === false || e instanceof TypeError ? 'offline' : 'error');
    } finally {
      pushing = false;
      if (again) { again = false; schedulePush(300); }
    }
  }
  async function pull() {
    if (!ready || !store.sync || pushing) return;
    const code = store.sync.code;
    try {
      setStatus('syncing');
      const remote = await fetchRemote(code);
      if (!store.sync || store.sync.code !== code) return;
      if (!remote) return push();
      if (remote.updatedAt > (store.sync.updatedAt || 0)) {
        const wasDirty = store.sync.dirty;
        applyRemote(remote);
        if (wasDirty) return push();
      } else if (store.sync.dirty) return push();
      store.sync.lastOk = Date.now(); persistQuiet(); setStatus('ok');
    } catch (e) {
      setStatus(navigator.onLine === false || e instanceof TypeError ? 'offline' : 'error');
    }
  }
  function schedulePush(ms) { clearTimeout(pushTimer); pushTimer = setTimeout(push, ms == null ? 1500 : ms); }

  // save()가 부를 때마다: 로컬 변경 표시 + 잠시 뒤 업로드
  window.onLocalSave = function () {
    if (applying || !ready || !store.sync) return;
    store.sync.dirty = true;
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
    schedulePush();
  };

  async function connect(input) {
    const code = norm(input);
    if (code.length !== CODE_LEN) return toast(`코드는 ${CODE_LEN}자예요 (지금 ${code.length}자)`);
    setStatus('syncing');
    let remote;
    try { remote = await fetchRemote(code); }
    catch (e) { setStatus('offline'); return toast('서버에 연결할 수 없어요. 인터넷을 확인해 주세요'); }
    if (!remote) { setStatus('idle'); return toast('이 코드의 기록을 찾을 수 없어요. 코드를 다시 확인해 주세요'); }
    const hadLocal = hasData();
    store.sync = {code, updatedAt: 0, dirty: hadLocal, lastOk: 0};
    applyRemote(remote);             // 이 기기에 기록이 있으면 합치고, 없으면 그대로 받아옴
    if (hadLocal) await push(); else setStatus('ok');
    toast(hadLocal ? '연결 완료! 이 기기 기록과 합쳤어요' : '연결 완료! 기록을 받아왔어요');
  }
  async function create() {
    store.sync = {code: newCode(), updatedAt: 0, dirty: true, lastOk: 0};
    persistQuiet(); render();
    await push();
    if (status === 'ok') toast('동기화를 켰어요 — 이제 기록이 서버에 자동 저장돼요');
    else toast('코드를 만들었어요. 인터넷이 연결되면 자동으로 올라가요');
  }
  function disconnect() {
    if (!confirm('이 기기의 동기화를 끌까요?\n(이 기기와 서버의 기록은 그대로 남아요. 같은 코드로 다시 연결할 수 있어요)')) return;
    store.sync = null; clearTimeout(pushTimer); persistQuiet(); setStatus('idle');
  }
  async function copyCode() {
    const t = fmt(store.sync.code);
    try { await navigator.clipboard.writeText(t); toast('코드를 복사했어요'); }
    catch (e) { prompt('이 코드를 복사하세요', t); }
  }
  async function shareLink() {
    const url = location.origin + location.pathname + '#sync=' + store.sync.code;
    try { if (navigator.share) { await navigator.share({title: '영어30 동기화', text: '영어30 동기화 코드: ' + fmt(store.sync.code), url}); return; } } catch (e) { if (e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); toast('연결 링크를 복사했어요'); } catch (e) { prompt('이 링크를 복사하세요', url); }
  }

  const STATUS_TEXT = {
    idle: '', syncing: '⏳ 동기화 중…', ok: '☁️ 서버에 저장됨',
    offline: '📴 오프라인 — 연결되면 자동으로 올라가요', error: '⚠️ 서버 저장 실패 — 잠시 뒤 다시 시도해요'
  };
  function render() {
    const btn = document.getElementById('btnData');
    if (btn) {
      btn.firstChild.textContent = store.sync && ready ? '☁️' : '💾';
      btn.classList.toggle('pending', !!(store.sync && ready && (status === 'offline' || status === 'error' || (store.sync.dirty && status !== 'syncing'))));
    }
    const box = document.getElementById('syncBox');
    if (!box) return;
    const sheet = document.getElementById('dataSheet');
    if (sheet && sheet.classList.contains('show') && typeof renderDataSheet === 'function') renderDataSheet();
    if (!ready) {
      box.innerHTML = `<div class="sync"><b>☁️ 서버 동기화</b><p>서버 연결 준비 중이에요. 그동안 기록은 이 기기에 저장돼요.</p></div>`;
      return;
    }
    if (!store.sync) {
      box.innerHTML = `<div class="sync"><b>☁️ 서버 동기화</b>
        <p>켜면 모든 기록이 서버에 자동 저장돼요. 앱을 지우거나 폰을 바꿔도 코드만 있으면 그대로 이어서 쓸 수 있어요.</p>
        <button class="sbtn" id="sCreate">동기화 켜기 (새 코드 만들기)</button>
        <div class="sjoin"><input id="sCode" placeholder="다른 기기의 코드 입력" autocapitalize="characters" autocomplete="off" spellcheck="false"><button id="sJoin">연결</button></div>
      </div>`;
      box.querySelector('#sCreate').onclick = create;
      box.querySelector('#sJoin').onclick = () => connect(box.querySelector('#sCode').value);
      return;
    }
    const last = store.sync.lastOk ? ago(store.sync.lastOk) : '아직';
    box.innerHTML = `<div class="sync on"><b>☁️ 서버 동기화 켜짐</b>
      <div class="scode">${fmt(store.sync.code)}</div>
      <p>다른 기기에서 이 코드를 입력하면 같은 기록을 써요. <b>코드는 비밀번호처럼 보관</b>하세요 (잃어버리면 다른 기기에서 찾을 수 없어요).</p>
      <div class="sstat ${status}">${STATUS_TEXT[status] || ''}${status === 'ok' || status === 'idle' ? ` · 마지막 동기화 ${last}` : ''}</div>
      <div class="srow"><button id="sCopy">📋 코드 복사</button><button id="sShare">🔗 링크 보내기</button><button id="sNow">🔄 지금</button></div>
      <button class="soff" id="sOff">동기화 끄기</button>
    </div>`;
    box.querySelector('#sCopy').onclick = copyCode;
    box.querySelector('#sShare').onclick = shareLink;
    box.querySelector('#sNow').onclick = () => (store.sync.dirty ? push() : pull());
    box.querySelector('#sOff').onclick = disconnect;
  }
  window.renderSync = render;
  window.syncOn = () => !!(ready && store.sync);

  // 시작 · 복귀 · 온라인 · 주기적으로 받아오기
  if (ready) {
    const m = location.hash.match(/sync=([A-Za-z0-9-]+)/);
    if (m) {
      history.replaceState(null, '', location.pathname + location.search);
      const code = norm(m[1]);
      if (!store.sync || store.sync.code !== code) {
        if (confirm('이 동기화 코드로 연결할까요?\n' + fmt(code))) connect(code);
      }
    }
    if (store.sync) { store.sync.dirty ? push() : pull(); }
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pull(); else if (store.sync && store.sync.dirty) push(); });
    window.addEventListener('online', () => { if (store.sync) (store.sync.dirty ? push() : pull()); });
    setInterval(() => { if (document.visibilityState === 'visible' && store.sync) pull(); }, 30000);
  }
  render();
})();
