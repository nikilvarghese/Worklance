import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import JobCard from "../components/JobCard";
import { useToast } from "../components/Toast";

export default function SavedJobs() {
  const { addToast } = useToast();
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    try {
      const [savedRes, appRes] = await Promise.all([axios.get("/saved"), axios.get("/applications")]);
      setSavedJobs(savedRes.data);
      setApplications(appRes.data);
    } catch (err) {
      addToast("Could not load saved jobs", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const appliedIds = new Set(applications.map((item) => item.jobId?._id || item.jobId));

  const applyJob = async (job) => {
    try {
      await axios.post("/applications", { jobId: job._id });
      addToast("Application submitted", "success");
      fetchSavedJobs();
    } catch (err) {
      addToast(err.response?.data?.message || "Could not apply", "error");
    }
  };

  const unsaveJob = async (savedItem) => {
    try {
      await axios.delete(`/saved/${savedItem._id}`);
      addToast("Removed from saved jobs", "success");
      fetchSavedJobs();
    } catch (err) {
      addToast("Could not remove job", "error");
    }
  };

  return (
    <div className="page-wrap space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Saved jobs</h2>
        <p className="muted mt-1">Keep high-intent roles close while you compare fit and compensation.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((item) => <JobCard key={item} loading />)}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="text-lg font-semibold text-slate-950">No saved jobs yet</p>
          <Link to="/browse" className="btn-primary mt-5">Browse jobs</Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {savedJobs.map((item) => (
            <JobCard
              key={item._id}
              job={item.jobId}
              applied={appliedIds.has(item.jobId?._id)}
              saved
              onApply={applyJob}
              onSave={() => unsaveJob(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
