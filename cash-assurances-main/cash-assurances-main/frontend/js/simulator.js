const API = 'http://localhost:3000/api';

function fmt(n) {
  return parseFloat(n).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DA';
}

async function simulate() {
  const tiv  = parseFloat(document.getElementById('tiv').value);
  const year = parseInt(document.getElementById('construction_year').value);
  const type = document.getElementById('boat_type').value;
  const dur  = document.getElementById('duration').value;
  const codes = [...document.querySelectorAll('.g-check:checked')].map(c => c.value);

  if (!tiv || !year) {
    alert('Veuillez remplir la valeur assurée et l\'année de construction.');
    return;
  }

  const btn = document.getElementById('btn-simulate');
  btn.textContent = 'Calcul en cours…';
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/premium/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        total_insured_value: tiv,
        construction_year:   year,
        boat_type:           type,
        contract_duration:   dur,
        guarantee_codes:     codes,
      }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const d = data.data;
    document.getElementById('r-main').textContent     = fmt(d.garantie_principale.prime);
    document.getElementById('r-adjusted').textContent = fmt(d.prime_nette_ajustee);
    document.getElementById('r-tva').textContent      = fmt(d.taxe_7pct || 0);
    document.getElementById('r-total').textContent    = fmt(d.prime_totale_ttc || 0);

    if (d.garanties_complementaires && d.garanties_complementaires.length > 0) {
      const optTotal = d.garanties_complementaires.reduce((s, g) => s + g.prime, 0);
      document.getElementById('r-options').textContent = fmt(optTotal);
      document.getElementById('r-options-row').style.display = 'flex';
    }

    localStorage.setItem('sim_result', JSON.stringify({
      tiv, construction_year: year, boat_type: type,
      contract_duration: dur, guarantee_codes: codes,
      result: d,
    }));

    document.getElementById('result-box').style.display = 'block';
    document.getElementById('result-box').scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    alert('Erreur: ' + err.message);
  } finally {
    btn.textContent = 'Calculer ma prime';
    btn.disabled = false;
  }
}