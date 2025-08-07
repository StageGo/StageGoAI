import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateCoverLetter } from "./openai";
import { insertCoverLetterSchema, updateUserSchema } from "@shared/schema";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // Cover letter routes
  app.post('/api/cover-letters/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has credits or is premium
      if (!user.isPremium && (user.remainingCredits || 0) <= 0) {
        return res.status(402).json({ 
          message: "No credits remaining. Please upgrade to premium.",
          requiresUpgrade: true 
        });
      }

      const { country, company, internshipType, duration, fieldOfStudy, motivations } = req.body;

      if (!country || !company || !internshipType || !duration || !fieldOfStudy) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Generate cover letter using AI
      const generatedLetter = await generateCoverLetter({
        country,
        company,
        internshipType,
        duration,
        fieldOfStudy,
        motivations,
        userProfile: {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          university: user.university || "",
          fieldOfStudy: user.fieldOfStudy || fieldOfStudy,
          languages: user.languages || [],
        },
      });

      // Save cover letter to database
      const coverLetter = await storage.createCoverLetter({
        userId,
        title: generatedLetter.title,
        content: generatedLetter.content,
        country,
        company,
        internshipType,
        duration,
        fieldOfStudy,
      });

      // Decrease credits if not premium
      if (!user.isPremium) {
        await storage.updateUser(userId, {
          remainingCredits: Math.max(0, (user.remainingCredits || 0) - 1),
        });
      }

      res.json(coverLetter);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  app.get('/api/cover-letters', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const letters = await storage.getCoverLettersByUser(userId);
      res.json(letters);
    } catch (error) {
      console.error("Error fetching cover letters:", error);
      res.status(500).json({ message: "Failed to fetch cover letters" });
    }
  });

  app.get('/api/cover-letters/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const letter = await storage.getCoverLetter(id);
      
      if (!letter) {
        return res.status(404).json({ message: "Cover letter not found" });
      }

      // Check if user owns this letter
      const userId = req.user.claims.sub;
      if (letter.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(letter);
    } catch (error) {
      console.error("Error fetching cover letter:", error);
      res.status(500).json({ message: "Failed to fetch cover letter" });
    }
  });

  // Stripe subscription routes
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured. Please add STRIPE_SECRET_KEY." });
    }
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: typeof subscription.latest_invoice === 'object' && subscription.latest_invoice?.payment_intent && typeof subscription.latest_invoice.payment_intent === 'object' ? subscription.latest_invoice.payment_intent.client_secret : null,
        });
      }

      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: 'eur',
            unit_amount: 499, // 4.99 EUR in cents
            recurring: {
              interval: 'month',
            },
          },
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: typeof subscription.latest_invoice === 'object' && subscription.latest_invoice?.payment_intent && typeof subscription.latest_invoice.payment_intent === 'object' ? subscription.latest_invoice.payment_intent.client_secret : null,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Webhook for Stripe events
  app.post('/api/stripe/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
    }
    try {
      const sig = req.headers['stripe-signature'];
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET || '');
      } catch (err: any) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            // Update user's premium status
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            
            // Find user by email and update premium status
            // This is a simplified approach - in production, you'd want to store the mapping
            break;
          }
          break;
        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
