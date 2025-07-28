import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Wrench, Mail, Lock, AlertCircle, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"cliente" | "mecanico">("cliente");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  // Create user account based on selected type
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    if (!nome || !sobrenome || !email || !password) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            nome,
            sobrenome,
            telefone,
            cpf_cnpj: cpfCnpj,
            cep,
            endereco,
            cidade,
            estado,
            conta: userType === "cliente" ? "Cliente" : "Mecanico"
          }
        }
      });

      if (error) throw error;

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) throw signInError;

      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao SOS Mecânicos!",
        variant: "default",
      });
      
      // Navigate based on user type
      if (userType === "mecanico") {
        navigate("/mechanic-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check user type and navigate accordingly
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("conta")
          .eq("id", session.user.id)
          .single();

        if (profile?.conta === "Mecanico") {
          navigate("/mechanic-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 bg-orange-600 text-white justify-center items-center flex font-bold rounded-full h-[45px] w-[45px]">
             SOS
            </div>
            <span className="font-bold text-2xl bg-black bg-clip-text text-transparent">
              Mecânicos
            </span>
          </div>
          <p className="text-muted-foreground">
            Entre na sua conta ou crie uma nova
          </p>
        </div>

        <Card className="bg-gradient-card shadow-elegant border-0">
          <CardHeader>
            <CardTitle className="text-center">Acesso à Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="hero"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Conta</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={userType === "cliente" ? "default" : "outline"}
                        onClick={() => setUserType("cliente")}
                        className="justify-start"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Cliente
                      </Button>
                      <Button
                        type="button"
                        variant={userType === "mecanico" ? "default" : "outline"}
                        onClick={() => setUserType("mecanico")}
                        className="justify-start"
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        Mecânico
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Seu nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sobrenome">Sobrenome *</Label>
                      <Input
                        id="sobrenome"
                        type="text"
                        placeholder="Seu sobrenome"
                        value={sobrenome}
                        onChange={(e) => setSobrenome(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telefone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf-cnpj">CPF/CNPJ</Label>
                    <Input
                      id="cpf-cnpj"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpfCnpj}
                      onChange={(e) => setCpfCnpj(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        type="text"
                        placeholder="00000-000"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        type="text"
                        placeholder="Sua cidade"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="endereco"
                        type="text"
                        placeholder="Rua, número, bairro"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      type="text"
                      placeholder="SP"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="hero"
                    disabled={loading}
                  >
                    {loading ? "Criando..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Ao continuar, você concorda com nossos{" "}
          <a href="/termos" className="text-primary hover:underline">
            Termos de Uso
          </a>{" "}
          e{" "}
          <a href="/privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
};

export default Auth;