import { Metadata } from "next";

import { getLegalAction } from "@/lib/legal/legal.actions";
import { LegalTypeEnum } from "@/lib/legal/types/legal.types";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default async function TermsOfService() {
  const legal = await getLegalAction(LegalTypeEnum.TERMS_OF_SERVICE);

  return (
    <div className="space-y-4">
      <div className="flex flex-1 rounded-lg border border-dashed p-2 shadow-sm md:p-8">
        <div className="w-full space-y-4">
          <h3 className="text-2xl font-bold tracking-tight text-black">
            Terms of Service
          </h3>

          <p className="text-base font-medium leading-6 text-gray-600 dark:text-gray-300">
            Last updated:{" "}
            {legal.data?.updatedAt ? formatDate(legal.data.updatedAt) : "N/A"}
          </p>

          {legal.success ? (
            <div className="space-y-8">
              {legal.data.content && (
                <div
                  dangerouslySetInnerHTML={{ __html: legal.data.content }}
                  className="text-gray-900 prose prose-slate dark:prose-invert"
                />
              )}
            </div>
          ) : (
            <div className="">
              <p className="text-base font-medium leading-6 text-gray-600 dark:text-gray-300">
                Terms of Service not found
              </p>
              <p className="text-sm text-red-600 mt-2">Error: {legal.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
