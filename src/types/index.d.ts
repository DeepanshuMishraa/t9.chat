export type SiteConfig = {
  name: string;
  title: string;
  description: string;
  origin: string;
  og: string;
  keywords: string[];
  creator: {
    name: string;
    url: string;
  }
  socials: {
    github: string;
    x: string;
  }
}

enum Provider {
  OPENAI = "openai",
  GROQ = "groq",
  GOOGLE = "google",
}


interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
