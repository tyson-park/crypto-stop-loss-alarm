import { NextResponse } from 'next/server';
import { ATR } from 'technicalindicators';

export async function GET(req: Request) {
  console.log('Incoming request:', req.url);

  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker') || 'KRW-BTC'; // Default to KRW-BTC
  console.log('Ticker:', ticker);

  try {
    // Fetch Upbit candlestick data
    const response = await fetch(
      `https://api.upbit.com/v1/candles/minutes/60?market=${ticker}&count=200`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data from Upbit: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw data fetched:', data.length, 'candles');

    // Parse data into arrays
    const highs = data.map((candle: any) => candle.high_price);
    const lows = data.map((candle: any) => candle.low_price);
    const closes = data.map((candle: any) => candle.trade_price);

    console.log('Parsed arrays:', {
      highs: highs.slice(-5), // last 5 values for brevity
      lows: lows.slice(-5),
      closes: closes.slice(-5),
    });

    // Get current price (close price of the latest candle)
    const currentPrice = closes[0];
    console.log('Current Price:', currentPrice);

    // Calculate ATR
    const atrValues = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });
    console.log('ATR values (last 5):', atrValues.slice(-5));

    // Find Pivot Lows
    function findPivotLows(lowArray: number[], leftBars: number, rightBars: number) {
      const pivotLows: { index: number; value: number }[] = [];
      for (let i = leftBars; i < lowArray.length - rightBars; i++) {
        const left = lowArray.slice(i - leftBars, i);
        const right = lowArray.slice(i + 1, i + 1 + rightBars);
        if (lowArray[i] < Math.min(...left) && lowArray[i] < Math.min(...right)) {
          pivotLows.push({ index: i, value: lowArray[i] });
        }
      }
      return pivotLows;
    }

    const pivotLows = findPivotLows(lows, 15, 15);
    console.log('Pivot Lows:', pivotLows.slice(-5)); // show last few for brevity

    if (pivotLows.length === 0) {
      throw new Error('No pivot lows found in the dataset.');
    }

    const recentPivot = pivotLows[pivotLows.length - 1];
    console.log('Most recent pivot low:', recentPivot);

    const recentATR = atrValues[recentPivot.index - 14 + 1];
    console.log('Recent ATR:', recentATR);

    const swingLowMinusATR = recentPivot.value - recentATR;
    console.log('swingLowMinusATR:', swingLowMinusATR);

    return NextResponse.json({
      ticker,
      currentPrice,
      recentPivotLow: recentPivot.value,
      atr: recentATR,
      swingLowMinusATR,
    });
  } catch (error: any) {
    console.error('Error in API:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}