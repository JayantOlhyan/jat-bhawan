import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { BookingsAdmin } from "@/components/admin/BookingsAdmin";
import en from "../../../../../messages/en.json";

export const metadata: Metadata = { title: "Bookings" };

/** Reuses the public calendar component, so it gets the English calendar messages. */
export default function Page() {
  return (
    <NextIntlClientProvider locale="en" messages={{ Calendar: en.Calendar }} timeZone="Asia/Kolkata">
      <BookingsAdmin />
    </NextIntlClientProvider>
  );
}
