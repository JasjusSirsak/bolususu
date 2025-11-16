const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function postRow(url, row, source) {
  const body = {
    name: row.name || `item-${row.id||Date.now()}`,
    metadata: { source, note: row.note || null, price: row.price ? Number(row.price) : null }
  };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`POST failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function importFile(csvPath, source) {
  const text = fs.readFileSync(csvPath,'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines.shift().split(',').map(h=>h.trim());
  const rows = lines.map(ln => {
    const vals = ln.split(',');
    const obj = {};
    header.forEach((h,i)=> obj[h]=vals[i]);
    return obj;
  });

  for (const r of rows) {
    try {
      const created = await postRow('http://localhost:3000/items', r, source);
      console.log('Created', created.id, created.name);
    } catch (e) {
      console.error('Failed to create row', r, e.message);
    }
  }
}

(async ()=>{
  const base = path.join(__dirname,'..','data');
  await importFile(path.join(base,'file1.csv'),'file1.csv');
  await importFile(path.join(base,'file2.csv'),'file2.csv');
})();
