"use client";

import { AppProgressBar } from "next-nprogress-bar";

export function ProgressBar() {
  return (
    <AppProgressBar
      height="4px"
      color="#142d39"
      options={{ showSpinner: true }}
      shallowRouting
    />
  );
}
