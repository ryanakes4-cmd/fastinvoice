import { InvoiceForm } from "@/components/InvoiceForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <InvoiceForm />
      </div>
    </main>
  );
}
