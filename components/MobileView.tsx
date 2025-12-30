
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
  const [isFlashing, setIsFlashing] = useState(false);

  // Visual feedback when data arrives
  useEffect(() => {
    if (state.mainEntries.length > 0 || state.outPartyEntries.length > 0) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <div className="flex justify-center items-start py-4 min-h-screen bg-slate-950 sm:bg-slate-100">
      <div className={`relative bg-slate-950 shadow-2xl overflow-hidden flex flex-col ${isIPhone ? 'w-[375px] h-[812px] sm:rounded-[65px] sm:border-[14px] border-slate-900' : 'w-full max-w-[450px] h-screen sm:h-[880px] sm:rounded-[45px] sm:border-[10px] border-slate-900'}`}>
        
        {/* Hardware Elements */}
        {isIPhone && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-9 bg-slate-900 rounded-b-[2rem] z-40 border-x border-b border-white/5 shadow-inner"></div>
        )}
        
        <div className={`flex-1 bg-slate-50 overflow-y-auto scrollbar-hide pt-16 px-6 pb-32 transition-colors duration-300 ${isFlashing ? 'bg-green-50' : ''}`}>
          
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-[900] text-black tracking-tighter leading-none">Live Sync</h1>
              <div className="mt-3 inline-flex items-center gap-3 bg-blue-100 px-4 py-1.5 rounded-xl">
                <span className="text-[11px] text-blue-700 font-black uppercase tracking-tight">{syncId}</span>
              </div>
            </div>
            <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 border-4 transition-all duration-500 ${isSynced ? 'border-green-100 bg-white shadow-lg' : 'border-slate-100 bg-slate-50'}`}>
               <div className={`w-3 h-3 rounded-full ${isSynced ? 'live-status-pulse' : 'bg-slate-300'}`}></div>
               <span className="text-[11px] font-[900] text-black uppercase tracking-widest">{isSynced ? 'LIVE' : 'WAITING'}</span>
            </div>
          </div>

          <div className="scale-95 origin-left mb-10">
            <ExchangeRatesView rates={rates} />
          </div>

          {/* Drawer Status */}
          <div className={`p-10 rounded-[3.5rem] bg-black text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-300 ${isFlashing ? 'scale-105 ring-8 ring-green-500/20' : ''}`}>
             <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-600/30 blur-[80px] rounded-full"></div>
             <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] block mb-3 relative z-10">Drawer Balance</span>
             <div className="text-6xl font-[900] tracking-tighter tabular-nums leading-none relative z-10">
               LKR {calculations.drawerBalance.toLocaleString()}
             </div>
             
             <div className="grid grid-cols-2 gap-8 mt-12 pt-10 border-t border-white/10 relative z-10">
               <div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue</span>
                 <p className="text-green-400 font-black text-2xl tabular-nums mt-1">+{calculations.totalCashIn.toLocaleString()}</p>
               </div>
               <div className="text-right">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expense</span>
                 <p className="text-red-400 font-black text-2xl tabular-nums mt-1">-{calculations.totalCashOut.toLocaleString()}</p>
               </div>
             </div>
          </div>

          {/* Data Feed */}
          <h3 className="text-[12px] font-[900] text-slate-400 uppercase mt-14 mb-8 tracking-[0.5em] px-4 flex items-center gap-5">
            <span className="h-px w-10 bg-slate-200"></span> MASTER FEED <span className="flex-1 h-px bg-slate-200"></span>
          </h3>
          
          <div className="space-y-6">
            {!state.mainEntries.length && !state.initialBalance && (
              <div className="py-32 text-center flex flex-col items-center">
                 <div className="w-20 h-20 border-[8px] border-slate-100 border-t-blue-600 rounded-full animate-spin mb-10 shadow-xl"></div>
                 <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.3em] animate-pulse">Waiting for Signal Alpha...</p>
                 <button 
                  onClick={() => window.location.reload()}
                  className="mt-12 text-blue-600 text-[11px] font-[900] bg-blue-50 px-8 py-4 rounded-2xl shadow-sm border border-blue-100"
                 >
                  FORCE SIGNAL RESET
                 </button>
              </div>
            )}

            {state.initialBalance !== 0 && (
              <div className="bg-blue-600 text-white p-8 rounded-[2.8rem] shadow-2xl flex justify-between items-center ring-8 ring-blue-600/10">
                <div>
                   <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 block">Carried Forward</span>
                   <p className="text-4xl font-[900] tabular-nums">{state.initialBalance.toLocaleString()}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-3xl text-[11px] font-black tracking-tighter">BFWD</div>
              </div>
            )}

            {state.mainEntries.slice().reverse().map(entry => (
               <div key={entry.id} className={`bg-white border-4 border-slate-50 p-8 rounded-[3rem] shadow-xl flex flex-col gap-6 transition-all duration-300 ${isFlashing ? 'flash-update' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black text-slate-300 tabular-nums">{entry.date}</span>
                    <span className={`text-[10px] px-5 py-2 rounded-2xl font-[900] tracking-widest shadow-sm ${entry.isCard ? 'bg-yellow-400 text-yellow-950' : entry.isPayPal ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {entry.isCard ? 'CARD' : entry.isPayPal ? 'PAYPAL' : 'CASH'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[12px] font-black text-blue-600 uppercase mb-3 block tracking-tight">ROOM {entry.roomNo || '--'}</span>
                    <p className="text-black font-[900] text-2xl leading-tight tracking-tight">{entry.description}</p>
                  </div>
                  <div className="flex justify-between pt-8 border-t border-slate-100">
                    <div className={entry.cashIn > 0 ? '' : 'opacity-20'}>
                      <span className="text-[11px] font-black text-slate-400 uppercase block mb-1">In (+)</span>
                      <span className="text-3xl font-[900] text-green-600 tabular-nums">{entry.cashIn.toLocaleString()}</span>
                    </div>
                    <div className={`text-right ${entry.cashOut > 0 ? '' : 'opacity-20'}`}>
                      <span className="text-[11px] font-black text-slate-400 uppercase block mb-1">Out (-)</span>
                      <span className="text-3xl font-[900] text-red-600 tabular-nums">{entry.cashOut.toLocaleString()}</span>
                    </div>
                  </div>
               </div>
            ))}
          </div>

          {/* Digital Distribution */}
          <div className="mt-16 bg-black rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-600/10 blur-[70px] rounded-full"></div>
             <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10 text-center">Digital Asset Status</h4>
             <div className="space-y-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Liquid Cash</span>
                  </div>
                  <span className="text-3xl font-[900] tabular-nums">{outPartyTotals.cash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]"></div>
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Card Pool</span>
                  </div>
                  <span className="text-3xl font-[900] tabular-nums">{outPartyTotals.card.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]"></div>
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">PayPal Fund</span>
                  </div>
                  <span className="text-3xl font-[900] tabular-nums">{outPartyTotals.paypal.toLocaleString()}</span>
                </div>
             </div>
          </div>

          <div className="mt-20 text-center">
             <p className="text-[11px] font-[900] tracking-[1em] uppercase text-slate-300">SHIVAS BEACH TERMINAL</p>
             <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.3em]">Signal Quality: Excellent</p>
          </div>
        </div>
        
        {/* Navigation Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-40 h-2 bg-slate-800 rounded-full opacity-40"></div>
      </div>
    </div>
  );
};

export default MobileView;
