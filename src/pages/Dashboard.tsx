import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Plus, Settings, LogOut, Crown, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionPlans from "@/components/SubscriptionPlans";





type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SubscriptionResponse = { subscription_tier: string; subscribed: boolean; subscription_end?: string };

type Subscription = {
  id: string;
  user_id: string;
  subscription_tier: string;
  subscribed: boolean;
  subscription_end?: string;
};


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

type VehicleRequest = {
  id: number;
  user_id: string;
  usuario:string;
  vehicle_id: number;
  service_type: string;
  status: "Pendente" | "Em Andamento" | "Concluído"
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  nome: string;
  email: string;
  conta: "Cliente" | "Mecanico" | "Guincho" | "Seguradora";
  created_at: string;
  updated_at: string;
};

type UserSession = {
  user: User | null;
  profile: Profile | null;
  subscription: SubscriptionResponse | null;
  vehicles: VehicleRow[];
};
type limits = {
  plano: string;
  max_veiculos: number;
  max_solicitacoes: number;
  veiculos_usados: number;
  solicitacoes_usadas: number;
  pode_adicionar_veiculo: boolean;
  pode_fazer_solicitacao: boolean;
};

type UserLimits = {
  max_vehicles: number;
  max_requests: number;
  vehicles_used: number;
  requests_used: number;
  can_add_vehicle: boolean;
  can_make_request: boolean;
};

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Partial<VehicleRow>[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<VehicleRequest[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, loading: subscriptionLoading, getCurrentPlan, isActive } = useSubscription();




  
const fetchSolicitacoes = async (userId: string, setSolicitacoes: React.Dispatch<React.SetStateAction<VehicleRequest[]>>) => {
  try {
    const { data: solicitacoesData, error } = await supabase
      .from("solicitacoes")
      .select("*")
      .eq("usuario", userId) as unknown as { data: any[]; error: any };
    if (error) throw error;
    // Map raw data to VehicleRequest type
    const mapped = (solicitacoesData || []).map((item) => ({
      id: item.id,
      user_id: item.user_id ?? item.usuario,
      vehicle_id: item.vehicle_id ?? item.veiculo,
      service_type: item.service_type ?? item["tipo-servico"],
      status: item.status ?? item.ServiceStatus,
      created_at: item.created_at,
      updated_at: item.updated_at ?? "",
    })) as VehicleRequest[];
    setSolicitacoes(mapped);
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
  }
};
  const checkUserLimits = useCallback(() => {

    const maxVeiculos = 1;
    const maxSolicitacoes = 3;
    const limitsData = {
    plano: subscription?.subscription_tier || "Gratis",
    max_veiculos: maxVeiculos,
    max_solicitacoes: maxSolicitacoes,
    veiculos_usados: vehicles.length,
    solicitacoes_usadas: 0, // substitua por lógica real se disponível
    pode_adicionar_veiculo: vehicles.length < maxVeiculos,
    pode_fazer_solicitacao: true // ou coloque lógica de contagem aqui
  };
    
  }, [vehicles, subscription]);


  const checkUser = useCallback(async () => {
    try {
      setLoading(false);
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
      if (profileData?.conta === "Mecanico") {
        navigate("/mechanic-dashboard");
        return;
      }
      await checkSubscription();
      await checkUserLimits();
      await fetchVehicles(session.user.id);
      await fetchSolicitacoes(session.user.id, setSolicitacoes);

    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate, checkUserLimits]);
  useEffect(() => {
    const runCheckUser = async () => {
      try {
        await checkUserLimits();
       
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };
    runCheckUser();
  }, [navigate, checkUserLimits]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);




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
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja excluir este veículo?")) return;
    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;

      setVehicles(prev => prev.filter(v => v.id !== id));
      toast({ title: "Veículo excluído", description: "Removido com sucesso." });
      checkUserLimits();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast({
          title: "Erro ao excluir",
          description: err.message,
          variant: "destructive",
        });
      } else {

        toast({
          title: "Erro inesperado",
          description: "Não foi possível excluir o veículo.",
          variant: "destructive",
        });

      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Free": return "secondary";
      case "Standard": return "default";
      case "Premium": return "default";
      case "Ultimate": return "destructive";
      default: return "secondary";
    }
  };

  if (loading || subscriptionLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  const currentPlan = getCurrentPlan();

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
          {currentPlan && (
            <Badge variant={getPlanColor(currentPlan.name)}>
              {currentPlan.name === "Free" ? "✨ " : currentPlan.name.includes("Standard") ? "🚀 " : currentPlan.name.includes("Premium") ? "⭐ " : "👑 "}
              {currentPlan.name}
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
                <Button onClick={() => navigate("/vehicles/add")} >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Veículo
                </Button>
              </div>

           
                <Card><CardContent>
                  <p className="text-sm">Veículos: </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ }} />
                  </div>
                </CardContent></Card>
            

              {vehicles.length === 0 ? (
                <Card><CardContent><p className="text-center text-muted">Nenhum veículo cadastrado ainda.</p></CardContent></Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="relative">
                      <CardContent className="pt-6 space-y-2">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">{vehicle.marca} {vehicle.modelo}</h3>
                          <div className="text-muted-foreground text-sm">Ano: {vehicle.ano}</div>
                        </div>
                        <p className="text-sm text-muted-foreground">Placa: {vehicle.placa}</p>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}>
                          Editar</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(vehicle.id)}>Excluir</Button>
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
                <Button onClick={() => navigate("/vehicles/requests")} >
                  <Plus className="h-4 w-4 mr-2" /> Solicitar Serviço
                </Button>
              </div>

              
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="text-center">Solicitações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {solicitacoes.length === 0 ? (
                    <p className="text-center text-muted">Nenhuma solicitação feita ainda.</p>
                  ) : (
                    <ul className="space-y-2">
                      {solicitacoes.map((request) => (
                        <li key={request.id} className="border p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">{request.service_type}</h3>
                              <p className="text-sm text-muted-foreground">Status: {request.status}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/vehicles/request/${request.id}`)}>
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
                <p className="text-sm text-muted-foreground">Gerencie suas informações e preferências</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configurações do Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Aqui você pode adicionar campos para editar o perfil do usuário */}
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>

            {profile && (
              <Card><CardContent>
                <p><strong>Nome:</strong> {profile.nome}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Tipo de Conta:</strong> {profile.conta}</p>
              </CardContent></Card>
            )}      
          </TabsContent>
          </Tabs>


        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex items-center">
              <Crown className="mr-2" /> 
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPlan && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">{currentPlan.name}</span>
                    <Badge variant={getPlanColor(currentPlan.name)}>
                      {isActive() ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Subscription Plans */}
          <SubscriptionPlans currentPlan={currentPlan.name} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
