// cacheConfig.ts
// Define default and specific TTLs for tools in milliseconds
export const toolCacheTTLs: Record<string, number> = {
  // Intraday data (very frequent updates)
  time_series_intraday_1min: 60 * 1000, // 1 minute
  time_series_intraday_5min: 5 * 60 * 1000, // 5 minutes
  time_series_intraday_15min: 15 * 60 * 1000, // 15 minutes
  time_series_intraday_30min: 30 * 60 * 1000, // 30 minutes
  time_series_intraday_60min: 60 * 60 * 1000, // 1 hour

  // Daily data (updates daily)
  time_series_daily: 6 * 60 * 60 * 1000, // 6 hours (cache until end of trading day)
  stock_quote: 5 * 60 * 1000, // 5 minutes (relatively frequent updates during market hours)
  market_status: 5 * 60 * 1000, // 5 minutes

  // Weekly/Monthly data (less frequent updates)
  time_series_weekly: 24 * 60 * 60 * 1000, // 24 hours
  time_series_monthly: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Fundamental data (updates quarterly/annually)
  company_overview: 7 * 24 * 60 * 60 * 1000, // 7 days
  income_statement: 7 * 24 * 60 * 60 * 1000, // 7 days
  balance_sheet: 7 * 24 * 60 * 60 * 1000, // 7 days
  cash_flow: 7 * 24 * 60 * 60 * 1000, // 7 days
  company_earnings: 7 * 24 * 60 * 60 * 1000, // 7 days
  company_dividends: 7 * 24 * 60 * 60 * 1000, // 7 days
  company_splits: 7 * 24 * 60 * 60 * 1000, // 7 days
  etf_profile: 7 * 24 * 60 * 60 * 1000, // 7 days
  listing_status: 7 * 24 * 60 * 60 * 1000, // 7 days
  earnings_calendar: 24 * 60 * 60 * 1000, // 24 hours
  ipo_calendar: 24 * 60 * 60 * 1000, // 24 hours

  // Economic Indicators (vary in frequency, often monthly/quarterly)
  real_gdp: 30 * 24 * 60 * 60 * 1000, // 30 days
  real_gdp_per_capita: 30 * 24 * 60 * 60 * 1000, // 30 days
  treasury_yield: 24 * 60 * 60 * 1000, // 24 hours
  federal_funds_rate: 24 * 60 * 60 * 1000, // 24 hours
  cpi: 30 * 24 * 60 * 60 * 1000, // 30 days
  inflation: 30 * 24 * 60 * 60 * 1000, // 30 days
  retail_sales: 30 * 24 * 60 * 60 * 1000, // 30 days
  durables: 30 * 24 * 60 * 60 * 1000, // 30 days
  unemployment: 30 * 24 * 60 * 60 * 1000, // 30 days
  nonfarm_payroll: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Technical Indicators (depend on underlying data frequency)
  // These will likely inherit the default TTL unless specified otherwise
  sma: 6 * 60 * 60 * 1000, // Example: match daily data TTL
  ema: 6 * 60 * 60 * 1000,
  rsi: 6 * 60 * 60 * 1000,
  bbands: 6 * 60 * 60 * 1000,
  adx: 6 * 60 * 60 * 1000,
  obv: 6 * 60 * 60 * 1000,
  atr: 6 * 60 * 60 * 1000,
  ad: 6 * 60 * 60 * 1000,
  stoch: 6 * 60 * 60 * 1000,
  aroon: 6 * 60 * 60 * 1000,

  // Alpha Intelligence (news and sentiment are dynamic)
  news_sentiment: 5 * 60 * 1000, // 5 minutes
  top_gainers_losers: 5 * 60 * 1000, // 5 minutes
  insider_transactions: 6 * 60 * 60 * 1000, // 6 hours
  earnings_call_transcript: 30 * 24 * 60 * 60 * 1000, // 30 days (historical data)
  analytics_fixed_window: 6 * 60 * 60 * 1000, // Depends on interval, default to daily
  analytics_sliding_window: 6 * 60 * 60 * 1000, // Depends on interval, default to daily

  // Options data (can be dynamic)
  historical_options: 24 * 60 * 60 * 1000, // 24 hours (historical data)

  // Crypto data (can be very frequent)
  currencyExchangeRate: 60 * 1000, // 1 minute
  digitalCurrencyDaily: 6 * 60 * 60 * 1000, // 6 hours
  digitalCurrencyWeekly: 24 * 60 * 60 * 1000, // 24 hours
  digitalCurrencyMonthly: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Default TTL for tools not explicitly listed
  DEFAULT_TTL: 1 * 60 * 60 * 1000, // 1 hour
};

export const getToolTTL = (toolName: string): number => toolCacheTTLs[toolName] || toolCacheTTLs['DEFAULT_TTL'];
