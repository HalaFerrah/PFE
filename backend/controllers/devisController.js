const TAUX_34141A = {
  '1-1-1':1.7,'1-2-1':1.6,'1-3-1':1.6,'1-4-1':1.5,
  '2-1-1':1.6,'2-2-1':1.5,'2-3-1':1.5,'2-4-1':1.4,
  '3-1-1':1.5,'3-2-1':1.4,'3-3-1':1.4,'3-4-1':1.3,
  '4-1-1':1.4,'4-2-1':1.3,'4-3-1':1.3,'4-4-1':1.2,
  '5-1-1':1.3,'5-2-1':1.2,'5-3-1':1.2,'5-4-1':1.2,
  '6-1-1':1.2,'6-2-1':1.1,'6-3-1':1.1,'6-4-1':1.8,
  '7-1-1':1.1,'7-2-1':1.0,'7-3-1':1.0,'7-4-1':1.7,
  '8-1-1':1.0,'8-2-1':0.9,'8-3-1':0.9,'8-4-1':1.6,
  '9-1-1':0.9,'9-2-1':0.8,'9-3-1':0.8,'9-4-1':1.5,
  '10-1-1':0.8,'10-2-1':0.7,'10-3-1':0.7,'10-4-1':1.4,
  '1-1-2':1.9,'1-2-2':1.8,'1-3-2':2.0,'1-4-2':2.2,
  '2-1-2':1.8,'2-2-2':1.7,'2-3-2':1.9,'2-4-2':2.1,
  '3-1-2':1.7,'3-2-2':1.6,'3-3-2':1.8,'3-4-2':2.0,
  '4-1-2':1.6,'4-2-2':1.5,'4-3-2':1.7,'4-4-2':1.9,
  '5-1-2':1.5,'5-2-2':1.4,'5-3-2':1.6,'5-4-2':1.1,
  '6-1-2':1.4,'6-2-2':1.3,'6-3-2':1.5,'6-4-2':1.7,
  '7-1-2':1.3,'7-2-2':1.2,'7-3-2':1.4,'7-4-2':1.6,
  '8-1-2':1.2,'8-2-2':1.1,'8-3-2':1.3,'8-4-2':1.5,
  '9-1-2':1.1,'9-2-2':1.0,'9-3-2':1.2,'9-4-2':1.4,
  '10-1-2':1.0,'10-2-2':0.9,'10-3-2':1.1,'10-4-2':1.3,
};

const TRANCHES_VALEUR = [
  {code:1,max:2000000},{code:2,max:3000000},{code:3,max:4000000},
  {code:4,max:7000000},{code:5,max:10000000},{code:6,max:13000000},
  {code:7,max:16000000},{code:8,max:20000000},{code:9,max:25000000},
  {code:10,max:Infinity},
];

const TRANCHES_AGE = [
  {code:1,max:10},{code:2,max:15},{code:3,max:20},{code:4,max:Infinity},
];

function getCodeVal(v)  { return (TRANCHES_VALEUR.find(t => v <= t.max) || {code:10}).code; }
function getCodeAge(yr) { const age = new Date().getFullYear() - yr; return (TRANCHES_AGE.find(t => age <= t.max) || {code:4}).code; }
function getCodeType(t) { return t === 'sailboat' ? 2 : 1; }

const calculer = (req, res) => {
  try {
    const { boat_type, construction_year, total_insured_value, garanties } = req.body;

    if (!total_insured_value || !construction_year || !garanties || garanties.length === 0) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    const codeVal  = getCodeVal(total_insured_value);
    const codeAge  = getCodeAge(construction_year);
    const codeType = getCodeType(boat_type);
    const cle      = `${codeVal}-${codeAge}-${codeType}`;
    const taux     = TAUX_34141A[cle];

    if (!taux) {
      return res.status(400).json({ success: false, message: `Taux introuvable pour clé ${cle}` });
    }

    let prime_nette = 0;
    const detail = {};

    if (garanties.includes('34141A')) {
      const prime = Math.round(total_insured_value * taux / 100 * 100) / 100;
      detail['34141A'] = { taux: `${taux}%`, prime };
      prime_nette += prime;
    }
    if (garanties.includes('34142A')) {
      const prime = Math.round(total_insured_value * 5 / 1000 * 100) / 100;
      detail['34142A'] = { taux: '5‰', prime };
      prime_nette += prime;
    }
    if (garanties.includes('34142B')) {
      const prime = Math.round(total_insured_value * 8 / 1000 * 100) / 100;
      detail['34142B'] = { taux: '8‰', prime };
      prime_nette += prime;
    }
    if (garanties.includes('34142C')) {
      const prime = Math.round(total_insured_value * 10 / 1000 * 100) / 100;
      detail['34142C'] = { taux: '10‰', prime };
      prime_nette += prime;
    }
    if (garanties.includes('34142D')) {
      const prime = Math.round(total_insured_value * 1.5 / 1000 * 100) / 100;
      detail['34142D'] = { taux: '1.5‰', prime };
      prime_nette += prime;
    }

    const cout_police = 500;
    const timbre      = 120;   // 2 pages × 60 DA
    const tva         = Math.round((prime_nette + cout_police) * 0.19 * 100) / 100;
    const prime_totale = Math.round((prime_nette + cout_police + tva + timbre) * 100) / 100;

    res.json({
      success: true,
      data: { prime_nette, tva, timbre, cout_police, prime_totale, detail,
              infos: { codeVal, codeAge, codeType, cle } }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { calculer };