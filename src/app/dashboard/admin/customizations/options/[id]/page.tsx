"use client";

import { useParams } from "next/navigation";
import OptionDetailPage from "../../option-details";

export default function OptionDetailPageWrapper() {
  const params = useParams();
  const optionId = params.optionId as string;

  return <OptionDetailPage optionId={optionId} />;
}
