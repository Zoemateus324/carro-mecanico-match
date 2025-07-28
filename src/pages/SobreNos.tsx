import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SobreNos() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-6 py-10 pt-20">
        <h1 className="text-4xl font-semibold mb-6 text-gray-900">Sobre Nós</h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          O SOS Mecânicos é uma plataforma que conecta clientes a mecânicos de confiança
          com rapidez e segurança. Nossa missão é facilitar o acesso a serviços automotivos
          de qualidade, garantindo transparência e comodidade em todo o processo.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          Trabalhamos para oferecer uma experiência simples e eficiente, com atendimento
          personalizado e suporte dedicado. Aqui você encontra mecânicos certificados,
          planos sob medida e acompanhamento em tempo real dos seus serviços.
        </p>
      </main>

      <Footer />
    </div>
  );
}
