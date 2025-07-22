import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wrench, 
  LogOut, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Phone,
  User,
  Calendar,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Solicitacao {
  id: number;
  usuario: string;
  'tipo-servico': string;
  'descricao-solicitacao': string;
  ServiceStatus: string;
  created_at: string;
  veiculo: number;
}

const MechanicDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      
      // Buscar perfil do mecânico
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      setProfile(profileData);

      // Verificar se é mecânico
      if (profileData?.conta !== "Mecanico") {
        navigate("/mechanic-dashboard"); // Redirecionar para dashboard do cliente
        return;
      }

      // Buscar solicitações
      await loadSolicitacoes();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSolicitacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("solicitacoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSolicitacoes(data || []);
    } catch (error) {
      console.error("Error loading solicitações:", error);
    }
  };

  const updateSolicitacaoStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase
        .from("solicitacoes")
        .update({ ServiceStatus: status as any })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: `Solicitação ${status === 'aceita' ? 'aceita' : status === 'rejeitada' ? 'rejeitada' : 'concluída'} com sucesso.`,
      });

      loadSolicitacoes();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da solicitação.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente": return "bg-yellow-500";
      case "aceita": return "bg-blue-500";
      case "em_andamento": return "bg-purple-500";
      case "concluida": return "bg-green-500";
      case "rejeitada": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pendente": return "Pendente";
      case "aceita": return "Aceita";
      case "em_andamento": return "Em Andamento";
      case "concluida": return "Concluída";
      case "rejeitada": return "Rejeitada";
      default: return status;
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
      <div className="border-b border-border/50 bg-gradient-card backdrop-blur supports-[backdrop-filter]:bg-gradient-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Wrench className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-xl">Dashboard do Mecânico</h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo, {profile?.nome || user?.email}!
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold">
                      {solicitacoes.filter(s => s.ServiceStatus === 'pendente').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Concluídas</p>
                    <p className="text-2xl font-bold">
                      {solicitacoes.filter(s => s.ServiceStatus === 'concluida').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Em Andamento</p>
                    <p className="text-2xl font-bold">
                      {solicitacoes.filter(s => s.ServiceStatus === 'em_andamento').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{solicitacoes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Solicitações List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                {solicitacoes.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Nenhuma solicitação encontrada.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {solicitacoes.map((solicitacao) => (
                      <div
                        key={solicitacao.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Cliente: {solicitacao.usuario}</span>
                          </div>
                          <Badge 
                            className={`${getStatusColor(solicitacao.ServiceStatus)} text-white`}
                          >
                            {getStatusText(solicitacao.ServiceStatus)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Tipo de Serviço:</p>
                            <p className="font-medium">{solicitacao['tipo-servico']}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Veículo ID:</p>
                            <p className="font-medium">#{solicitacao.veiculo}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Descrição:</p>
                          <p className="text-sm">{solicitacao['descricao-solicitacao']}</p>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(solicitacao.created_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(solicitacao.created_at).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>

                        {solicitacao.ServiceStatus === 'pendente' && (
                          <div className="flex space-x-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => updateSolicitacaoStatus(solicitacao.id, 'aceita')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aceitar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateSolicitacaoStatus(solicitacao.id, 'rejeitada')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejeitar
                            </Button>
                          </div>
                        )}

                        {solicitacao.ServiceStatus === 'aceita' && (
                          <div className="pt-2">
                            <Button
                              size="sm"
                              onClick={() => updateSolicitacaoStatus(solicitacao.id, 'em_andamento')}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Wrench className="h-4 w-4 mr-2" />
                              Iniciar Serviço
                            </Button>
                          </div>
                        )}

                        {solicitacao.ServiceStatus === 'em_andamento' && (
                          <div className="pt-2">
                            <Button
                              size="sm"
                              onClick={() => updateSolicitacaoStatus(solicitacao.id, 'concluida')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Concluir Serviço
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;