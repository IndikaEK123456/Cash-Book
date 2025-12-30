
import React from 'react';
import { AppState, DeviceView, ExchangeRates } from '../types';
import TotalsHeader from './TotalsHeader';
import ExchangeRatesView from './ExchangeRatesView';

interface MobileViewProps {
  device: DeviceView;
  state: AppState;
  rates: ExchangeRates;
  calculations: any;
  outPartyTotals: any;
}

const MobileView: React.FC<MobileViewProps> = ({ device, state, rates, calculations, outPartyTotals }) => {
  const isIPhone = device === 'IPHONE';
  const currentDate = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <div className="flex justify-center items-center py-10 min-h-screen">
      {/* Device Frame Wrapper */}
      <div className={`relative bg-slate-900 shadow-2xl overflow-hidden flex flex-col ${isIPhone ? 'w-[375px] h-[812px] rounded-[50px] border-[12px] border-slate-800' : 'w-[400px] h-[850px] rounded-3xl border-[8px] border-slate-800'}`}>
        
        {/* Device Notch/Hardware */}
        {isIPhone && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-3xl z-10"></div>
        )}
        
        {/* Screen Content */}
        <div className="flex-1 bg-slate-50 overflow-y-auto scrollbar-hide pt-10 px-4 pb-10">
          <div className="text-center mb-6 relative">
            <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block mb-1">
              {currentDate}
            </div>
            <h1 className="text-xl font-black text-slate-800">Shivas Beach Cabanas</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Sync • Ready Only</p>
          </div>

          <div className="mb-4 scale-90 origin-top">
            <ExchangeRatesView rates={rates} />
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
               <div className="text-[10px] font-bold text-slate-400 uppercase">Drawer Balance</div>
               <div className="text-2xl font-black text-blue-600">LKR {calculations.drawerBalance.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-green-500">
                <div className="text-[8px] font-bold text-slate-400 uppercase">Cash In</div>
                <div className="text-lg font-bold text-green-600">{calculations.totalCashIn.toLocaleString()}</div>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-red-500">
                <div className="text-[8px] font-bold text-slate-400 uppercase">Cash Out</div>
                <div className="text-lg font-bold text-red-600">{calculations.totalCashOut.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase mb-3 px-1">Main Ledger Records</h3>
          <div className="space-y-3">
            {state.mainEntries.length === 0 && (
              <div className="text-center py-10 text-slate-300 italic text-sm">No entries for today</div>
            )}
            {state.mainEntries.map(entry => {
               let bgColor = 'bg-blue-50';
               let borderColor = 'border-blue-200';
               if (entry.isCard) { bgColor = 'bg-yellow-50'; borderColor = 'border-yellow-200'; }
               if (entry.isPayPal) { bgColor = 'bg-purple-50'; borderColor = 'border-purple-200'; }

               return (
                 <div key={entry.id} className={`${bgColor} border ${borderColor} p-4 rounded-xl shadow-sm`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-600">{entry.date} • RM <span className="text-slate-900">{entry.roomNo}</span></span>
                      <span className={`text-[8px] px-2 py-0.5 rounded font-black ${entry.isCard ? 'bg-yellow-400 text-yellow-900' : entry.isPayPal ? 'bg-purple-400 text-white' : 'bg-blue-400 text-white'}`}>
                        {entry.isCard ? 'CARD' : entry.isPayPal ? 'PAYPAL' : 'CASH'}
                      </span>
                    </div>
                    <p className="text-slate-900 font-black text-xs mb-3 leading-snug">{entry.description}</p>
                    <div className="flex justify-between items-end">
                      <div className="text-slate-900">
                        <span className="text-[8px] block uppercase font-black text-slate-500">Cash In</span>
                        <span className="text-sm font-black">{entry.cashIn.toLocaleString()}</span>
                      </div>
                      <div className="text-slate-900 text-right">
                        <span className="text-[8px] block uppercase font-black text-slate-500">Cash Out</span>
                        <span className="text-sm font-black">{entry.cashOut.toLocaleString()}</span>
                      </div>
                    </div>
                 </div>
               );
            })}
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase mb-3 mt-8 px-1">Out Party Summary</h3>
          <div className="bg-slate-800 rounded-xl p-4 text-white shadow-lg">
             <div className="flex justify-between border-b border-slate-700 py-2">
               <span className="text-xs font-medium text-slate-400">Total Cash</span>
               <span className="text-sm font-bold text-blue-400">{outPartyTotals.cash.toLocaleString()}</span>
             </div>
             <div className="flex justify-between border-b border-slate-700 py-2">
               <span className="text-xs font-medium text-slate-400">Total Card</span>
               <span className="text-sm font-bold text-yellow-400">{outPartyTotals.card.toLocaleString()}</span>
             </div>
             <div className="flex justify-between py-2">
               <span className="text-xs font-medium text-slate-400">Total PayPal</span>
               <span className="text-sm font-bold text-purple-400">{outPartyTotals.paypal.toLocaleString()}</span>
             </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="h-1.5 w-32 bg-slate-700 mx-auto mb-2 rounded-full mt-auto"></div>
      </div>
    </div>
  );
};

export default MobileView;
