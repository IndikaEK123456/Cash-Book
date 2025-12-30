
import { ExchangeRates } from '../types';

export const fetchLkrRates = async (): Promise<ExchangeRates> => {
  try {
    // Using a reliable public API for demonstration. 
    // In a real production app, you'd use a more stable provider.
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    
    // Get EUR to USD to derive EUR to LKR
    const usdToLkr = data.rates.LKR;
    const eurToUsd = data.rates.EUR; // Rate is USD per 1 EUR? No, base is USD.
    // data.rates.EUR is how many EUR for 1 USD.
    // 1 EUR = (1 / data.rates.EUR) USD.
    // 1 EUR = (1 / data.rates.EUR) * usdToLkr LKR.
    
    const eurToLkr = (1 / data.rates.EUR) * usdToLkr;

    return {
      usdToLkr: Math.ceil(usdToLkr),
      eurToLkr: Math.ceil(eurToLkr)
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Fallback static rates if API fails
    return {
      usdToLkr: 310,
      eurToLkr: 335
    };
  }
};
