import { Users, Briefcase, Clock, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Active Researchers",
  },
  {
    icon: Briefcase,
    value: "2,000+",
    label: "Projects Completed",
  },
  {
    icon: Clock,
    value: "80%",
    label: "Time Saved",
  },
  {
    icon: TrendingUp,
    value: "4.9/5",
    label: "User Satisfaction",
  },
];

export function Stats() {
  return (
    <section className="py-16 bg-white border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl mb-3">
                <stat.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
