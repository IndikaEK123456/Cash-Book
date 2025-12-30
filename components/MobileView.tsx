
import React from 'react';
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
  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="flex justify-center items-center py-10 min-h-screen">
      <div className={`relative bg-slate-900 shadow-2xl overflow-hidden flex flex-col ${isIPhone ? 'w-[375px] h-[812px] rounded-[50px] border-[12px] border-slate-800' : 'w-[400px] h-[850px] rounded-3xl border-[8px] border-slate-800'}`}>
        
        {isIPhone && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-3xl z-10"></div>
        )}
        
        <div className="flex-1 bg-slate-50 overflow-y-auto scrollbar-hide pt-10 px-4 pb-10">
          <div className="text-center mb-6 relative">
            <div className="flex justify-center items-center space-x-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-500 animate-sync' : 'bg-slate-300'}`}></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isSynced ? 'Live Synced' : 'Connecting...'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Shivas Beach</h1>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{syncId}</p>
          </div>

          <div className="mb-4 scale-90 origin-top flex justify-center">
            <ExchangeRatesView rates={rates} />
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-200/20">
               <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Final Drawer Balance</div>
               <div className="text-3xl font-black tabular-nums leading-none">LKR {calculations.drawerBalance.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500">
                <div className="text-[8px] font-black text-slate-400 uppercase">Total Cash In</div>
                <div className="text-lg font-black text-green-600">{calculations.totalCashIn.toLocaleString()}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-red-500">
                <div className="text-[8px] font-black text-slate-400 uppercase">Total Cash Out</div>
                <div className="text-lg font-black text-red-600">{calculations.totalCashOut.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase mb-3 px-1 tracking-widest">Live Ledger</h3>
          <div className="space-y-3">
            {state.mainEntries.length === 0 && !state.initialBalance && (
              <div className="text-center py-20 text-slate-300 italic text-sm font-bold">Waiting for updates from Laptop...</div>
            )}
            {state.initialBalance !== 0 && (
              <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-100 flex justify-between items-center">
                <div>
                   <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Opening Balance</span>
                   <p className="text-lg font-black">LKR {state.initialBalance.toLocaleString()}</p>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">BFWD</div>
              </div>
            )}
            {state.mainEntries.slice().reverse().map(entry => {
               const colorClass = entry.isCard ? 'border-yellow-200 bg-yellow-50' : entry.isPayPal ? 'border-purple-200 bg-purple-50' : 'border-slate-100 bg-white';
               return (
                 <div key={entry.id} className={`${colorClass} border p-4 rounded-[1.5rem] shadow-sm animate-in fade-in slide-in-from-bottom duration-500`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-slate-400">{entry.date}</span>
                      <span className={`text-[8px] px-3 py-1 rounded-full font-black tracking-widest ${entry.isCard ? 'bg-yellow-400 text-yellow-950' : entry.isPayPal ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {entry.isCard ? 'CARD' : entry.isPayPal ? 'PAYPAL' : 'CASH'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="pr-4">
                        <span className="text-[10px] font-black text-blue-600 uppercase block">RM {entry.roomNo || '--'}</span>
                        <p className="text-slate-900 font-black text-sm leading-tight tracking-tight">{entry.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[8px] block uppercase font-black text-slate-400">In</span>
                        <span className="text-base font-black text-green-600">{entry.cashIn > 0 ? entry.cashIn.toLocaleString() : '-'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] block uppercase font-black text-slate-400">Out</span>
                        <span className="text-base font-black text-red-500">{entry.cashOut > 0 ? entry.cashOut.toLocaleString() : '-'}</span>
                      </div>
                    </div>
                 </div>
               );
            })}
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase mb-3 mt-8 px-1 tracking-widest">Out Party Summary</h3>
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
             <div className="flex justify-between border-b border-slate-800 py-3">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cash Pool</span>
               <span className="text-lg font-black text-blue-400 tabular-nums">{outPartyTotals.cash.toLocaleString()}</span>
             </div>
             <div className="flex justify-between border-b border-slate-800 py-3">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Card Pool</span>
               <span className="text-lg font-black text-yellow-400 tabular-nums">{outPartyTotals.card.toLocaleString()}</span>
             </div>
             <div className="flex justify-between pt-3">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">PayPal Pool</span>
               <span className="text-lg font-black text-purple-400 tabular-nums">{outPartyTotals.paypal.toLocaleString()}</span>
             </div>
          </div>
        </div>

        <div className="h-1.5 w-32 bg-slate-800 mx-auto mb-2 rounded-full mt-auto"></div>
      </div>
    </div>
  );
};

export default MobileView;
