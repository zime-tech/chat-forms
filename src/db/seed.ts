import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  // @ts-ignore
  const db = drizzle(pool, { schema });

  console.log("Seeding database...");

  // Clean existing data
  await db.delete(schema.formSessions);
  await db.delete(schema.formCreationLogs);
  await db.delete(schema.forms);
  await db.delete(schema.sessions);
  await db.delete(schema.accounts);
  await db.delete(schema.verificationTokens);
  await db.delete(schema.users);

  console.log("Cleared existing data");

  // Create test users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const testUserId = uuidv4();
  const demoUserId = uuidv4();

  await db.insert(schema.users).values([
    {
      id: testUserId,
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      createdAt: new Date(),
    },
    {
      id: demoUserId,
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
      createdAt: new Date(),
    },
  ]);

  console.log("Created test users: test@example.com / demo@example.com (password: password123)");

  // Create sample forms
  const customerFeedbackFormId = uuidv4();
  const jobApplicationFormId = uuidv4();
  const eventRegistrationFormId = uuidv4();
  const productSurveyFormId = uuidv4();

  await db.insert(schema.forms).values([
    {
      id: customerFeedbackFormId,
      title: "Customer Satisfaction Survey",
      tone: "friendly and empathetic",
      persona: "Friendly customer success representative named Alex",
      keyInformation: [
        "Overall satisfaction rating",
        "Product or service used",
        "Specific feedback on experience",
        "Areas for improvement",
        "Likelihood to recommend",
      ],
      targetAudience: "Existing customers who recently made a purchase",
      expectedCompletionTime: "3-5 minutes",
      aboutBusiness: "We are an e-commerce platform selling premium tech accessories",
      welcomeMessage: "Hi there! Thanks for taking a moment to share your experience with us. Your feedback helps us improve. Ready to get started?",
      callToAction: "Share Your Feedback",
      endScreenMessage: "Thank you so much for your valuable feedback! We truly appreciate you taking the time to help us improve.",
      messageHistory: [
        {
          id: "msg-1",
          role: "assistant" as const,
          content: "Let's start creating the form. Give me an idea of what this form is created for?",
        },
        {
          id: "msg-2",
          role: "user" as const,
          content: "I want to create a customer satisfaction survey for our e-commerce store that sells tech accessories",
        },
        {
          id: "msg-3",
          role: "assistant" as const,
          content: "I've set up your Customer Satisfaction Survey. The form will collect feedback about their experience, specific products, and suggestions for improvement. Want to adjust any of the settings?",
        },
      ],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      userId: testUserId,
    },
    {
      id: jobApplicationFormId,
      title: "Software Engineer Application",
      tone: "professional and welcoming",
      persona: "Experienced HR recruiter named Sam",
      keyInformation: [
        "Full name and contact information",
        "Years of experience",
        "Primary programming languages",
        "Previous work experience highlights",
        "Availability and expected compensation",
        "Why they want to join the company",
      ],
      targetAudience: "Software engineers with 2+ years of experience",
      expectedCompletionTime: "5-8 minutes",
      aboutBusiness: "A fast-growing SaaS startup building developer tools",
      welcomeMessage: "Welcome! We're excited you're interested in joining our team. Let's get to know you better through a quick conversation.",
      callToAction: "Start Application",
      endScreenMessage: "Thanks for applying! Our team will review your application and get back to you within 5 business days.",
      messageHistory: [],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      userId: testUserId,
    },
    {
      id: eventRegistrationFormId,
      title: "Tech Conference Registration",
      tone: "energetic and enthusiastic",
      persona: "Enthusiastic event coordinator named Jordan",
      keyInformation: [
        "Attendee name and email",
        "Company and role",
        "Dietary restrictions",
        "Session preferences",
        "Networking interests",
      ],
      targetAudience: "Tech professionals and enthusiasts",
      expectedCompletionTime: "2-3 minutes",
      aboutBusiness: "Annual technology conference bringing together industry leaders",
      welcomeMessage: "Welcome to TechConnect 2025! We can't wait to have you join us. Let's get you registered.",
      callToAction: "Register Now",
      endScreenMessage: "You're all set! Check your email for confirmation and event details. See you there!",
      messageHistory: [],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      userId: testUserId,
    },
    {
      id: productSurveyFormId,
      title: "Product Feature Survey",
      tone: "casual and conversational",
      persona: "Product manager named Taylor",
      keyInformation: [
        "Current usage frequency",
        "Most used features",
        "Pain points",
        "Feature requests",
        "Overall product rating",
      ],
      targetAudience: "Active users of the product",
      expectedCompletionTime: "3-4 minutes",
      aboutBusiness: "A project management tool for small teams",
      welcomeMessage: "Hey! We're working on making our product even better and would love to hear your thoughts.",
      callToAction: "Give Feedback",
      endScreenMessage: "Thanks for your input! Your feedback directly shapes what we build next.",
      messageHistory: [],
      createdAt: new Date(),
      userId: demoUserId,
    },
  ]);

  console.log("Created 4 sample forms");

  // Create form creation logs
  await db.insert(schema.formCreationLogs).values([
    { userId: testUserId, formId: customerFeedbackFormId, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { userId: testUserId, formId: jobApplicationFormId, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { userId: testUserId, formId: eventRegistrationFormId, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { userId: demoUserId, formId: productSurveyFormId, createdAt: new Date() },
  ]);

  // Create sample form sessions (completed submissions)
  const session1Id = uuidv4();
  const session2Id = uuidv4();
  const session3Id = uuidv4();

  await db.insert(schema.formSessions).values([
    {
      id: session1Id,
      formId: customerFeedbackFormId,
      quickSummary: "Very satisfied customer, loves the product quality but wants faster shipping",
      detailedSummary: "Overall satisfaction: 4/5 stars\nProduct used: Wireless keyboard and mouse combo\nExperience: Great build quality and comfortable typing experience\nAreas for improvement: Shipping took 8 days, would prefer 3-5 day delivery\nLikelihood to recommend: 8/10",
      overallSentiment: "Positive",
      messageHistory: [
        { id: "s1-1", role: "assistant" as const, content: "How would you rate your overall experience with us on a scale of 1-5?" },
        { id: "s1-2", role: "user" as const, content: "I'd give it a 4 out of 5" },
        { id: "s1-3", role: "assistant" as const, content: "Great! Which product did you recently purchase?" },
        { id: "s1-4", role: "user" as const, content: "The wireless keyboard and mouse combo" },
        { id: "s1-5", role: "assistant" as const, content: "How has your experience been using it?" },
        { id: "s1-6", role: "user" as const, content: "Really good build quality, comfortable to type on for long hours" },
        { id: "s1-7", role: "assistant" as const, content: "Is there anything we could improve?" },
        { id: "s1-8", role: "user" as const, content: "Shipping was slow, took about 8 days. Would be nice to get it in 3-5 days" },
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: session2Id,
      formId: customerFeedbackFormId,
      quickSummary: "Mixed experience - product is good but customer support needs improvement",
      detailedSummary: "Overall satisfaction: 3/5 stars\nProduct used: USB-C Hub\nExperience: Product works well but had issues initially\nAreas for improvement: Customer support response time was very slow (3 days)\nLikelihood to recommend: 6/10",
      overallSentiment: "Neutral",
      messageHistory: [
        { id: "s2-1", role: "assistant" as const, content: "How would you rate your overall experience?" },
        { id: "s2-2", role: "user" as const, content: "3 out of 5" },
        { id: "s2-3", role: "assistant" as const, content: "What product did you purchase?" },
        { id: "s2-4", role: "user" as const, content: "USB-C Hub" },
        { id: "s2-5", role: "assistant" as const, content: "Can you tell me about your experience?" },
        { id: "s2-6", role: "user" as const, content: "Product works fine now but had connection issues at first. Support took 3 days to respond" },
      ],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: session3Id,
      formId: customerFeedbackFormId,
      quickSummary: "Extremely satisfied, repeat customer praising product range and quality",
      detailedSummary: "Overall satisfaction: 5/5 stars\nProduct used: Multiple products (phone case, screen protector, charger)\nExperience: Consistently high quality across all products purchased\nAreas for improvement: Would like a loyalty program or bundle discounts\nLikelihood to recommend: 10/10",
      overallSentiment: "Very Positive",
      messageHistory: [
        { id: "s3-1", role: "assistant" as const, content: "How would you rate your experience?" },
        { id: "s3-2", role: "user" as const, content: "5 stars, definitely!" },
        { id: "s3-3", role: "assistant" as const, content: "That's wonderful! What products have you tried?" },
        { id: "s3-4", role: "user" as const, content: "Phone case, screen protector, and a charger. All great quality" },
      ],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log("Created 3 sample form sessions with responses");

  await pool.end();
  console.log("\nSeeding complete!");
  console.log("\nTest accounts:");
  console.log("  test@example.com / password123 (3 forms, with responses)");
  console.log("  demo@example.com / password123 (1 form)");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
