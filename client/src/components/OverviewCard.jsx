export default function OverviewCard({ icon: Icon, number, label, accent = "indigo", helper }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{number}</p>
          {helper && <p className="mt-2 text-xs font-medium text-slate-500">{helper}</p>}
        </div>
        {Icon && (
          <div className={`rounded-lg p-3 ${colors[accent] || colors.indigo}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
