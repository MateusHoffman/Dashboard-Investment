import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function fetchWithRetry(url: string, options: RequestInit, maxAttempts: number = 999) {
  let attempt = 0
  const baseDelay = 1000

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(url, options)

      if (response.ok) {
        return await response.json()
      } else {
        if (response.status === 429) {
          const cooldown = 3000 + attempt * 1000
          await new Promise((resolve) => setTimeout(resolve, cooldown))
          attempt++
          continue
        }

        if (response.status >= 500 && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, baseDelay))
        }

        throw new Error(`Error on request to ${url}: ${response.statusText}`)
      }
    } catch (error) {
      if (attempt < maxAttempts - 1) {
        const jitter = Math.random() * 100
        const fibonacciDelay = baseDelay * Math.pow(1.618, attempt)
        const delay = fibonacciDelay + jitter
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
      attempt++
    }
  }
  throw new Error(`Failed to fetch ${url} after ${maxAttempts} attempts`)
}

async function fetchTickers(): Promise<string[]> {
  const url = "https://statusinvest.com.br/category/advancedsearchresultpaginated?search=%7B%22Sector%22%3A%22%22%2C%22SubSector%22%3A%22%22%2C%22Segment%22%3A%22%22%2C%22my_range%22%3A%22-20%3B100%22%7D&take=800&CategoryType=1"
  const headers = { "User-Agent": "Mozilla" }

  const response = await fetchWithRetry(url, { method: "GET", headers })
  const tickersSet = new Set((response.list as Array<{ ticker: string }>).map((item) => item.ticker))
  return Array.from(tickersSet)
}

async function fetchPriceHistory(ticker: string) {
  const url = "https://statusinvest.com.br/acao/tickerpricerange"
  const headers = { "User-Agent": "Mozilla" }
  const body = new URLSearchParams({
    ticker,
    start: "1000-01-01",
    end: "3000-01-01",
  })

  const response = await fetchWithRetry(url, { method: "POST", headers, body })
  return response?.data?.[0]?.prices || []
}

async function fetchDividendHistory(ticker: string) {
  const url = `https://statusinvest.com.br/acao/companytickerprovents?ticker=${ticker}&chartProventsType=2`
  const headers = { "User-Agent": "Mozilla" }
  const response = await fetchWithRetry(url, { method: "GET", headers })
  return response || []
}

async function fetchNetProfitHistory(ticker: string) {
  const url = `https://statusinvest.com.br/acao/getdre?code=${ticker}&type=0&futureData=false&range.min=1000&range.max=3000`
  const headers = { "User-Agent": "Mozilla" }
  const response = await fetchWithRetry(url, { method: "GET", headers })
  return response?.data || []
}

async function processSingleTicker() {
  try {
    const tickers: string[] = await fetchTickers()
    
    const supabase = await createClient()
    const { data: lastProcessed } = await supabase
      .from('stocks_data')
      .select('ticker, last_updated')
      .order('last_updated', { ascending: false })
      .limit(1)
    
    let nextTickerIndex = 0
    if (lastProcessed && lastProcessed.length > 0) {
      const lastIndex = tickers.indexOf(lastProcessed[0].ticker)
      if (lastIndex !== -1) {
        nextTickerIndex = (lastIndex + 1) % tickers.length
      }
    }
    
    const ticker = tickers[nextTickerIndex]
    const position = nextTickerIndex + 1
    
    const [priceHistory, dividendHistory, netProfitHistory] = await Promise.all([
      fetchPriceHistory(ticker),
      fetchDividendHistory(ticker),
      fetchNetProfitHistory(ticker),
    ])
    
    const { error } = await supabase
      .from('stocks_data')
      .upsert({
        ticker,
        price_history: JSON.stringify(priceHistory),
        dividend_history: JSON.stringify(dividendHistory),
        net_profit_history: JSON.stringify(netProfitHistory),
        last_updated: new Date().toISOString(),
        price_history_updated: new Date().toISOString(),
        dividend_history_updated: new Date().toISOString(),
        net_profit_history_updated: new Date().toISOString(),
      }, { onConflict: 'ticker' })
    
    if (error) {
      return { success: false, ticker, error: error.message }
    } else {
      const nextIndex = (nextTickerIndex + 1) % tickers.length
      const currentLoop = Math.floor(position / tickers.length) + 1
      const nextLoop = Math.floor((nextIndex + 1) / tickers.length) + 1
      
      return { 
        success: true, 
        ticker, 
        progress: `${position}/${tickers.length}`,
        currentLoop,
        nextTicker: tickers[nextIndex],
        nextProgress: `${nextIndex + 1}/${tickers.length}`,
        nextLoop
      }
    }
    
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<{
  success: boolean
  message: string
  status?: string
  progress?: string
  currentLoop?: number
  nextTicker?: string
  nextProgress?: string
  nextLoop?: number
  error?: string
}>> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token de autorização não fornecido' 
      }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    if (token !== process.env.CRON_SECRET_TOKEN) {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        return NextResponse.json({ 
        success: false, 
        message: 'Token inválido ou expirado' 
      }, { status: 401 })
      }
    }

    const result = await processSingleTicker()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Ticker ${result.ticker} processado com sucesso (Loop ${result.currentLoop})`,
        status: 'completed',
        progress: result.progress,
        currentLoop: result.currentLoop,
        nextTicker: result.nextTicker,
        nextProgress: result.nextProgress,
        nextLoop: result.nextLoop
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `Erro ao processar ticker: ${result.error}`,
        status: 'error'
      })
    }

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
