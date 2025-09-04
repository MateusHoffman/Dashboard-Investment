'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RankCard } from '@/components/RankCard'
import { supabase } from '@/lib/supabase/client'
import { Stock } from '@/types'
import { useRouter } from 'next/navigation'
import { RefreshCw, LogOut, XCircle } from 'lucide-react'

export default function DashboardPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingRanking, setProcessingRanking] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const router = useRouter()

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const fetchRanking = useCallback(async () => {
    try {
      setError(null)
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const url = baseUrl ? `${baseUrl}/api/ranking` : `/api/ranking`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && Array.isArray(data.ranking)) {
        setStocks(data.ranking)
      } else {
        setStocks([])
        setError('Formato de resposta inválido')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      setStocks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      fetchRanking()
    }
    checkAuth()
  }, [fetchRanking, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Carregando ranking...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-foreground">Dashboard de Investimentos</h1>
            <div className="flex items-center gap-3">
              <Button
                onClick={async () => {
                  try {
                    setProcessingRanking(true)
                    
                    const { data: { session } } = await supabase.auth.getSession()
                    
                    if (!session) {
                      showNotification('error', 'Usuário não autenticado. Faça login para processar o ranking.')
                      return
                    }
                    
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
                    const url = baseUrl ? `${baseUrl}/api/ranking` : `/api/ranking`
                    
                    const response = await fetch(url, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                      }
                    })
                    
                    if (!response.ok) {
                      const errorData = await response.json()
                      throw new Error(`Erro ao processar ranking: ${response.status} ${response.statusText} - ${errorData.error || 'Erro desconhecido'}`)
                    }
                    
                    const result = await response.json()
                    
                    showNotification('success', `Ranking processado com sucesso!\n\nAções processadas: ${result.stocksProcessed}\nRanking final: ${result.finalRanking}\nTempo de execução: ${result.executionTime}`)
                    
                    await fetchRanking()
                    
                  } catch (error) {
                    showNotification('error', `Erro ao processar ranking: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
                  } finally {
                    setProcessingRanking(false)
                  }
                }}
                variant="default"
                size="sm"
                disabled={processingRanking}
              >
                {processingRanking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Processar Ranking
                  </>
                )}
              </Button>
              
              <Button
                onClick={async () => {
                  try {
                    const { error } = await supabase.auth.signOut()
                    if (error) {
                      showNotification('error', 'Erro ao fazer logout')
                    } else {
                      window.location.href = '/login'
                    }
                  } catch (error) {
                    showNotification('error', 'Erro ao fazer logout')
                  }
                }}
                variant="outline"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <p className="text-lg font-semibold">Erro ao carregar dados</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : stocks.length === 0 ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-semibold">Nenhuma ação encontrada</p>
                <p className="text-sm">Os dados serão carregados automaticamente</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock, index) => (
              <RankCard key={stock.ticker} stock={stock} rank={index + 1} />
            ))}
          </div>
        )}
      </div>

      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-destructive text-destructive-foreground'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium whitespace-pre-line">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-current hover:opacity-70"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
