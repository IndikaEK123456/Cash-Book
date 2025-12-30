
import React, { useState, useEffect, useRef } from 'react';
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
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      const url = `${window.location.origin}${window.location.pathname}?sid=${syncId}&view=ANDROID`;
      // @ts-ignore
      new window.QRCode(qrRef.current, {
        text: url,
        width: 100,
        height: 100,
        colorDark: "#ffffff",
        colorLight: "#0f172a",
        correctLevel: 1 // QRCodes.CorrectLevel.H
      });
    }
  }, [syncId]);

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

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start mb-12 gap-8">
        <div>
          <h1 className="text-7xl font-[900] text-slate-900 tracking-tighter mb-2 leading-none">
            Shivas <span className="text-blue-600">Beach</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-12 bg-blue-600 rounded-full"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Master Ledger Management</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
           <ExchangeRatesView rates={rates} />
           <button onClick={onEndDay} className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-5 rounded-[2rem] shadow-xl transition-all uppercase text-[10px] tracking-widest active:scale-95">End Day & Flush</button>
        </div>
      </div>

      {/* Sync Control Hub */}
      <div className="bg-slate-900 rounded-[3rem] p-10 mb-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10 border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 w-full">
          <div className="bg-white/5 p-4 rounded-[2rem] border border-white/10 flex items-center gap-6">
            <div ref={qrRef} className="rounded-xl overflow-hidden p-2 bg-slate-900"></div>
            <div>
              <h3 className="text-lg font-black mb-1">Direct Sync QR</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest max-w-[150px]">Scan with Android or iPhone to link instantly</p>
            </div>
          </div>

          <div className="flex-1 space-y-4">
             <div>
               <h3 className="text-2xl font-black tracking-tight">Broadcasting Live</h3>
               <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Everything you edit here is synced in real-time</p>
             </div>
             <div className="flex flex-wrap items-center gap-4">
               <div className="bg-slate-800/50 p-2 pl-6 rounded-2xl flex items-center border border-white/5 group">
                 <span className="text-[10px] font-black text-slate-500 uppercase mr-4">Sync ID:</span>
                 <input 
                   type="text" 
                   value={syncId} 
                   onChange={(e) => onSyncIdChange(e.target.value)} 
                   className="bg-transparent border-none outline-none font-black text-blue-400 w-48 text-lg" 
                 />
               </div>
               <button 
                 onClick={() => {
                   const url = `${window.location.origin}${window.location.pathname}?sid=${syncId}&view=ANDROID`;
                   navigator.clipboard.writeText(url);
                   alert("Direct link copied!");
                 }}
                 className="bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
               >
                 Copy Viewer Link
               </button>
             </div>
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

      <div className="grid grid-cols-1 gap-12 mt-12">
        {/* Out Party Section */}
        <section className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-12 py-8 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-3xl font-[900] text-slate-800 tracking-tight">Out Party Ledger</h2>
            <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black">OP</div>
          </div>
          <div className="p-12">
            <form onSubmit={handleAddOutParty} className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {['Cash', 'Card', 'PayPal'].map(label => (
                <div key={label} className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} In (LKR)</label>
                  <input 
                    type="number" 
                    value={(opForm as any)[label.toLowerCase()]} 
                    onChange={e => setOpForm({...opForm, [label.toLowerCase()]: e.target.value})} 
                    className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-3xl font-black text-2xl outline-none focus:border-blue-500 focus:bg-white transition-all" 
                    placeholder="0.00"
                  />
                </div>
              ))}
              <div className="flex items-end">
                <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-3xl uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all">Add Record</button>
              </div>
            </form>
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-[11px] uppercase font-black">
                  <tr>
                    <th className="p-8">Timestamp</th>
                    <th className="p-8">Cash</th>
                    <th className="p-8">Card</th>
                    <th className="p-8">PayPal</th>
                    <th className="p-8 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-xl">
                  {state.outPartyEntries.slice().reverse().map(entry => (
                    <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-8 text-slate-400 text-sm">{entry.date}</td>
                      <td className="p-8 text-blue-600 font-black">{entry.cash.toLocaleString()}</td>
                      <td className="p-8 text-yellow-600 font-black">{entry.card.toLocaleString()}</td>
                      <td className="p-8 text-purple-600 font-black">{entry.paypal.toLocaleString()}</td>
                      <td className="p-8 text-right">
                        <button onClick={() => onDeleteOutParty(entry.id)} className="text-red-300 hover:text-red-600 p-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-900 p-8 flex justify-end gap-12 text-white">
                <div className="text-right"><p className="text-[10px] font-black text-blue-400 uppercase">Cash In</p><p className="text-2xl font-black">{outPartyTotals.cash.toLocaleString()}</p></div>
                <div className="text-right"><p className="text-[10px] font-black text-yellow-400 uppercase">Card In</p><p className="text-2xl font-black">{outPartyTotals.card.toLocaleString()}</p></div>
                <div className="text-right"><p className="text-[10px] font-black text-purple-400 uppercase">PayPal In</p><p className="text-2xl font-black">{outPartyTotals.paypal.toLocaleString()}</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Section */}
        <section className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden mb-20">
          <div className="bg-slate-900 px-12 py-8 flex justify-between items-center text-white">
            <h2 className="text-3xl font-[900] tracking-tight">Main Cash Ledger</h2>
            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-green-400 font-black">$$</div>
          </div>
          <div className="p-12">
            <form onSubmit={handleAddMain} className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-12">
              <input type="text" placeholder="RM-" value={mainForm.roomNo} onChange={e => setMainForm({...mainForm, roomNo: e.target.value})} className="bg-slate-50 border-2 border-slate-50 p-6 rounded-2xl font-black outline-none focus:border-blue-500" />
              <input type="text" placeholder="Detail Description..." value={mainForm.description} onChange={e => setMainForm({...mainForm, description: e.target.value})} className="bg-slate-50 border-2 border-slate-50 p-6 rounded-2xl font-black outline-none md:col-span-2 focus:border-blue-500" />
              <input type="number" placeholder="Income" value={mainForm.cashIn} onChange={e => setMainForm({...mainForm, cashIn: e.target.value})} className="bg-slate-50 border-2 border-slate-50 p-6 rounded-2xl font-black outline-none text-green-600 focus:border-green-500" />
              <input type="number" placeholder="Expense" value={mainForm.cashOut} onChange={e => setMainForm({...mainForm, cashOut: e.target.value})} className="bg-slate-50 border-2 border-slate-50 p-6 rounded-2xl font-black outline-none text-red-600 focus:border-red-500" />
              <div className="flex flex-col gap-2 justify-center px-4">
                <label className="text-[10px] font-black flex items-center gap-3 cursor-pointer select-none"><input type="checkbox" checked={mainForm.isCard} onChange={e => setMainForm({...mainForm, isCard: e.target.checked})} className="w-5 h-5 accent-yellow-400" /> CARD</label>
                <label className="text-[10px] font-black flex items-center gap-3 cursor-pointer select-none"><input type="checkbox" checked={mainForm.isPayPal} onChange={e => setMainForm({...mainForm, isPayPal: e.target.checked})} className="w-5 h-5 accent-purple-600" /> PAYPAL</label>
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">Post Entry</button>
            </form>
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-[11px] uppercase font-black">
                  <tr>
                    <th className="p-8">Time</th>
                    <th className="p-8">Method</th>
                    <th className="p-8">RM</th>
                    <th className="p-8 w-1/3">Detail</th>
                    <th className="p-8">Revenue (+)</th>
                    <th className="p-8">Expense (-)</th>
                    <th className="p-8 text-right">Del</th>
                  </tr>
                </thead>
                <tbody className="font-black text-2xl text-slate-900">
                  {state.initialBalance !== 0 && (
                    <tr className="bg-blue-50/50 border-b border-blue-100">
                      <td className="p-8">--</td>
                      <td className="p-8"><span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Start Balance</span></td>
                      <td className="p-8">--</td>
                      <td className="p-8 uppercase text-lg opacity-40">Opening Balance Forward</td>
                      <td className="p-8 text-blue-600 font-black">{state.initialBalance.toLocaleString()}</td>
                      <td className="p-8 opacity-10">0</td>
                      <td></td>
                    </tr>
                  )}
                  {state.mainEntries.slice().reverse().map(entry => (
                    <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-8 text-slate-400 text-sm">{entry.date}</td>
                      <td className="p-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${entry.isCard ? 'bg-yellow-400 text-yellow-950' : entry.isPayPal ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {entry.isCard ? 'CARD' : entry.isPayPal ? 'PAYPAL' : 'CASH'}
                        </span>
                      </td>
                      <td className="p-8 text-3xl font-[900] tracking-tighter text-blue-600">{entry.roomNo || '--'}</td>
                      <td className="p-8 text-lg">{entry.description}</td>
                      <td className="p-8 text-green-600 font-black">{entry.cashIn > 0 ? entry.cashIn.toLocaleString() : '-'}</td>
                      <td className="p-8 text-red-500 font-black">{entry.cashOut > 0 ? entry.cashOut.toLocaleString() : '-'}</td>
                      <td className="p-8 text-right">
                        <button onClick={() => onDeleteMain(entry.id)} className="text-red-200 hover:text-red-600 p-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path></svg>
                        </button>
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
