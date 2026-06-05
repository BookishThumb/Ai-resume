import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  LayoutDashboard,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Shield,
  Search,
  Calendar,
  Activity
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center bg-background/80 backdrop-blur-md">
        <div className="text-xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          Matchpoint
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hover:bg-white/5">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section (Split Screen) */}
      <main className="flex-1 mt-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Modern Recruiting Operations
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            Hire exceptional candidates before your competitors do.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
            Source, evaluate, engage, and track top talent from a unified recruiting workspace built for modern hiring teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 rounded-lg w-full sm:w-auto font-medium">
                Book Demo
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/10 hover:bg-white/5 rounded-lg w-full sm:w-auto">
                View Platform
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                </div>
              ))}
            </div>
            <p>Joined by 10,000+ modern recruiters</p>
          </div>
        </motion.div>

        {/* Right: Mockup Dashboard */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative w-full h-full min-h-[500px] flex items-center justify-center lg:justify-end"
        >
          {/* Abstract glow behind mockup - subtle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          
          {/* Main Mockup Card */}
          <div className="relative w-full max-w-[560px] bg-card border border-white/10 rounded-2xl p-6 shadow-2xl z-10 flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Active Pipeline</div>
                  <div className="text-xs text-muted-foreground">Engineering Team</div>
                </div>
              </div>
              <div className="text-xs bg-success/20 text-success px-2 py-1 rounded">On Track</div>
            </div>

            {/* Pipeline Stages */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Sourced", count: 124 },
                { label: "Screening", count: 38 },
                { label: "Interview", count: 12 }
              ].map((stage, i) => (
                <div key={i} className="bg-background rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-muted-foreground mb-1">{stage.label}</div>
                  <div className="text-xl font-bold">{stage.count}</div>
                </div>
              ))}
            </div>

            {/* Candidate List Mockup */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="text-sm font-medium mb-1">Recent Evaluations</div>
              {[
                { name: "Sarah Jenkins", role: "Senior Frontend Eng", match: "98%", status: "Offer" },
                { name: "David Chen", role: "Product Manager", match: "92%", status: "Interview" },
                { name: "Maya Patel", role: "Backend Eng", match: "89%", status: "Screening" },
              ].map((cand, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors cursor-pointer bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{cand.name}</div>
                      <div className="text-xs text-muted-foreground">{cand.role}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-xs font-mono text-primary bg-primary/10 px-1.5 rounded">{cand.match} Match</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{cand.status}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-2 w-full pt-4 border-t border-white/5">
              <Button className="w-full text-sm h-9 bg-white/5 hover:bg-white/10 text-foreground" variant="ghost">
                View All Candidates <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-white/5 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <p className="text-sm text-muted-foreground font-medium mb-8 tracking-wide uppercase">Trusted by hiring teams at modern companies</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Mock Logos */}
             <div className="flex items-center gap-2 font-bold text-xl tracking-tighter"><div className="w-6 h-6 bg-white rounded-sm" /> ACME Corp</div>
             <div className="flex items-center gap-2 font-bold text-xl tracking-tighter"><div className="w-6 h-6 rounded-full border-4 border-white" /> Globex</div>
             <div className="flex items-center gap-2 font-bold text-xl tracking-tighter"><div className="w-6 h-6 bg-white rotate-45" /> Initech</div>
             <div className="flex items-center gap-2 font-bold text-xl tracking-tighter"><div className="w-6 h-6 bg-white rounded-full" /> Soylent</div>
             <div className="flex items-center gap-2 font-bold text-xl tracking-tighter"><div className="w-6 h-6 border-2 border-white rounded-sm" /> Massive Dynamic</div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to hire at scale</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A complete toolkit designed to streamline your operations and give you a competitive edge in the talent market.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Clock className="w-6 h-6" />}
            title="Reduce Screening Time"
            description="Automatically rank and organize candidates based on your specific role requirements."
          />
          <FeatureCard 
            icon={<LayoutDashboard className="w-6 h-6" />}
            title="Centralized Recruiting"
            description="Manage all your hiring workflows, communications, and evaluations from one single workspace."
          />
          <FeatureCard 
            icon={<Users className="w-6 h-6" />}
            title="Faster Hiring Decisions"
            description="Collaborate seamlessly with hiring managers to evaluate profiles and extend offers quickly."
          />
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-24 bg-card/30 border-y border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">A workspace that works the way you do.</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Matchpoint replaces fragmented tools with a streamlined, intuitive platform. Get complete visibility into your pipeline without the spreadsheet chaos.
              </p>
              <ul className="space-y-4">
                {[
                  "Customizable hiring stages",
                  "Automated interview scheduling",
                  "Collaborative scorecard evaluations",
                  "Deep integration with your tech stack"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Minimal Dashboard Showcase */}
            <div className="bg-background rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[400px]">
              {/* Window Controls */}
              <div className="bg-card px-4 py-3 border-b border-white/5 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              {/* Body */}
              <div className="flex-1 p-6 flex gap-6">
                {/* Sidebar mock */}
                <div className="w-32 flex flex-col gap-4">
                  <div className="h-4 w-full bg-white/10 rounded" />
                  <div className="h-4 w-3/4 bg-white/5 rounded" />
                  <div className="h-4 w-5/6 bg-white/5 rounded" />
                  <div className="h-4 w-2/3 bg-white/5 rounded" />
                </div>
                {/* Main mock */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex justify-between items-center mb-2">
                     <div className="h-6 w-1/3 bg-white/10 rounded" />
                     <div className="h-8 w-24 bg-primary/20 rounded" />
                  </div>
                  {/* Table mock */}
                  <div className="flex-1 border border-white/5 rounded-lg flex flex-col">
                    <div className="h-10 border-b border-white/5 bg-white/5" />
                    <div className="flex-1 p-4 flex flex-col gap-3">
                      {[1,2,3,4].map(i => (
                         <div key={i} className="h-8 w-full bg-white/5 rounded flex items-center px-4 gap-4">
                           <div className="h-4 w-4 rounded-full bg-white/10" />
                           <div className="h-3 w-1/4 bg-white/10 rounded" />
                           <div className="h-3 w-1/3 bg-white/5 rounded" />
                         </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiting Workflow */}
      <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto text-center">
        <h2 className="text-3xl font-bold mb-16">The modern hiring workflow</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <WorkflowStep icon={<Search />} title="Source Candidates" />
          <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block rotate-90 md:rotate-0" />
          <WorkflowStep icon={<CheckCircle />} title="Evaluate Profiles" />
          <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block rotate-90 md:rotate-0" />
          <WorkflowStep icon={<Calendar />} title="Schedule Interviews" />
          <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block rotate-90 md:rotate-0" />
          <WorkflowStep icon={<TrendingUp />} title="Hire Faster" highlight />
        </div>
      </section>

      {/* Analytics Section */}
      <section className="py-24 border-t border-white/5 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Metrics that matter</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Gain actionable insights to optimize your hiring engine.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Time to Hire" value="18 Days" trend="-12%" isGood />
            <MetricCard title="Candidate Quality Score" value="8.9/10" trend="+4%" isGood />
            <MetricCard title="Pipeline Conversion" value="24%" trend="+2%" isGood />
            <MetricCard title="Team Performance" value="94%" trend="+1%" isGood />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-muted-foreground text-sm">
         <p>© {new Date().getFullYear()} Matchpoint Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card border border-white/5 hover:border-white/10 p-8 rounded-2xl transition-colors">
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function WorkflowStep({ icon, title, highlight = false }: { icon: React.ReactNode, title: string, highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-4 p-6 rounded-2xl border ${highlight ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-card border-white/5'}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${highlight ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
        {icon}
      </div>
      <div className="font-semibold">{title}</div>
    </div>
  );
}

function MetricCard({ title, value, trend, isGood }: { title: string, value: string, trend: string, isGood: boolean }) {
  return (
    <div className="bg-card border border-white/5 p-6 rounded-2xl">
      <div className="text-sm text-muted-foreground mb-4">{title}</div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className={`text-sm font-medium ${isGood ? 'text-success' : 'text-destructive'}`}>
        {trend} vs last month
      </div>
    </div>
  );
}
