import HrSidebar from "../components/HrSidebar";

export default function HrLayout({ children }) {
  return (
    <div className="flex">
      <HrSidebar />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        {children}
      </div>
    </div>
  );
}
