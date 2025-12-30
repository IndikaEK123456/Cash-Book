
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, OutPartyEntry, MainEntry, DeviceView, ExchangeRates } from './types';
import { fetchLkrRates } from './services/exchangeRateService';
import LaptopView from './components/LaptopView';
import MobileView from './components/MobileView';

const LOCAL_STORAGE_KEY = 'shivas_cabanas_v3';
const DEFAULT_SYNC_ID = 'shivas-main-branch';

const App: React.FC = () => {
  const [device, setDevice] = useState<DeviceView>(() => {
    // Auto-detect view based on screen width if not specified
    if (window.innerWidth < 768) return 'ANDROID';
    return 'LAPTOP';
  });
  
  const [rates, setRates] = useState<ExchangeRates>({ usdToLkr: 0, eurToLkr: 0 });
  const [syncId, setSyncId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sid') || localStorage.getItem('shivas_sync_id') || DEFAULT_SYNC_ID;
  });
  
  const [syncStatus, setSyncStatus] = useState<'OFFLINE' | 'SYNCING' | 'LIVE'>('OFFLINE');
  const gunRef = useRef<any>(null);
  const ignoreNextUpdate = useRef(false);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      outPartyEntries: [],
      mainEntries: [],
      initialBalance: 0
    };
  });

  // 1. Initialize Gun.js with multiple relays for redundancy
  useEffect(() => {
    // @ts-ignore
    const gun = window.Gun([
      'https://gun-manhattan.herokuapp.com/gun',
      'https://gun-server.herokuapp.com/gun',
      'https://relay.peer.ooo/gun'
    ]);
    gunRef.current = gun;

    const channel = gun.get('shivas_beach_v3').get(syncId);
    setSyncStatus('SYNCING');

    // Listen for remote updates
    channel.on((data: any) => {
      if (data && data.payload) {
        try {
          const remoteState = JSON.parse(data.payload);
          // Only update local state if we are a VIEWER or if the remote timestamp is newer
          // (Mobile views should always follow the cloud)
          if (device !== 'LAPTOP') {
            ignoreNextUpdate.current = true;
            setState(remoteState);
          }
          setSyncStatus('LIVE');
          setTimeout(() => setSyncStatus('LIVE'), 1000);
        } catch (e) {
          console.error("Sync error:", e);
        }
      }
    });

    return () => {
      if (gunRef.current) gunRef.current.off();
    };
  }, [syncId, device]);

  // 2. Broadcast state (ONLY if LAPTOP)
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem('shivas_sync_id', syncId);
    
    // Only 'LAPTOP' is the Master Broadcaster
    if (device === 'LAPTOP' && gunRef.current) {
      if (ignoreNextUpdate.current) {
        ignoreNextUpdate.current = false;
        return;
      }
      
      setSyncStatus('SYNCING');
      gunRef.current.get('shivas_beach_v3').get(syncId).put({ 
        payload: JSON.stringify(state),
        sender: 'LAPTOP-MASTER',
        timestamp: Date.now()
      });
      
      // Artificial delay to show sync status
      const timer = setTimeout(() => setSyncStatus('LIVE'), 500);
      return () => clearTimeout(timer);
    }
  }, [state, syncId, device]);

  // 3. Auto-load Rates
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
    const balancingCashOut = state.mainEntries.reduce((sum, e) => (e.isCard || e.isPayPal) ? sum + e.cashIn : sum, 0);
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
    if (window.confirm("End Day: Clear records and carry LKR " + mainCalculations.drawerBalance.toLocaleString() + " forward?")) {
      setState({
        outPartyEntries: [],
        mainEntries: [],
        initialBalance: mainCalculations.drawerBalance
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Platform Switcher & Sync Status */}
      <div className="bg-slate-900 text-white p-3 flex flex-wrap justify-center items-center gap-3 sticky top-0 z-50 shadow-xl border-b border-white/5">
        <div className="flex items-center space-x-3 px-4 border-r border-slate-700">
          <div className={`w-3 h-3 rounded-full ${
            syncStatus === 'LIVE' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 
            syncStatus === 'SYNCING' ? 'bg-blue-500 live-indicator' : 'bg-slate-600'
          }`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
            {syncStatus} {device === 'LAPTOP' ? '• BROADCASTING' : '• RECEIVING'}
          </span>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button onClick={() => setDevice('LAPTOP')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${device === 'LAPTOP' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>LAPTOP</button>
          <button onClick={() => setDevice('ANDROID')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${device === 'ANDROID' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500'}`}>ANDROID</button>
          <button onClick={() => setDevice('IPHONE')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${device === 'IPHONE' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}>IPHONE</button>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8">
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
