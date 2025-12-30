
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
    alert("Sync link copied! Open this on your mobile devices to view real-time updates.");
  };

  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-10">
        <div className="animate-in fade-in slide-in-from-left duration-700">
          <h1 className="text-6xl font-[900] text-slate-900 mb-2 tracking-tighter leading-none">
            Shivas Beach <span className="text-blue-600">Cabanas</span>
          </h1>
          <div className="flex items-center space-x-2">
            <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
            <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Premium Ledger Management</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-4 mt-6 lg:mt-0 animate-in fade-in slide-in-from-right duration-700">
           <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Session</p>
                <div className="text-slate-950 font-black text-3xl tabular-nums">{currentDate}</div>
              </div>
           </div>
           
           <div className="flex items-center space-x-4">
             <ExchangeRatesView rates={rates} />
             <button 
               onClick={onEndDay}
               className="group bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl hover:shadow-red-200 transition-all uppercase tracking-widest text-xs flex items-center space-x-3 active:scale-95"
             >
               <span>End Work Day</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
             </button>
           </div>
        </div>
      </div>

      {/* Connectivity & Sync Panel */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 mb-10 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl border border-slate-800">
        <div className="flex items-center space-x-6 mb-6 md:mb-0">
          <div className="h-16 w-16 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Real-Time Connectivity</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Broadcasting to Android & iPhone Viewers</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="bg-slate-800 p-2 pl-6 rounded-2xl flex items-center border border-slate-700 w-full md:w-auto">
            <span className="text-[10px] font-black text-slate-500 uppercase mr-4">Sync ID:</span>
            <input 
              type="text" 
              value={syncId} 
              onChange={(e) => onSyncIdChange(e.target.value)} 
              className="bg-transparent border-none outline-none font-black text-blue-400 w-32" 
            />
          </div>
          <button 
            onClick={copySyncLink}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            Copy Viewer Link
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

      <div className="grid grid-cols-1 gap-12">
        {/* Out Party Section */}
        <section className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-10 py-8 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Out Party Ledger</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">External Assets & Events</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            </div>
          </div>
          
          <div className="p-10">
            <form onSubmit={handleAddOutParty} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200">
              {['Cash', 'Card', 'PayPal'].map((label) => (
                <div key={label} className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">{label} In</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">LKR</span>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={(opForm as any)[label.toLowerCase()]} 
                      onChange={e => setOpForm({...opForm, [label.toLowerCase()]: e.target.value})} 
                      className="w-full bg-white border-2 border-slate-100 p-4 pl-14 rounded-2xl focus:border-blue-500 outline-none text-slate-950 font-black text-xl transition-all" 
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-end">
                <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] uppercase tracking-widest text-xs">Add Record</button>
              </div>
            </form>

            <div className="overflow-x-auto rounded-3xl border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Card</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">PayPal</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Del</th>
                  </tr>
                </thead>
                <tbody className="font-bold">
                  {state.outPartyEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 px-6 text-sm text-slate-500">{entry.date}</td>
                      <td className="py-6 px-6 text-blue-600 font-black text-xl">{entry.cash.toLocaleString()}</td>
                      <td className="py-6 px-6 text-yellow-600 font-black text-xl">{entry.card.toLocaleString()}</td>
                      <td className="py-6 px-6 text-purple-600 font-black text-xl">{entry.paypal.toLocaleString()}</td>
                      <td className="py-6 px-6 text-right">
                        <button onClick={() => onDeleteOutParty(entry.id)} className="p-2 text-red-300 hover:text-red-600 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-900 text-white p-8 flex justify-between items-center">
                <span className="font-black text-xs tracking-[0.3em] uppercase opacity-50">Out-Party Totals</span>
                <div className="flex space-x-12">
                  <div className="text-right"><p className="text-[9px] font-black text-blue-400 uppercase">Cash</p><p className="text-2xl font-black">{outPartyTotals.cash.toLocaleString()}</p></div>
                  <div className="text-right"><p className="text-[9px] font-black text-yellow-400 uppercase">Card</p><p className="text-2xl font-black">{outPartyTotals.card.toLocaleString()}</p></div>
                  <div className="text-right"><p className="text-[9px] font-black text-purple-400 uppercase">PayPal</p><p className="text-2xl font-black">{outPartyTotals.paypal.toLocaleString()}</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Ledger Section */}
        <section className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 px-10 py-8 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Main Cash Ledger</h2>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Internal Cabana Operations</p>
            </div>
            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect></svg>
            </div>
          </div>
          <div className="p-10">
            <form onSubmit={handleAddMain} className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-12 bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Room No.</label>
                <input type="text" placeholder="RM-" value={mainForm.roomNo} onChange={e => setMainForm({...mainForm, roomNo: e.target.value})} className="bg-white border-2 border-slate-100 p-4 rounded-xl outline-none focus:border-blue-500 text-slate-950 font-black text-lg transition-all" />
              </div>
              <div className="flex flex-col space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Detail</label>
                <input type="text" placeholder="Description..." value={mainForm.description} onChange={e => setMainForm({...mainForm, description: e.target.value})} className="bg-white border-2 border-slate-100 p-4 rounded-xl outline-none focus:border-blue-500 text-slate-950 font-black text-lg transition-all" />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Revenue (+)</label>
                <input type="number" placeholder="0" value={mainForm.cashIn} onChange={e => setMainForm({...mainForm, cashIn: e.target.value})} className="bg-white border-2 border-slate-100 p-4 rounded-xl outline-none focus:border-green-500 text-slate-950 font-black text-lg transition-all" />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Expense (-)</label>
                <input type="number" placeholder="0" value={mainForm.cashOut} onChange={e => setMainForm({...mainForm, cashOut: e.target.value})} className="bg-white border-2 border-slate-100 p-4 rounded-xl outline-none focus:border-red-500 text-slate-950 font-black text-lg transition-all" />
              </div>
              <div className="flex flex-col justify-center items-start space-y-2 px-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" checked={mainForm.isCard} onChange={e => setMainForm({...mainForm, isCard: e.target.checked})} className="w-6 h-6 rounded-md accent-yellow-500" />
                  <span className="text-[11px] font-black text-slate-600 uppercase">Card</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" checked={mainForm.isPayPal} onChange={e => setMainForm({...mainForm, isPayPal: e.target.checked})} className="w-6 h-6 rounded-md accent-purple-500" />
                  <span className="text-[11px] font-black text-slate-600 uppercase">PayPal</span>
                </label>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] uppercase tracking-widest text-xs">Post</button>
              </div>
            </form>

            <div className="overflow-x-auto rounded-3xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Time</th>
                    <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-center">Type</th>
                    <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">RM</th>
                    <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 w-[30%]">Description</th>
                    <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Revenue</th>
                    <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Expense</th>
                    <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-right">Del</th>
                  </tr>
                </thead>
                <tbody className="font-black text-slate-950 text-lg">
                   {state.initialBalance !== 0 && (
                    <tr className="bg-blue-50 border-b-2 border-blue-100">
                      <td className="py-6 px-6 text-slate-400 text-xs font-bold uppercase">START</td>
                      <td className="py-6 px-4 text-center"><span className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-black">BFWD</span></td>
                      <td className="py-6 px-4">—</td>
                      <td className="py-6 px-6 text-blue-900 font-black text-base uppercase">OPENING BALANCE</td>
                      <td className="py-6 px-6 text-blue-600 font-black text-2xl">{state.initialBalance.toLocaleString()}</td>
                      <td className="py-6 px-6 text-slate-300">0</td>
                      <td></td>
                    </tr>
                  )}
                  {state.mainEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-slate-50 group hover:bg-slate-50 transition-all">
                      <td className="py-7 px-6 font-bold text-slate-400 text-xs">{entry.date}</td>
                      <td className="py-7 px-4 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest ${entry.isCard ? 'bg-yellow-400 text-yellow-900' : entry.isPayPal ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {entry.isCard ? 'CARD' : entry.isPayPal ? 'PAYPAL' : 'CASH'}
                        </span>
                      </td>
                      <td className="py-7 px-4 text-slate-950 font-black text-xl">{entry.roomNo || '--'}</td>
                      <td className="py-7 px-6 text-slate-950 font-black text-base">{entry.description}</td>
                      <td className="py-7 px-6 text-green-600 font-black text-2xl">{entry.cashIn > 0 ? entry.cashIn.toLocaleString() : '-'}</td>
                      <td className="py-7 px-6 text-red-500 font-black text-2xl">{entry.cashOut > 0 ? entry.cashOut.toLocaleString() : '-'}</td>
                      <td className="py-7 px-6 text-right">
                        <button onClick={() => onDeleteMain(entry.id)} className="p-2 text-slate-200 hover:text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path></svg>
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
