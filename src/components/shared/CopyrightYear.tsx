"use client";

import { useEffect, useState } from "react";

export default function CopyrightYear() {
  // Cache Components forbids reading the current time during prerender, and
  // the hooks lint rule forbids synchronous setState in an effect — defer
  // the read to a microtask, which runs right after hydration.
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    queueMicrotask(() => setYear(new Date().getFullYear()));
  }, []);

  return (
    <span suppressHydrationWarning>
      © {year ? `${year} ` : ""}FixMate. All rights reserved.
    </span>
  );
}
