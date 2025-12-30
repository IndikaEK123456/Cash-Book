
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, OutPartyEntry, MainEntry, DeviceView, ExchangeRates } from './types';
import { fetchLkrRates } from './services/exchangeRateService';
import LaptopView from './components/LaptopView';
import MobileView from './components/MobileView';

// Use a stable local storage key
const LOCAL_STORAGE_KEY = 'shivas_beach_cabanas_v2_sync';
// Default Sync ID if none exists
const DEFAULT_SYNC_ID = 'shivas-beach-default-sync';

const App: React.FC = () => {
  const [device, setDevice] = useState<DeviceView>('LAPTOP');
  const [rates, setRates] = useState<ExchangeRates>({ usdToLkr: 0, eurToLkr: 0 });
  const [syncId, setSyncId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sid') || localStorage.getItem('shivas_sync_id') || DEFAULT_SYNC_ID;
  });
  const [isSynced, setIsSynced] = useState(false);
  
  const gunRef = useRef<any>(null);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      outPartyEntries: [],
      mainEntries: [],
      initialBalance: 0
    };
  });

  // Initialize Gun.js
  useEffect(() => {
    // @ts-ignore - Gun is loaded via CDN
    const gun = window.Gun(['https://gun-manhattan.herokuapp.com/gun']);
    gunRef.current = gun;

    const channel = gun.get('shivas_cabanas_v1').get(syncId);
    
    // Listen for remote updates (Mobile Viewer mode)
    channel.on((data: any) => {
      if (data) {
        // Gun returns flattened objects, we need to handle JSON strings for our complex state
        try {
          const parsedState = typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload;
          if (parsedState) {
            setState(parsedState);
            setIsSynced(true);
            setTimeout(() => setIsSynced(false), 2000); // Visual feedback
          }
        } catch (e) {
          console.error("Sync parsing error", e);
        }
      }
    });

    return () => {
      if (gunRef.current) gunRef.current.off();
    };
  }, [syncId]);

  // Sync state to LocalStorage and Cloud (if Laptop)
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem('shivas_sync_id', syncId);
    
    // Only 'broadcasting' from Laptop (Editor)
    if (device === 'LAPTOP' && gunRef.current) {
      gunRef.current.get('shivas_cabanas_v1').get(syncId).put({ 
        payload: JSON.stringify(state),
        timestamp: Date.now()
      });
      setIsSynced(true);
      setTimeout(() => setIsSynced(false), 1000);
    }
  }, [state, syncId, device]);

  useEffect(() => {
    const loadRates = async () => {
      const newRates = await fetchLkrRates();
      setRates(newRates);
    };
    loadRates();
    const interval = setInterval(loadRates, 300000);
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
    
    const ledgerCardTotal = state.mainEntries.reduce((sum, e) => e.isCard ? sum + e.cashIn : sum, 0);
    const ledgerPayPalTotal = state.mainEntries.reduce((sum, e) => e.isPayPal ? sum + e.cashIn : sum, 0);

    const finalCardTotal = ledgerCardTotal + outPartyTotals.card;
    const finalPayPalTotal = ledgerPayPalTotal + outPartyTotals.paypal;
    const drawerBalance = totalCashIn - totalCashOut;

    return { totalCashIn, totalCashOut, drawerBalance, finalCardTotal, finalPayPalTotal };
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
    const confirmed = window.confirm("Are you sure you want to End the Day? This clears today's records and carries the balance forward.");
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
      <div className="bg-slate-900 text-white p-2 flex justify-center items-center space-x-4 sticky top-0 z-50 shadow-md">
        <div className="flex space-x-2 mr-4 border-r border-slate-700 pr-4">
          <div className={`w-3 h-3 rounded-full ${isSynced ? 'bg-green-500 animate-sync' : 'bg-slate-600'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {isSynced ? 'Synced' : 'Cloud Ready'}
          </span>
        </div>
        <button 
          onClick={() => setDevice('LAPTOP')} 
          className={`px-4 py-1 rounded-full text-[10px] font-black transition-all ${device === 'LAPTOP' ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}
        >
          LAPTOP EDITOR
        </button>
        <button 
          onClick={() => setDevice('ANDROID')} 
          className={`px-4 py-1 rounded-full text-[10px] font-black transition-all ${device === 'ANDROID' ? 'bg-green-600' : 'bg-slate-800 text-slate-500'}`}
        >
          ANDROID VIEW
        </button>
        <button 
          onClick={() => setDevice('IPHONE')} 
          className={`px-4 py-1 rounded-full text-[10px] font-black transition-all ${device === 'IPHONE' ? 'bg-white text-black' : 'bg-slate-800 text-slate-500'}`}
        >
          IPHONE VIEW
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
            syncId={syncId}
            onSyncIdChange={setSyncId}
          />
        ) : (
          <MobileView 
            device={device}
            state={state}
            rates={rates}
            calculations={mainCalculations}
            outPartyTotals={outPartyTotals}
            syncId={syncId}
            isSynced={isSynced}
          />
        )}
      </main>
    </div>
  );
};

export default App;
