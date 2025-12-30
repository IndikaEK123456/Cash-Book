
import React from 'react';
import { ExchangeRates } from '../types';

const ExchangeRatesView: React.FC<{ rates: ExchangeRates }> = ({ rates }) => {
  return (
    <div className="flex space-x-4 mb-6 bg-slate-800 p-3 rounded-xl inline-flex text-white shadow-inner">
      <div className="flex items-center space-x-2 px-3 border-r border-slate-700">
        <span className="text-xs font-medium text-slate-400">USD to LKR:</span>
        <span className="text-lg font-bold text-blue-400">{rates.usdToLkr || '---'}</span>
      </div>
      <div className="flex items-center space-x-2 px-3">
        <span className="text-xs font-medium text-slate-400">EUR to LKR:</span>
        <span className="text-lg font-bold text-orange-400">{rates.eurToLkr || '---'}</span>
      </div>
    </div>
  );
};

export default ExchangeRatesView;
