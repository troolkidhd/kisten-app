async function loadKiste() {
  const id = document.getElementById('kisteId').value;
  const res = await fetch(`/api/kiste/${id}`);
  if (!res.ok) {
    document.getElementById('inhalt').innerHTML = '<p>Kiste nicht gefunden</p>';
    return;
  }
  const data = await res.json();
  showInhalt(data);
}

function showInhalt(kiste) {
  const container = document.getElementById('inhalt');
  container.innerHTML = `<h2>${kiste.bezeichnung} (${kiste.id})</h2>`;
  kiste.inhalt.forEach((item, index) => {
    const checked = item.status === 'vorhanden' ? 'checked' : '';
    container.innerHTML += `
      <div>
        <input type="checkbox" id="item${index}" ${checked}
          onchange="toggleStatus('${kiste.id}', ${index}, this.checked)">
        <label for="item${index}">${item.name}</label>
      </div>
    `;
  });
}

async function toggleStatus(kisteId, index, isChecked) {
  const res = await fetch(`/api/kiste/${kisteId}`);
  const kiste = await res.json();
  kiste.inhalt[index].status = isChecked ? 'vorhanden' : 'entnommen';

  await fetch(`/api/kiste/${kisteId}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inhalt: kiste.inhalt })
  });
}

// Suchfunktion
async function searchItem() {
  const term = document.getElementById('searchTerm').value.toLowerCase();
  const res = await fetch('/api/kisten');
  const allKisten = await res.json();

  const results = [];

  allKisten.forEach(kiste => {
    kiste.inhalt.forEach(item => {
      if (item.name.toLowerCase().includes(term)) {
        results.push({ kiste: kiste.id, name: item.name, status: item.status });
      }
    });
  });

  const output = document.getElementById('searchResults');
  if (results.length === 0) {
    output.innerHTML = '<p>Keine Treffer.</p>';
  } else {
    output.innerHTML = results.map(r => `
      <p><strong>${r.name}</strong> in <a href="?kiste=${r.kiste}">${r.kiste}</a> (${r.status})</p>
    `).join('');
  }
}

// Automatisch laden bei ?kiste=K001
window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  const kiste = params.get('kiste');
  if (kiste) {
    document.getElementById('kisteId').value = kiste;
    loadKiste();
  }
};

