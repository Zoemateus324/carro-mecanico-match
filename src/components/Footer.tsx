import { Car, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-600 text-white flex items-center jusfity-center w-[45px] h-[45px] rounded-full font-bold">
                SOS
              </div>
              <span className="font-bold text-xl text-background">Mecânicos</span>
            </div>
            <p className="text-background/80 leading-relaxed">
              Conectando clientes com os melhores mecânicos da região. 
              Serviços automotivos de qualidade, transparentes e confiáveis.
            </p>
            <div className="flex space-x-4">
              <div className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors cursor-pointer">
                <Facebook className="h-5 w-5" />
              </div>
              <div className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors cursor-pointer">
                <Instagram className="h-5 w-5" />
              </div>
              <div className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors cursor-pointer">
                <Twitter className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Serviços</h3>
            <ul className="space-y-2">
              <li><Link to="/servicos/manutencao" className="text-background/80 hover:text-background transition-colors">Manutenção Preventiva</Link></li>
              <li><Link to="/servicos/reparo" className="text-background/80 hover:text-background transition-colors">Reparo de Motor</Link></li>
              <li><Link to="/servicos/eletrica" className="text-background/80 hover:text-background transition-colors">Sistema Elétrico</Link></li>
              <li><Link to="/servicos/ar-condicionado" className="text-background/80 hover:text-background transition-colors">Ar Condicionado</Link></li>
              <li><Link to="/servicos/guincho" className="text-background/80 hover:text-background transition-colors">Guincho 24h</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li><Link to="/sobre" className="text-background/80 hover:text-background transition-colors">Sobre Nós</Link></li>
              <li><Link to="/como-funciona" className="text-background/80 hover:text-background transition-colors">Como Funciona</Link></li>
              <li><Link to="/para-mecanicos" className="text-background/80 hover:text-background transition-colors">Para Mecânicos</Link></li>
              <li><Link to="/ajuda" className="text-background/80 hover:text-background transition-colors">Central de Ajuda</Link></li>
              <li><Link to="/privacidade" className="text-background/80 hover:text-background transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-background/60" />
                <span className="text-background/80">contato@sosmecanicos.com.br</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-background/60" />
                <span className="text-background/80">(11) 95150-5824</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-background/60" />
                <span className="text-background/80">São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-background/60 text-sm">
              © 2025 SOS Mecânicos. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/termos" className="text-background/60 hover:text-background text-sm transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="text-background/60 hover:text-background text-sm transition-colors">
                Privacidade
              </Link>
              <Link to="/cookies" className="text-background/60 hover:text-background text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;