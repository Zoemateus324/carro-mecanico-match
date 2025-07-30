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
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

<<<<<<< HEAD
    // Validações básicas
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

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Por favor, insira um email válido.");
      setLoading(false);
      return;
    }

    try {
      console.log("Iniciando cadastro do usuário...");
      
      // Dados do usuário para metadata
      const userData = {
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        telefone: telefone.trim(),
        cpf_cnpj: cpfCnpj.trim(),
        cep: cep.trim(),
        endereco: endereco.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        conta: userType === "cliente" ? "Cliente" : "Mecanico",
      };

      console.log("Dados do usuário:", userData);

      // 1. Cadastro do usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: userData,
        },
      });

      if (signUpError) {
        console.error("Erro no signUp:", signUpError);
        throw new Error(`Erro no cadastro: ${signUpError.message}`);
      }

      if (!signUpData.user) {
        throw new Error("Usuário não foi criado corretamente.");
      }

      console.log("Usuário criado com sucesso:", signUpData.user.id);

      // 2. Verificar se o perfil foi criado automaticamente pelo trigger
      let retryCount = 0;
      const maxRetries = 5;
      let profileExists = false;

      while (retryCount < maxRetries && !profileExists) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1 segundo
        
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", signUpData.user.id)
          .single();

        if (profile && !profileError) {
          profileExists = true;
          console.log("Perfil encontrado:", profile);
        } else {
          console.log(`Tentativa ${retryCount + 1}: Perfil ainda não encontrado`);
          retryCount++;
        }
      }

      // 3. Se o perfil não foi criado automaticamente, criar manualmente
      if (!profileExists) {
        console.log("Tentando criar perfil manualmente...");
        
        const { error: profileInsertError } = await supabase
          .from("profiles")
          .insert({
            id: signUpData.user.id,
            email: email.trim(),
            nome: nome.trim(),
            sobrenome: sobrenome.trim(),
            telefone: telefone.trim(),
            "cpf/cnpj": cpfCnpj.trim(),
            cep: cep.trim(),
            endereco: endereco.trim(),
            cidade: cidade.trim(),
            estado: estado.trim(),
            conta: userType === "cliente" ? "Cliente" : "Mecanico",
          });

        if (profileInsertError) {
          console.error("Erro ao criar perfil manualmente:", profileInsertError);
          // Não falha aqui, pois o usuário já foi criado
        } else {
          console.log("Perfil criado manualmente com sucesso");
        }
      }

      // 4. Fazer login automático
      console.log("Fazendo login automático...");
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.error("Erro no login automático:", signInError);
        // Se o login automático falhar, ainda mostra sucesso mas pede para fazer login
        toast({
          title: "Conta criada com sucesso!",
          description: "Faça login para acessar sua conta.",
        });
        return;
      }

      if (!signInData.session) {
        throw new Error("Não foi possível obter a sessão após o login.");
      }

      console.log("Login automático realizado com sucesso");

      // 5. Sucesso total
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao SOS Mecânicos!",
      });

      // Navegar para o dashboard apropriado
      if (userType === "mecanico") {
        navigate("/mechanic-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao criar conta.";
      console.error("Erro completo no signup:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

=======

const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

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

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    setError("Por favor, insira um email válido.");
    setLoading(false);
    return;
  }

  try {
    console.log("Iniciando cadastro do usuário...");
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          sobrenome,
          telefone,
          cpf_cnpj: cpfCnpj,
          cep,
          endereco,
          cidade,
          estado,
          conta: userType === "cliente" ? "Cliente" : "Mecanico",
        },
      },
    });

    if (signUpError) {
      console.error("Erro no signUp:", signUpError);
      throw new Error(`Erro no cadastro: ${signUpError.message}`);
    }

    console.log("Usuário cadastrado com sucesso, fazendo login...");

    // Aguardar um momento para o trigger processar
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Login automático após cadastro
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Erro no signIn:", signInError);
      throw new Error(`Erro no login: ${signInError.message}`);
    }

    console.log("Login realizado com sucesso, verificando sessão...");

    // Verifica a sessão e perfil
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error("Erro na sessão:", sessionError);
      throw new Error("Não foi possível obter a sessão após o login.");
    }

    // Verificar se o perfil foi criado
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", sessionData.session.user.id)
      .single();

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError);
      // Se o perfil não foi criado automaticamente, criar manualmente
      const { error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          id: sessionData.session.user.id,
          email: email,
          nome: nome,
          sobrenome: sobrenome,
          telefone: telefone,
          "cpf/cnpj": cpfCnpj,
          cep: cep,
          endereco: endereco,
          cidade: cidade,
          estado: estado,
          conta: userType === "cliente" ? "Cliente" : "Mecanico",
        });

      if (createProfileError) {
        console.error("Erro ao criar perfil manualmente:", createProfileError);
        throw new Error("Erro ao criar perfil do usuário.");
      }
    }

    console.log("Perfil verificado/criado, verificando assinatura...");

    // Verificar/criar assinatura gratuita
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", sessionData.session.user.id)
      .single();

    if (subscriptionError || !subscriptionData) {
      console.log("Criando assinatura gratuita...");
      const { error: createSubError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: sessionData.session.user.id,
          plan_type: "gratuito",
          status: "ativa",
          max_vehicles: 1,
          max_requests: 3,
          vehicles_used: 0,
          requests_used: 0,
        });

      if (createSubError) {
        console.error("Erro ao criar assinatura:", createSubError);
        // Não falhar por causa da assinatura, apenas logar o erro
      }
    }
    toast({
      title: "Conta criada com sucesso!",
      description: "Bem-vindo ao SOS Mecânicos!",
    });

    // Navegar baseado no tipo de usuário
    const targetRoute = userType === "mecanico" ? "/mechanic-dashboard" : "/dashboard";
    console.log(`Navegando para: ${targetRoute}`);
    navigate(targetRoute);

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao criar conta.";
    setError(errorMessage);
    console.error("Erro no signup:", errorMessage);
  } finally {
    setLoading(false);
  }
};
>>>>>>> 84af4169ce5181384cd632eb7d79a3884fcb581a
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Buscar o tipo de conta do usuário
        const { data: profile } = await supabase
          .from("profiles")
          .select("conta")
          .eq("id", data.session.user.id)
          .single();

        if (profile?.conta === "Mecanico") {
          navigate("/mechanic-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido ao entrar.");
      }
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
                    <Label htmlFor="signup-email">Email *</Label>
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
                    <Label htmlFor="signup-password">Senha *</Label>
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