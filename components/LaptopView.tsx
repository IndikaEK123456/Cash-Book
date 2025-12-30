
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
        width: 120,
        height: 120,
        colorDark: "#ffffff",
        colorLight: "#020617",
        correctLevel: 1
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
    <div className="max-w-[1600px] mx-auto p-6 md:p-12">
      {/* Brand Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start mb-16 gap-10">
        <div>
          <h1 className="text-[10rem] font-[900] text-black tracking-tighter mb-4 leading-[0.8]">
            Shivas <span className="text-blue-600">Beach</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-3 w-24 bg-blue-600 rounded-full"></div>
            <p className="text-slate-900 font-black uppercase tracking-[0.5em] text-[12px]">Master Broadcasting Unit</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-8">
           <ExchangeRatesView rates={rates} />
           <button onClick={onEndDay} className="bg-red-600 hover:bg-red-700 text-white font-[900] px-14 py-8 rounded-[2rem] shadow-2xl transition-all uppercase text-xs tracking-[0.3em] active:scale-95">End Work Day</button>
        </div>
      </div>

      {/* Broadcasting Hub */}
      <div className="bg-black rounded-[4rem] p-16 mb-16 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-16 border border-white/10">
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-blue-600/20 blur-[180px] rounded-full"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-16 relative z-10 w-full">
          <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 flex items-center gap-10 shadow-inner">
            <div ref={qrRef} className="rounded-3xl overflow-hidden p-4 bg-black border border-white/20"></div>
            <div>
              <h3 className="text-2xl font-[900] mb-3">Live Pairing</h3>
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest max-w-[200px] leading-relaxed">Point Android or iPhone camera here for instant sync</p>
            </div>
          </div>

          <div className="flex-1 space-y-8">
             <div>
               <h3 className="text-5xl font-[900] tracking-tighter">Sync Channel Alpha</h3>
               <p className="text-blue-400 text-[11px] font-[900] uppercase tracking-[0.4em] mt-3">High-speed 3s heartbeat broadcasting</p>
             </div>
             <div className="flex flex-wrap items-center gap-6">
               <div className="bg-slate-900/50 backdrop-blur-md p-4 pl-10 rounded-3xl flex items-center border border-white/10 shadow-inner">
                 <span className="text-[11px] font-black text-slate-500 uppercase mr-6">Channel ID:</span>
                 <input 
                   type="text" 
                   value={syncId} 
                   onChange={(e) => onSyncIdChange(e.target.value)} 
                   className="bg-transparent border-none outline-none font-[900] text-blue-400 w-64 text-2xl !text-blue-400" 
                 />
               </div>
               <button 
                 onClick={() => {
                   const url = `${window.location.origin}${window.location.pathname}?sid=${syncId}&view=ANDROID`;
                   navigator.clipboard.writeText(url);
                   alert("Master Link Copied!");
                 }}
                 className="bg-blue-600 hover:bg-blue-500 px-12 py-8 rounded-3xl font-[900] text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95"
               >
                 Copy Terminal Link
               </button>
             </div>
          </div>
        </div>
      </div>

      <TotalsHeader 
        drawerBalance={calculations.drawerBalance}
        totalCashIn={calculations.totalCashIn}
        totalCashOut={calculations.totalCashOut}
        finalCardTotal={calculations.cardTotal}
        finalPayPalTotal={calculations.paypalTotal}
      />

      <div className="grid grid-cols-1 gap-20 mt-16">
        {/* Out Party Form */}
        <section className="bg-white rounded-[5rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-20 py-12 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-5xl font-[900] text-black tracking-tighter">Out Party Registry</h2>
            <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl">OP</div>
          </div>
          <div className="p-20">
            <form onSubmit={handleAddOutParty} className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-20">
              {['Cash', 'Card', 'PayPal'].map(label => (
                <div key={label} className="space-y-4">
                  <label className="text-[12px] font-[900] text-slate-500 uppercase tracking-widest ml-2">{label} Asset</label>
                  <input 
                    type="number" 
                    value={(opForm as any)[label.toLowerCase()]} 
                    onChange={e => setOpForm({...opForm, [label.toLowerCase()]: e.target.value})} 
                    className="w-full bg-slate-100 border-4 border-slate-50 p-8 rounded-[2.5rem] font-[900] text-4xl outline-none focus:border-blue-600 focus:bg-white transition-all text-black" 
                    placeholder="0"
                  />
                </div>
              ))}
              <div className="flex items-end">
                <button type="submit" className="w-full bg-black hover:bg-slate-900 text-white font-[900] py-8 rounded-[2.5rem] uppercase text-sm tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Record Entry</button>
              </div>
            </form>
            
            <div className="overflow-hidden rounded-[4rem] border-8 border-slate-50">
              <table className="w-full text-left">
                <thead className="bg-black text-white text-[12px] uppercase font-black">
                  <tr>
                    <th className="p-12">Time Record</th>
                    <th className="p-12">Cash Flow</th>
                    <th className="p-12">Card Ledger</th>
                    <th className="p-12">PayPal Fund</th>
                    <th className="p-12 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="font-[900] text-3xl text-black">
                  {state.outPartyEntries.slice().reverse().map(entry => (
                    <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-12 text-slate-400 text-sm font-bold uppercase">{entry.date}</td>
                      <td className="p-12 text-blue-600 tabular-nums">{entry.cash.toLocaleString()}</td>
                      <td className="p-12 text-yellow-600 tabular-nums">{entry.card.toLocaleString()}</td>
                      <td className="p-12 text-purple-600 tabular-nums">{entry.paypal.toLocaleString()}</td>
                      <td className="p-12 text-right">
                        <button onClick={() => onDeleteOutParty(entry.id)} className="text-red-200 hover:text-red-600 transition-colors p-4">
                           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Main Ledger Form */}
        <section className="bg-white rounded-[5rem] shadow-2xl border border-slate-100 overflow-hidden mb-32">
          <div className="bg-black px-20 py-12 flex justify-between items-center text-white">
            <h2 className="text-5xl font-[900] tracking-tighter">Revenue Master Ledger</h2>
            <div className="h-16 w-16 bg-green-500 rounded-3xl flex items-center justify-center text-black font-black text-2xl">ML</div>
          </div>
          <div className="p-20">
            <form onSubmit={handleAddMain} className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-20">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">Room #</label>
                <input type="text" placeholder="RM-" value={mainForm.roomNo} onChange={e => setMainForm({...mainForm, roomNo: e.target.value})} className="w-full bg-slate-100 border-4 border-slate-50 p-7 rounded-3xl font-[900] text-black outline-none focus:border-blue-600" />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">Description</label>
                <input type="text" placeholder="Transaction details..." value={mainForm.description} onChange={e => setMainForm({...mainForm, description: e.target.value})} className="w-full bg-slate-100 border-4 border-slate-50 p-7 rounded-3xl font-[900] text-black outline-none focus:border-blue-600" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">In (+)</label>
                <input type="number" placeholder="0" value={mainForm.cashIn} onChange={e => setMainForm({...mainForm, cashIn: e.target.value})} className="w-full bg-slate-100 border-4 border-slate-50 p-7 rounded-3xl font-[900] text-green-700 outline-none focus:border-green-600" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">Out (-)</label>
                <input type="number" placeholder="0" value={mainForm.cashOut} onChange={e => setMainForm({...mainForm, cashOut: e.target.value})} className="w-full bg-slate-100 border-4 border-slate-50 p-7 rounded-3xl font-[900] text-red-700 outline-none focus:border-red-600" />
              </div>
              <div className="flex flex-col gap-4 justify-center px-6">
                <label className="text-[12px] font-[900] flex items-center gap-5 cursor-pointer text-black"><input type="checkbox" checked={mainForm.isCard} onChange={e => setMainForm({...mainForm, isCard: e.target.checked})} className="w-7 h-7 accent-yellow-400" /> CARD</label>
                <label className="text-[12px] font-[900] flex items-center gap-5 cursor-pointer text-black"><input type="checkbox" checked={mainForm.isPayPal} onChange={e => setMainForm({...mainForm, isPayPal: e.target.checked})} className="w-7 h-7 accent-purple-600" /> PAYPAL</label>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-[900] p-7 rounded-3xl uppercase text-[11px] tracking-widest shadow-2xl active:scale-95 transition-all">Post Record</button>
              </div>
            </form>

            <div className="overflow-hidden rounded-[4rem] border-8 border-slate-50">
              <table className="w-full text-left">
                <thead className="bg-black text-white text-[12px] uppercase font-black">
                  <tr>
                    <th className="p-10">Timestamp</th>
                    <th className="p-10">Method</th>
                    <th className="p-10">RM#</th>
                    <th className="p-10 w-1/3">Detail</th>
                    <th className="p-10">Revenue</th>
                    <th className="p-10">Expense</th>
                    <th className="p-10 text-right">Del</th>
                  </tr>
                </thead>
                <tbody className="font-[900] text-3xl text-black">
                  {state.initialBalance !== 0 && (
                    <tr className="bg-blue-50/50 border-b border-blue-100">
                      <td className="p-10">--</td>
                      <td className="p-10"><span className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest">OPEN_BAL</span></td>
                      <td className="p-10">--</td>
                      <td className="p-10 uppercase text-xl text-blue-500">Balance From Last Shift</td>
                      <td className="p-10 text-blue-600 tabular-nums">{state.initialBalance.toLocaleString()}</td>
                      <td className="p-10 opacity-10">0</td>
                      <td></td>
                    </tr>
                  )}
                  {state.mainEntries.slice().reverse().map(entry => (
                    <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-10 text-slate-400 text-sm font-bold">{entry.date}</td>
                      <td className="p-10">
                        <span className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest ${entry.isCard ? 'bg-yellow-400 text-yellow-950' : entry.isPayPal ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {entry.isCard ? 'CARD' : entry.isPayPal ? 'PAYPAL' : 'CASH'}
                        </span>
                      </td>
                      <td className="p-10 text-4xl font-[900] text-blue-600">{entry.roomNo || '--'}</td>
                      <td className="p-10 text-xl font-bold">{entry.description}</td>
                      <td className="p-10 text-green-600 tabular-nums">{entry.cashIn > 0 ? entry.cashIn.toLocaleString() : '-'}</td>
                      <td className="p-10 text-red-500 tabular-nums">{entry.cashOut > 0 ? entry.cashOut.toLocaleString() : '-'}</td>
                      <td className="p-10 text-right">
                        <button onClick={() => onDeleteMain(entry.id)} className="text-red-200 hover:text-red-600 transition-colors p-4">
                           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path></svg>
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
