import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
import Loading from "@/components/ui/loading";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erreur de paiement",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Paiement réussi",
        description: "Vous êtes maintenant abonné Premium !",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full bg-gradient-to-r from-primary to-accent text-white"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {isLoading ? "Traitement..." : "S'abonner maintenant"}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour vous abonner.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (isAuthenticated && stripePromise) {
      // Create subscription as soon as the page loads
      apiRequest("POST", "/api/create-subscription")
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: "Erreur",
            description: "Impossible de créer l'abonnement",
            variant: "destructive",
          });
        });
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">Paiement non configuré</h1>
            <p className="text-gray-600 mb-8">
              Le système de paiement n'est pas encore configuré. Veuillez contacter l'administrateur.
            </p>
            <Button onClick={() => window.location.href = "/"} variant="outline">
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return <Loading />;
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = "/"}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="text-white h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Passez Premium</h1>
            <p className="text-gray-600">Débloquez toutes les fonctionnalités de StageGo</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pricing Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  4,99€<span className="text-lg text-gray-600">/mois</span>
                </div>
                <p className="text-sm text-gray-600">Facturation mensuelle</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="text-accent mr-3 h-5 w-5" />
                  <span>Lettres de motivation illimitées</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-accent mr-3 h-5 w-5" />
                  <span>Génération d'emails de candidature</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-accent mr-3 h-5 w-5" />
                  <span>Support prioritaire</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-accent mr-3 h-5 w-5" />
                  <span>Statistiques avancées</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-accent mr-3 h-5 w-5" />
                  <span>Accès aux nouvelles fonctionnalités</span>
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 text-center">
                  Résiliable à tout moment. Sécurisé par Stripe.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de paiement</CardTitle>
            </CardHeader>
            <CardContent>
              {stripePromise && <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm />
              </Elements>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
