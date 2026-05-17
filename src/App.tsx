import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import { Header } from './features/stock-analysis/components/Header';
import { NewsList } from './features/stock-analysis/components/NewsList';
import { PriceHistoryCard } from './features/stock-analysis/components/PriceHistoryCard';
import { SearchBar } from './features/stock-analysis/components/SearchBar';
import { SentimentCard } from './features/stock-analysis/components/SentimentCard';
import { StockInfoCard } from './features/stock-analysis/components/StockInfoCard';
import { sanitizeTickerInput } from './features/stock-analysis/api/stockAnalysisApi';
import { useStockAnalysis } from './features/stock-analysis/hooks/useStockAnalysis';

const exampleTickers = ['AAPL', 'MSFT', 'NVDA', 'TSLA'];

function getErrorCopy(type: string | undefined, ticker: string, message?: string) {
  switch (type) {
    case 'invalid_ticker':
      return {
        title: 'Enter a valid US ticker',
        message:
          'Use uppercase letters, dot, or hyphen for a common US ticker, such as AAPL, MSFT, NVDA, or BRK.B.',
      };
    case 'unsupported_market':
      return {
        title: 'Unsupported market',
        message: 'This MVP currently supports US stocks only.',
      };
    case 'stock_not_found':
      return {
        title: 'Ticker not found',
        message: `We could not find a supported US stock record for ${ticker}.`,
      };
    case 'no_news':
      return {
        title: 'No recent news found',
        message: `We could not find enough recent news coverage for ${ticker}. Try one of the sample tickers above.`,
      };
    default:
      return {
        title: 'Analysis service unavailable',
        message: message ?? 'The stock analysis request failed. Please try again shortly.',
      };
  }
}

function App() {
  const { tickerInput, setTickerInput, status, result, error, analyze } = useStockAnalysis();
  const errorCopy = getErrorCopy(error?.type, tickerInput, error?.message);

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        <SearchBar
          value={tickerInput}
          onChange={(value) => setTickerInput(sanitizeTickerInput(value))}
          onSubmit={() => void analyze()}
          onQuickSelect={(ticker) => {
            setTickerInput(ticker);
            void analyze(ticker);
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
            onRetry={tickerInput ? () => void analyze(tickerInput) : undefined}
          />
        ) : null}

        {status === 'success' && result ? (
          <section className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <StockInfoCard stock={result} />
              <SentimentCard
                sentiment={result.overallSentiment}
                confidence={result.confidence}
                articleCount={result.articleCount}
                positiveCount={result.positiveCount}
                negativeCount={result.negativeCount}
                neutralCount={result.neutralCount}
                modelName={result.modelName}
              />
            </div>

            <PriceHistoryCard points={result.priceHistory} currency={result.currency} />
            <NewsList items={result.newsItems} provider={result.newsProvider} />
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default App;
