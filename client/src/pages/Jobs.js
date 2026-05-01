import { useEffect, useState } from "react";
import axios from "../utils/axios";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("/jobs");
        setJobs(res.data);
      } catch (err) {
        console.error("Jobs fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const applyJob = async (jobId) => {
    try {
      await axios.post("/applications", { jobId });
      setAppliedJobs((prev) => [...prev, jobId]);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4 text-xl font-bold">Worklance</div>

      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Jobs for you</h2>

        {jobs.length === 0 ? (
          <div className="text-gray-500 text-center mt-6">
            No jobs available right now.
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-xl shadow-sm p-4 mb-4 border"
            >
              <h3 className="text-lg font-bold">{job.title}</h3>
              <p className="text-gray-500 text-sm mt-1">
                {job.company} • {job.location}
              </p>
              <p className="text-green-600 font-semibold mt-2">₹{job.salary}</p>
              <p className="text-gray-600 text-sm mt-2">{job.description}</p>

              {role !== "hr" && (
                <div className="mt-3">
                  {appliedJobs.includes(job._id) ? (
                    <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full w-full">
                      Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => applyJob(job._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full w-full"
                    >
                      Apply Job
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Jobs;
