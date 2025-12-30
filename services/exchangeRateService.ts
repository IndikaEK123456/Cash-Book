
import { ExchangeRates } from '../types';

export const fetchLkrRates = async (): Promise<ExchangeRates> => {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    if (!data || !data.rates || !data.rates.LKR || !data.rates.EUR) {
      throw new Error('Invalid data format from exchange rate API');
    }

    const usdToLkr = data.rates.LKR;
    // 1 EUR = (1 / data.rates.EUR) * usdToLkr LKR
    const eurToLkr = (1 / data.rates.EUR) * usdToLkr;

    return {
      usdToLkr: Math.ceil(usdToLkr),
      eurToLkr: Math.ceil(eurToLkr)
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Reliable fallback rates if API fails or rate limits hit
    return {
      usdToLkr: 312,
      eurToLkr: 338
    };
  }
};
