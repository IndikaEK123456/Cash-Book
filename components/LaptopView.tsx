
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
  syncId: string;
  onSyncIdChange: (id: string) => void;
}

const LaptopView: React.FC<LaptopViewProps> = ({ 
  state, rates, calculations, outPartyTotals, onAddOutParty, onAddMain, 
  onDeleteOutParty, onDeleteMain, onEndDay, syncId, onSyncIdChange 
}) => {
  const [opForm, setOpForm] = useState({ cash: '', card: '', paypal: '' });
  const [mainForm, setMainForm] = useState({ isCard: false, isPayPal: false, roomNo: '', description: '', cashIn: '', cashOut: '' });

  const handleAddOutParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opForm.cash && !opForm.card && !opForm.paypal) return;
    onAddOutParty({
      id: Date.now().toString(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCard: mainForm.isCard,
      isPayPal: mainForm.isPayPal,
      roomNo: mainForm.roomNo,
      description: mainForm.description,
      cashIn: Number(mainForm.cashIn) || 0,
      cashOut: Number(mainForm.cashOut) || 0,
    });
    setMainForm({ isCard: false, isPayPal: false, roomNo: '', description: '', cashIn: '', cashOut: '' });
  };

  const copySyncLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?sid=${syncId}`;
    navigator.clipboard.writeText(url);
    alert("Viewer link copied! Open this on your Android/iPhone for real-time updates.");
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-6xl font-[900] text-slate-900 tracking-tighter mb-2">
            Shivas <span className="text-blue-600">Beach</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Master Control Terminal</p>
        </div>
        <div className="mt-6 lg:mt-0 flex flex-col items-end gap-4">
           <ExchangeRatesView rates={rates} />
           <button onClick={onEndDay} className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all uppercase text-xs active:scale-95">End Work Day</button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 mb-10 text-white shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
            </div>
            <div>
              <h3 className="text-2xl font-black">Direct Broadcast Active</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Everything you type here appears on mobile instantly</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-[1.5rem] border border-white/5">
            <input 
              type="text" 
              value={syncId} 
              onChange={(e) => onSyncIdChange(e.target.value)} 
              placeholder="Sync Channel Name"
              className="bg-transparent px-4 outline-none font-black text-blue-400 w-48 text-lg" 
            />
            <button onClick={copySyncLink} className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Copy Live Link</button>
          </div>
        </div>
      </div>

      <TotalsHeader 
        drawerBalance={calculations.drawerBalance}
        totalCashIn={calculations.totalCashIn}
        totalCashOut={calculations.totalCashOut}
        finalCardTotal={calculations.finalCardTotal}
        finalPayPalTotal={calculations.finalPayPalTotal}
      />

      <div className="space-y-12">
        {/* Forms and Tables remain but with polished styles */}
        <section className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-10 py-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-800">Out Party Ledger</h2>
          </div>
          <div className="p-10">
            <form onSubmit={handleAddOutParty} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {['Cash', 'Card', 'PayPal'].map(label => (
                <div key={label} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label} In</label>
                  <input 
                    type="number" 
                    value={(opForm as any)[label.toLowerCase()]} 
                    onChange={e => setOpForm({...opForm, [label.toLowerCase()]: e.target.value})} 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-black text-xl outline-none focus:border-blue-500" 
                    placeholder="0.00"
                  />
                </div>
              ))}
              <div className="flex items-end">
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-widest">Record In</button>
              </div>
            </form>
            <div className="overflow-hidden rounded-2xl border border-slate-50">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-[10px] uppercase font-black">
                  <tr>
                    <th className="p-5">Time</th>
                    <th className="p-5">Cash</th>
                    <th className="p-5">Card</th>
                    <th className="p-5">PayPal</th>
                    <th className="p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-lg">
                  {state.outPartyEntries.slice().reverse().map(entry => (
                    <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="p-5 text-slate-400 text-sm">{entry.date}</td>
                      <td className="p-5 text-blue-600">{entry.cash.toLocaleString()}</td>
                      <td className="p-5 text-yellow-600">{entry.card.toLocaleString()}</td>
                      <td className="p-5 text-purple-600">{entry.paypal.toLocaleString()}</td>
                      <td className="p-5 text-right">
                        <button onClick={() => onDeleteOutParty(entry.id)} className="text-red-300 hover:text-red-600 transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 px-10 py-6 flex justify-between items-center text-white">
            <h2 className="text-2xl font-black">Main Cash Ledger</h2>
          </div>
          <div className="p-10">
            <form onSubmit={handleAddMain} className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-10">
              <input type="text" placeholder="RM-" value={mainForm.roomNo} onChange={e => setMainForm({...mainForm, roomNo: e.target.value})} className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-black outline-none" />
              <input type="text" placeholder="Detail..." value={mainForm.description} onChange={e => setMainForm({...mainForm, description: e.target.value})} className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-black outline-none md:col-span-2" />
              <input type="number" placeholder="In" value={mainForm.cashIn} onChange={e => setMainForm({...mainForm, cashIn: e.target.value})} className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-black outline-none text-green-600" />
              <input type="number" placeholder="Out" value={mainForm.cashOut} onChange={e => setMainForm({...mainForm, cashOut: e.target.value})} className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-black outline-none text-red-600" />
              <div className="flex flex-col gap-1 justify-center px-2">
                <label className="text-[10px] font-black flex items-center gap-2"><input type="checkbox" checked={mainForm.isCard} onChange={e => setMainForm({...mainForm, isCard: e.target.checked})} /> CARD</label>
                <label className="text-[10px] font-black flex items-center gap-2"><input type="checkbox" checked={mainForm.isPayPal} onChange={e => setMainForm({...mainForm, isPayPal: e.target.checked})} /> PAYPAL</label>
              </div>
              <button type="submit" className="bg-blue-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-colors">Post Record</button>
            </form>
            <div className="overflow-hidden rounded-2xl border border-slate-50">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-[10px] uppercase font-black">
                  <tr>
                    <th className="p-5">Time</th>
                    <th className="p-5">Method</th>
                    <th className="p-5">RM</th>
                    <th className="p-5 w-1/3">Detail</th>
                    <th className="p-5">Rev (+)</th>
                    <th className="p-5">Exp (-)</th>
                    <th className="p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="font-black text-lg">
                  {state.initialBalance !== 0 && (
                    <tr className="bg-blue-50 border-b">
                      <td className="p-5">--</td>
                      <td className="p-5"><span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px]">BFWD</span></td>
                      <td className="p-5">--</td>
                      <td className="p-5 uppercase">Opening Balance</td>
                      <td className="p-5 text-blue-600 text-2xl">{state.initialBalance.toLocaleString()}</td>
                      <td className="p-5">0</td>
                      <td></td>
                    </tr>
                  )}
                  {state.mainEntries.slice().reverse().map(entry => (
                    <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="p-5 text-slate-400 text-sm">{entry.date}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] ${entry.isCard ? 'bg-yellow-400' : entry.isPayPal ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {entry.isCard ? 'CARD' : entry.isPayPal ? 'PAYPAL' : 'CASH'}
                        </span>
                      </td>
                      <td className="p-5">{entry.roomNo || '--'}</td>
                      <td className="p-5 text-base">{entry.description}</td>
                      <td className="p-5 text-green-600">{entry.cashIn > 0 ? entry.cashIn.toLocaleString() : '-'}</td>
                      <td className="p-5 text-red-500">{entry.cashOut > 0 ? entry.cashOut.toLocaleString() : '-'}</td>
                      <td className="p-5 text-right">
                        <button onClick={() => onDeleteMain(entry.id)} className="text-red-300 hover:text-red-600 transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LaptopView;
