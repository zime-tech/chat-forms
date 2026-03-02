export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  settings: {
    title: string;
    tone: string;
    persona: string;
    targetAudience: string;
    keyInformation: string[];
    aboutBusiness: string;
    welcomeMessage: string;
    callToAction: string;
    endScreenMessage: string;
    expectedCompletionTime: string;
  };
}

export const formTemplates: FormTemplate[] = [
  {
    id: "customer-feedback",
    name: "Customer Feedback",
    description: "Collect customer satisfaction ratings and improvement suggestions",
    category: "Feedback",
    settings: {
      title: "Customer Feedback Survey",
      tone: "friendly and empathetic",
      persona: "Customer Experience Specialist",
      targetAudience: "Existing customers who have used the product or service",
      keyInformation: [
        "Overall satisfaction rating",
        "What they liked most about the experience",
        "Areas for improvement",
        "Likelihood to recommend to others",
        "Any additional comments or suggestions",
      ],
      aboutBusiness: "",
      welcomeMessage: "We'd love to hear about your experience! Your feedback helps us improve.",
      callToAction: "Share Feedback",
      endScreenMessage: "Thank you for your valuable feedback! We truly appreciate you taking the time to help us improve.",
      expectedCompletionTime: "2-3 minutes",
    },
  },
  {
    id: "job-application",
    name: "Job Application",
    description: "Screen candidates with background, experience, and motivation questions",
    category: "HR",
    settings: {
      title: "Job Application Form",
      tone: "professional and welcoming",
      persona: "HR Representative",
      targetAudience: "Job seekers applying for open positions",
      keyInformation: [
        "Full name and contact information",
        "Current role and years of experience",
        "Relevant skills and qualifications",
        "Why they're interested in this position",
        "Availability and salary expectations",
      ],
      aboutBusiness: "",
      welcomeMessage: "Welcome! We're excited you're interested in joining our team. Let's get to know you better.",
      callToAction: "Start Application",
      endScreenMessage: "Thank you for applying! We'll review your application and get back to you soon.",
      expectedCompletionTime: "5-8 minutes",
    },
  },
  {
    id: "event-registration",
    name: "Event Registration",
    description: "Register attendees with contact info and preferences",
    category: "Events",
    settings: {
      title: "Event Registration",
      tone: "energetic and enthusiastic",
      persona: "Event Coordinator",
      targetAudience: "People interested in attending the event",
      keyInformation: [
        "Attendee name and email",
        "Number of guests",
        "Dietary restrictions or accessibility needs",
        "How they heard about the event",
        "Session or workshop preferences",
      ],
      aboutBusiness: "",
      welcomeMessage: "We're thrilled you want to join us! Let's get you registered.",
      callToAction: "Register Now",
      endScreenMessage: "You're all set! We'll send a confirmation email with all the event details.",
      expectedCompletionTime: "2-3 minutes",
    },
  },
  {
    id: "lead-generation",
    name: "Lead Generation",
    description: "Capture potential customer information and qualify leads",
    category: "Sales",
    settings: {
      title: "Get Started",
      tone: "professional and helpful",
      persona: "Solutions Advisor",
      targetAudience: "Potential customers exploring solutions",
      keyInformation: [
        "Name and company",
        "Current challenges or pain points",
        "What solution they're looking for",
        "Budget range and timeline",
        "Preferred contact method",
      ],
      aboutBusiness: "",
      welcomeMessage: "Let's find the right solution for you. Tell us a bit about what you're looking for.",
      callToAction: "Get Started",
      endScreenMessage: "Thanks for your interest! A member of our team will reach out within 24 hours.",
      expectedCompletionTime: "3-4 minutes",
    },
  },
  {
    id: "employee-survey",
    name: "Employee Survey",
    description: "Measure team satisfaction and gather workplace improvement ideas",
    category: "HR",
    settings: {
      title: "Employee Satisfaction Survey",
      tone: "supportive and confidential",
      persona: "People & Culture Team Member",
      targetAudience: "Current employees",
      keyInformation: [
        "Overall job satisfaction",
        "Work-life balance rating",
        "Team collaboration and communication",
        "Professional development opportunities",
        "Suggestions for workplace improvement",
      ],
      aboutBusiness: "",
      welcomeMessage: "Your honest feedback matters. This survey is anonymous and helps us create a better workplace.",
      callToAction: "Begin Survey",
      endScreenMessage: "Thank you for sharing your thoughts. Your feedback directly helps us improve our workplace.",
      expectedCompletionTime: "3-5 minutes",
    },
  },
];
