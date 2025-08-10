import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, ArrowLeft, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
  languages: z.array(z.string()).min(1, "Sélectionnez au moins une langue"),
  countriesOfInterest: z.array(z.string()).min(1, "Sélectionnez au moins un pays"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const countries = [
  "États-Unis", "Canada", "Royaume-Uni", "Allemagne", "Espagne", "Italie",
  "Pays-Bas", "Suède", "Danemark", "Norvège", "Suisse", "Autriche",
  "Belgique", "Luxembourg", "Irlande", "Portugal", "Australie", "Nouvelle-Zélande",
  "Singapour", "Japon", "Corée du Sud", "Hong Kong"
];

const languages = [
  "Français", "Anglais", "Espagnol", "Allemand", "Italien", "Portugais",
  "Néerlandais", "Suédois", "Danois", "Norvégien", "Japonais", "Coréen",
  "Mandarin", "Arabe", "Russe"
];

const fieldOfStudyOptions = [
  "Informatique", "Ingénierie", "Business/Management", "Marketing",
  "Finance", "Économie", "Droit", "Médecine", "Architecture",
  "Design", "Communication", "Relations Internationales",
  "Environnement", "Energie", "Biotechnologies", "Autre"
];

export default function Register() {
  const { toast } = useToast();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      university: "",
      fieldOfStudy: "",
      languages: [],
      countriesOfInterest: [],
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const res = await apiRequest("POST", "/api/auth/register", {
        ...data,
        languages: selectedLanguages,
        countriesOfInterest: selectedCountries,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Inscription réussie !",
        description: "Votre compte a été créé. Connexion automatique...",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'inscription",
        description: error.message.includes("400") 
          ? "Cet email est déjà utilisé ou les données sont invalides."
          : "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    if (selectedLanguages.length === 0) {
      toast({
        title: "Langues manquantes",
        description: "Veuillez sélectionner au moins une langue.",
        variant: "destructive",
      });
      return;
    }

    if (selectedCountries.length === 0) {
      toast({
        title: "Pays manquants", 
        description: "Veuillez sélectionner au moins un pays d'intérêt.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(data);
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
            
            <Button variant="ghost" onClick={() => window.location.href = "/"}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Créez votre profil StageGo
          </h1>
          <p className="text-xl text-gray-600">
            Renseignez vos informations pour recevoir des recommandations personnalisées
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="John"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    placeholder="Doe"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="john.doe@email.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    placeholder="••••••••"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...form.register("confirmPassword")}
                    placeholder="••••••••"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Informations académiques */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Informations académiques
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="university">Université/École *</Label>
                    <Input
                      id="university"
                      {...form.register("university")}
                      placeholder="Université de la Sorbonne"
                    />
                    {form.formState.errors.university && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.university.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fieldOfStudy">Domaine d'études *</Label>
                    <Select onValueChange={(value) => form.setValue("fieldOfStudy", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre domaine" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOfStudyOptions.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.fieldOfStudy && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.fieldOfStudy.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Langues */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Langues parlées *
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez toutes les langues que vous parlez
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((language) => (
                    <Badge
                      key={language}
                      variant={selectedLanguages.includes(language) ? "default" : "outline"}
                      className="cursor-pointer p-2 justify-center"
                      onClick={() => toggleLanguage(language)}
                    >
                      {selectedLanguages.includes(language) && (
                        <Check className="mr-1 h-3 w-3" />
                      )}
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Pays d'intérêt */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Pays d'intérêt pour un stage *
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez les pays où vous aimeriez faire un stage
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {countries.map((country) => (
                    <Badge
                      key={country}
                      variant={selectedCountries.includes(country) ? "default" : "outline"}
                      className="cursor-pointer p-2 justify-center"
                      onClick={() => toggleCountry(country)}
                    >
                      {selectedCountries.includes(country) && (
                        <Check className="mr-1 h-3 w-3" />
                      )}
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 text-lg"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Création du compte..." : "Créer mon compte"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Déjà un compte ?{" "}
                  <button
                    type="button"
                    onClick={() => window.location.href = "/login"}
                    className="text-primary hover:underline"
                  >
                    Se connecter
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}