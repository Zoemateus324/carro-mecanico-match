/*
  # Corrigir Sistema de Cadastro e Assinatura

  1. Novas Tabelas
    - `user_subscriptions`: Gerencia assinaturas dos usuários
      - Conecta usuários a planos de assinatura
      - Controla limites e uso de recursos
      - Plano gratuito por padrão

  2. Funções
    - `handle_new_user_complete`: Função melhorada para criar perfil e assinatura
    - `check_user_limits`: Verifica limites do usuário baseado no plano

  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários acessarem apenas seus próprios dados
*/

-- Criar tabela de assinaturas de usuário
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL DEFAULT 'gratuito',
  status text NOT NULL DEFAULT 'ativa',
  max_vehicles integer NOT NULL DEFAULT 1,
  max_requests integer NOT NULL DEFAULT 3,
  vehicles_used integer NOT NULL DEFAULT 0,
  requests_used integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT NULL
);

-- Habilitar RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas assinaturas
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para usuários atualizarem suas assinaturas
CREATE POLICY "Users can update own subscription"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Função para criar perfil completo e assinatura
CREATE OR REPLACE FUNCTION handle_new_user_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir perfil
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    sobrenome,
    telefone,
    "cpf/cnpj",
    cep,
    endereco,
    cidade,
    estado,
    conta,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'sobrenome', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf_cnpj', ''),
    COALESCE(NEW.raw_user_meta_data->>'cep', ''),
    COALESCE(NEW.raw_user_meta_data->>'endereco', ''),
    COALESCE(NEW.raw_user_meta_data->>'cidade', ''),
    COALESCE(NEW.raw_user_meta_data->>'estado', ''),
    COALESCE(NEW.raw_user_meta_data->>'conta', 'Cliente')::public."tipo-conta-usuario",
    NOW(),
    NOW()
  );

  -- Inserir assinatura gratuita
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_type,
    status,
    max_vehicles,
    max_requests,
    vehicles_used,
    requests_used
  )
  VALUES (
    NEW.id,
    'gratuito',
    'ativa',
    1,
    3,
    0,
    0
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar novo trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_complete();

-- Função para verificar limites do usuário
CREATE OR REPLACE FUNCTION check_user_limits(user_id_param uuid, tipo_limite text)
RETURNS json AS $$
DECLARE
  subscription_data record;
  result json;
BEGIN
  -- Buscar dados da assinatura
  SELECT * INTO subscription_data
  FROM user_subscriptions
  WHERE user_id = user_id_param AND status = 'ativa';

  IF NOT FOUND THEN
    -- Se não encontrar assinatura, criar uma gratuita
    INSERT INTO user_subscriptions (user_id, plan_type, status, max_vehicles, max_requests)
    VALUES (user_id_param, 'gratuito', 'ativa', 1, 3);
    
    SELECT * INTO subscription_data
    FROM user_subscriptions
    WHERE user_id = user_id_param AND status = 'ativa';
  END IF;

  IF tipo_limite = 'veiculo' THEN
    result := json_build_object(
      'max_veiculos', subscription_data.max_vehicles,
      'veiculos_usados', subscription_data.vehicles_used,
      'pode_adicionar_veiculo', subscription_data.vehicles_used < subscription_data.max_vehicles
    );
  ELSIF tipo_limite = 'solicitacao' THEN
    result := json_build_object(
      'max_solicitacoes', subscription_data.max_requests,
      'solicitacoes_usadas', subscription_data.requests_used,
      'pode_fazer_solicitacao', subscription_data.requests_used < subscription_data.max_requests
    );
  ELSE
    result := json_build_object(
      'max_veiculos', subscription_data.max_vehicles,
      'veiculos_usados', subscription_data.vehicles_used,
      'max_solicitacoes', subscription_data.max_requests,
      'solicitacoes_usadas', subscription_data.requests_used,
      'pode_adicionar_veiculo', subscription_data.vehicles_used < subscription_data.max_vehicles,
      'pode_fazer_solicitacao', subscription_data.requests_used < subscription_data.max_requests,
      'plano', subscription_data.plan_type,
      'status', subscription_data.status
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);