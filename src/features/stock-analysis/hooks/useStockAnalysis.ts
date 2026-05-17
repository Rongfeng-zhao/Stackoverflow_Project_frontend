import { useState } from 'react';
import { fetchStockAnalysis, StockAnalysisApiError } from '../api/stockAnalysisApi';
import type {
  StockAnalysisErrorType,
  StockAnalysisResult,
  StockAnalysisStatus,
} from '../model/stockAnalysis.domainTypes';

interface StockAnalysisErrorState {
  type: StockAnalysisErrorType;
  message: string;
}

function createUiError(error: StockAnalysisApiError): StockAnalysisErrorState {
  return {
    type: error.type,
    message: error.message,
  };
}

export function useStockAnalysis() {
  const [tickerInput, setTickerInput] = useState('');
  const [status, setStatus] = useState<StockAnalysisStatus>('idle');
  const [result, setResult] = useState<StockAnalysisResult | null>(null);
  const [error, setError] = useState<StockAnalysisErrorState | null>(null);

  const analyze = async (ticker = tickerInput) => {
    setStatus('loading');
    setError(null);

    try {
      const nextResult = await fetchStockAnalysis(ticker);
      setResult(nextResult);
      setTickerInput(nextResult.ticker);
      setStatus('success');
    } catch (caughtError) {
      setResult(null);
      setStatus('error');
      if (caughtError instanceof StockAnalysisApiError) {
        setError(createUiError(caughtError));
        return;
      }
      setError({
        type: 'provider_failure',
        message: 'Unexpected stock analysis failure.',
      });
    }
  };

  return {
    tickerInput,
    setTickerInput,
    status,
    result,
    error,
    analyze,
  };
}
