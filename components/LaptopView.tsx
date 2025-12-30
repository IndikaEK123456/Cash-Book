
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start mb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Shivas Beach <span className="text-blue-600">Cabanas</span></h1>
          <p className="text-slate-500 font-medium">Professional Cash Management Dashboard</p>
        </div>
        <div className="flex flex-col items-end space-y-2 mt-4 md:mt-0">
           <div className="text-slate-800 font-black text-xl bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
             {currentDate}
           </div>
           <ExchangeRatesView rates={rates} />
           <button 
             onClick={onEndDay}
             className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-3 rounded-xl shadow-lg hover:shadow-red-200 transition-all uppercase tracking-widest text-sm"
           >
             End Day
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
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-12">
        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-700">Out Party Section</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase">External Transactions</span>
        </div>
        <div className="p-8">
          <form onSubmit={handleAddOutParty} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
            <input type="number" placeholder="Cash Amount" value={opForm.cash} onChange={e => setOpForm({...opForm, cash: e.target.value})} className="bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-bold" />
            <input type="number" placeholder="Card Amount" value={opForm.card} onChange={e => setOpForm({...opForm, card: e.target.value})} className="bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-slate-900 font-bold" />
            <input type="number" placeholder="PayPal Amount" value={opForm.paypal} onChange={e => setOpForm({...opForm, paypal: e.target.value})} className="bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 font-bold" />
            <button type="submit" className="bg-slate-800 hover:bg-black text-white font-bold p-3 rounded-xl transition-colors">Add Out Party</button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 text-xs font-black text-slate-400 uppercase">Date</th>
                  <th className="py-4 text-xs font-black text-slate-400 uppercase">Out Party Cash</th>
                  <th className="py-4 text-xs font-black text-slate-400 uppercase">Out Party Card</th>
                  <th className="py-4 text-xs font-black text-slate-400 uppercase">Out Party PayPal</th>
                  <th className="py-4 text-xs font-black text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                {state.outPartyEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-sm">{entry.date}</td>
                    <td className="py-4 text-sm text-blue-600 font-bold">{entry.cash.toLocaleString()}</td>
                    <td className="py-4 text-sm text-yellow-600 font-bold">{entry.card.toLocaleString()}</td>
                    <td className="py-4 text-sm text-purple-600 font-bold">{entry.paypal.toLocaleString()}</td>
                    <td className="py-4">
                      <button onClick={() => onDeleteOutParty(entry.id)} className="text-red-400 hover:text-red-600 font-bold text-xs uppercase underline">Delete</button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-black">
                  <td className="py-4 px-4 text-slate-500">TOTALS</td>
                  <td className="py-4 text-blue-700">{outPartyTotals.cash.toLocaleString()}</td>
                  <td className="py-4 text-yellow-700">{outPartyTotals.card.toLocaleString()}</td>
                  <td className="py-4 text-purple-700">{outPartyTotals.paypal.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 2: Main Cash Book */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-12">
        <div className="bg-slate-800 px-8 py-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Main Cash Book</h2>
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Internal Ledger</span>
        </div>
        <div className="p-8">
          <form onSubmit={handleAddMain} className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-8 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Room No</label>
              <input type="text" placeholder="No." value={mainForm.roomNo} onChange={e => setMainForm({...mainForm, roomNo: e.target.value})} className="bg-white border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 font-bold" />
            </div>
            <div className="flex flex-col space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
              <input type="text" placeholder="Detail..." value={mainForm.description} onChange={e => setMainForm({...mainForm, description: e.target.value})} className="bg-white border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 font-bold" />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cash In</label>
              <input type="number" placeholder="In" value={mainForm.cashIn} onChange={e => setMainForm({...mainForm, cashIn: e.target.value})} className="bg-white border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400 text-slate-900 font-bold" />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cash Out</label>
              <input type="number" placeholder="Out" value={mainForm.cashOut} onChange={e => setMainForm({...mainForm, cashOut: e.target.value})} className="bg-white border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-red-400 text-slate-900 font-bold" />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input type="checkbox" checked={mainForm.isCard} onChange={e => setMainForm({...mainForm, isCard: e.target.checked})} className="w-5 h-5" />
              <label className="text-xs font-bold text-slate-600">Card</label>
              <input type="checkbox" checked={mainForm.isPayPal} onChange={e => setMainForm({...mainForm, isPayPal: e.target.checked})} className="w-5 h-5" />
              <label className="text-xs font-bold text-slate-600">PayPal</label>
            </div>
            <div className="pt-6">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black p-2 rounded-lg transition-all shadow-md">ADD</button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800">
                  <th className="py-4 px-2 text-xs font-black text-slate-800 uppercase">Date</th>
                  <th className="py-4 px-2 text-xs font-black text-slate-800 uppercase">Method</th>
                  <th className="py-4 px-2 text-xs font-black text-slate-800 uppercase">Room</th>
                  <th className="py-4 px-2 text-xs font-black text-slate-800 uppercase w-1/3">Description</th>
                  <th className="py-4 px-2 text-xs font-black text-slate-800 uppercase">Cash In</th>
                  <th className="py-4 px-2 text-xs font-black text-slate-800 uppercase">Cash Out</th>
                  <th className="py-4 px-2 text-xs font-black text-slate-800 uppercase text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="font-bold text-slate-900">
                {state.initialBalance !== 0 && (
                  <tr className="bg-blue-50">
                    <td className="py-4 px-2 italic text-slate-500 text-sm">{new Date().toLocaleDateString()}</td>
                    <td className="py-4 px-2">—</td>
                    <td className="py-4 px-2 text-slate-900">—</td>
                    <td className="py-4 px-2 text-slate-900">CARRIED BALANCE FROM PREVIOUS DAY</td>
                    <td className="py-4 px-2 text-slate-900">{state.initialBalance.toLocaleString()}</td>
                    <td className="py-4 px-2 text-slate-900">0</td>
                    <td></td>
                  </tr>
                )}
                {state.mainEntries.map(entry => {
                  let bgColor = 'bg-blue-50'; // Default Cash color
                  let methodText = 'CASH';
                  if (entry.isCard) { bgColor = 'bg-yellow-200'; methodText = 'CARD'; }
                  if (entry.isPayPal) { bgColor = 'bg-purple-200'; methodText = 'PAYPAL'; }

                  return (
                    <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-2 text-sm text-slate-900">{entry.date}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded text-[10px] ${bgColor} text-slate-900`}>{methodText}</span>
                      </td>
                      <td className="py-4 px-2 text-slate-900">{entry.roomNo}</td>
                      <td className="py-4 px-2 text-sm text-slate-900 whitespace-normal leading-relaxed">{entry.description}</td>
                      <td className={`py-4 px-2 ${bgColor} text-slate-900 min-w-[120px]`}>{entry.cashIn.toLocaleString()}</td>
                      <td className="py-4 px-2 text-slate-900 min-w-[120px]">{entry.cashOut.toLocaleString()}</td>
                      <td className="py-4 px-2 text-right">
                        <button onClick={() => onDeleteMain(entry.id)} className="text-red-400 hover:text-red-600 text-xs uppercase">X</button>
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
