import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import CandidateDashboard from "@/pages/CandidateDashboard";
import CandidateJobs from "@/pages/CandidateJobs";
import CandidateJobDetail from "@/pages/CandidateJobDetail";
import CandidateApplications from "@/pages/CandidateApplications";
import CandidateInterviews from "@/pages/CandidateInterviews";
import CandidateOnboarding from "@/pages/CandidateOnboarding";
import Jobs from "@/pages/Jobs";
import JobNew from "@/pages/JobNew";
import JobDetail from "@/pages/JobDetail";
import Candidates from "@/pages/Candidates";
import CandidateDetail from "@/pages/CandidateDetail";
import Applications from "@/pages/Applications";
import Interviews from "@/pages/Interviews";
import InterviewDetail from "@/pages/InterviewDetail";
import Analytics from "@/pages/Analytics";
import Copilot from "@/pages/Copilot";
import Onboarding from "@/pages/Onboarding";
import OnboardingDetail from "@/pages/OnboardingDetail";
import BulkUpload from "@/pages/BulkUpload";
import VideoInterview from "@/pages/VideoInterview";
import InterviewReview from "@/pages/InterviewReview";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/candidate-dashboard" component={CandidateDashboard} />
      <Route path="/jobs/new" component={JobNew} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/find-jobs/:id" component={CandidateJobDetail} />
      <Route path="/find-jobs" component={CandidateJobs} />
      <Route path="/candidates/:id" component={CandidateDetail} />
      <Route path="/candidates" component={Candidates} />
      <Route path="/applications" component={Applications} />
      <Route path="/my-applications" component={CandidateApplications} />
      <Route path="/interviews/:id" component={InterviewDetail} />
      <Route path="/interviews" component={Interviews} />
      <Route path="/my-interviews" component={CandidateInterviews} />
      <Route path="/my-onboarding" component={CandidateOnboarding} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/copilot" component={Copilot} />
      <Route path="/onboarding/:id" component={OnboardingDetail} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/bulk-upload" component={BulkUpload} />
      <Route path="/video-interview/:id" component={VideoInterview} />
      <Route path="/interviews/:id/review" component={InterviewReview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
