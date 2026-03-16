export interface InvoiceItem {
id: string;
description: string;
quantity: number;
rate: number;
amount: number;
}

export interface Client {
id?: string;
name: string;
email: string;
address: string;
city: string;
state: string;
zip: string;
country: string;
}

export interface Invoice {
id?: string;
invoiceNumber: string;
date: string;
dueDate: string;
fromName: string;
fromEmail: string;
fromAddress: string;
fromCity: string;
fromState: string;
fromZip: string;
fromCountry: string;
client: Client;
items: InvoiceItem[];
notes: string;
subtotal: number;
taxRate: number;
taxAmount: number;
total: number;
status: "draft" | "sent" | "paid";
createdAt?: string;
userId?: string;
}
