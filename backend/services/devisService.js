const COUT_POLICE = 500;
const TIMBRE_PAR_PAGE = 60;
const NB_PAGES = 2;
const TVA = 0.19;

const calculerDevis = ({ boat_type, construction_year, total_insured_value, garanties }) => {
  const codeVal  = getCodeValeur(total_insured_value);
  const codeAge  = getCodeAge(construction_year);
  const codeType = getCodeType(boat_type);

  const resultat = { detail: {} };

  // ── Garanties ──────────────────────────────────────────
  let prime_nette = 0;

  if (garanties.includes('34141A')) {
    const cle  = `${codeVal}-${codeAge}-${codeType}`;
    const taux = TAUX_34141A[cle];
    if (!taux) throw new Error(`Taux introuvable pour la clé ${cle}`);
    const prime = total_insured_value * taux / 100;
    resultat.detail['34141A'] = { taux: `${taux}%`, prime: Math.round(prime) };
    prime_nette += prime;
  }

  if (garanties.includes('34142A')) {
    const prime = total_insured_value * 5 / 1000;
    resultat.detail['34142A'] = { taux: '5‰', prime: Math.round(prime) };
    prime_nette += prime;
  }

  if (garanties.includes('34142B')) {
    const prime = total_insured_value * 8 / 1000;
    resultat.detail['34142B'] = { taux: '8‰', prime: Math.round(prime) };
    prime_nette += prime;
  }

  if (garanties.includes('34142C')) {
    const prime = total_insured_value * 10 / 1000;
    resultat.detail['34142C'] = { taux: '10‰', prime: Math.round(prime) };
    prime_nette += prime;
  }

  if (garanties.includes('34142D')) {
    const prime = total_insured_value * 1.5 / 1000;
    resultat.detail['34142D'] = { taux: '1.5‰', prime: Math.round(prime) };
    prime_nette += prime;
  }

  // ── Frais et taxes ─────────────────────────────────────
  const tva          = Math.round(prime_nette * TVA);
  const timbre       = TIMBRE_PAR_PAGE * NB_PAGES;       // 120 DA
  const cout_police  = COUT_POLICE;                       // 500 DA

  const prime_totale = Math.round(prime_nette) + tva + timbre + cout_police;

  return {
    prime_nette:   Math.round(prime_nette),
    tva,
    timbre,
    cout_police,
    prime_totale,
    detail:        resultat.detail,
    infos:         { codeVal, codeAge, codeType }
  };
};