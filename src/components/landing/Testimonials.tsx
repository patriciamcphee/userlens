import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior UX Researcher",
    company: "TechCorp",
    content: "UserLens Insights cut our synthesis time from 3 days to 6 hours. The affinity mapping feature is exactly what we needed for remote collaboration.",
    initials: "SC",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Product Manager",
    company: "StartupXYZ",
    content: "Finally, a tool that understands how researchers actually work. The participant tracking and session management features are game-changers.",
    initials: "MR",
    rating: 5,
  },
  {
    name: "Emily Watkins",
    role: "Research Lead",
    company: "Enterprise Inc",
    content: "We've tried every tool out there. UserLens Insights is the only one that our entire team actually uses. The real-time collaboration is seamless.",
    initials: "EW",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-indigo-600 mb-2">Testimonials</h2>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900">
            Loved by research teams
          </p>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            See what researchers are saying about UserLens Insights
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
