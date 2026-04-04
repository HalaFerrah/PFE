import { createContext, useContext, useMemo, useState } from "react";

const QuoteContext = createContext(null);

const initialState = {
  boatId: "",
  duration: "3_months",
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
  photo_main: null,
  photo_front: null,
  photo_rear: null,
  photo_interior: null,
  photo_engine: null,
  photo_hull: null,
  selectedGuarantees: [],
  estimatedPrice: 0,
  premiumDetails: null
};

export function QuoteProvider({ children }) {
  const [quote, setQuote] = useState(initialState);

  const updateQuote = (updates) => {
    setQuote((prev) => ({ ...prev, ...updates }));
  };

  const runCalculation = () => {
    setQuote((prev) => ({ ...prev, amount: Number(prev.amount || 0) }));
  };

  const toggleGuarantee = (key) => {
    setQuote((prev) => {
      const nextGuarantees = prev.selectedGuarantees.includes(key)
        ? prev.selectedGuarantees.filter((item) => item !== key)
        : [...prev.selectedGuarantees, key];

      return {
        ...prev,
        selectedGuarantees: nextGuarantees
      };
    });
  };

  const resetQuote = () => {
    setQuote(initialState);
  };

  const value = useMemo(() => ({ quote, updateQuote, runCalculation, toggleGuarantee, resetQuote }), [quote]);

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("useQuote must be used inside QuoteProvider");
  }
  return context;
}
