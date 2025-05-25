"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { m } from "framer-motion";
import { Send, User, Mail, MessageSquare } from "lucide-react";
import {
  helloFormSchema,
  type HelloFormData,
} from "@/shared/schemas/hello-form";
import { useAppStore } from "@/shared/stores/app-store";

export function HelloForm() {
  const { setUser } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<HelloFormData>({
    resolver: zodResolver(helloFormSchema),
  });

  const onSubmit = async (data: HelloFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUser({ id: "1", name: data.name });
    console.log("Form submitted:", data);
    reset();
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-border"
    >
      <m.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-center mb-6 text-foreground"
      >
        Hello World Form
      </m.h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-foreground mb-1">
            <User className="inline w-4 h-4 mr-1" />
            Name
          </label>
          <input
            {...register("name")}
            type="text"
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="text-destructive text-sm mt-1">
              {errors.name.message}
            </p>
          )}
        </m.div>

        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-foreground mb-1">
            <Mail className="inline w-4 h-4 mr-1" />
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-destructive text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </m.div>

        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-sm font-medium text-foreground mb-1">
            <MessageSquare className="inline w-4 h-4 mr-1" />
            Message
          </label>
          <textarea
            {...register("message")}
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground resize-none"
            placeholder="Enter your message"
          />
          {errors.message && (
            <p className="text-destructive text-sm mt-1">
              {errors.message.message}
            </p>
          )}
        </m.div>

        <m.button
          type="submit"
          disabled={isSubmitting}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <m.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit
            </>
          )}
        </m.button>
      </form>
    </m.div>
  );
}
