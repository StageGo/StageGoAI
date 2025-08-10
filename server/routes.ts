import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { generateCoverLetter } from "./openai";
import { insertCoverLetterSchema, updateUserSchema, insertUserSchema, loginSchema } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
}) : null;

// Custom authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Session configuration
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "stagego-secret-key-dev",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user
      const user = await storage.createUser(userData);
      
      // Create session
      (req.session as any).userId = user.id;
      
      res.json({ message: "User registered successfully", userId: user.id });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(400).json({ message: "Failed to register user" });
    }
  });

  // Create demo account
  app.post('/api/auth/create-demo', async (req, res) => {
    try {
      // Check if demo user already exists
      const existingUser = await storage.getUserByEmail('demo@stagego.com');
      if (!existingUser) {
        // Create demo user
        const demoUser = await storage.createUser({
          email: 'demo@stagego.com',
          password: 'demo123',
          firstName: 'Jean',
          lastName: 'Dupont',
          university: 'Université Paris-Sorbonne',
          fieldOfStudy: 'Informatique',
          languages: ['Français', 'Anglais', 'Espagnol'],
          countriesOfInterest: ['États-Unis', 'Canada', 'Royaume-Uni'],
        });
        console.log('Demo user created:', demoUser.id);
      }
      res.json({ message: "Demo user ready" });
    } catch (error) {
      console.error("Error creating demo user:", error);
      res.status(500).json({ message: "Failed to create demo user" });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.verifyUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      (req.session as any).userId = user.id;
      
      res.json({ message: "Login successful", userId: user.id });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const updates = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(userId, updates);
      
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // Cover letter routes
  app.post('/api/cover-letters/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
          expand: ['latest_invoice.payment_intent'],
        });
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice && 
            typeof subscription.latest_invoice === 'object' && 
            subscription.latest_invoice.payment_intent &&
            typeof subscription.latest_invoice.payment_intent === 'object' 
            ? subscription.latest_invoice.payment_intent.client_secret : null,
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
            product_data: {
              name: 'StageGo Premium',
            },
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
        clientSecret: subscription.latest_invoice && 
          typeof subscription.latest_invoice === 'object' && 
          subscription.latest_invoice.payment_intent &&
          typeof subscription.latest_invoice.payment_intent === 'object' 
          ? subscription.latest_invoice.payment_intent.client_secret : null,
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
