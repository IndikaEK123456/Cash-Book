
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, OutPartyEntry, MainEntry, DeviceView, ExchangeRates } from './types';
import { fetchLkrRates } from './services/exchangeRateService';
import LaptopView from './components/LaptopView';
import MobileView from './components/MobileView';

const LOCAL_STORAGE_KEY = 'shivas_v7_master_store';
const STABLE_CHANNEL = 'shivas-beach-v7-ultra';

const App: React.FC = () => {
  const [device, setDevice] = useState<DeviceView>(() => {
    const params = new URLSearchParams(window.location.search);
    const forceView = params.get('view') as DeviceView;
    if (forceView) return forceView;
    return window.innerWidth < 768 ? 'ANDROID' : 'LAPTOP';
  });
  
  const [rates, setRates] = useState<ExchangeRates>({ usdToLkr: 0, eurToLkr: 0 });
  const [syncId, setSyncId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sid') || localStorage.getItem('shivas_sync_id') || STABLE_CHANNEL;
  });
  
  const [syncStatus, setSyncStatus] = useState<'OFFLINE' | 'SEARCHING' | 'LIVE'>('OFFLINE');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const gunRef = useRef<any>(null);
  const lastPulseRef = useRef<number>(0);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      outPartyEntries: [],
      mainEntries: [],
      initialBalance: 0
    };
  });

  // 1. Core Sync Setup
  useEffect(() => {
    // Connect to 3 high-availability relays for redundancy
    // @ts-ignore
    const gun = window.Gun({
      peers: [
        'https://gun-manhattan.herokuapp.com/gun',
        'https://relay.peer.ooo/gun',
        'https://gun-us.herokuapp.com/gun'
      ],
      localStorage: false
    });
    gunRef.current = gun;

    const channel = gun.get('shivas_v7_stream').get(syncId);
    setSyncStatus('SEARCHING');

    // Listen for EVERYTHING on the channel
    channel.on((data: any) => {
      if (!data) return;

      // Update sync status if we hear any pulse or see data
      setSyncStatus('LIVE');
      lastPulseRef.current = Date.now();

      if (data.payload && device !== 'LAPTOP') {
        try {
          const remoteState = JSON.parse(data.payload);
          // Only update if it's a newer version or first load
          setState(remoteState);
          setLastSyncTime(new Date().toLocaleTimeString());
        } catch (e) {
          console.error("Payload parse error", e);
        }
      }
    });

    // Connection Watchdog: If no pulse for 10 seconds, go OFFLINE
    const watchdog = setInterval(() => {
      if (Date.now() - lastPulseRef.current > 10000) {
        setSyncStatus('SEARCHING');
      }
    }, 5000);

    return () => {
      if (gunRef.current) gunRef.current.off();
      clearInterval(watchdog);
    };
  }, [syncId, device]);

  // 2. Master Broadcaster (Laptop)
  useEffect(() => {
    if (device === 'LAPTOP') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem('shivas_sync_id', syncId);
      
      const broadcastData = () => {
        if (gunRef.current) {
          gunRef.current.get('shivas_v7_stream').get(syncId).put({ 
            payload: JSON.stringify(state),
            pulse: Date.now(),
            master: 'laptop-primary'
          });
        }
      };

      // Broadcast on change
      broadcastData();

      // Constant heartbeat to keep mobile connections awake
      const heartbeat = setInterval(() => {
        if (gunRef.current) {
          gunRef.current.get('shivas_v7_stream').get(syncId).put({ pulse: Date.now() });
        }
      }, 3000);

      return () => clearInterval(heartbeat);
    }
  }, [state, syncId, device]);

  // 3. Currency Loader
  useEffect(() => {
    const loadRates = async () => {
      const newRates = await fetchLkrRates();
      setRates(newRates);
    };
    loadRates();
    const interval = setInterval(loadRates, 600000);
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
    return { 
      totalCashIn, 
      totalCashOut, 
      drawerBalance: totalCashIn - totalCashOut,
      cardTotal: state.mainEntries.reduce((sum, e) => e.isCard ? sum + e.cashIn : sum, 0) + outPartyTotals.card,
      paypalTotal: state.mainEntries.reduce((sum, e) => e.isPayPal ? sum + e.cashIn : sum, 0) + outPartyTotals.paypal
    };
  }, [state, outPartyTotals]);

  // --- Laptop Exclusive Handlers ---
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
    if (window.confirm("End Shift? LKR " + mainCalculations.drawerBalance.toLocaleString() + " will be carried forward.")) {
      setState({ outPartyEntries: [], mainEntries: [], initialBalance: mainCalculations.drawerBalance });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Global Connection Header */}
      <div className="bg-slate-950 text-white p-3 flex justify-between items-center px-6 sticky top-0 z-50 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${syncStatus === 'LIVE' ? 'live-status-pulse' : 'bg-red-600 animate-pulse'}`}></div>
            <span className="text-[10px] font-[900] tracking-widest uppercase text-slate-300">
              {syncStatus === 'LIVE' ? 'Direct Signal Active' : 'Searching for Signal...'}
            </span>
          </div>
          <div className="hidden md:block h-4 w-px bg-slate-800"></div>
          <span className="hidden md:block text-[10px] font-black tracking-widest uppercase text-blue-500">
            {device === 'LAPTOP' ? 'MASTER TERMINAL' : `VIEWER • LAST SYNC: ${lastSyncTime || '--:--'}`}
          </span>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 shadow-inner">
          <button onClick={() => setDevice('LAPTOP')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${device === 'LAPTOP' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>LAPTOP</button>
          <button onClick={() => setDevice('ANDROID')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${device === 'ANDROID' ? 'bg-green-600 text-white shadow-xl' : 'text-slate-500'}`}>ANDROID</button>
          <button onClick={() => setDevice('IPHONE')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${device === 'IPHONE' ? 'bg-white text-black shadow-xl' : 'text-slate-500'}`}>IPHONE</button>
        </div>
      </div>

      <main className="flex-1">
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
