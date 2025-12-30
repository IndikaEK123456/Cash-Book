
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, OutPartyEntry, MainEntry, DeviceView, ExchangeRates } from './types';
import { fetchLkrRates } from './services/exchangeRateService';
import LaptopView from './components/LaptopView';
import MobileView from './components/MobileView';

const LOCAL_STORAGE_KEY = 'shivas_beach_cabanas_data_v1';

const App: React.FC = () => {
  const [device, setDevice] = useState<DeviceView>('LAPTOP');
  const [rates, setRates] = useState<ExchangeRates>({ usdToLkr: 0, eurToLkr: 0 });
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      outPartyEntries: [],
      mainEntries: [],
      initialBalance: 0
    };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const loadRates = async () => {
      const newRates = await fetchLkrRates();
      setRates(newRates);
    };
    loadRates();
    const interval = setInterval(loadRates, 300000); // Update every 5 mins
    return () => clearInterval(interval);
  }, []);

  // --- Calculations ---

  const outPartyTotals = useMemo(() => {
    return state.outPartyEntries.reduce(
      (acc, curr) => ({
        cash: acc.cash + curr.cash,
        card: acc.card + curr.card,
        paypal: acc.paypal + curr.paypal,
      }),
      { cash: 0, card: 0, paypal: 0 }
    );
  }, [state.outPartyEntries]);

  const mainCalculations = useMemo(() => {
    const manualCashInTotal = state.mainEntries.reduce((sum, e) => sum + e.cashIn, 0);
    const totalCashIn = state.initialBalance + manualCashInTotal + outPartyTotals.cash + outPartyTotals.card + outPartyTotals.paypal;

    const manualCashOutTotal = state.mainEntries.reduce((sum, e) => sum + e.cashOut, 0);
    const balancingCashOut = state.mainEntries.reduce((sum, e) => {
      if (e.isCard || e.isPayPal) return sum + e.cashIn;
      return sum;
    }, 0);

    const totalCashOut = manualCashOutTotal + balancingCashOut + outPartyTotals.card + outPartyTotals.paypal;
    
    // Ledger totals (main section only)
    const ledgerCardTotal = state.mainEntries.reduce((sum, e) => e.isCard ? sum + e.cashIn : sum, 0);
    const ledgerPayPalTotal = state.mainEntries.reduce((sum, e) => e.isPayPal ? sum + e.cashIn : sum, 0);

    // Final combined totals
    const finalCardTotal = ledgerCardTotal + outPartyTotals.card;
    const finalPayPalTotal = ledgerPayPalTotal + outPartyTotals.paypal;

    const drawerBalance = totalCashIn - totalCashOut;

    return {
      totalCashIn,
      totalCashOut,
      drawerBalance,
      finalCardTotal,
      finalPayPalTotal,
      ledgerCardTotal,
      ledgerPayPalTotal
    };
  }, [state, outPartyTotals]);

  // --- Actions ---

  const addOutPartyEntry = (entry: OutPartyEntry) => {
    setState(prev => ({ ...prev, outPartyEntries: [...prev.outPartyEntries, entry] }));
  };

  const addMainEntry = (entry: MainEntry) => {
    setState(prev => ({ ...prev, mainEntries: [...prev.mainEntries, entry] }));
  };

  const deleteOutParty = (id: string) => {
    setState(prev => ({ ...prev, outPartyEntries: prev.outPartyEntries.filter(e => e.id !== id) }));
  };

  const deleteMain = (id: string) => {
    setState(prev => ({ ...prev, mainEntries: prev.mainEntries.filter(e => e.id !== id) }));
  };

  const endDay = () => {
    const confirmed = window.confirm("Are you sure you want to End the Day? This will clear today's records and carry the balance forward.");
    if (confirmed) {
      setState(prev => ({
        outPartyEntries: [],
        mainEntries: [],
        initialBalance: mainCalculations.drawerBalance
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Platform Switcher */}
      <div className="bg-slate-900 text-white p-2 flex justify-center space-x-4 sticky top-0 z-50 shadow-md">
        <button 
          onClick={() => setDevice('LAPTOP')} 
          className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${device === 'LAPTOP' ? 'bg-blue-500 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-700 opacity-60 hover:opacity-100'}`}
        >
          💻 Laptop (Editor)
        </button>
        <button 
          onClick={() => setDevice('ANDROID')} 
          className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${device === 'ANDROID' ? 'bg-green-500 scale-105 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-slate-700 opacity-60 hover:opacity-100'}`}
        >
          🤖 Android (Viewer)
        </button>
        <button 
          onClick={() => setDevice('IPHONE')} 
          className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${device === 'IPHONE' ? 'bg-white text-black scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-slate-700 opacity-60 hover:opacity-100'}`}
        >
          🍎 iPhone (Viewer)
        </button>
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {device === 'LAPTOP' ? (
          <LaptopView 
            state={state} 
            rates={rates}
            calculations={mainCalculations}
            outPartyTotals={outPartyTotals}
            onAddOutParty={addOutPartyEntry}
            onAddMain={addMainEntry}
            onDeleteOutParty={deleteOutParty}
            onDeleteMain={deleteMain}
            onEndDay={endDay}
          />
        ) : (
          <MobileView 
            device={device}
            state={state}
            rates={rates}
            calculations={mainCalculations}
            outPartyTotals={outPartyTotals}
          />
        )}
      </main>
    </div>
  );
};

export default App;
