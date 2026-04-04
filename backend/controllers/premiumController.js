// ============================================================
//  controllers/premiumController.js
//  Calcul de la prime — Produit 3414 Bateau de Plaisance
//  Basé sur les taux exacts du fichier Excel Plaisance.xlsx
// ============================================================

// ── Table des taux 34141A ────────────────────────────────────
// Clé : "CODE_VAL_ASSUREE-CODE_AGE_NAVIRE-CODE_TYPE_NAVIRE"
// Valeur : taux en %
const TAUX_34141A = {
  // TYPE 1 = MOTEUR
  '1-1-1': 1.7,  '1-2-1': 1.6,  '1-3-1': 1.6,  '1-4-1': 1.5,
  '2-1-1': 1.6,  '2-2-1': 1.5,  '2-3-1': 1.5,  '2-4-1': 1.4,
  '3-1-1': 1.5,  '3-2-1': 1.4,  '3-3-1': 1.4,  '3-4-1': 1.3,
  '4-1-1': 1.4,  '4-2-1': 1.3,  '4-3-1': 1.3,  '4-4-1': 1.2,
  '5-1-1': 1.3,  '5-2-1': 1.2,  '5-3-1': 1.2,  '5-4-1': 1.2,
  '6-1-1': 1.2,  '6-2-1': 1.1,  '6-3-1': 1.1,  '6-4-1': 1.8,
  '7-1-1': 1.1,  '7-2-1': 1.0,  '7-3-1': 1.0,  '7-4-1': 1.7,
  '8-1-1': 1.0,  '8-2-1': 0.9,  '8-3-1': 0.9,  '8-4-1': 1.6,
  '9-1-1': 0.9,  '9-2-1': 0.8,  '9-3-1': 0.8,  '9-4-1': 1.5,
  '10-1-1': 0.8, '10-2-1': 0.7, '10-3-1': 0.7, '10-4-1': 1.4,
  // TYPE 2 = VOILE
  '1-1-2': 1.9,  '1-2-2': 1.8,  '1-3-2': 2.0,  '1-4-2': 2.2,
  '2-1-2': 1.8,  '2-2-2': 1.7,  '2-3-2': 1.9,  '2-4-2': 2.1,
  '3-1-2': 1.7,  '3-2-2': 1.6,  '3-3-2': 1.8,  '3-4-2': 2.0,
  '4-1-2': 1.6,  '4-2-2': 1.5,  '4-3-2': 1.7,  '4-4-2': 1.9,
  '5-1-2': 1.5,  '5-2-2': 1.4,  '5-3-2': 1.6,  '5-4-2': 1.1,
  '6-1-2': 1.4,  '6-2-2': 1.3,  '6-3-2': 1.5,  '6-4-2': 1.7,
  '7-1-2': 1.3,  '7-2-2': 1.2,  '7-3-2': 1.4,  '7-4-2': 1.6,
  '8-1-2': 1.2,  '8-2-2': 1.1,  '8-3-2': 1.3,  '8-4-2': 1.5,
  '9-1-2': 1.1,  '9-2-2': 1.0,  '9-3-2': 1.2,  '9-4-2': 1.4,
  '10-1-2': 1.0, '10-2-2': 0.9, '10-3-2': 1.1, '10-4-2': 1.3,
};

// ── Tranches de valeur assurée ───────────────────────────────
const TRANCHES_VALEUR = [
  { code: 1,  max: 2000000  },
  { code: 2,  max: 3000000  },
  { code: 3,  max: 4000000  },
  { code: 4,  max: 7000000  },
  { code: 5,  max: 10000000 },
  { code: 6,  max: 13000000 },
  { code: 7,  max: 16000000 },
  { code: 8,  max: 20000000 },
  { code: 9,  max: 25000000 },
  { code: 10, max: Infinity },
];

// ── Tranches d'âge navire ────────────────────────────────────
const TRANCHES_AGE = [
  { code: 1, maxAge: 10  }, // 1 à 10 ans
  { code: 2, maxAge: 15  }, // 11 à 15 ans
  { code: 3, maxAge: 20  }, // 16 à 20 ans
  { code: 4, maxAge: Infinity }, // > 20 ans
];

// ── Taux fixes garanties complémentaires ────────────────────
const TAUX_COMPLEMENTAIRES = {
  '34142A': 5   / 1000,  // 0.5%
  '34142B': 8   / 1000,  // 0.8%
  '34142C': 10  / 1000,  // 1.0%
  '34142D': 1.5 / 1000,  // 0.15%
};

