export interface Stock {
  ticker: string;
  currentPrice: number;
  currentDividend: number;
  bestPrice: number;
  bestDividend: number;
  distanceBetweenPrices: number;
  haveOptions: boolean;
  scoreByBestPrice: number;
}
