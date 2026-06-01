import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          TalentAI
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hover:text-primary">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(124,58,237,0.3)] border border-primary-foreground/10">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 mt-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <section className="py-20 md:py-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight">
              AI-Powered <br />
              <span className="bg-gradient-to-r from-primary via-fuchsia-500 to-blue-400 bg-clip-text text-transparent">
                Recruitment Intelligence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Hire Faster. Hire Smarter. Hire with AI. Experience the enterprise-grade cockpit for modern recruitment teams.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(124,58,237,0.4)] border border-primary-foreground/10 rounded-xl">
                  Enter App
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Applications Processed" value="2.4M" delay={0.1} />
          <StatCard title="Candidates Screened" value="847K" delay={0.2} />
          <StatCard title="Interviews Conducted" value="312K" delay={0.3} />
          <StatCard title="Hiring Success Rate" value="94%" delay={0.4} />
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, delay }: { title: string, value: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center"
    >
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider">{title}</div>
    </motion.div>
  );
}
