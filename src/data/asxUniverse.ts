export interface AsxTrackedCompany {
  ticker: string;
  company_name: string;
  sector: string;
  weight: number;
  alpha_vantage_symbol: string;
  twelve_data_symbol: string;
}

export const asxTrackedCompanies: AsxTrackedCompany[] = [
  {
    ticker: 'BHP',
    company_name: 'BHP Group Ltd',
    sector: 'Materials',
    weight: 18,
    alpha_vantage_symbol: 'BHP.AX',
    twelve_data_symbol: 'BHP:XASX',
  },
  {
    ticker: 'CBA',
    company_name: 'Commonwealth Bank of Australia',
    sector: 'Financials',
    weight: 16,
    alpha_vantage_symbol: 'CBA.AX',
    twelve_data_symbol: 'CBA:XASX',
  },
  {
    ticker: 'CSL',
    company_name: 'CSL Limited',
    sector: 'Health Care',
    weight: 14,
    alpha_vantage_symbol: 'CSL.AX',
    twelve_data_symbol: 'CSL:XASX',
  },
  {
    ticker: 'WES',
    company_name: 'Wesfarmers Limited',
    sector: 'Consumer',
    weight: 10,
    alpha_vantage_symbol: 'WES.AX',
    twelve_data_symbol: 'WES:XASX',
  },
  {
    ticker: 'NAB',
    company_name: 'National Australia Bank',
    sector: 'Financials',
    weight: 9,
    alpha_vantage_symbol: 'NAB.AX',
    twelve_data_symbol: 'NAB:XASX',
  },
  {
    ticker: 'FMG',
    company_name: 'Fortescue Ltd',
    sector: 'Materials',
    weight: 8,
    alpha_vantage_symbol: 'FMG.AX',
    twelve_data_symbol: 'FMG:XASX',
  },
  {
    ticker: 'MQG',
    company_name: 'Macquarie Group Ltd',
    sector: 'Financials',
    weight: 7,
    alpha_vantage_symbol: 'MQG.AX',
    twelve_data_symbol: 'MQG:XASX',
  },
  {
    ticker: 'WOW',
    company_name: 'Woolworths Group Ltd',
    sector: 'Consumer',
    weight: 7,
    alpha_vantage_symbol: 'WOW.AX',
    twelve_data_symbol: 'WOW:XASX',
  },
];

export function findTrackedCompany(ticker: string) {
  return asxTrackedCompanies.find((company) => company.ticker === ticker);
}