// ── Coefficients de durée ────────────────────────────────────
const COEFF_DUREE = {
  '3_months': 0.35,
  '6_months': 0.60,
  '1_year':   1.00,
};

const TAX_RATE   = 0.07;   // 7%
const STAMP_DUTY = 500.00; // DA fixe

// ── Helpers ──────────────────────────────────────────────────
function getCodeValeur(valeur) {
  const t = TRANCHES_VALEUR.find(t => valeur <= t.max);
  return t ? t.code : 10;
}

function getCodeAge(anneeConstruction) {
  const age = new Date().getFullYear() - anneeConstruction;
  const t = TRANCHES_AGE.find(t => age <= t.maxAge);
  return t ? t.code : 4;
}

function getCodeType(boatType) {
  // 1 = moteur, 2 = voile
  return boatType === 'sailboat' ? 2 : 1;
}

// ── POST /api/premium/simulate ───────────────────────────────
// Body attendu :
// {
//   total_insured_value : 12500000,
//   construction_year   : 2015,
//   boat_type           : "motorboat",   // ou "sailboat"
//   contract_duration   : "1_year",      // "3_months" | "6_months" | "1_year"
//   guarantee_codes     : ["34141A", "34142B", "34142C"]
// }
const simulate = (req, res) => {
  try {
    const {
      total_insured_value,
      construction_year,
      boat_type,
      contract_duration,
      guarantee_codes = [],
    } = req.body;

    // Validation basique
    if (!total_insured_value || !construction_year || !boat_type || !contract_duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: total_insured_value, construction_year, boat_type, contract_duration',
      });
    }

    const valeur = parseFloat(total_insured_value);

    // Codes pour la lookup table
    const codeVal  = getCodeValeur(valeur);
    const codeAge  = getCodeAge(parseInt(construction_year));
    const codeType = getCodeType(boat_type);
    const coeff    = COEFF_DUREE[contract_duration] || 1;

    // ── 1. Prime garantie principale 34141A (TOUJOURS incluse) ──
    const cleTable = `${codeVal}-${codeAge}-${codeType}`;
    const taux34141A = TAUX_34141A[cleTable];

    if (!taux34141A) {
      return res.status(400).json({
        success: false,
        message: `Taux non trouvé pour les paramètres donnés (clé: ${cleTable})`,
      });
    }

    const prime34141A = Math.round(valeur * taux34141A / 100 * 100) / 100;

    // ── 2. Primes garanties complémentaires ──────────────────
    const codes = [...new Set(guarantee_codes)].filter(c => c !== '34141A');
    const detailComplementaires = [];
    let totalComplementaires = 0;

    for (const code of codes) {
      const taux = TAUX_COMPLEMENTAIRES[code];
      if (!taux) continue;
      const prime = Math.round(valeur * taux * 100) / 100;
      totalComplementaires += prime;
      detailComplementaires.push({
        code,
        taux_pct: (taux * 100).toFixed(3) + '%',
        prime,
      });
    }

    // ── 3. Calculs finaux ────────────────────────────────────
    const prime_nette_totale   = prime34141A + totalComplementaires;
    const prime_nette_ajustee  = Math.round(prime_nette_totale * coeff * 100) / 100;
    const montant_taxe         = Math.round(prime_nette_ajustee * TAX_RATE * 100) / 100;
    const prime_totale_ttc     = Math.round((prime_nette_ajustee + montant_taxe + STAMP_DUTY) * 100) / 100;

    // ── Réponse ──────────────────────────────────────────────
    res.json({
      success: true,
      data: {
        // Paramètres utilisés
        valeur_assuree:      valeur,
        type_navire:         boat_type,
        age_navire:          new Date().getFullYear() - parseInt(construction_year),
        duree_contrat:       contract_duration,
        // Détail du calcul
        garantie_principale: {
          code:     '34141A',
          taux_pct: taux34141A + '%',
          prime:    prime34141A,
        },
        garanties_complementaires: detailComplementaires,
        // Totaux
        prime_nette_totale,
        coefficient_duree:   coeff,
        prime_nette_ajustee,
        taxe_7pct:           montant_taxe,
        droit_timbre:        STAMP_DUTY,
        prime_totale_ttc,    // ← MONTANT FINAL À PAYER
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { simulate };