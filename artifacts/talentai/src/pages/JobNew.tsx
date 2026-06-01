import { useState } from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useCreateJob, getListJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Link } from "wouter";

export default function JobNew() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createJob = useCreateJob();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    employmentType: "full-time",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    status: "open",
  });
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills(prev => [...prev, s]);
      setSkillInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    createJob.mutate({
      data: {
        title: form.title,
        description: form.description,
        location: form.location || undefined,
        employmentType: form.employmentType,
        experience: form.experience || undefined,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
        requiredSkills: skills,
        status: form.status,
      }
    }, {
      onSuccess: (job) => {
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        toast({ title: "Job created successfully" });
        setLocation(`/jobs/${job.id}`);
      },
      onError: () => toast({ title: "Failed to create job", variant: "destructive" }),
    });
  };

  return (
    <Layout>
      <div className="p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/jobs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-heading">Create Job Opening</h1>
          </div>
        </div>

        <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} className="space-y-6">

          <div className="glass-panel p-6 rounded-xl space-y-5">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Basic Information</h2>

            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input id="title" placeholder="e.g. Senior React Engineer" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                data-testid="input-job-title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea id="description" placeholder="Describe the role, responsibilities, and requirements..." rows={5}
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                data-testid="input-job-description" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g. San Francisco, CA" value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  data-testid="input-job-location" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Employment Type</Label>
                <select id="type" className="w-full bg-card border border-white/10 rounded-lg px-3 py-2 text-sm"
                  value={form.employmentType} onChange={e => setForm(p => ({ ...p, employmentType: e.target.value }))}
                  data-testid="select-employment-type">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Required</Label>
                <Input id="experience" placeholder="e.g. 3+ years" value={form.experience}
                  onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} data-testid="input-experience" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Min Salary ($)</Label>
                <Input id="salaryMin" type="number" placeholder="80000" value={form.salaryMin}
                  onChange={e => setForm(p => ({ ...p, salaryMin: e.target.value }))} data-testid="input-salary-min" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Max Salary ($)</Label>
                <Input id="salaryMax" type="number" placeholder="120000" value={form.salaryMax}
                  onChange={e => setForm(p => ({ ...p, salaryMax: e.target.value }))} data-testid="input-salary-max" />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Required Skills</h2>
            <div className="flex gap-2">
              <Input placeholder="Add skill (e.g. React)" value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                data-testid="input-skill" />
              <Button type="button" variant="outline" onClick={addSkill} data-testid="button-add-skill">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {s}
                  <button type="button" onClick={() => setSkills(p => p.filter(x => x !== s))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={createJob.isPending} className="gap-2" data-testid="button-submit-job">
              {createJob.isPending ? "Creating..." : "Create Job"}
            </Button>
            <Link href="/jobs">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </motion.form>
      </div>
    </Layout>
  );
}
