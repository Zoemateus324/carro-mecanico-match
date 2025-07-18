import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  FileText, 
  Users, 
  CheckCircle,
  ArrowRight,
  MessageSquare 
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: FileText,
      title: "1. Descreva seu Problema",
      description: "Conte-nos qual é o problema do seu veículo e que tipo de serviço você precisa",
      color: "bg-gradient-primary"
    },
    {
      icon: Search,
      title: "2. Encontre Mecânicos",
      description: "Nossa plataforma conecta você com mecânicos qualificados na sua região",
      color: "bg-gradient-secondary"
    },
    {
      icon: MessageSquare,
      title: "3. Receba Orçamentos",
      description: "Compare propostas detalhadas e escolha a melhor opção para você",
      color: "bg-gradient-primary"
    },
    {
      icon: CheckCircle,
      title: "4. Contrate e Avalie",
      description: "Contrate o serviço e avalie a experiência para ajudar outros usuários",
      color: "bg-gradient-secondary"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Como{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Funciona
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Processo simples e transparente para encontrar o mecânico ideal
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative">
                <Card className="p-6 text-center hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-gradient-card border-0">
                  <div className="space-y-4">
                    <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>

                {/* Arrow connector for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button variant="hero" size="lg">
            Começar Agora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;