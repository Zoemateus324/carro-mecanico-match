import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Car, ArrowLeft, AlertCircle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: number;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
}

const VehicleRequests = () => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState("");
  const [canMakeRequest, setCanMakeRequest] = useState(false);
  const [formData, setFormData] = useState({
    veiculo: "",
    tipoServico: "",
    descricao: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkLimitsAndVehicles = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        // Buscar veículos do usuário
        const { data: vehiclesData } = await supabase
          .from("vehicles")
          .select("id, marca, modelo, ano, placa")
          .eq("user_id", session.user.id);

        setVehicles(vehiclesData || []);

        // Verificar limites usando dados mock temporariamente
        const mockData = {
          max_solicitacoes: 3,
          solicitacoes_usadas: 0,
          pode_fazer_solicitacao: true
        };
        
        if (!mockData.pode_fazer_solicitacao) {
          setError(`Limite de solicitações atingido. Seu plano permite apenas ${mockData.max_solicitacoes} solicitação(ões) por mês.`);
          setCanMakeRequest(false);
        } else {
          setCanMakeRequest(true);
        }
      } catch (error) {
        console.error("Error checking limits:", error);
        setError("Erro ao verificar limites do plano");
      }
    };

    checkLimitsAndVehicles();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMakeRequest) return;
    
    setLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      // Map formData.tipoServico to the allowed enum values
      const tipoServicoMap: Record<string, "Guincho" | "Mecânica Geral" | "Elétrica" | "Pneus" | "Bateria" | "Combustível" | "Chaveiro" | "Outros" | "Revisão" | "Troca de óleo" | "Freios" | "Suspensão" | "Motor" | "Transmissão" | "Ar condicionado" | "Sistema elétrico"> = {
        "guincho": "Guincho",
        "mecanica-geral": "Mecânica Geral",
        "eletrica": "Elétrica",
        "pneu": "Pneus",
        "bateria": "Bateria",
        "combustivel": "Combustível",
        "chaveiro": "Chaveiro",
        "outros": "Outros"
      };

      const { error } = await supabase.from("solicitacoes").insert({
        usuario: session.user.id,
        veiculo: parseInt(formData.veiculo),
        "tipo-servico": tipoServicoMap[formData.tipoServico] || "Outros",
        "descricao-solicitacao": formData.descricao,
        ServiceStatus: "pendente"
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Solicitação de serviço criada com sucesso.",
      });

      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-card backdrop-blur supports-[backdrop-filter]:bg-gradient-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Solicitar Serviço</h1>
              <p className="text-sm text-muted-foreground">Solicite um mecânico para seu veículo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Nova Solicitação</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Você precisa ter pelo menos um veículo cadastrado para solicitar serviços.
                  </p>
                  <Button onClick={() => navigate("/vehicles/add")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Veículo
                  </Button>
                </div>
              ) : !canMakeRequest ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Você atingiu o limite de solicitações do seu plano.
                  </p>
                  <Button onClick={() => navigate("/dashboard")}>
                    Voltar ao Dashboard
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="veiculo">Veículo *</Label>
                    <Select onValueChange={(value) => handleChange("veiculo", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            {vehicle.marca} {vehicle.modelo} ({vehicle.ano}) - {vehicle.placa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
                    <Select onValueChange={(value) => handleChange("tipoServico", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guincho">Guincho</SelectItem>
                        <SelectItem value="mecanica-geral">Mecânica Geral</SelectItem>
                        <SelectItem value="eletrica">Elétrica</SelectItem>
                        <SelectItem value="pneu">Pneu</SelectItem>
                        <SelectItem value="bateria">Bateria</SelectItem>
                        <SelectItem value="combustivel">Combustível</SelectItem>
                        <SelectItem value="chaveiro">Chaveiro</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição do Problema *</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => handleChange("descricao", e.target.value)}
                      placeholder="Descreva detalhadamente o problema do seu veículo..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? "Enviando..." : "Solicitar Serviço"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VehicleRequests;