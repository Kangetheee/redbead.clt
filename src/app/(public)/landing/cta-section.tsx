import { ActionButtons } from "./action-buttons";
import { SessionProps } from "@/lib/session/session.types";

export function CTASection({ session }: SessionProps) {
  const isLoggedIn = !!session?.user;

  return (
    <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          {isLoggedIn
            ? "Ready for Your Next Order?"
            : "Ready to Create Something Amazing?"}
        </h2>
        <p className="text-xl text-green-100 dark:text-green-200 mb-8 max-w-2xl mx-auto">
          {isLoggedIn
            ? "Browse our latest products or reorder your favorites. We're here to help bring your next project to life!"
            : "Join hundreds of businesses that trust Red Bead for their custom printing needs. Let's bring your brand to life!"}
        </p>

        <ActionButtons
          primaryHref={isLoggedIn ? "/orders/new" : "/products"}
          primaryText={isLoggedIn ? "Place New Order" : "Browse Products"}
          secondaryHref={isLoggedIn ? "/orders" : "/contact"}
          secondaryText={isLoggedIn ? "View Orders" : "Contact Us Today"}
          variant="cta"
        />
      </div>
    </section>
  );
}
