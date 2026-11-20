"use client";

import React from "react";
import { useParams } from "next/navigation";
import { BookingFunnel } from "@/components/booking/BookingFunnel";

export default function BookInstructorPage() {
  const params = useParams();
  const rawId = (params?.id as string) || "1";
  const instructorId = parseInt(rawId, 10) || 1;

  return <BookingFunnel initialInstructorId={instructorId} />;
}
