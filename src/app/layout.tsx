import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
title: "FastInvoice - Simple Invoice Generator",
description: "Create professional invoices in seconds. Free invoice generator for freelancers and small businesses.",
};

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode;
}>) {
return (
<html lang="en">
<body className="antialiased">
{children}
<Analytics />
</body>
</html>
);
}
