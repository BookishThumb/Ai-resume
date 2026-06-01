import CandidateLayout from "@/components/CandidateLayout";
import { Calendar } from "lucide-react";

export default function CandidateInterviews() {
  return (
    <CandidateLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading">My Interviews</h1>
            <p className="text-muted-foreground mt-1">Manage your upcoming and past interviews</p>
          </div>
        </div>

        <div className="glass-panel p-16 rounded-xl text-center text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No upcoming interviews</p>
          <p className="text-sm">You have no interviews scheduled at the moment.</p>
        </div>
      </div>
    </CandidateLayout>
  );
}
