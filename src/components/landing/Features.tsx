import { Users, Layers, BarChart3, Zap, Lock, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const features = [
  {
    icon: Users,
    title: "Participant Management",
    description: "Track interviews across user segments with automatic participant numbering and session management.",
  },
  {
    icon: Layers,
    title: "Affinity Mapping",
    description: "Drag-and-drop sticky notes into clusters. Organize insights visually with collaborative boards.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Visualize SUS scores, NPS metrics, and completion rates with interactive charts and filters.",
  },
  {
    icon: Zap,
    title: "Real-Time Synthesis",
    description: "Collaborate with your team in real-time. See updates instantly as your team adds insights.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Enterprise-grade security with Azure AD. Your research data is encrypted and compliant.",
  },
  {
    icon: RefreshCw,
    title: "Project Templates",
    description: "Duplicate projects for recurring studies. Set up quarterly research in seconds, not hours.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-indigo-600 mb-2">Everything you need</h2>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900">
            Research tools that actually help
          </p>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Built by researchers, for researchers. Every feature designed to make 
            your workflow faster and insights clearer.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
