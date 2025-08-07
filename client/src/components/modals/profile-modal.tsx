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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { User } from "@shared/schema";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export default function ProfileModal({ open, onOpenChange, user }: ProfileModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    university: user.university || "",
    fieldOfStudy: user.fieldOfStudy || "",
    languages: user.languages || [],
    countriesOfInterest: user.countriesOfInterest || [],
  });
  const [newLanguage, setNewLanguage] = useState("");
  const [newCountry, setNewCountry] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
      onOpenChange(false);
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

      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLanguage],
      });
      setNewLanguage("");
    }
  };

  const removeLanguage = (language: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(l => l !== language),
    });
  };

  const addCountry = () => {
    if (newCountry && !formData.countriesOfInterest.includes(newCountry)) {
      setFormData({
        ...formData,
        countriesOfInterest: [...formData.countriesOfInterest, newCountry],
      });
      setNewCountry("");
    }
  };

  const removeCountry = (country: string) => {
    setFormData({
      ...formData,
      countriesOfInterest: formData.countriesOfInterest.filter(c => c !== country),
    });
  };

  const countries = [
    "États-Unis", "Canada", "Royaume-Uni", "Allemagne", "France", "Espagne", 
    "Italie", "Suède", "Danemark", "Norvège", "Pays-Bas", "Belgique", 
    "Suisse", "Australie", "Nouvelle-Zélande", "Japon", "Corée du Sud", "Singapour"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Mon profil
          </DialogTitle>
          <p className="text-gray-600">Mettez à jour vos informations</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src={user.profileImageUrl || ""} />
              <AvatarFallback className="text-lg">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button variant="link" className="text-primary text-sm">
              Changer la photo
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="university">Université</Label>
            <Input
              id="university"
              value={formData.university}
              onChange={(e) => setFormData({...formData, university: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="fieldOfStudy">Domaine d'études</Label>
            <Input
              id="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})}
            />
          </div>

          <div>
            <Label>Langues parlées</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.languages.map((language) => (
                <Badge key={language} variant="default" className="bg-primary text-white">
                  {language}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0 text-white hover:bg-transparent"
                    onClick={() => removeLanguage(language)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Ajouter une langue"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
              />
              <Button type="button" onClick={addLanguage} variant="outline">
                Ajouter
              </Button>
            </div>
          </div>

          <div>
            <Label>Pays d'intérêt</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.countriesOfInterest.map((country) => (
                <Badge key={country} variant="secondary" className="bg-accent text-white">
                  {country}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0 text-white hover:bg-transparent"
                    onClick={() => removeCountry(country)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={newCountry} onValueChange={setNewCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter un pays" />
                </SelectTrigger>
                <SelectContent>
                  {countries
                    .filter(country => !formData.countriesOfInterest.includes(country))
                    .map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addCountry} variant="outline">
                Ajouter
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              {updateMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}