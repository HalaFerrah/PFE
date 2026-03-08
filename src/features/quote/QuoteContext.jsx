import { createContext, useContext, useMemo, useState } from "react";

const QuoteContext = createContext(null);

const OPTIONAL_GUARANTEE_RATES = {
  theft: 0.08,
  fire: 0.06,
  natural: 0.07,
  towing: 0.04,
  crew: 0.05
};

const initialState = {
  duration: "3",
  startDate: "",
  endDate: "",
  boatName: "",
  type: "",
  material: "",
  power: 0,
  yearConstruction: "",
  grossTonnage: 0,
  length: 0,
  width: 0,
  amount: 0,
  selectedGuarantees: [],
  estimatedPrice: 0
};

export function calculateAmount(data) {
  const power = Number(data.power || 0) * 2.5;
  const tonnage = Number(data.grossTonnage || 0) * 5.2;
  const length = Number(data.length || 0) * 35;
  const width = Number(data.width || 0) * 22;
  const agePenalty = data.yearConstruction ? Math.max(0, new Date().getFullYear() - Number(data.yearConstruction)) * 1.4 : 0;
  const typeFactor = data.type === "yacht" ? 1.35 : data.type === "motorboat" ? 1.2 : 1.08;

  const raw = (850 + power + tonnage + length + width + agePenalty) * typeFactor;
  return Math.max(0, Math.round(raw));
}

function calculatePrice(data) {
  const amount = Number(data.amount || 0);
  const durationFactor = data.duration === "12" ? 1.8 : data.duration === "6" ? 1.25 : 1;
  const mandatoryGuarantee = amount * 0.18;
  const optionalGuarantee = (data.selectedGuarantees || []).reduce(
    (acc, key) => acc + amount * (OPTIONAL_GUARANTEE_RATES[key] || 0),
    0
  );

  return Math.round(amount * durationFactor + mandatoryGuarantee + optionalGuarantee);
}

export function QuoteProvider({ children }) {
  const [quote, setQuote] = useState(initialState);

  const updateQuote = (updates) => {
    setQuote((prev) => ({ ...prev, ...updates }));
  };

  const runCalculation = () => {
    setQuote((prev) => {
      const amount = calculateAmount(prev);
      return { ...prev, amount, estimatedPrice: calculatePrice({ ...prev, amount }) };
    });
  };

  const toggleGuarantee = (key) => {
    setQuote((prev) => {
      const nextGuarantees = prev.selectedGuarantees.includes(key)
        ? prev.selectedGuarantees.filter((item) => item !== key)
        : [...prev.selectedGuarantees, key];

      return {
        ...prev,
        selectedGuarantees: nextGuarantees,
        estimatedPrice: calculatePrice({ ...prev, selectedGuarantees: nextGuarantees })
      };
    });
  };

  const value = useMemo(() => ({ quote, updateQuote, runCalculation, toggleGuarantee }), [quote]);

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("useQuote must be used inside QuoteProvider");
  }
  return context;
}
