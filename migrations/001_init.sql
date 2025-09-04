-- Criar tabela de ranking
CREATE TABLE ranking (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) UNIQUE NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  current_dividend DECIMAL(10,5) NOT NULL,
  best_price DECIMAL(10,2) NOT NULL,
  best_dividend DECIMAL(10,2) NOT NULL,
  distance_between_prices DECIMAL(5,2) NOT NULL,
  have_options BOOLEAN DEFAULT false,
  score_by_best_price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_ranking_ticker ON ranking(ticker);
CREATE INDEX idx_ranking_distance ON ranking(distance_between_prices);
CREATE INDEX idx_ranking_options ON ranking(have_options);

-- Habilitar RLS (Row Level Security)
ALTER TABLE ranking ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler ranking" ON ranking
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserção/atualização apenas via API
CREATE POLICY "API pode inserir/atualizar ranking" ON ranking
  FOR ALL USING (true);