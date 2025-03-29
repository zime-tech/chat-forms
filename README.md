# Chat Froms

An AI-powered form builder with interactive responses, built with Next.js 15, AI SDK, Drizzle ORM, and AI features.

## 📝 Overview

Chat Forms is a powerful web application that allows users to build interactive forms with AI-powered responses. Create, manage, and share forms easily with a modern UI and real-time validation.

### Key Features

- 🔄 AI-Native experience
- 🤖 AI-powered form responses
- 📊 Intuitive form builder interface
- 🤖 AI assistant for form submission

## 🎬 Demo Video

[![Chat Forms Demo](https://img.youtube.com/vi/SNt0ILIV8Hc/0.jpg)](https://www.youtube.com/watch?v=SNt0ILIV8Hc)

_Click the image above to watch a demonstration of Forms Chatbot in action._

## 📚 Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **AI Integration**: AI SDK with OpenAI support
- **Deployment**: Vercel

## 🧩 Project Structure

```
/
├── src/
│   ├── actions/      # Server actions
│   ├── app/          # Next.js app directory
│   ├── auth/         # Authentication configuration
│   ├── components/   # React components
│   ├── db/           # Database models and configuration
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions
│   ├── system-prompts/ # AI prompt templates
│   └── types/        # TypeScript types
├── public/           # Static assets
└── ...config files
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zime-tech/chat-forms.git
   cd chat-forms
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:

   ```
    OPENAI_API_KEY
    DATABASE_URL
    NEXTAUTH_SECRET
    NEXTAUTH_URL
    NEXT_PUBLIC_JITSU_WRITE_KEY
    NEXT_PUBLIC_JITSU_HOST
    JITSU_SERVER_WRITE_KEY
   ```

4. Set up the database:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [NextAuth.js](https://next-auth.js.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [AI SDK](https://sdk.vercel.ai/docs)
- [Jitsu](https://jitsu.com/)
