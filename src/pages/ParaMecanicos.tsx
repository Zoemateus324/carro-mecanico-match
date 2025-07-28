import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ParaMecanicos() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-6 py-10 pt-20">
        <h1 className="text-4xl font-semibold mb-6 text-gray-900">Para Mecânicos</h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          Esta página é dedicada aos mecânicos que utilizam nosso serviço.
          Aqui você encontra todas as informações necessárias para gerenciar seus atendimentos,
          planos e clientes de forma simples e eficiente.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          Nosso objetivo é proporcionar uma plataforma fácil de usar, que ajuda você a crescer
          seu negócio, receber orçamentos e se conectar rapidamente com clientes na sua região.
        </p>
      </main>

      <Footer />
    </div>
  );
}
