import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10">
        <h2 className="text-3xl font-heading font-bold text-center mb-6">Welcome Back</h2>
        <div className="flex flex-col gap-4">
          <Link href="/dashboard">
            <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-lg">
              Login as HR Recruiter
            </Button>
          </Link>
          <Link href="/candidate-dashboard">
            <Button variant="outline" className="w-full h-12 text-lg">
              Login as Candidate
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full h-12 text-lg">
              Login as Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
