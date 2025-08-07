import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2, Copy, Download, Info } from "lucide-react";
import type { User, CoverLetter } from "@shared/schema";

interface GeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export default function GeneratorModal({ open, onOpenChange, user }: GeneratorModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    country: "",
    company: "",
    internshipType: "",
    duration: "",
    fieldOfStudy: "",
    motivations: "",
  });
  const [generatedLetter, setGeneratedLetter] = useState<CoverLetter | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/cover-letters/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedLetter(data);
      queryClient.invalidateQueries({ queryKey: ["/api/cover-letters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Lettre générée !",
        description: "Votre lettre de motivation a été créée avec succès.",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }

      if (error.message.includes("402")) {
        toast({
          title: "Crédits épuisés",
          description: "Vous n'avez plus de crédits. Passez au premium pour continuer.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Erreur",
        description: "Impossible de générer la lettre. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.country || !formData.company || !formData.internshipType || !formData.duration || !formData.fieldOfStudy) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate(formData);
  };

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

  const handleClose = () => {
    onOpenChange(false);
    setGeneratedLetter(null);
    setFormData({
      country: "",
      company: "",
      internshipType: "",
      duration: "",
      fieldOfStudy: "",
      motivations: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Générateur IA
          </DialogTitle>
          <p className="text-gray-600">Créez votre lettre de motivation parfaite</p>
        </DialogHeader>

        {!generatedLetter ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Pays ciblé *</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="États-Unis">États-Unis</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Royaume-Uni">Royaume-Uni</SelectItem>
                    <SelectItem value="Allemagne">Allemagne</SelectItem>
                    <SelectItem value="Suède">Suède</SelectItem>
                    <SelectItem value="Danemark">Danemark</SelectItem>
                    <SelectItem value="Norvège">Norvège</SelectItem>
                    <SelectItem value="Pays-Bas">Pays-Bas</SelectItem>
                    <SelectItem value="Australie">Australie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="company">Entreprise *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="Ex: Google, Microsoft..."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="internshipType">Type de stage *</Label>
                <Select value={formData.internshipType} onValueChange={(value) => setFormData({...formData, internshipType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Développement Web">Développement Web</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Design UX/UI">Design UX/UI</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Ressources Humaines">Ressources Humaines</SelectItem>
                    <SelectItem value="Ingénierie">Ingénierie</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Durée *</Label>
                <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir la durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3 mois">3 mois</SelectItem>
                    <SelectItem value="6 mois">6 mois</SelectItem>
                    <SelectItem value="12 mois">12 mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="fieldOfStudy">Domaine d'études *</Label>
              <Input
                id="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})}
                placeholder="Ex: Marketing Digital, Informatique..."
              />
            </div>

            <div>
              <Label htmlFor="motivations">Motivations spécifiques (optionnel)</Label>
              <Textarea
                id="motivations"
                value={formData.motivations}
                onChange={(e) => setFormData({...formData, motivations: e.target.value})}
                rows={3}
                placeholder="Mentionnez des projets de l'entreprise qui vous intéressent..."
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Info className="text-primary mr-2 h-4 w-4" />
                <span>Génération estimée : 30 secondes</span>
              </div>
              <Button 
                type="submit" 
                disabled={generateMutation.isPending || (!user.isPremium && (user.remainingCredits || 0) <= 0)}
                className="bg-gradient-to-r from-primary to-accent text-white px-8 py-3"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {generateMutation.isPending ? "Génération..." : "Générer ma lettre"}
              </Button>
            </div>

            {!user.isPremium && (user.remainingCredits || 0) <= 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  Vous n'avez plus de crédits gratuits. 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-yellow-800 underline"
                    onClick={() => window.location.href = "/subscribe"}
                  >
                    Passez au premium
                  </Button> pour générer des lettres illimitées.
                </p>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-primary">Votre lettre de motivation</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedLetter.content)}
                      title="Copier"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      title="Télécharger PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="prose text-sm bg-white p-4 rounded-lg border max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap">{generatedLetter.content}</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setGeneratedLetter(null)}
              >
                Générer une nouvelle lettre
              </Button>
              <Button onClick={handleClose}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
