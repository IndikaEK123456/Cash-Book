
import React, { useState } from 'react';
import { AppState, OutPartyEntry, MainEntry, ExchangeRates } from '../types';
import TotalsHeader from './TotalsHeader';
import ExchangeRatesView from './ExchangeRatesView';

interface LaptopViewProps {
  state: AppState;
  rates: ExchangeRates;
  calculations: any;
  outPartyTotals: any;
  onAddOutParty: (entry: OutPartyEntry) => void;
  onAddMain: (entry: MainEntry) => void;
  onDeleteOutParty: (id: string) => void;
  onDeleteMain: (id: string) => void;
  onEndDay: () => void;
}

const LaptopView: React.FC<LaptopViewProps> = ({ 
  state, rates, calculations, outPartyTotals, onAddOutParty, onAddMain, onDeleteOutParty, onDeleteMain, onEndDay 
}) => {
  const [opForm, setOpForm] = useState({ cash: '', card: '', paypal: '' });
  const [mainForm, setMainForm] = useState({ isCard: false, isPayPal: false, roomNo: '', description: '', cashIn: '', cashOut: '' });

  const handleAddOutParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opForm.cash && !opForm.card && !opForm.paypal) return;
    onAddOutParty({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      cash: Number(opForm.cash) || 0,
      card: Number(opForm.card) || 0,
      paypal: Number(opForm.paypal) || 0,
    });
    setOpForm({ cash: '', card: '', paypal: '' });
  };

  const handleAddMain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainForm.description && !mainForm.cashIn && !mainForm.cashOut) return;
    onAddMain({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      isCard: mainForm.isCard,
      isPayPal: mainForm.isPayPal,
      roomNo: mainForm.roomNo,
      description: mainForm.description,
      cashIn: Number(mainForm.cashIn) || 0,
      cashOut: Number(mainForm.cashOut) || 0,
    });
    setMainForm({ isCard: false, isPayPal: false, roomNo: '', description: '', cashIn: '', cashOut: '' });
  };

  const currentDate = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">Shivas Beach <span className="text-blue-600">Cabanas</span></h1>
          <p className="text-slate-500 font-semibold tracking-wide">PREMIUM LEDGER MANAGEMENT SYSTEM</p>
        </div>
        <div className="flex flex-col items-end space-y-3 mt-4 md:mt-0">
           <div className="text-slate-950 font-black text-2xl bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
             {currentDate}
           </div>
           <ExchangeRatesView rates={rates} />
           <button 
             onClick={onEndDay}
             className="group bg-red-600 hover:bg-red-700 text-white font-black px-12 py-4 rounded-2xl shadow-xl hover:shadow-red-200 transition-all uppercase tracking-widest text-sm flex items-center space-x-2"
           >
             <span>End Day</span>
             <span className="opacity-50 group-hover:opacity-100 transition-opacity">→</span>
           </button>
        </div>
      </div>

      <TotalsHeader 
        drawerBalance={calculations.drawerBalance}
        totalCashIn={calculations.totalCashIn}
        totalCashOut={calculations.totalCashOut}
        finalCardTotal={calculations.finalCardTotal}
        finalPayPalTotal={calculations.finalPayPalTotal}
      />

      {/* Section 1: Out Party */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden mb-12">
        <div className="bg-slate-50 px-10 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-800">Out Party Transactions</h2>
          <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">External Assets</span>
        </div>
        <div className="p-10">
          <form onSubmit={handleAddOutParty} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Cash Amount</label>
              <input type="number" placeholder="0.00" value={opForm.cash} onChange={e => setOpForm({...opForm, cash: e.target.value})} className="bg-white border-2 border-slate-100 p-4 rounded-2xl focus:border-blue-500 outline-none text-slate-950 font-black text-lg transition-all" />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Card Amount</label>
              <input type="number" placeholder="0.00" value={opForm.card} onChange={e => setOpForm({...opForm, card: e.target.value})} className="bg-white border-2 border-slate-100 p-4 rounded-2xl focus:border-yellow-500 outline-none text-slate-950 font-black text-lg transition-all" />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">PayPal Amount</label>
              <input type="number" placeholder="0.00" value={opForm.paypal} onChange={e => setOpForm({...opForm, paypal: e.target.value})} className="bg-white border-2 border-slate-100 p-4 rounded-2xl focus:border-purple-500 outline-none text-slate-950 font-black text-lg transition-all" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95">ADD ENTRY</button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-50">
                  <th className="py-5 px-4 text-xs font-black text-slate-400 uppercase">Date</th>
                  <th className="py-5 px-4 text-xs font-black text-slate-400 uppercase">Cash</th>
                  <th className="py-5 px-4 text-xs font-black text-slate-400 uppercase">Card</th>
                  <th className="py-5 px-4 text-xs font-black text-slate-400 uppercase">PayPal</th>
                  <th className="py-5 px-4 text-xs font-black text-slate-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                {state.outPartyEntries.map(entry => (
                  <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-4 text-sm text-slate-900">{entry.date}</td>
                    <td className="py-5 px-4 text-blue-600 font-black text-lg">{entry.cash.toLocaleString()}</td>
                    <td className="py-5 px-4 text-yellow-600 font-black text-lg">{entry.card.toLocaleString()}</td>
                    <td className="py-5 px-4 text-purple-600 font-black text-lg">{entry.paypal.toLocaleString()}</td>
                    <td className="py-5 px-4 text-right">
                      <button onClick={() => onDeleteOutParty(entry.id)} className="text-red-400 hover:text-red-600 font-black text-xs uppercase tracking-tighter">Remove</button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-950 text-white rounded-2xl">
                  <td className="py-6 px-6 font-black uppercase text-xs tracking-widest rounded-l-2xl">GRAND TOTALS</td>
                  <td className="py-6 px-4 text-blue-400 font-black text-xl">{outPartyTotals.cash.toLocaleString()}</td>
                  <td className="py-6 px-4 text-yellow-400 font-black text-xl">{outPartyTotals.card.toLocaleString()}</td>
                  <td className="py-6 px-4 text-purple-400 font-black text-xl rounded-r-2xl">{outPartyTotals.paypal.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 2: Main Cash Book */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden mb-20">
        <div className="bg-slate-900 px-10 py-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-black text-white">Main Ledger Section</h2>
          <span className="bg-green-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Live Updates</span>
        </div>
        <div className="p-10">
          <form onSubmit={handleAddMain} className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-10 bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Room</label>
              <input type="text" placeholder="RM" value={mainForm.roomNo} onChange={e => setMainForm({...mainForm, roomNo: e.target.value})} className="bg-white border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 text-slate-950 font-black transition-all" />
            </div>
            <div className="flex flex-col space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Description</label>
              <input type="text" placeholder="Transaction details..." value={mainForm.description} onChange={e => setMainForm({...mainForm, description: e.target.value})} className="bg-white border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 text-slate-950 font-black transition-all" />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cash In</label>
              <input type="number" placeholder="In" value={mainForm.cashIn} onChange={e => setMainForm({...mainForm, cashIn: e.target.value})} className="bg-white border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-green-500 text-slate-950 font-black transition-all" />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cash Out</label>
              <input type="number" placeholder="Out" value={mainForm.cashOut} onChange={e => setMainForm({...mainForm, cashOut: e.target.value})} className="bg-white border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-red-500 text-slate-950 font-black transition-all" />
            </div>
            <div className="flex flex-col justify-center items-center space-y-1">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="checkCard" checked={mainForm.isCard} onChange={e => setMainForm({...mainForm, isCard: e.target.checked})} className="w-5 h-5 accent-yellow-500" />
                <label htmlFor="checkCard" className="text-[10px] font-black text-slate-600 uppercase">Card</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="checkPaypal" checked={mainForm.isPayPal} onChange={e => setMainForm({...mainForm, isPayPal: e.target.checked})} className="w-5 h-5 accent-purple-500" />
                <label htmlFor="checkPaypal" className="text-[10px] font-black text-slate-600 uppercase">PayPal</label>
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-all shadow-lg active:scale-95">ADD</button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-5 px-3 text-xs font-black text-slate-900 uppercase">Date</th>
                  <th className="py-5 px-3 text-xs font-black text-slate-900 uppercase">Type</th>
                  <th className="py-5 px-3 text-xs font-black text-slate-900 uppercase">Room</th>
                  <th className="py-5 px-3 text-xs font-black text-slate-900 uppercase w-[35%]">Description</th>
                  <th className="py-5 px-3 text-xs font-black text-slate-900 uppercase">Cash In</th>
                  <th className="py-5 px-3 text-xs font-black text-slate-900 uppercase">Cash Out</th>
                  <th className="py-5 px-3 text-xs font-black text-slate-900 uppercase text-right">Del</th>
                </tr>
              </thead>
              <tbody className="font-black text-slate-950 text-base">
                {state.initialBalance !== 0 && (
                  <tr className="bg-blue-50 border-b border-blue-100">
                    <td className="py-5 px-3 text-slate-500 font-medium italic">{new Date().toLocaleDateString()}</td>
                    <td className="py-5 px-3"><span className="text-[10px] bg-blue-200 px-2 py-0.5 rounded-md">BFWD</span></td>
                    <td className="py-5 px-3">—</td>
                    <td className="py-5 px-3 text-blue-900 tracking-tight">BALANCE CARRIED FORWARD</td>
                    <td className="py-5 px-3 text-green-700 font-black">{state.initialBalance.toLocaleString()}</td>
                    <td className="py-5 px-3 text-slate-400">0</td>
                    <td></td>
                  </tr>
                )}
                {state.mainEntries.map(entry => {
                  let bgColor = 'bg-blue-50';
                  let methodText = 'CASH';
                  let methodClass = 'bg-blue-200 text-blue-900';
                  
                  if (entry.isCard) { 
                    bgColor = 'bg-yellow-100'; 
                    methodText = 'CARD';
                    methodClass = 'bg-yellow-400 text-yellow-950';
                  } else if (entry.isPayPal) { 
                    bgColor = 'bg-purple-100'; 
                    methodText = 'PAYPAL';
                    methodClass = 'bg-purple-400 text-white';
                  }

                  return (
                    <tr key={entry.id} className={`border-b border-slate-100 hover:brightness-95 transition-all ${bgColor}`}>
                      <td className="py-5 px-3 font-medium text-slate-500 text-sm">{entry.date}</td>
                      <td className="py-5 px-3">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black tracking-tighter ${methodClass}`}>{methodText}</span>
                      </td>
                      <td className="py-5 px-3 text-slate-950">{entry.roomNo}</td>
                      <td className="py-5 px-3 text-slate-950 whitespace-normal leading-tight font-bold">{entry.description}</td>
                      <td className="py-5 px-3 text-slate-950 text-lg tabular-nums">{entry.cashIn.toLocaleString()}</td>
                      <td className="py-5 px-3 text-slate-950 text-lg tabular-nums">{entry.cashOut.toLocaleString()}</td>
                      <td className="py-5 px-3 text-right">
                        <button onClick={() => onDeleteMain(entry.id)} className="text-red-400 hover:text-red-600 transition-colors">×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaptopView;
