'use strict';

(function () {
  const D = window.PATRANI_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const blankState = () => ({
    risk: {},
    checklist: {},
    person: {},
    coord: {},
    volunteers: [],
    areas: [],
    tips: [],
    timeline: {},
    events: []
  });

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(D.storageKey);
      return raw ? { ...blankState(), ...JSON.parse(raw) } : blankState();
    } catch (err) {
      console.error('Nelze načíst localStorage:', err);
      return blankState();
    }
  }

  function saveState() {
    localStorage.setItem(D.storageKey, JSON.stringify(state));
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function value(id) {
    return (state.person && state.person[id]) ? String(state.person[id]).trim() : '';
  }

  function fmtDateTime(v) {
    if (!v) return '';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleString('cs-CZ');
  }

  function phoneHref(phone) {
    return 'tel:' + String(phone).replace(/[^0-9+]/g, '');
  }

  function renderRiskQuestions() {
    const root = $('#riskQuestions');
    root.innerHTML = D.questions.map(q => {
      const val = state.risk[q.id] || 'unknown';
      return `<div class="question">
        <strong>${esc(q.text)}</strong>
        <div class="toggle" data-risk-id="${esc(q.id)}">
          <button type="button" class="${val === 'yes' ? 'active ' : ''}${q.critical ? 'danger' : ''}" data-val="yes">Ano</button>
          <button type="button" class="${val === 'no' ? 'active' : ''}" data-val="no">Ne</button>
        </div>
      </div>`;
    }).join('');

    $$('#riskQuestions button').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.closest('[data-risk-id]').dataset.riskId;
      state.risk[id] = btn.dataset.val;
      saveState();
      renderRiskQuestions();
      renderRiskResult();
    }));
  }

  function riskLevel() {
    const yesIds = Object.entries(state.risk).filter(([, v]) => v === 'yes').map(([k]) => k);
    const critical = D.questions.some(q => q.critical && yesIds.includes(q.id));
    const elevatedCount = D.questions.filter(q => q.elevated && yesIds.includes(q.id)).length;
    if (critical || elevatedCount >= 2) return 'critical';
    if (elevatedCount === 1) return 'elevated';
    return 'low';
  }

  function renderRiskResult() {
    const box = $('#riskResult');
    const level = riskLevel();
    const map = {
      critical: {
        title: 'KRITICKÉ RIZIKO – volejte 158 ihned',
        text: 'Nečekejte 24 ani 48 hodin. Řekněte Policii ČR konkrétní rizika a postup dále koordinujte s ní.',
        steps: ['Volat Policii ČR 158.', 'Připravit fotku, popis, poslední místo a čas.', 'Kontaktovat Czech SAR Team 222 762 227 jako další krizový kontakt.', 'Chránit možné pachové stopy a neorganizovat chaotické rojnice bez koordinace.']
      },
      elevated: {
        title: 'ZVÝŠENÉ RIZIKO – jednejte okamžitě',
        text: 'Situace vyžaduje rychlé ověření a pravděpodobně hlášení Policii ČR. Nečekejte do druhého dne.',
        steps: ['Zavolat 158 při důvodném podezření.', 'Zjistit poslední místo, čas, oblečení a zdravotní rizika.', 'Prověřit blízké okolí bez ničení stop.', 'Určit koordinátora.']
      },
      low: {
        title: 'NÍZKÉ RIZIKO – stále nečekejte pasivně',
        text: 'I při nízkém riziku jednejte věcně. Pokud se objeví nové riziko, volejte 158.',
        steps: ['Kontaktovat rodinu a známé.', 'Prověřit poslední známá místa.', 'Připravit údaje pro Policii ČR.', 'Nenechat pátrání bez koordinace.']
      }
    }[level];
    box.className = 'risk-result ' + level;
    box.innerHTML = `<p class="risk-title">${esc(map.title)}</p><p>${esc(map.text)}</p><ol class="steps">${map.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol><div class="hero__actions"><a class="btn btn--call" href="tel:158">Volat 158</a><a class="btn btn--secondary" href="tel:222762227">Czech SAR Team</a></div>`;
  }

  function renderChecklist() {
    const root = $('#checklist');
    root.innerHTML = D.checklist.map((item, i) => {
      const done = Boolean(state.checklist[i]);
      return `<label class="check-item ${done ? 'done' : ''}"><input type="checkbox" data-check="${i}" ${done ? 'checked' : ''}> <span>${esc(item)}</span></label>`;
    }).join('');
    $$('[data-check]').forEach(ch => ch.addEventListener('change', () => {
      state.checklist[ch.dataset.check] = ch.checked;
      saveState();
      renderChecklist();
    }));
  }

  function renderPersonForm() {
    const form = $('#personForm');
    form.innerHTML = D.personFields.map(([id, label, type, options]) => {
      const val = esc(state.person[id] || '');
      if (type === 'textarea') return `<label>${esc(label)}<textarea name="${esc(id)}">${val}</textarea></label>`;
      if (type === 'select') return `<label>${esc(label)}<select name="${esc(id)}">${options.map(o => `<option value="${esc(o)}" ${state.person[id] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
      return `<label>${esc(label)}<input name="${esc(id)}" type="${esc(type)}" value="${val}"></label>`;
    }).join('');
    $$('input, textarea, select', form).forEach(el => el.addEventListener('input', () => {
      state.person[el.name] = el.value;
      saveState();
      validateMinimum(false);
      syncTimelineFromPerson();
    }));
    validateMinimum(false);
  }

  function validateMinimum(showText = true) {
    const missing = [];
    if (!value('fullName')) missing.push('jméno');
    if (!value('lastPlace')) missing.push('poslední známé místo');
    if (!value('lastTime')) missing.push('poslední známý čas');
    if (!value('contactPhone')) missing.push('kontaktní telefon');
    const box = $('#validationBox');
    if (missing.length) {
      box.className = 'notice notice--critical';
      box.textContent = 'Chybí minimum pro hlášení: ' + missing.join(', ') + '. Pokračovat lze, ale doplňte co nejdříve.';
      return false;
    }
    box.className = 'notice';
    box.textContent = showText ? 'Minimum pro hlášení je vyplněno.' : '';
    return true;
  }

  function personSummary() {
    const p = state.person;
    return [
      ['Jméno', p.fullName], ['Datum narození', p.birthDate], ['Věk', p.age], ['Výška', p.height], ['Postava', p.build], ['Vlasy', p.hair], ['Oblečení', p.clothing], ['Specifické znaky', p.marks], ['Zdravotní stav', p.health], ['Léky', p.medication], ['Psychický stav', p.mentalState], ['Sebevražedné riziko', p.suicideRisk], ['Poslední známé místo', p.lastPlace], ['Poslední známý čas', fmtDateTime(p.lastTime)], ['Směr odchodu', p.direction], ['Oblíbená místa', p.favoritePlaces], ['Kontaktní osoba', p.contactName], ['Telefon kontaktní osoby', p.contactPhone], ['Poznámky', p.notes]
    ].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
  }

  function generate(type) {
    validateMinimum(true);
    const p = state.person;
    const base = personSummary() || 'DOPLNIT ÚDAJE O POHŘEŠOVANÉ OSOBĚ.';
    if (type === 'police') return `HLÁŠENÍ PRO POLICII ČR – POHŘEŠOVANÁ OSOBA\n\nŽádám o přijetí oznámení o pohřešované osobě. Nečekáme 24 ani 48 hodin; vzniklo důvodné podezření na pohřešování.\n\n${base}\n\nRizikové okolnosti podle dostupných informací:\n${riskHumanText()}\n\nŽádám o další postup Policie ČR. Budeme postup koordinovat s Policií ČR.\n`;
    if (type === 'sar') return `HLÁŠENÍ PRO CZECH SAR TEAM – POHŘEŠOVANÁ OSOBA\n\nProsíme o krizovou konzultaci k pohřešování osoby v Táboře a okolí. Policii ČR je nutné kontaktovat / informovat a postup koordinovat s ní.\n\n${base}\n\nDůležité pro terén a psy:\n- Poslední známé místo: ${p.lastPlace || 'DOPLNIT'}\n- Poslední známý čas: ${fmtDateTime(p.lastTime) || 'DOPLNIT'}\n- Rizika: ${riskHumanText()}\n- Fotografie: připravena / nutno doplnit\n- Pachové stopy: chránit, nešlapat zbytečně po možných trasách, nemanipulovat s osobními věcmi bez pokynu.\n\nKontakt: ${p.contactName || 'DOPLNIT'} ${p.contactPhone || 'DOPLNIT'}\n`;
    if (type === 'facebook') return `PROSÍME O POMOC SE SDÍLENÍM\n\nPohřešuje se: ${p.fullName || '[jméno doplnit]'}\nPopis: ${[p.height, p.build, p.hair, p.clothing, p.marks].filter(Boolean).join(', ') || '[popis doplnit]'}\nNaposledy viděn/a: ${p.lastPlace || '[místo doplnit]'} ${fmtDateTime(p.lastTime) || ''}\n\nPokud máte relevantní informaci, volejte Policii ČR 158 a kontakt: ${p.contactPhone || '[telefon doplnit]'}.\n\nProsíme: nešiřte neověřené informace, nespekulujte veřejně a sdílejte pouze tento ověřený příspěvek. Děkujeme za pomoc.`;
    return `POHŘEŠOVANÁ OSOBA\n\n${p.fullName || '[jméno]'}\n\nPopis: ${[p.age && p.age + ' let', p.height, p.build, p.hair].filter(Boolean).join(', ') || '[doplnit]'}\nOblečení: ${p.clothing || '[doplnit]'}\nSpecifické znaky: ${p.marks || '[doplnit]'}\nNaposledy viděn/a: ${p.lastPlace || '[doplnit]'} ${fmtDateTime(p.lastTime) || ''}\n\nInformace volejte: Policie ČR 158 nebo kontakt ${p.contactPhone || '[telefon]'}.\nNešiřte neověřené informace. Postup je koordinován s Policií ČR.`;
  }

  function riskHumanText() {
    const yes = D.questions.filter(q => state.risk[q.id] === 'yes').map(q => q.text.replace('?', ''));
    return yes.length ? yes.join('; ') : 'Zatím nejsou v aplikaci označena konkrétní rizika.';
  }

  async function copyGenerated(type) {
    const text = generate(type);
    $('#generatedText').textContent = text;
    try {
      await navigator.clipboard.writeText(text);
      $('#generatedText').textContent = text + '\n\nZKOPÍROVÁNO DO SCHRÁNKY.';
    } catch {
      $('#generatedText').textContent = text + '\n\nKopírování selhalo. Text označte a zkopírujte ručně.';
    }
  }

  function renderContacts() {
    $('#contacts').innerHTML = D.contacts.map(c => `<article class="contact"><h3>${esc(c.name)}</h3><div class="phone-row">${c.phones.map(p => `<a class="phone" href="${phoneHref(p)}">${esc(p)}</a>`).join('')}</div><p>${esc(c.note)}</p></article>`).join('');
  }

  function fillSelects() {
    $$('select[name="state"]', $('#volunteerForm')).forEach(s => s.innerHTML = D.volunteerStates.map(x => `<option>${esc(x)}</option>`).join(''));
    $$('select[name="state"]', $('#areaForm')).forEach(s => s.innerHTML = D.areaStates.map(x => `<option>${esc(x)}</option>`).join(''));
    $('[name="credibility"]', $('#tipForm')).innerHTML = D.credibility.map(x => `<option>${esc(x)}</option>`).join('');
  }

  function bindCoord() {
    ['coordName', 'coordPhone', 'meetingPoint', 'lastUpdate'].forEach(id => {
      const el = $('#' + id);
      el.value = state.coord[id] || '';
      el.addEventListener('input', () => { state.coord[id] = el.value; saveState(); });
    });
  }

  function addFromForm(form, target) {
    const data = Object.fromEntries(new FormData(form).entries());
    data.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
    state[target].push(data);
    saveState();
    form.reset();
    fillSelects();
  }

  function table(rows, cols, target, emptyText) {
    if (!rows.length) return `<p class="notice">${esc(emptyText)}</p>`;
    return `<table><thead><tr>${cols.map(c => `<th>${esc(c[1])}</th>`).join('')}<th>Akce</th></tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${esc(formatCell(r[c[0]]))}</td>`).join('')}<td><button class="small-btn" data-delete="${target}" data-id="${esc(r.id)}">Smazat</button></td></tr>`).join('')}</tbody></table>`;
  }

  function formatCell(v) {
    if (!v) return '';
    if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return fmtDateTime(v);
    return v;
  }

  function bindDeleteButtons() {
    $$('[data-delete]').forEach(btn => btn.addEventListener('click', () => {
      const key = btn.dataset.delete;
      state[key] = state[key].filter(x => x.id !== btn.dataset.id);
      saveState();
      renderLists();
    }));
  }

  function renderLists() {
    $('#volunteers').innerHTML = table(state.volunteers, [['name','Jméno'],['phone','Telefon'],['area','Oblast'],['state','Stav']], 'volunteers', 'Zatím nejsou zapsáni dobrovolníci.');
    $('#areas').innerHTML = table(state.areas, [['name','Oblast'],['terrain','Terén'],['searchedBy','Kdo hledal'],['from','Od'],['to','Do'],['result','Výsledek'],['note','Poznámky'],['state','Stav']], 'areas', 'Zatím nejsou zapsané oblasti.');
    const tips = $('#onlyUnsentTips').checked ? state.tips.filter(t => t.police !== 'ano') : state.tips;
    $('#tips').innerHTML = table(tips, [['who','Kdo'],['phone','Telefon'],['seenTime','Čas'],['place','Místo'],['what','Co viděl'],['credibility','Důvěryhodnost'],['police','Předáno policii'],['note','Poznámka']], 'tips', 'Zatím nejsou zapsané tipy.');
    renderEvents();
    bindDeleteButtons();
  }

  function exportCsv() {
    const cols = ['name','terrain','searchedBy','from','to','result','note','state'];
    const header = ['oblast','teren','kdo_hledal','cas_od','cas_do','vysledek','poznamky','stav'];
    const lines = [header.join(';')].concat(state.areas.map(r => cols.map(c => csvCell(r[c])).join(';')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prohledane-oblasti-tabor.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function csvCell(v) {
    return '"' + String(v ?? '').replace(/"/g, '""') + '"';
  }

  function bindTimeline() {
    ['timeMissing', 'timePolice', 'timeSar', 'timeFb'].forEach(id => {
      const el = $('#' + id);
      el.value = state.timeline[id] || '';
      el.addEventListener('input', () => { state.timeline[id] = el.value; saveState(); renderEvents(); updateTimer(); });
    });
  }

  function syncTimelineFromPerson() {
    if (state.person.lastTime && !state.timeline.timeMissing) {
      state.timeline.timeMissing = state.person.lastTime;
      const el = $('#timeMissing');
      if (el) el.value = state.timeline.timeMissing;
      saveState();
      updateTimer();
      renderEvents();
    }
  }

  function renderEvents() {
    const fixed = [
      ['timeMissing','Čas zmizení'],['timePolice','Nahlášeno Policii ČR'],['timeSar','Kontaktován Czech SAR Team'],['timeFb','Vytvořena FB skupina']
    ].filter(([id]) => state.timeline[id]).map(([id, text]) => ({ time: state.timeline[id], text }));
    const all = fixed.concat(state.events).sort((a,b) => String(a.time).localeCompare(String(b.time)));
    $('#events').innerHTML = all.length ? all.map(e => `<div class="event"><strong>${esc(fmtDateTime(e.time))}</strong><span>${esc(e.text)}</span>${e.id ? ` <button class="small-btn" data-delete="events" data-id="${esc(e.id)}">Smazat</button>` : ''}</div>`).join('') : '<p class="notice">Zatím nejsou zapsané události.</p>';
    bindDeleteButtons();
  }

  function updateTimer() {
    const el = $('#timer');
    const start = state.timeline.timeMissing;
    if (!start) { el.textContent = '00:00:00'; return; }
    const diff = Date.now() - new Date(start).getTime();
    if (diff < 0 || Number.isNaN(diff)) { el.textContent = '00:00:00'; return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = [h,m,s].map(x => String(x).padStart(2,'0')).join(':');
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service worker registrace selhala:', err));
    }
  }

  function bind() {
    $$('[data-copy]').forEach(btn => btn.addEventListener('click', () => copyGenerated(btn.dataset.copy)));
    $('#volunteerForm').addEventListener('submit', e => { e.preventDefault(); addFromForm(e.currentTarget, 'volunteers'); renderLists(); });
    $('#areaForm').addEventListener('submit', e => { e.preventDefault(); addFromForm(e.currentTarget, 'areas'); renderLists(); });
    $('#tipForm').addEventListener('submit', e => { e.preventDefault(); addFromForm(e.currentTarget, 'tips'); renderLists(); });
    $('#eventForm').addEventListener('submit', e => { e.preventDefault(); addFromForm(e.currentTarget, 'events'); renderLists(); });
    $('#onlyUnsentTips').addEventListener('change', renderLists);
    $('#exportAreas').addEventListener('click', exportCsv);
    $('#wipeData').addEventListener('click', () => {
      const ok = confirm('Opravdu smazat všechna uložená data z tohoto zařízení? Tuto akci nelze vrátit zpět.');
      if (!ok) return;
      localStorage.removeItem(D.storageKey);
      state = blankState();
      init();
      location.hash = '#top';
    });
  }

  function init() {
    renderRiskQuestions();
    renderRiskResult();
    renderChecklist();
    renderPersonForm();
    renderContacts();
    fillSelects();
    bindCoord();
    bindTimeline();
    renderLists();
    updateTimer();
  }

  document.addEventListener('DOMContentLoaded', () => {
    init();
    bind();
    registerServiceWorker();
    setInterval(updateTimer, 1000);
  });
})();
