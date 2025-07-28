import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ComoFunciona() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-6 py-10 pt-20">
        <h1 className="text-4xl font-semibold mb-6 text-gray-900">Como Funciona</h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          
          O SOS Mecânicos conecta clientes que precisam de serviços automotivos a mecânicos qualificados,
          facilitando a solicitação, orçamento e acompanhamento dos reparos.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          O cliente cadastra seu veículo e cria uma solicitação de serviço, que é enviada para mecânicos próximos.
          Os mecânicos podem enviar orçamentos, e o cliente escolhe a melhor proposta.
          Toda a comunicação e pagamento são feitos pela plataforma, garantindo segurança e transparência.
        </p>
      </main>

      <Footer />
    </div>
  );
}
