
import React from 'react';

interface TotalsHeaderProps {
  drawerBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  finalCardTotal: number;
  finalPayPalTotal: number;
}

const TotalsHeader: React.FC<TotalsHeaderProps> = ({ drawerBalance, totalCashIn, totalCashOut, finalCardTotal, finalPayPalTotal }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <div className="bg-white p-5 rounded-2xl shadow-sm border-l-8 border-blue-500 hover:shadow-md transition-shadow">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Final Drawer Balance</div>
        <div className="text-3xl font-black text-blue-600">LKR {drawerBalance.toLocaleString()}</div>
      </div>
      <div className="bg-white p-5 rounded-2xl shadow-sm border-l-8 border-green-500 hover:shadow-md transition-shadow">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Cash In</div>
        <div className="text-2xl font-bold text-green-600">{totalCashIn.toLocaleString()}</div>
      </div>
      <div className="bg-white p-5 rounded-2xl shadow-sm border-l-8 border-red-500 hover:shadow-md transition-shadow">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Cash Out</div>
        <div className="text-2xl font-bold text-red-600">{totalCashOut.toLocaleString()}</div>
      </div>
      <div className="bg-yellow-50 p-5 rounded-2xl shadow-sm border-l-8 border-yellow-400 hover:shadow-md transition-shadow">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Final Card Total</div>
        <div className="text-2xl font-bold text-yellow-700">{finalCardTotal.toLocaleString()}</div>
      </div>
      <div className="bg-purple-50 p-5 rounded-2xl shadow-sm border-l-8 border-purple-400 hover:shadow-md transition-shadow">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Final PayPal Total</div>
        <div className="text-2xl font-bold text-purple-700">{finalPayPalTotal.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default TotalsHeader;
