import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Brain, Globe, ChartLine, Rocket, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = "/";
    } else {
      window.location.href = "/api/login";
    }
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img 
                src="/attached_assets/Flèche noire sur cercle blanc_1754849198190.png" 
                alt="StageGo Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold text-primary">StageGo</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Tarifs</a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">Contact</a>
            </div>

            <div className="flex items-center space-x-4">
              {!isLoading && !isAuthenticated && (
                <>
                  <Button variant="ghost" onClick={() => window.location.href = "/login"}>
                    Connexion
                  </Button>
                  <Button onClick={() => window.location.href = "/register"} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Inscription
                  </Button>
                </>
              )}
              {isAuthenticated && (
                <Button onClick={() => window.location.href = "/"}>
                  Tableau de bord
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-accent text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&w=1920&h=1080&fit=crop')] bg-cover bg-center"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Décrochez votre stage de
              <span className="text-accent"> rêve à l'étranger</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto leading-relaxed">
              StageGo utilise l'intelligence artificielle pour générer vos candidatures et vous aide à postuler dans les universités à l'internationale
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleGetStarted} 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-8 py-4 text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Commencer gratuitement
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={scrollToFeatures}
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold transition-all"
              >
                Découvrir comment ça marche
              </Button>
            </div>
            <div className="mt-8 flex justify-center items-center space-x-8 text-sm text-gray-200">
              <div className="flex items-center">
                <CheckCircle className="text-accent mr-2 h-4 w-4" />
                <span>3 lettres gratuites</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-accent mr-2 h-4 w-4" />
                <span>IA personnalisée</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-accent mr-2 h-4 w-4" />
                <span>Sans engagement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Pourquoi choisir StageGo ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Notre plateforme révolutionnaire utilise l'IA pour maximiser vos chances de décrocher le stage parfait
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 bg-gray-50">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-4">IA Personnalisée</h3>
                  <p className="text-gray-600">
                    Notre intelligence artificielle analyse votre profil et génère des lettres de motivation uniques et percutantes
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 bg-gray-50">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Globe className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Opportunités Mondiales</h3>
                  <p className="text-gray-600">
                    Accédez à des milliers d'opportunités de stages dans plus de 50 pays à travers le monde
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 bg-gray-50">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ChartLine className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Suivi Intelligent</h3>
                  <p className="text-gray-600">
                    Suivez vos candidatures en temps réel et recevez des conseils personnalisés pour améliorer votre profil
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              En 3 étapes simples, générez vos candidatures parfaites
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold text-primary mb-4">Créez votre profil</h3>
              <p className="text-gray-600">Renseignez vos informations académiques, vos compétences et vos préférences de pays</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold text-primary mb-4">Définissez vos critères</h3>
              <p className="text-gray-600">Choisissez le type de stage, le pays, l'entreprise et la durée souhaitée</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold text-primary mb-4">Générez et postulez</h3>
              <p className="text-gray-600">Notre IA crée votre lettre de motivation personnalisée en quelques secondes</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Choisissez votre formule
            </h2>
            <p className="text-xl text-gray-600">
              Commencez gratuitement, passez au premium quand vous êtes prêt
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 border border-gray-200 bg-gray-50">
              <CardContent className="pt-0">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-2">Gratuit</h3>
                  <div className="text-4xl font-bold text-primary mb-4">0€<span className="text-lg text-gray-600">/mois</span></div>
                  <p className="text-gray-600">Parfait pour commencer</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="text-accent mr-3 h-4 w-4" />
                    <span>3 lettres de motivation par mois</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-accent mr-3 h-4 w-4" />
                    <span>Profil étudiant complet</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-accent mr-3 h-4 w-4" />
                    <span>Historique des candidatures</span>
                  </li>
                </ul>

                <Button onClick={handleGetStarted} className="w-full bg-gray-200 text-primary hover:bg-gray-300">
                  Commencer gratuitement
                </Button>
              </CardContent>
            </Card>

            <Card className="relative p-8 bg-gradient-to-br from-primary to-accent text-white">
              <Badge className="absolute top-4 right-4 bg-white text-primary">
                Populaire
              </Badge>
              
              <CardContent className="pt-0">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <div className="text-4xl font-bold mb-4">4,99€<span className="text-lg text-gray-100">/mois</span></div>
                  <p className="text-gray-100">Pour les plus ambitieux</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="text-white mr-3 h-4 w-4" />
                    <span>Lettres illimitées</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-white mr-3 h-4 w-4" />
                    <span>Génération d'emails de candidature</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-white mr-3 h-4 w-4" />
                    <span>Support prioritaire</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-white mr-3 h-4 w-4" />
                    <span>Statistiques avancées</span>
                  </li>
                </ul>

                <Button onClick={handleGetStarted} className="w-full bg-white text-primary hover:bg-gray-100">
                  Commencer l'essai gratuit
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/attached_assets/Flèche noire sur cercle blanc_1754849198190.png" 
                  alt="StageGo Logo" 
                  className="w-8 h-8 rounded-lg"
                />
                <span className="text-xl font-bold">StageGo</span>
              </div>
              <p className="text-gray-300 mb-4">
                La plateforme IA qui révolutionne la recherche de stages à l'étranger pour les étudiants français.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guide d'utilisation</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 StageGo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
