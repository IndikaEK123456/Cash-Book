
import React, { useEffect, useState } from 'react';
import { AppState, DeviceView, ExchangeRates } from '../types';
import ExchangeRatesView from './ExchangeRatesView';

interface MobileViewProps {
  device: DeviceView;
  state: AppState;
  rates: ExchangeRates;
  calculations: any;
  outPartyTotals: any;
  syncId: string;
  isSynced: boolean;
}

const MobileView: React.FC<MobileViewProps> = ({ device, state, rates, calculations, outPartyTotals, syncId, isSynced }) => {
  const isIPhone = device === 'IPHONE';
  const [flash, setFlash] = useState(false);

  // Trigger visual feedback when state updates from network
  useEffect(() => {
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 800);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div className="flex justify-center items-start py-6 min-h-screen bg-slate-900 sm:bg-slate-50">
      <div className={`relative bg-slate-950 shadow-2xl overflow-hidden flex flex-col ${isIPhone ? 'w-[375px] h-[812px] sm:rounded-[60px] sm:border-[12px] border-slate-800' : 'w-full max-w-[450px] h-screen sm:h-[850px] sm:rounded-3xl sm:border-[8px] border-slate-800'}`}>
        
        {isIPhone && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-3xl z-20"></div>
        )}
        
        <div className="flex-1 bg-slate-50 overflow-y-auto scrollbar-hide pt-12 px-5 pb-20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-[900] text-slate-900 leading-none">Shivas Live</h1>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">ID: {syncId}</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-500 animate-sync' : 'bg-red-400'}`}></div>
              <span className="text-[9px] font-black text-slate-500 uppercase">{isSynced ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>

          <div className="scale-90 origin-left">
            <ExchangeRatesView rates={rates} />
          </div>

          {/* Main Balance Card */}
          <div className={`mt-6 p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl transition-all duration-300 ${flash ? 'ring-4 ring-green-500/50 scale-[1.02]' : ''}`}>
             <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Available Drawer Balance</span>
             <div className="text-4xl font-[900] tracking-tighter tabular-nums leading-none">
               LKR {calculations.drawerBalance.toLocaleString()}
             </div>
             <div className="grid grid-cols-2 gap-4 mt-8 border-t border-white/5 pt-6">
               <div>
                 <span className="text-[8px] font-black text-slate-500 uppercase">Cash In</span>
                 <p className="text-green-400 font-black text-lg">{calculations.totalCashIn.toLocaleString()}</p>
               </div>
               <div className="text-right">
                 <span className="text-[8px] font-black text-slate-500 uppercase">Cash Out</span>
                 <p className="text-red-400 font-black text-lg">{calculations.totalCashOut.toLocaleString()}</p>
               </div>
             </div>
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase mt-10 mb-4 tracking-widest px-2">Live Activity Stream</h3>
          
          <div className="space-y-4">
            {!state.mainEntries.length && !state.initialBalance && (
              <div className="py-20 text-center">
                 <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                 <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Waiting for Master Terminal...</p>
              </div>
            )}

            {state.initialBalance !== 0 && (
              <div className="bg-blue-600 text-white p-5 rounded-[1.5rem] shadow-lg flex justify-between items-center">
                <div>
                   <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Balance Brought Forward</span>
                   <p className="text-xl font-black">{state.initialBalance.toLocaleString()}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-xl text-[10px] font-black">BFWD</div>
              </div>
            )}

            {state.mainEntries.slice().reverse().map(entry => (
               <div key={entry.id} className={`bg-white border-2 border-slate-50 p-5 rounded-[1.8rem] shadow-sm transition-all duration-300 ${flash ? 'data-updated' : ''}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-black text-slate-400">{entry.date}</span>
                    <span className={`text-[8px] px-3 py-1 rounded-full font-black tracking-widest ${entry.isCard ? 'bg-yellow-400' : entry.isPayPal ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {entry.isCard ? 'CARD' : entry.isPayPal ? 'PAYPAL' : 'CASH'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black text-blue-600 uppercase mb-1 block">RM {entry.roomNo || '--'}</span>
                      <p className="text-slate-900 font-black text-sm leading-tight tracking-tight">{entry.description}</p>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-slate-50">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">In</span>
                      <span className="text-base font-black text-green-600">{entry.cashIn > 0 ? entry.cashIn.toLocaleString() : '-'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Out</span>
                      <span className="text-base font-black text-red-500">{entry.cashOut > 0 ? entry.cashOut.toLocaleString() : '-'}</span>
                    </div>
                  </div>
               </div>
            ))}
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase mt-12 mb-4 tracking-widest px-2">Assets Distribution</h3>
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-[10px] font-black text-blue-400 uppercase">Cash Asset</span>
               <span className="text-lg font-black tabular-nums">{outPartyTotals.cash.toLocaleString()}</span>
             </div>
             <div className="h-px bg-white/5 w-full"></div>
             <div className="flex justify-between items-center">
               <span className="text-[10px] font-black text-yellow-400 uppercase">Card Ledger</span>
               <span className="text-lg font-black tabular-nums">{outPartyTotals.card.toLocaleString()}</span>
             </div>
             <div className="h-px bg-white/5 w-full"></div>
             <div className="flex justify-between items-center">
               <span className="text-[10px] font-black text-purple-400 uppercase">PayPal Pool</span>
               <span className="text-lg font-black tabular-nums">{outPartyTotals.paypal.toLocaleString()}</span>
             </div>
          </div>

          <div className="text-center py-10 opacity-20">
             <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500">Shivas Beach Premium Ledger</p>
          </div>
        </div>
        
        {/* Navigation Indicator Bar */}
        <div className="bg-slate-50 pt-2 pb-1 border-t border-slate-100 sm:hidden">
          <div className="h-1.5 w-32 bg-slate-300 mx-auto rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default MobileView;
