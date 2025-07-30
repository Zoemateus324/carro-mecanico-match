import { useState, useEffect, useCallback } from "react";
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
import { Database } from "@/types/supabase"; // ajuste o caminho conforme seu projeto

interface VehicleFormData {
  ano: string;
  categoria: "Automóveis" | "Motocicletas" | "Caminhões" | "Ônibus";
  combustivel: "gasolina" | "etanol" | "diesel" | "eletrico" | "hibrido";
  cor: string;
  marca: string;
  modelo: string;
  placa: string;
  "tipo_veiculo": string;
  user_id: string | null;
  
}

const VehicleAdd = () => {
  const [formData, setFormData] = useState<VehicleFormData>({
    ano: "",
    categoria: "Automóveis",
    combustivel: "gasolina",
    cor: "",
    marca: "",
    modelo: "",
    placa: "",
    "tipo_veiculo": "Hatch",
    user_id: null,
    
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canAddVehicle, setCanAddVehicle] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const checkLimits = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Verificar limites reais usando a função do banco
      const { data, error } = await supabase.rpc('check_user_limits', {
        user_id_param: session.user.id,
        tipo_limite: 'veiculo'
      });

      if (error) {
        console.error("Erro ao verificar limites:", error);
        setError("Erro ao verificar limites do plano.");
        return;
      }

      setCanAddVehicle(data.pode_adicionar_veiculo);
      setFormData(prev => ({ ...prev, user_id: session.user.id }));

      if (!data.pode_adicionar_veiculo) {
        setError(`Limite atingido: ${data.max_veiculos} veículo(s) permitidos.`);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao verificar limites.");
    }
  }, [navigate]);

  useEffect(() => {
    checkLimits();
  }, [checkLimits]);

  const handleChange = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddVehicle || !formData.user_id) return;

    setLoading(true);
    setError("");

    try {
      // Map form data to database schema
      const vehicleData = {
        ano: formData.ano,
        categoria: formData.categoria,
        combustivel: formData.combustivel,
        cor: formData.cor,
        marca: formData.marca,
        modelo: formData.modelo,
        placa: formData.placa,
        "tipo_veiculo": formData["tipo_veiculo"] as any,
        user_id: formData.user_id,
        
      };

      const { error } = await supabase.from("vehicles").insert(vehicleData);
      if (error) throw error;

      // Atualizar contador de veículos usados
      await supabase
        .from("user_subscriptions")
        .update({ 
          vehicles_used: supabase.sql`vehicles_used + 1`,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", formData.user_id);

      toast({
        title: "Veículo registrado",
        description: "Cadastro realizado com sucesso!"
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-card backdrop-blur supports-[backdrop-filter]:bg-gradient-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
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

      {/* Formulário */}
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Veículo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-3">
                <Label>Marca</Label>
                <Input value={formData.marca || ""} onChange={e => handleChange("marca", e.target.value)} />
                <Label>Modelo</Label>
                <Input value={formData.modelo || ""} onChange={e => handleChange("modelo", e.target.value)} />
                <Label>Ano</Label>
                <Input value={formData.ano || ""} onChange={e => handleChange("ano", e.target.value)} />
                <Label>Cor</Label>
                <Input value={formData.cor || ""} onChange={e => handleChange("cor", e.target.value)} />
                <Label>Placa</Label>
                <Input value={formData.placa || ""} onChange={e => handleChange("placa", e.target.value)} />

                <Label>Categoria</Label>
                <Select value={formData.categoria || ""} onValueChange={val => handleChange("categoria", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automóveis">Automóveis</SelectItem>
                    <SelectItem value="Motocicletas">Motocicletas</SelectItem>
                    <SelectItem value="Caminhões">Caminhões</SelectItem>
                    <SelectItem value="Ônibus">Ônibus</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Combustível</Label>
                <Select value={formData.combustivel || ""} onValueChange={val => handleChange("combustivel", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Combustível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasolina">Gasolina</SelectItem>
                    <SelectItem value="etanol">Etanol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="eletrico">Elétrico</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Tipo de Veículo</Label>
                <Select
                  value={formData["tipo_veiculo"] || ""}
                  onValueChange={val => handleChange("tipo_veiculo", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hatch">Hatch</SelectItem>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Crossover">Crossover</SelectItem>
                    <SelectItem value="Picape">Picape</SelectItem>
                    <SelectItem value="Minivan">Minivan</SelectItem>
                    <SelectItem value="Esportivo">Esportivo</SelectItem>
                    <SelectItem value="Motonetas">Motonetas</SelectItem>
                    <SelectItem value="Motocicletas">Motocicletas</SelectItem>
                    <SelectItem value="Triciclos">Triciclos</SelectItem>
                    <SelectItem value="Quadriciclos">Quadriciclos</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Toco">Toco</SelectItem>
                    <SelectItem value="Traçado">Traçado</SelectItem>
                    <SelectItem value="Bi-truck">Bi-truck</SelectItem>
                    <SelectItem value="Carretas">Carretas</SelectItem>
                    <SelectItem value="Ônibus">Ônibus</SelectItem>
                    <SelectItem value="Micro-ônibus">Micro-ônibus</SelectItem>
                    <SelectItem value="Bonde">Bonde</SelectItem>
                  </SelectContent>
                </Select>

              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Registrando..." : "Registrar Veículo"}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleAdd;
