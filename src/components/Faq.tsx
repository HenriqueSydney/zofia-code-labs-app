import { string } from "zod";

interface IFaq {
  faq: {
    question: string;
    answer: string;
  }[];
}

export function Faq({ faq }: IFaq) {
  return (
    <div className="mt-20 max-w-3xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">Dúvidas frequentes</h2>
      <div className="grid gap-6 text-left mt-8">
        {faq.map(({ question, answer }, index) => (
          <div
            key={index}
            className="p-6 rounded-lg bg-card border border-border"
          >
            <h3 className="font-semibold mb-2">{question}</h3>
            <p className="text-muted-foreground text-sm">{answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
