import {Database} from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { createClient } from '@supabase/supabase-js';
import { toast } from './ui/use-toast';
import { useState } from "react";


interface plano{
  id: string;
  nome: string;
  preco: number;
  veiculos: number;
  solicitacoes: number;
}
interface Subscription {
  id: string;
  user_id: string;
  subscription_tier: "Gratis" | "Basico" | "Premium";
  subscribed: boolean;
  subscription_end?: string;
}

export function PlanContent(){
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);
/** -------------------------------------------------------------- EVENTS */
  const handleUpgrade = async (plan: "basico" | "premium") => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", { body: { plan } });
      if (error) throw error;
      window.open(data.url, "_blank");
    } catch (err) {
      toast({ title: "Erro", description: "Erro ao iniciar upgrade de plano.", variant: "destructive" });
    }
  };

return(
    <div>
  {/* ------------------------------------------------ AVAILABLE PLANS */}
          <Card className="max-w-2xl mx-auto mt-10">
            <CardHeader className="text-center">
              <CardTitle>Planos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ------------------------------ GRATIS */}
              <div className="p-3 border rounded-lg space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Grátis</h4>
                  <span className="text-sm font-bold">R$ 0/mês</span>
                </div>
                <p className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> 1 veículo
                </p>
                <p className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> 3 solicitações/mês
                </p>
              </div>

              {/* ------------------------------ BASICO */}
              <div className="p-3 border rounded-lg space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Básico</h4>
                  <span className="text-sm font-bold">R$ 19,90/mês</span>
                </div>
                <p className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> 5 veículos
                </p>
                <p className="flex items-center text-sm text-muted-foreground mb-3">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> 15 solicitações/mês
                </p>
                {(!subscription?.subscribed || subscription.subscription_tier === "Gratis") && (
                  <Button size="sm" className="w-full" onClick={() => handleUpgrade("basico")}>
                    Assinar
                  </Button>
                )}
              </div>

              {/* ------------------------------ PREMIUM */}
              <div className="p-3 border rounded-lg space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Premium</h4>
                  <span className="text-sm font-bold">R$ 49,90/mês</span>
                </div>
                <p className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Veículos ilimitados
                </p>
                <p className="flex items-center text-sm text-muted-foreground mb-3">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Solicitações ilimitadas
                </p>
                {(!subscription?.subscribed || subscription.subscription_tier !== "Premium") && (
                  <Button size="sm" className="w-full" onClick={() => handleUpgrade("premium")}>
                    Assinar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
</div>
);
}
