import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wrench, MapPin, Clock, Star, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-automotive.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden p-3">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Serviços automotivos profissionais" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge variant="secondary" className="animate-pulse-glow">
                🚀 Plataforma #1 em Serviços Automotivos
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Conecte-se
                </span>{" "}
                com os{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  melhores mecânicos
                </span>{" "}
                da sua região
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Encontre profissionais qualificados para cuidar do seu veículo. 
                Orçamentos transparentes, serviços garantidos e mecânicos verificados.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-medium">Mecânicos Verificados</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-secondary rounded-lg">
                  <Clock className="h-5 w-5 text-secondary-foreground" />
                </div>
                <span className="font-medium">Atendimento Rápido</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Star className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-medium">Avaliações Reais</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-secondary rounded-lg">
                  <MapPin className="h-5 w-5 text-secondary-foreground" />
                </div>
                <span className="font-medium">Na Sua Região</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="hero"
                onClick={() => navigate("/auth")}
                className="group"
              >
                Solicitar Serviço
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="professional" 
                size="lg"
                onClick={() => navigate("/para-mecanicos")}
              >
                <Wrench className="mr-2 h-5 w-5" />
                Sou Mecânico
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8 pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Mecânicos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2.5k+</div>
                <div className="text-sm text-muted-foreground">Serviços</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">Avaliação</div>
              </div>
            </div>
          </div>

          {/* Right side - Service Card */}
          <div className="lg:flex justify-center hidden">
            <Card className="w-full max-w-md p-8 bg-gradient-card shadow-elegant border-0 animate-float">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Wrench className="h-10 w-10 text-primary-foreground" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">Simples e Rápido</h3>
                  <p className="text-muted-foreground">
                    Descreva seu problema, receba orçamentos e escolha o melhor mecânico
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      1
                    </div>
                    <span className="text-left">Descreva o problema</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      2
                    </div>
                    <span className="text-left">Receba orçamentos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      3
                    </div>
                    <span className="text-left">Escolha e contrate</span>
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  Começar Agora
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;