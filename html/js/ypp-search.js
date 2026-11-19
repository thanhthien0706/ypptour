// YPP search helpers — lọc theo tên, gõ không dấu vẫn khớp
function vnorm(x){return (x||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d');}
function filterItems(inp, sel){
  const q = vnorm(inp.value);
  document.querySelectorAll(sel).forEach(c => { c.style.display = vnorm(c.textContent).includes(q) ? '' : 'none'; });
}
function filterSel(inp, selId){
  const sel = document.getElementById(selId);
  if (!sel) return;
  if (!sel._opts) sel._opts = [...sel.options].map(o => ({ v: o.value, t: o.text }));
  const q = vnorm(inp.value), cur = sel.value;
  sel.innerHTML = '';
  sel._opts.filter(o => vnorm(o.t).includes(q)).forEach(o => {
    const op = document.createElement('option'); op.value = o.v; op.textContent = o.t; sel.appendChild(op);
  });
  if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
}
