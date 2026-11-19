// Đặt sân (demo tĩnh): bảng lịch chọn ngày, dropdown giờ/phút (mốc 15 phút),
// chọn sân; lưu yêu cầu vào localStorage. Giờ tính theo phút kể từ 00:00.
(() => {
  const COURTS = 5;
  const MAX_DAYS = 90;              // đặt trước tối đa 90 ngày
  const DEMO_BUSY_FROM = 6;         // lịch "đã kín" minh họa chỉ nằm trong 06:00–22:00
  const DEMO_BUSY_TO = 21;
  const MINUTE_STEPS = [0, 15, 30, 45];
  const KEY = 'ypp-bookings';
  const DOW_LONG = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const fmt = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
  const dateText = (d) => `${DOW_LONG[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const fmtDur = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    return [h ? `${h} giờ` : '', m ? `${m} phút` : ''].filter(Boolean).join(' ');
  };

  const loadBookings = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  };
  const saveBookings = (list) => {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* bộ nhớ bị chặn: bỏ qua */ }
  };

  // Lịch "đã kín" minh họa: cố định theo ngày/sân/giờ (không ngẫu nhiên giữa các lần tải).
  const demoBusy = (dateKey, court, hour) => {
    let h = 7;
    for (const ch of `${dateKey}|${court}|${hour}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h % 6 === 0;
  };

  // Các khoảng [bắt đầu, kết thúc] (phút) đã kín của một sân trong một ngày, đã gộp liền kề.
  function busyIntervals(date, court) {
    const dk = keyOf(date);
    const list = [];
    for (let h = DEMO_BUSY_FROM; h <= DEMO_BUSY_TO; h++) {
      if (demoBusy(dk, court, h)) list.push([h * 60, (h + 1) * 60]);
    }
    loadBookings().forEach((b) => {
      if (b.date === dk && b.court === court && Number.isFinite(b.start) && Number.isFinite(b.end)) list.push([b.start, b.end]);
    });
    list.sort((x, y) => x[0] - y[0]);
    return list.reduce((acc, cur) => {
      const last = acc[acc.length - 1];
      if (last && cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1]);
      else acc.push([...cur]);
      return acc;
    }, []);
  }

  // ---------- Trạng thái ----------
  const now = new Date();
  const minDate = startOfDay(now);
  const maxDate = addDays(minDate, MAX_DAYS);

  let defDate = minDate;
  let defStart = (now.getHours() + 1) * 60;
  if (defStart >= 23 * 60) { defDate = addDays(minDate, 1); defStart = 8 * 60; }

  const state = {
    date: defDate,
    court: 1,
    mode: 'range',          // 'range' = bắt đầu–kết thúc | 'dur' = bắt đầu + thời lượng
    start: defStart,
    end: defStart + 60,
    dur: 60,
    touched: false,         // chỉ hiện lỗi giờ sau khi người dùng đã thao tác
  };
  let view = { y: defDate.getFullYear(), m: defDate.getMonth() };

  const form = $('form'), done = $('done');
  const stH = $('st-h'), stM = $('st-m'), enH = $('en-h'), enM = $('en-m'), durSel = $('dur');

  // ---------- Kiểm tra giờ ----------
  function check() {
    const { start, end, date, court } = state;
    if (end <= start) return 'Giờ kết thúc phải sau giờ bắt đầu.';
    if (end > 1440) return 'Khung giờ vượt quá 24:00. Hãy chọn giờ bắt đầu sớm hơn hoặc thời lượng ngắn hơn.';
    if (keyOf(date) === keyOf(new Date()) && start <= new Date().getHours() * 60 + new Date().getMinutes()) {
      return 'Giờ bắt đầu đã qua.';
    }
    const hit = busyIntervals(date, court).find(([a, b]) => start < b && end > a);
    if (hit) return `Trùng khung đã kín ${fmt(hit[0])} – ${fmt(hit[1])}.`;
    return '';
  }

  function showError(field, msg) {
    const el = $(`e-${field}`);
    el.textContent = msg;
    el.hidden = !msg;
    const input = $(`f-${field}`);
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  // ---------- Dropdown giờ / phút ----------
  function fill(sel, values, label) {
    sel.innerHTML = '';
    values.forEach((v) => {
      const o = document.createElement('option');
      o.value = String(v);
      o.textContent = label(v);
      sel.appendChild(o);
    });
  }
  const range = (a, b, step = 1) => Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, i) => a + i * step);

  function buildSelects() {
    fill(stH, range(0, 23), pad);
    fill(stM, MINUTE_STEPS, pad);
    fill(enH, range(0, 24), pad);       // 24 = kết thúc đúng nửa đêm
    fill(enM, MINUTE_STEPS, pad);
    fill(durSel, range(30, 360, 30), fmtDur);
  }

  function syncControls() {
    stH.value = String(Math.floor(state.start / 60));
    stM.value = String(state.start % 60);
    const endH = Math.min(Math.floor(state.end / 60), 24);
    enH.value = String(endH);
    enM.value = String(endH === 24 ? 0 : state.end % 60);
    enM.disabled = endH === 24;
    durSel.value = String(state.dur);

    $('end-field').hidden = state.mode !== 'range';
    $('dur-field').hidden = state.mode !== 'dur';
    const note = $('end-note');
    if (state.mode === 'dur') {
      note.hidden = false;
      note.innerHTML = state.end <= 1440
        ? `Kết thúc lúc <b>${fmt(state.end)}</b> (${fmtDur(state.dur)}).`
        : `Kết thúc sau <b>24:00</b> — vượt quá trong ngày.`;
    } else {
      note.hidden = true;
    }
  }

  function onStartChange() {
    state.start = Number(stH.value) * 60 + Number(stM.value);
    if (state.mode === 'dur') state.end = state.start + state.dur;
    else if (state.end <= state.start) state.end = Math.min(state.start + 60, 1440);
    touchAndRefresh();
  }
  function onEndChange() {
    const h = Number(enH.value);
    state.end = h * 60 + (h === 24 ? 0 : Number(enM.value));
    touchAndRefresh();
  }
  function onDurChange() {
    state.dur = Number(durSel.value);
    state.end = state.start + state.dur;
    touchAndRefresh();
  }
  function onModeChange(mode) {
    state.mode = mode;
    if (mode === 'dur') {
      const d = state.end - state.start;
      if (d > 0 && d % 30 === 0 && d <= 360) state.dur = d;
      state.end = state.start + state.dur;
    }
    touchAndRefresh();
  }
  function touchAndRefresh() { state.touched = true; refresh(); }

  // ---------- Hiển thị ----------
  function renderCourts() {
    const wrap = $('courts');
    wrap.innerHTML = '';
    for (let c = 1; c <= COURTS; c++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'court';
      b.textContent = `Sân ${c}`;
      b.setAttribute('aria-pressed', String(c === state.court));
      b.addEventListener('click', () => { state.court = c; renderCourts(); refresh(); });
      wrap.appendChild(b);
    }
  }

  function renderBusy() {
    const wrap = $('busy');
    wrap.innerHTML = '';
    const list = busyIntervals(state.date, state.court);
    if (!list.length) {
      const p = document.createElement('p');
      p.className = 'busy-none';
      p.textContent = 'Chưa có khung nào bị kín.';
      wrap.appendChild(p);
      return;
    }
    list.forEach(([a, b]) => {
      const chip = document.createElement('span');
      chip.className = 'busy-chip';
      chip.textContent = `${fmt(a)} – ${fmt(b)}`;
      wrap.appendChild(chip);
    });
  }

  function timeText() {
    return state.end > state.start && state.end <= 1440
      ? `${fmt(state.start)} – ${fmt(state.end)} (${fmtDur(state.end - state.start)})`
      : '—';
  }

  function refresh() {
    $('date-text').textContent = dateText(state.date);
    $('s-date').textContent = dateText(state.date);
    $('s-court').textContent = `Sân ${state.court}`;
    $('s-time').textContent = timeText();
    syncControls();
    renderBusy();
    if (state.touched) showError('time', check());
  }

  // ---------- Bảng lịch ----------
  const calBtn = $('date-btn'), cal = $('cal'), calGrid = $('cal-grid');
  const ym = (y, m) => y * 12 + m;

  function renderCal() {
    $('cal-title').textContent = `Tháng ${view.m + 1}, ${view.y}`;
    calGrid.innerHTML = '';
    const first = new Date(view.y, view.m, 1);
    const lead = (first.getDay() + 6) % 7;                  // tuần bắt đầu từ Thứ hai
    const total = new Date(view.y, view.m + 1, 0).getDate();
    const selKey = keyOf(state.date), todayKey = keyOf(minDate);

    for (let i = 0; i < lead; i++) {
      const s = document.createElement('span');
      s.className = 'cal-blank';
      calGrid.appendChild(s);
    }
    let firstEnabled = null, selected = null;
    for (let d = 1; d <= total; d++) {
      const dt = new Date(view.y, view.m, d);
      const k = keyOf(dt);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cal-day' + (k === todayKey ? ' is-today' : '');
      b.textContent = String(d);
      b.dataset.date = k;
      b.disabled = dt < minDate || dt > maxDate;
      b.tabIndex = -1;
      b.setAttribute('aria-pressed', String(k === selKey));
      b.setAttribute('aria-label', `${dateText(dt)}${k === todayKey ? ', hôm nay' : ''}`);
      b.addEventListener('click', () => { state.date = dt; state.touched = true; closeCal(true); refresh(); });
      if (!b.disabled && !firstEnabled) firstEnabled = b;
      if (k === selKey) selected = b;
      calGrid.appendChild(b);
    }
    (selected && !selected.disabled ? selected : firstEnabled)?.setAttribute('tabindex', '0');

    $('cal-prev').disabled = ym(view.y, view.m) <= ym(minDate.getFullYear(), minDate.getMonth());
    $('cal-next').disabled = ym(view.y, view.m) >= ym(maxDate.getFullYear(), maxDate.getMonth());
  }

  function openCal() {
    view = { y: state.date.getFullYear(), m: state.date.getMonth() };
    renderCal();
    cal.hidden = false;
    calBtn.setAttribute('aria-expanded', 'true');
    calGrid.querySelector('[tabindex="0"]')?.focus();
  }
  function closeCal(returnFocus) {
    if (cal.hidden) return;
    cal.hidden = true;
    calBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) calBtn.focus();
  }
  function shiftMonth(delta) {
    const d = new Date(view.y, view.m + delta, 1);
    view = { y: d.getFullYear(), m: d.getMonth() };
    renderCal();
  }

  calBtn.addEventListener('click', () => (cal.hidden ? openCal() : closeCal(false)));
  $('cal-prev').addEventListener('click', () => shiftMonth(-1));
  $('cal-next').addEventListener('click', () => shiftMonth(1));
  document.addEventListener('click', (e) => { if (!cal.hidden && !e.target.closest('.datepick')) closeCal(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cal.hidden) { e.preventDefault(); closeCal(true); } });

  // Điều hướng bằng phím mũi tên trong lưới ngày
  const ARROWS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
  calGrid.addEventListener('keydown', (e) => {
    if (!(e.key in ARROWS) || !e.target.matches('.cal-day')) return;
    e.preventDefault();
    const [y, m, d] = e.target.dataset.date.split('-').map(Number);
    const t = new Date(y, m - 1, d + ARROWS[e.key]);
    if (t < minDate || t > maxDate) return;
    if (t.getMonth() !== view.m || t.getFullYear() !== view.y) {
      view = { y: t.getFullYear(), m: t.getMonth() };
      renderCal();
    }
    calGrid.querySelector(`[data-date="${keyOf(t)}"]`)?.focus();
  });

  // ---------- Sự kiện giờ ----------
  [stH, stM].forEach((s) => s.addEventListener('change', onStartChange));
  [enH, enM].forEach((s) => s.addEventListener('change', onEndChange));
  durSel.addEventListener('change', onDurChange);
  document.querySelectorAll('input[name="mode"]').forEach((r) =>
    r.addEventListener('change', () => r.checked && onModeChange(r.value)));

  // ---------- Form ----------
  const PHONE_RE = /^(0|\+84)\d{9}$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('f-name').value.trim();
    const phone = $('f-phone').value.replace(/[\s.-]/g, '');
    let firstBad = null;

    state.touched = true;
    const timeErr = check();
    showError('time', timeErr);
    if (timeErr) firstBad = stH;
    if (!name) { showError('name', 'Vui lòng nhập họ và tên.'); firstBad = firstBad || $('f-name'); }
    else showError('name', '');
    if (!PHONE_RE.test(phone)) { showError('phone', 'Số điện thoại cần 10 chữ số, ví dụ 0912345678.'); firstBad = firstBad || $('f-phone'); }
    else showError('phone', '');

    if (firstBad) { firstBad.focus(); return; }

    const code = `HGL-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    saveBookings([...loadBookings(), {
      code,
      date: keyOf(state.date),
      court: state.court,
      start: state.start,
      end: state.end,
      name,
      phone,
      note: $('f-note').value.trim(),
      createdAt: new Date().toISOString(),
    }]);

    $('d-code').textContent = code;
    const sum = $('d-summary');
    sum.innerHTML = '';
    [
      ['Ngày', dateText(state.date)],
      ['Sân', `Sân ${state.court}`],
      ['Giờ', timeText()],
      ['Người đặt', name],
    ].forEach(([k, v]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      row.append(dt, dd);
      sum.appendChild(row);
    });

    form.hidden = true;
    done.hidden = false;
    done.focus();
    refresh();                                // khung vừa đặt hiện trong danh sách "đã kín"
  });

  $('again').addEventListener('click', () => {
    form.reset();
    state.touched = false;
    showError('time', '');
    done.hidden = true;
    form.hidden = false;
    refresh();
    $('f-name').focus();
  });

  buildSelects();
  renderCourts();
  refresh();
})();
