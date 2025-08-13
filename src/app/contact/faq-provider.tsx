import { getFaqsAction } from "@/lib/faqs/faqs.action";
import { Faq } from "@/lib/faqs/types/faq.types";

export async function FaqDataProvider() {
  const response = await getFaqsAction({ limit: 20 });

  let faqs: Faq[] = [];

  if (response.success && response.data && response.data.data) {
    faqs = response.data.data;
  } else {
  }

  return (
    <div
      data-faqs={JSON.stringify(faqs)}
      id="faq-data-container"
      className="hidden"
    />
  );
}
