"use client";

import { useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { gsap } from "gsap";
import { m } from "framer-motion";
import { Heart, Sparkles, Moon, Sun } from "lucide-react";
import { useAppStore } from "@/shared/stores/app-store";

export function HelloWorld() {
  const intl = useIntl();
  const { theme, user, toggleTheme } = useAppStore();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "back.out(1.7)",
          delay: 0.3,
        },
      );
    }

    if (sparklesRef.current) {
      const sparkles = sparklesRef.current.children;
      gsap.fromTo(
        sparkles,
        {
          opacity: 0,
          scale: 0,
          rotation: 0,
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 360,
          duration: 0.8,
          stagger: 0.1,
          ease: "elastic.out(1, 0.3)",
          delay: 1.5,
        },
      );

      gsap.to(sparkles, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        stagger: 0.2,
        delay: 2,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8"
      >
        <div ref={sparklesRef} className="flex justify-center space-x-4 mb-8">
          <Sparkles className="w-6 h-6 text-primary" />
          <Heart className="w-6 h-6 text-destructive" />
          <Sparkles className="w-6 h-6 text-accent" />
        </div>

        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
        >
          {intl.formatMessage({ id: "app.welcome" })}
        </h1>

        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
        >
          {intl.formatMessage({ id: "app.description" })}
        </m.p>

        {user.name && (
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.2, duration: 0.5 }}
            className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto"
          >
            <p className="text-lg text-foreground">
              Welcome back,{" "}
              <span className="font-semibold text-primary">{user.name}</span>!
              👋
            </p>
          </m.div>
        )}

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.6 }}
          className="flex justify-center"
        >
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors duration-200"
          >
            {theme === "light" ? (
              <>
                <Moon className="w-4 h-4" />
                Dark Mode
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                Light Mode
              </>
            )}
          </button>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.8 }}
          className="text-sm text-muted-foreground space-y-2"
        >
          <p>✨ React Query • React Hook Form • Zod • Framer Motion</p>
          <p>🎨 Tailwind CSS • Zustand • React Intl • GSAP • Lucide React</p>
        </m.div>
      </m.div>
    </div>
  );
}
