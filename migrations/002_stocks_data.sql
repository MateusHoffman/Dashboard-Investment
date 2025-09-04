-- =====================================================
-- MIGRATION 002: Criar tabela stocks_data
-- =====================================================
-- Data: 2024-01-XX
-- Descrição: Tabela para armazenar histórico completo de preços, dividendos e lucro líquido das ações

-- Criar tabela de dados das ações
CREATE TABLE IF NOT EXISTS stocks_data (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) UNIQUE NOT NULL,
  price_history JSONB,
  dividend_history JSONB,
  net_profit_history JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  price_history_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dividend_history_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  net_profit_history_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_stocks_data_ticker ON stocks_data(ticker);
CREATE INDEX IF NOT EXISTS idx_stocks_data_last_updated ON stocks_data(last_updated);

-- Habilitar RLS (Row Level Security)
ALTER TABLE stocks_data ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Users can view stocks data" ON stocks_data
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert/update stocks data" ON stocks_data
  FOR ALL USING (true);

-- Adicionar comentários
COMMENT ON TABLE stocks_data IS 'Tabela para armazenar histórico completo de preços, dividendos e lucro líquido das ações';
COMMENT ON COLUMN stocks_data.price_history IS 'Histórico de preços em formato JSON com data e valor';
COMMENT ON COLUMN stocks_data.dividend_history IS 'Histórico de dividendos em formato JSON';
COMMENT ON COLUMN stocks_data.net_profit_history IS 'Histórico de lucro líquido em formato JSON';
