// Tipos para as interfaces do sistema

export interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export interface Solicitacao {
  id: number;
  usuario: string;
  'tipo_servico': string; // Removido hífen para corresponder ao DB
  'descricao_solicitacao': string; // Removido hífen para corresponder ao DB
  ServiceStatus: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  created_at: string;
  veiculo: number;
  'status_orçamento'?: 'pendente' | 'aprovado' | 'rejeitado' | 'expirado';
}

export interface Vehicle {
  id: number;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  categoria: string;
  combustivel: string;
  cor: string;
  tipo_veiculo: string;
  user_id: string;
}

export interface Profile {
  id: string;
  nome?: string;
  email?: string;
  conta?: 'Cliente' | 'Mecanico';
  plano_id?: string;
}