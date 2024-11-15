"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code2Icon, LayersIcon, UsersIcon, ZapIcon } from "lucide-react";
import { useSession } from "next-auth/react";

// Import the Header component
import Header from "@/components/client/Header";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const features = [
    {
      icon: <Code2Icon className="h-6 w-6" />,
      title: "Live Coding",
      description: "Real-time collaborative code editing",
    },
    {
      icon: <UsersIcon className="h-6 w-6" />,
      title: "Peer Assistance",
      description: "Request and provide help in real-time",
    },
    {
      icon: <ZapIcon className="h-6 w-6" />,
      title: "Instant Compilation",
      description: "Compile and run code directly in the browser",
    },
    {
      icon: <LayersIcon className="h-6 w-6" />,
      title: "Multiple Languages",
      description: "Support for various programming languages",
    },
  ];

  const techStack = {
    Frontend: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "shadcn/ui",
      "Monaco Editor",
    ],
    Backend: ["Node.js", "Express", "Socket.IO", "MongoDB"],
    Authentication: ["NextAuth.js"],
    DevOps: ["TypeScript", "ESLint", "Concurrently", "Nodemon"],
    Libraries: ["Axios", "Lucide React", "React Select", "Sonner"],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-primary">
            Welcome to CodeNexus
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Collaborative Coding Platform for Seamless Development
          </p>
          {session ? (
            <Button
              onClick={() => router.push("/liveIDE")}
              variant="outline"
              className="mr-4"
            >
              Try CodeNexus Now!
            </Button>
          ) : (
            <Button onClick={() => router.push("/signup")} variant="default">
              Get Started
            </Button>
          )}
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {feature.icon}
                    <span className="ml-2">{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(techStack).map(([category, technologies]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside">
                    {technologies.map((tech, index) => (
                      <li key={index} className="text-muted-foreground">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-muted py-8 text-center">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">
            CodeNexus - where collaboration meets innovation. Crafted with
            WebSockets, real-time coding, and a passion for seamless teamwork.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            © 2024 CodeNexus. Built for exploration, shared for inspiration.
          </p>
        </div>
      </footer>
    </div>
  );
}
