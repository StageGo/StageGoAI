import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "@/components/ui/loading";
import GeneratorModal from "@/components/modals/generator-modal";
import ProfileModal from "@/components/modals/profile-modal";
import { useState } from "react";
import { GraduationCap, Crown, FileText, Download, Copy, User, Wand2 } from "lucide-react";
import type { User as UserType, CoverLetter } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();
  const typedUser = currentUser as UserType;
  const queryClient = useQueryClient();
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour accéder au tableau de bord.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: coverLetters, isLoading: lettersLoading } = useQuery<CoverLetter[]>({
    queryKey: ["/api/cover-letters"],
    enabled: isAuthenticated,
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: "Le contenu a été copié dans le presse-papier.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le contenu.",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = () => {
    window.location.href = "/subscribe";
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || !typedUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-primary">StageGo</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={typedUser.profileImageUrl || ""} />
                <AvatarFallback>
                  {typedUser.firstName?.charAt(0)}{typedUser.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {typedUser.firstName} {typedUser.lastName}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Tableau de bord</h1>
              <p className="text-gray-600">
                Bienvenue, {typedUser.firstName} !
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={typedUser.isPremium ? "default" : "secondary"} className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2">
                {typedUser.isPremium ? "Premium" : `${typedUser.remainingCredits || 0} lettres restantes`}
              </Badge>
              {!typedUser.isPremium && (
                <Button onClick={handleUpgrade} className="bg-accent text-white hover:bg-accent/90">
                  <Crown className="mr-2 h-4 w-4" />
                  Passer Premium
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setShowGeneratorModal(true)}
                    className="p-6 h-auto bg-gradient-to-br from-primary to-accent text-white hover:opacity-90 flex-col items-start space-y-2"
                  >
                    <Wand2 className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold">Générer une lettre</div>
                      <div className="text-sm text-gray-100">Créez une lettre de motivation personnalisée</div>
                    </div>
                  </Button>
                  <Button 
                    onClick={() => setShowProfileModal(true)}
                    variant="outline"
                    className="p-6 h-auto border-2 hover:border-primary flex-col items-start space-y-2"
                  >
                    <User className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold text-primary">Modifier mon profil</div>
                      <div className="text-sm text-gray-600">Mettez à jour vos informations</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Letters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary">Lettres récentes</CardTitle>
                  {coverLetters && coverLetters.length > 3 && (
                    <Button variant="link" className="text-primary">
                      Voir tout
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {lettersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                ) : coverLetters && coverLetters.length > 0 ? (
                  <div className="space-y-4">
                    {coverLetters.slice(0, 3).map((letter) => (
                      <div key={letter.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                            <FileText className="text-white h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{letter.title}</h3>
                            <p className="text-sm text-gray-600">
                              {letter.company} • {letter.country} • {letter.createdAt ? new Date(letter.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(letter.content)}
                            title="Copier"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune lettre générée pour le moment.</p>
                    <Button 
                      onClick={() => setShowGeneratorModal(true)}
                      className="mt-4"
                    >
                      Créer ma première lettre
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={typedUser.profileImageUrl || ""} />
                    <AvatarFallback className="text-lg">
                      {typedUser.firstName?.charAt(0)}{typedUser.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-primary">
                    {typedUser.firstName} {typedUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{typedUser.university}</p>
                  <p className="text-sm text-gray-600">{typedUser.fieldOfStudy}</p>
                </div>
                <Button 
                  onClick={() => setShowProfileModal(true)}
                  variant="outline" 
                  className="w-full mt-4"
                >
                  Modifier le profil
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Mes statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lettres générées</span>
                    <span className="font-semibold text-primary">
                      {coverLetters?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Crédits restants</span>
                    <span className="font-semibold text-primary">
                      {typedUser.isPremium ? "Illimité" : (typedUser.remainingCredits || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Statut</span>
                    <Badge variant={typedUser.isPremium ? "default" : "secondary"}>
                      {typedUser.isPremium ? "Premium" : "Gratuit"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-br from-accent to-primary text-white">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">💡 Conseil du jour</h3>
                <p className="text-sm text-gray-100">
                  Personnalisez toujours votre lettre en mentionnant un projet spécifique de l'entreprise !
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GeneratorModal 
        open={showGeneratorModal} 
        onOpenChange={setShowGeneratorModal}
        user={typedUser}
      />
      <ProfileModal 
        open={showProfileModal} 
        onOpenChange={setShowProfileModal}
        user={typedUser}
      />
    </div>
  );
}
