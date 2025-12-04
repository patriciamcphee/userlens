import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const faqs = [
  {
    question: "How does the free trial work?",
    answer: "You get full access to all Professional features for 14 days, no credit card required. After the trial, you can choose to upgrade or continue with the free Starter plan.",
  },
  {
    question: "Can I import data from other tools?",
    answer: "Yes! We support CSV imports for participant data and sticky notes. Our team can also help with custom migrations from tools like Dovetail, Miro, or Airtable.",
  },
  {
    question: "Is my research data secure?",
    answer: "Absolutely. We use enterprise-grade encryption (AES-256), Azure AD authentication, and are GDPR & SOC 2 compliant. Your data is encrypted at rest and in transit.",
  },
  {
    question: "How many team members can I have?",
    answer: "The Starter plan is for individual use. Professional includes up to 10 team members. Enterprise plans support unlimited team members with advanced permissions.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period, and you can export all your data before canceling.",
  },
  {
    question: "Do you offer academic or non-profit discounts?",
    answer: "Yes! We offer 50% off Professional plans for students, educators, and registered non-profits. Contact our team for verification and discount codes.",
  },
  {
    question: "What happens to my data if I downgrade?",
    answer: "Your data is never deleted. If you downgrade, you'll retain read-only access to projects beyond your plan limits. You can also export everything as CSV or PDF.",
  },
  {
    question: "Can I use UserLens Insights for HIPAA-compliant research?",
    answer: "Yes, our Enterprise plan includes HIPAA compliance features. We can sign a Business Associate Agreement (BAA) and provide dedicated infrastructure for healthcare research.",
  },
];

export function FAQ() {
  return (
    <section className="py-20 sm:py-32 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-indigo-600 mb-2">FAQ</h2>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900">
            Frequently asked questions
          </p>
          <p className="mt-4 text-lg text-slate-600">
            Can't find what you're looking for? <a href="#footer" className="text-indigo-600 hover:underline">Contact our team</a>
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white border border-slate-200 rounded-lg px-6 data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-slate-900">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
