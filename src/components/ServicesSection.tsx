import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  Car, 
  Gauge, 
  Battery, 
  Truck, 
  Shield,
  ArrowRight 
} from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: Wrench,
      title: "Manutenção Preventiva",
      description: "Revisões periódicas, troca de óleo, filtros e manutenção geral",
      popular: true
    },
    {
      icon: Car,
      title: "Reparo de Motor",
      description: "Diagnóstico e reparo de problemas no motor do seu veículo",
      popular: false
    },
    {
      icon: Gauge,
      title: "Sistema Elétrico",
      description: "Bateria, alternador, sistema de ignição e componentes elétricos",
      popular: false
    },
    {
      icon: Battery,
      title: "Ar Condicionado",
      description: "Manutenção e reparo do sistema de climatização automotiva",
      popular: false
    },
    {
      icon: Truck,
      title: "Guincho e Reboque",
      description: "Serviço de guincho 24h para emergências automotivas",
      popular: true
    },
    {
      icon: Shield,
      title: "Diagnóstico Completo",
      description: "Análise computadorizada e diagnóstico de falhas",
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Serviços{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Automotivos
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontre mecânicos especializados em diversos tipos de serviços para seu veículo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card 
                key={index} 
                className="p-6 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-gradient-card border-0 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-gradient-primary rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-6 w-6 text-primary-foreground" />
                    </div>
                    {service.popular && (
                      <span className="bg-gradient-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full justify-between group/btn"
                  >
                    Solicitar Orçamento
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg">
            Ver Todos os Serviços
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;