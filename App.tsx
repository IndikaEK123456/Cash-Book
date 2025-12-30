
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, OutPartyEntry, MainEntry, DeviceView, ExchangeRates } from './types';
import { fetchLkrRates } from './services/exchangeRateService';
import LaptopView from './components/LaptopView';
import MobileView from './components/MobileView';

const LOCAL_STORAGE_KEY = 'shivas_cabanas_v4_master';
const DEFAULT_SYNC_ID = 'shivas-direct-sync-' + Math.random().toString(36).substring(7);

const App: React.FC = () => {
  const [device, setDevice] = useState<DeviceView>(() => {
    const params = new URLSearchParams(window.location.search);
    const forceView = params.get('view') as DeviceView;
    if (forceView) return forceView;
    if (window.innerWidth < 768) return 'ANDROID';
    return 'LAPTOP';
  });
  
  const [rates, setRates] = useState<ExchangeRates>({ usdToLkr: 0, eurToLkr: 0 });
  const [syncId, setSyncId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sid') || localStorage.getItem('shivas_sync_id') || DEFAULT_SYNC_ID;
  });
  
  const [syncStatus, setSyncStatus] = useState<'OFFLINE' | 'SYNCING' | 'LIVE'>('OFFLINE');
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
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

  // 1. Initialize Gun.js with aggressive relay peers
  useEffect(() => {
    // @ts-ignore
    const gun = window.Gun([
      'https://gun-manhattan.herokuapp.com/gun',
      'https://relay.peer.ooo/gun',
      'https://gun-us.herokuapp.com/gun'
    ]);
    gunRef.current = gun;

    const channel = gun.get('shivas_v4').get(syncId);
    setSyncStatus('SYNCING');

    // Subscribe to updates
    channel.on((data: any) => {
      if (data && data.payload) {
        try {
          const remoteState = JSON.parse(data.payload);
          // Only viewers update their state from the network
          // This prevents "fighting" where a mobile device might overwrite the laptop
          if (device !== 'LAPTOP') {
            setState(remoteState);
            setLastUpdateTime(new Date().toLocaleTimeString());
          }
          setSyncStatus('LIVE');
        } catch (e) {
          console.error("Sync error:", e);
        }
      }
    });

    return () => {
      if (gunRef.current) gunRef.current.off();
    };
  }, [syncId, device]);

  // 2. Broadcast updates (LAPTOP ONLY)
  useEffect(() => {
    if (device === 'LAPTOP') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem('shivas_sync_id', syncId);
      
      if (gunRef.current) {
        setSyncStatus('SYNCING');
        gunRef.current.get('shivas_v4').get(syncId).put({ 
          payload: JSON.stringify(state),
          updatedAt: Date.now()
        });
        setSyncStatus('LIVE');
      }
    }
  }, [state, syncId, device]);

  // 3. Currency Rates
  useEffect(() => {
    const loadRates = async () => {
      const newRates = await fetchLkrRates();
      setRates(newRates);
    };
    loadRates();
    const interval = setInterval(loadRates, 300000);
    return () => clearInterval(interval);
  }, []);

  // --- Logic ---
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
    const balancingCashOut = state.mainEntries.reduce((sum, e) => (e.isCard || e.isPayPal) ? sum + e.cashIn : sum, 0);
    const totalCashOut = manualCashOutTotal + balancingCashOut + outPartyTotals.card + outPartyTotals.paypal;
    const ledgerCardTotal = state.mainEntries.reduce((sum, e) => e.isCard ? sum + e.cashIn : sum, 0);
    const ledgerPayPalTotal = state.mainEntries.reduce((sum, e) => e.isPayPal ? sum + e.cashIn : sum, 0);
    const finalCardTotal = ledgerCardTotal + outPartyTotals.card;
    const finalPayPalTotal = ledgerPayPalTotal + outPartyTotals.paypal;
    const drawerBalance = totalCashIn - totalCashOut;
    return { totalCashIn, totalCashOut, drawerBalance, finalCardTotal, finalPayPalTotal };
  }, [state, outPartyTotals]);

  // --- Handlers (Laptop Only) ---
  const addOutPartyEntry = (entry: OutPartyEntry) => {
    if (device !== 'LAPTOP') return;
    setState(prev => ({ ...prev, outPartyEntries: [...prev.outPartyEntries, entry] }));
  };

  const addMainEntry = (entry: MainEntry) => {
    if (device !== 'LAPTOP') return;
    setState(prev => ({ ...prev, mainEntries: [...prev.mainEntries, entry] }));
  };

  const deleteOutParty = (id: string) => {
    if (device !== 'LAPTOP') return;
    setState(prev => ({ ...prev, outPartyEntries: prev.outPartyEntries.filter(e => e.id !== id) }));
  };

  const deleteMain = (id: string) => {
    if (device !== 'LAPTOP') return;
    setState(prev => ({ ...prev, mainEntries: prev.mainEntries.filter(e => e.id !== id) }));
  };

  const endDay = () => {
    if (device !== 'LAPTOP') return;
    if (window.confirm("End Work Day? This clears today's logs and carries the balance forward.")) {
      setState({
        outPartyEntries: [],
        mainEntries: [],
        initialBalance: mainCalculations.drawerBalance
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Dynamic Sync Status Bar */}
      <div className="bg-slate-900 text-white p-3 flex justify-between items-center px-6 sticky top-0 z-50 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${syncStatus === 'LIVE' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-blue-500 live-indicator'}`}></div>
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">{syncStatus}</span>
          </div>
          <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
          <span className="text-[10px] font-black tracking-widest uppercase text-blue-400 hidden sm:block">
            {device === 'LAPTOP' ? 'Master Terminal' : `Live Viewer • ${lastUpdateTime || 'Wait'}`}
          </span>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setDevice('LAPTOP')} className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${device === 'LAPTOP' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>LAPTOP</button>
          <button onClick={() => setDevice('ANDROID')} className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${device === 'ANDROID' ? 'bg-green-600 text-white' : 'text-slate-500'}`}>ANDROID</button>
          <button onClick={() => setDevice('IPHONE')} className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${device === 'IPHONE' ? 'bg-white text-black' : 'text-slate-500'}`}>IPHONE</button>
        </div>
      </div>

      <main className="flex-1 overflow-x-hidden">
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
            isSynced={syncStatus === 'LIVE'}
          />
        )}
      </main>
    </div>
  );
};

export default App;
