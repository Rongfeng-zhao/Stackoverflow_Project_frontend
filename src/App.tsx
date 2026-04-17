import { useState } from 'react';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { Header } from './components/Header';
import { LoadingState } from './components/LoadingState';
import { NewsList } from './components/NewsList';
import { PriceHistoryCard } from './components/PriceHistoryCard';
import { SearchBar } from './components/SearchBar';
import { SentimentCard } from './components/SentimentCard';
import { StockInfoCard } from './components/StockInfoCard';
import { SentimentApiError, fetchStockSentiment } from './services/stockSentimentApi';
import type { DashboardStatus, StockSentimentResult } from './types/stock';
import { sanitizeTickerInput } from './utils/ticker';

const exampleTickers = ['BHP', 'CBA', 'CSL', 'WES'];

function getErrorCopy(error: SentimentApiError | null, ticker: string) {
  switch (error?.type) {
    case 'invalid_ticker':
      return {
        title: 'Enter a valid ASX ticker',
        message:
          'Use 3 to 4 uppercase letters for an ASX-listed company, such as BHP, CBA, CSL, or WES.',
      };
    case 'no_news':
      return {
        title: 'No recent news found',
        message: `We could not find enough recent news coverage for ${ticker}. Try one of the sample ASX tickers above.`,
      };
    case 'api_failure':
      return {
        title: 'Analysis service unavailable',
        message:
          'The mock analysis request failed. This state is ready for future API error handling and retry logic.',
      };
    default:
      return {
        title: 'Something went wrong',
        message: 'Please try another ASX ticker or retry the analysis.',
      };
  }
}

function App() {
  const [tickerInput, setTickerInput] = useState('');
  const [status, setStatus] = useState<DashboardStatus>('idle');
  const [result, setResult] = useState<StockSentimentResult | null>(null);
  const [error, setError] = useState<SentimentApiError | null>(null);

  const errorCopy = getErrorCopy(error, tickerInput);

  const handleAnalyze = async (ticker = tickerInput) => {
    setStatus('loading');
    setError(null);

    try {
      const response = await fetchStockSentiment(ticker);
      setResult(response.result);
      setTickerInput(response.result.ticker);
      setStatus('success');
    } catch (caughtError) {
      setResult(null);
      setStatus('error');

      if (caughtError instanceof SentimentApiError) {
        setError(caughtError);
        return;
      }

      setError(new SentimentApiError('api_failure', 'Unexpected sentiment analysis failure.'));
    }
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        <SearchBar
          value={tickerInput}
          onChange={(value) => setTickerInput(sanitizeTickerInput(value))}
          onSubmit={() => void handleAnalyze()}
          onQuickSelect={(ticker) => {
            setTickerInput(ticker);
            void handleAnalyze(ticker);
          }}
          isLoading={status === 'loading'}
          exampleTickers={exampleTickers}
        />

        {status === 'idle' ? <EmptyState /> : null}
        {status === 'loading' ? <LoadingState /> : null}
        {status === 'error' ? (
          <ErrorState
            title={errorCopy.title}
            message={errorCopy.message}
            onRetry={tickerInput ? () => void handleAnalyze(tickerInput) : undefined}
          />
        ) : null}

        {status === 'success' && result ? (
          <section className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <StockInfoCard stock={result} />
              <SentimentCard
                sentiment={result.overall_sentiment}
                confidence={result.confidence}
                articleCount={result.article_count}
                positiveCount={result.sentiment_summary?.positive_count}
                negativeCount={result.sentiment_summary?.negative_count}
              />
            </div>

            <PriceHistoryCard points={result.price_history ?? []} currency={result.currency} />
            <NewsList items={result.news_items} />
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default App;
