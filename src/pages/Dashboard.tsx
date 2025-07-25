import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Plus, LogOut, Crown, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";


type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SubscriptionResponse = { subscription_tier: string; subscribed: boolean; subscription_end?: string };

type VehicleRequest = Database["public"]["Tables"]["solicitacoes"]["Row"];

type UserProfile = {
  id: string;
  email: string;
  nome: string;
  conta: "Cliente" | "Mecanico" | "Guincho" | "Seguradora";
  created_at: string;
  updated_at: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
};

type Vehicle = {
  id: number;
  user_id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  created_at: string;
  updated_at: string;
};

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [vehicles, setVehicles] = useState<Partial<VehicleRow>[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<VehicleRequest[]>([]);
  

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchSolicitacoes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("solicitacoes")
        .select("id, usuario, veiculo, tipo_servico, descricao_solicitacao, ServiceStatus, created_at")
        .eq("usuario", userId);

      if (error) {
        throw new Error(`Erro ao buscar solicitações: ${error.message}`);
      }

      if (!Array.isArray(data) || data.length === 0 || (data.length > 0 && (data[0] as any).error)) {
        setSolicitacoes([]);
        return;
      }

      setSolicitacoes(data as VehicleRequest[]);
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    }
  };

  const checkUserLimits = useCallback(() => {
    const maxVeiculos = subscription?.subscription_tier === "Premium" ? Infinity : subscription?.subscription_tier === "Basico" ? 5 : 1;
    const maxSolicitacoes = subscription?.subscription_tier === "Premium" ? Infinity : subscription?.subscription_tier === "Basico" ? 15 : 3;

    return {
      plano: subscription?.subscription_tier || "Gratis",
      max_veiculos: maxVeiculos,
      max_solicitacoes: maxSolicitacoes,
      veiculos_usados: vehicles.length,
      solicitacoes_usadas: solicitacoes.length,
      pode_adicionar_veiculo: vehicles.length < maxVeiculos,
      pode_fazer_solicitacao: solicitacoes.length < maxSolicitacoes,
    };
  }, [vehicles, subscription, solicitacoes]);

  const checkUser = useCallback(async () => {
  try {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profileData);
    setUser({
      id: session.user.id,
      name: profileData?.nome || "",
      email: session.user.email || "",
      profile: profileData,
    });

    if (profileData?.conta === "Mecanico") {
      navigate("/mechanic-dashboard");
      return;
    }

    await checkSubscription();
    await fetchVehicles(session.user.id);
    await fetchSolicitacoes(session.user.id); // Passa o userId da sessão
  } catch (error) {
    console.error("Error checking user:", error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar os dados do usuário.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
}, [navigate]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar a assinatura.",
        variant: "destructive",
      });
    }
  };

  const fetchVehicles = async (userId: string) => {
    try {
      const { data: vehiclesData, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      setVehicles(vehiclesData || []);
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os veículos.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleUpgrade = async (plan: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan },
      });
      if (error) throw error;
      window.open(data.url, "_blank");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao iniciar upgrade de plano.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja excluir este veículo?")) return;
    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;

      setVehicles((prev) => prev.filter((v) => v.id !== id));
      toast({ title: "Veículo excluído", description: "Removido com sucesso." });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o veículo.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Gratis":
        return "secondary";
      case "Basico":
        return "default";
      case "Premium":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">



      
      {/* Header */}
      <div className="border-b bg-gradient-card p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-600 rounded-full w-11 h-11 flex justify-center items-center text-white font-bold">
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
              {subscription.subscription_tier === "Gratis"
                ? "✨ "
                : subscription.subscription_tier === "Basico"
                  ? "🚀 "
                  : "👑 "}
              {subscription.subscription_tier}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto p-4 grid lg:grid-cols-3 gap-6">
        {/* Abas principais */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="vehicles">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="vehicles">Veículos</TabsTrigger>
              <TabsTrigger value="requests">Solicitações</TabsTrigger>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
            </TabsList>

            <TabsContent value="vehicles" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Meus Veículos</h2>
                <Button onClick={() => navigate("/vehicles/add")}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Veículo
                </Button>
              </div>

              <Card>
                <CardContent>
                  <p className="text-sm">Veículos: {vehicles.length}/{checkUserLimits().max_veiculos}</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(vehicles.length / checkUserLimits().max_veiculos) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {vehicles.length === 0 ? (
                <Card>
                  <CardContent>
                    <p className="text-center text-muted">Nenhum veículo cadastrado ainda.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="relative">
                      <CardContent className="pt-6 space-y-2">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">
                            {vehicle.marca} {vehicle.modelo}
                          </h3>
                          <div className="text-muted-foreground text-sm">Ano: {vehicle.ano}</div>
                        </div>
                        <p className="text-sm text-muted-foreground">Placa: {vehicle.placa}</p>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(vehicle.id)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </CardContent>
                      <div className="absolute top-2 right-2 text-muted-foreground">
                        <Car className="h-5 w-5" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Minhas Solicitações</h2>
                <Button onClick={() => navigate("/vehicles/requests")}>
                  <Plus className="h-4 w-4 mr-2" /> Solicitar Serviço
                </Button>
              </div>

              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="text-center">Solicitações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {solicitacoes.length === 0 ? (
                    <p className="text-center text-foreground">Nenhuma solicitação feita ainda.</p>
                  ) : (
                    <ul className="space-y-2">
                      {solicitacoes.map((request) => (
                        <li key={request.id} className="border p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">{request.tipo_servico}</h3>
                              <p className="text-sm text-muted-foreground">Status: {request.ServiceStatus}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/vehicles/request/${request.id}`)}
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Crown className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Meu Perfil</h2>
                  <p className="text-sm text-muted-foreground">
                    Gerencie suas informações e preferências
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                    Editar Perfil
                  </Button>
                </CardContent>
              </Card>

              {profile && (
                <Card>
                  <CardContent>
                    <p>
                      <strong>Nome:</strong> {profile.nome}
                    </p>
                    <p>
                      <strong>Email:</strong> {user?.email}
                    </p>
                    <p>
                      <strong>Tipo de Conta:</strong> {profile.conta}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex items-center">
              <Crown className="mr-2" /> <CardTitle>Plano Atual</CardTitle>
            </CardHeader>
            <CardContent>
              {subscription && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">{subscription.subscription_tier}</span>
                    <Badge variant={getPlanColor(subscription.subscription_tier)}>
                      {subscription.subscribed ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  {subscription.subscription_end && (
                    <p className="text-sm">
                      Renovação: {new Date(subscription.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                  {subscription.subscribed && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => supabase.functions.invoke("customer-portal")}
                    >
                      Gerenciar Assinatura
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

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
  );
};

export default Dashboard;