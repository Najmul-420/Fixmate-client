"use client";

import { useEffect, useState } from "react";

export default function CopyrightYear() {
  // Next.js Cache Components requires reading the current time after hydration.
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span>© {year ? `${year} ` : ""}FixMate. All rights reserved.</span>;
}


// Customer Bookings & Payment History