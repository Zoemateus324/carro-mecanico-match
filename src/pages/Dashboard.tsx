import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Plus, Settings, LogOut, Crown, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [limits, setLimits] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();






  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await checkSubscription();
      await checkUserLimits();
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);
  


  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const checkUserLimits = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Temporariamente usando dados mock até a função estar disponível
      const data = {
        plano: "Gratis",
        max_veiculos: 1,
        max_solicitacoes: 3,
        veiculos_usados: 0,
        solicitacoes_usadas: 0,
        pode_adicionar_veiculo: true,
        pode_fazer_solicitacao: true
      };
      
      setLimits(data);
    } catch (error) {
      console.error("Error checking limits:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleUpgrade = async (plan: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar pagamento",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      // Open Stripe portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao acessar portal do cliente",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Gratis": return "secondary";
      case "Basico": return "default";
      case "Premium": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-card backdrop-blur supports-[backdrop-filter]:bg-gradient-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-600 rounded-full w-[45px] h-[45px] flex justify-center items-center text-white font-bold">
                SOS
              </div>
              <div>
                <h1 className="font-bold text-xl">Mecânicos</h1>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {subscription && (
                <Badge variant={getPlanColor(subscription.subscription_tier)}>
                  {subscription.subscription_tier === "Gratis" && "✨ "}
                  {subscription.subscription_tier === "Basico" && "🚀 "}
                  {subscription.subscription_tier === "Premium" && "👑 "}
                  {subscription.subscription_tier}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="vehicles" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vehicles">Veículos</TabsTrigger>
                <TabsTrigger value="requests">Solicitações</TabsTrigger>
                <TabsTrigger value="profile">Perfil</TabsTrigger>
              </TabsList>

              <TabsContent value="vehicles" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Meus Veículos</h2>
                  <Button 
                    onClick={() => navigate("/vehicles/add")}
                    disabled={limits && !limits.pode_adicionar_veiculo}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Veículo
                  </Button>
                </div>

                {limits && (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        Veículos: {limits.veiculos_usados} / {limits.max_veiculos}
                      </p>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(limits.veiculos_usados / limits.max_veiculos) * 100}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Nenhum veículo cadastrado ainda.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Solicitações</h2>
                  <Button 
                    onClick={() => navigate("/requests/new")}
                    disabled={limits && !limits.pode_fazer_solicitacao}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Solicitação
                  </Button>
                </div>

                {limits && (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        Solicitações este mês: {limits.solicitacoes_usadas} / {limits.max_solicitacoes}
                      </p>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(limits.solicitacoes_usadas / limits.max_solicitacoes) * 100}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Nenhuma solicitação encontrada.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <h2 className="text-2xl font-bold">Perfil</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <p className="text-muted-foreground">{user?.email}</p>
                      </div>
                      <Button variant="outline" onClick={() => navigate("/profile/edit")}>
                        <Settings className="h-4 w-4 mr-2" />
                        Editar Perfil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Plano Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subscription.subscription_tier}</span>
                      <Badge variant={getPlanColor(subscription.subscription_tier)}>
                        {subscription.subscribed ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    
                    {subscription.subscription_end && (
                      <p className="text-sm text-muted-foreground">
                        Renovação: {new Date(subscription.subscription_end).toLocaleDateString()}
                      </p>
                    )}

                    {subscription.subscribed && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleManageSubscription}
                        className="w-full"
                      >
                        Gerenciar Assinatura
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upgrade Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Planos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Grátis</h4>
                      <span className="text-sm font-bold">R$ 0/mês</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        1 veículo
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        3 solicitações/mês
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Básico</h4>
                      <span className="text-sm font-bold">R$ 19,90/mês</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        5 veículos
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        15 solicitações/mês
                      </div>
                    </div>
                    {(!subscription?.subscribed || subscription?.subscription_tier === "Gratis") && (
                      <Button 
                        size="sm" 
                        onClick={() => handleUpgrade("basico")}
                        className="w-full"
                      >
                        Assinar
                      </Button>
                    )}
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Premium</h4>
                      <span className="text-sm font-bold">R$ 49,90/mês</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Veículos ilimitados
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Solicitações ilimitadas
                      </div>
                    </div>
                    {(!subscription?.subscribed || subscription?.subscription_tier !== "Premium") && (
                      <Button 
                        size="sm" 
                        onClick={() => handleUpgrade("premium")}
                        className="w-full"
                      >
                        Assinar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;