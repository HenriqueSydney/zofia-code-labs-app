import { PricingHeader } from "@/components/pricing/PricingHeader";
import { getParams } from "@/utils/getParams";
import { PrincingCard } from "@/components/pricing/PricingCard";

import { AI_REPORTS_PLANS, FAQ } from "@/data/products/aiReportsPlans";
import { Faq } from "@/components/Faq";

interface IPricing {
  searchParams: Promise<{ planType?: string }>;
}

const Pricing = async ({ searchParams }: IPricing) => {
  const { planType } = await getParams<{ planType?: "monthly" | "yearly" }>(
    searchParams,
    ["planType"]
  );

  const isYearly = planType === "yearly";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pt-18 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <PricingHeader
            badge="ZofIA Reports"
            title="A consultora virtual da sua Software House"
            description="Pare de perder horas criando relatórios manuais. Nossa IA cruza dados de tráfego, qualidade e segurança para gerar insights que provam o valor do seu trabalho para o cliente final."
            discountText="2 meses grátis"
          />

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {AI_REPORTS_PLANS.map((plan) => {
              return (
                <PrincingCard key={plan.id} plan={plan} isYearly={isYearly} />
              );
            })}
          </div>

          {/* FAQ Section */}
          <Faq faq={FAQ} />

          {/* CTA Section */}
          {/* <div className="mt-20 text-center p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
            <h2 className="text-2xl font-bold mb-4">Ainda tem dúvidas?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Nossa equipe está pronta para ajudar você a escolher o melhor
              plano e responder todas as suas perguntas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">Ver Demonstração</Button>
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                Falar com Especialista
              </Button>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default Pricing;
