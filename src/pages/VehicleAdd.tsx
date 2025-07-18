import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Car, Upload, ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VehicleAdd = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canAddVehicle, setCanAddVehicle] = useState(false);
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    ano: "",
    cor: "",
    placa: "",
    categoria: "",
    combustivel: "",
    tipoVeiculo: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkLimits();
  }, []);

  const checkLimits = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Temporariamente usando dados mock até a função estar disponível
      const data = {
        max_veiculos: 1,
        veiculos_usados: 0,
        pode_adicionar_veiculo: true
      };
      
      if (!data.pode_adicionar_veiculo) {
        setError(`Limite de veículos atingido. Seu plano permite apenas ${data.max_veiculos} veículo(s).`);
        setCanAddVehicle(false);
      } else {
        setCanAddVehicle(true);
      }
    } catch (error) {
      console.error("Error checking limits:", error);
      setError("Erro ao verificar limites do plano");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddVehicle) return;
    
    setLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("vehicles").insert({
        user_id: session.user.id,
        marca: formData.marca,
        modelo: formData.modelo,
        ano: formData.ano,
        cor: formData.cor,
        placa: formData.placa,
        categoria: formData.categoria as any,
        combustivel: formData.combustivel as any,
        "tipo-veiculo": formData.tipoVeiculo as any
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Veículo adicionado com sucesso.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      setError(error.message);
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
              <h1 className="font-bold text-xl">Adicionar Veículo</h1>
              <p className="text-sm text-muted-foreground">Cadastre um novo veículo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!canAddVehicle ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Você atingiu o limite de veículos do seu plano.
                  </p>
                  <Button onClick={() => navigate("/dashboard")}>
                    Voltar ao Dashboard
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marca">Marca *</Label>
                      <Input
                        id="marca"
                        value={formData.marca}
                        onChange={(e) => handleChange("marca", e.target.value)}
                        placeholder="Ex: Toyota, Ford, etc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="modelo">Modelo *</Label>
                      <Input
                        id="modelo"
                        value={formData.modelo}
                        onChange={(e) => handleChange("modelo", e.target.value)}
                        placeholder="Ex: Corolla, Focus, etc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ano">Ano *</Label>
                      <Input
                        id="ano"
                        value={formData.ano}
                        onChange={(e) => handleChange("ano", e.target.value)}
                        placeholder="Ex: 2020"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cor">Cor</Label>
                      <Input
                        id="cor"
                        value={formData.cor}
                        onChange={(e) => handleChange("cor", e.target.value)}
                        placeholder="Ex: Branco, Prata, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="placa">Placa</Label>
                      <Input
                        id="placa"
                        value={formData.placa}
                        onChange={(e) => handleChange("placa", e.target.value)}
                        placeholder="Ex: ABC-1234"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select onValueChange={(value) => handleChange("categoria", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passeio">Passeio</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                          <SelectItem value="moto">Motocicleta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="combustivel">Combustível</Label>
                      <Select onValueChange={(value) => handleChange("combustivel", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gasolina">Gasolina</SelectItem>
                          <SelectItem value="etanol">Etanol</SelectItem>
                          <SelectItem value="flex">Flex</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="eletrico">Elétrico</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipoVeiculo">Tipo de Veículo</Label>
                      <Select onValueChange={(value) => handleChange("tipoVeiculo", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="carro">Carro</SelectItem>
                          <SelectItem value="caminhao">Caminhão</SelectItem>
                          <SelectItem value="moto">Motocicleta</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Foto do Veículo</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para adicionar uma foto (opcional)
                      </p>
                    </div>
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
                      {loading ? "Salvando..." : "Salvar Veículo"}
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

export default VehicleAdd;