'use client';

import { useState } from 'react';
import { Invoice, InvoiceItem, Client } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Download, Eye, Save } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceFormProps {
initialInvoice?: Invoice;
onSave?: (invoice: Invoice) => void;
userId?: string;
}

const defaultClient: Client = {
name: '',
email: '',
address: '',
city: '',
state: '',
zip: '',
country: 'United States',
};

const defaultItem: InvoiceItem = {
id: uuidv4(),
description: '',
quantity: 1,
rate: 0,
amount: 0,
};

export function InvoiceForm({ initialInvoice, onSave, userId }: InvoiceFormProps) {
const [invoice, setInvoice] = useState<Invoice>(
initialInvoice || {
id: uuidv4(),
invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
date: format(new Date(), 'yyyy-MM-dd'),
dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
fromName: '',
fromEmail: '',
fromAddress: '',
fromCity: '',
fromState: '',
fromZip: '',
fromCountry: 'United States',
client: { ...defaultClient },
items: [{ ...defaultItem }],
notes: 'Payment is due within 30 days. Thank you for your business!',
subtotal: 0,
taxRate: 0,
taxAmount: 0,
total: 0,
status: 'draft',
userId,
}
);

const [showPreview, setShowPreview] = useState(false);

const calculateTotals = (items: InvoiceItem[], taxRate: number) => {
const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
const taxAmount = (subtotal * taxRate) / 100;
const total = subtotal + taxAmount;
return { subtotal, taxAmount, total };
};

const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
const newItems = [...invoice.items];
newItems[index] = { ...newItems[index], [field]: value };

if (field === 'quantity' || field === 'rate') {
newItems[index].amount = newItems[index].quantity * newItems[index].rate;
}

const { subtotal, taxAmount, total } = calculateTotals(newItems, invoice.taxRate);
setInvoice({ ...invoice, items: newItems, subtotal, taxAmount, total });
};

const addItem = () => {
setInvoice({
...invoice,
items: [...invoice.items, { ...defaultItem, id: uuidv4() }],
});
};

const removeItem = (index: number) => {
if (invoice.items.length <= 1) return;
const newItems = invoice.items.filter((_, i) => i !== index);
const { subtotal, taxAmount, total } = calculateTotals(newItems, invoice.taxRate);
setInvoice({ ...invoice, items: newItems, subtotal, taxAmount, total });
};

const updateTaxRate = (rate: number) => {
const { subtotal, taxAmount, total } = calculateTotals(invoice.items, rate);
setInvoice({ ...invoice, taxRate: rate, subtotal, taxAmount, total });
};

const handleSave = () => {
if (onSave) {
onSave(invoice);
}
};

const generatePDF = () => {
window.print();
};

const formatCurrency = (amount: number) => {
return new Intl.NumberFormat('en-US', {
style: 'currency',
currency: 'USD',
}).format(amount);
};

return (
<div className="space-y-8">
<div className="flex justify-between items-center print:hidden">
<div>
<h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
<p className="text-gray-500 mt-1">Fill in the details below to generate your invoice</p>
</div>
<div className="flex gap-3">
<button
onClick={() => setShowPreview(!showPreview)}
className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
>
<Eye size={18} />
{showPreview ? 'Edit' : 'Preview'}
</button>
<button
onClick={generatePDF}
className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
>
<Download size={18} />
Print / Save PDF
</button>
{onSave && (
<button
onClick={handleSave}
className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
>
<Save size={18} />
Save
</button>
)}
</div>
</div>

{showPreview ? (
<div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0">
<div className="border rounded-lg overflow-hidden print:border-none">
<div className="p-8 print:p-0">
<div className="flex justify-between mb-8">
<div>
<h2 className="text-3xl font-bold">INVOICE</h2>
</div>
<div className="text-right">
<p className="text-gray-500 text-sm">Invoice Number</p>
<p className="font-bold">{invoice.invoiceNumber}</p>
<p className="text-gray-500 text-sm mt-2">Date</p>
<p className="font-bold">{invoice.date}</p>
<p className="text-gray-500 text-sm mt-2">Due Date</p>
<p className="font-bold">{invoice.dueDate}</p>
</div>
</div>
<div className="grid grid-cols-2 gap-8 mb-8">
<div>
<p className="text-gray-500 text-sm uppercase tracking-wide mb-2">From</p>
<p className="font-bold">{invoice.fromName || 'Your Name'}</p>
<p>{invoice.fromEmail}</p>
</div>
<div>
<p className="text-gray-500 text-sm uppercase tracking-wide mb-2">Bill To</p>
<p className="font-bold">{invoice.client.name || 'Client Name'}</p>
<p>{invoice.client.email}</p>
</div>
</div>
<table className="w-full mb-8">
<thead className="bg-gray-100">
<tr>
<th className="text-left p-3 text-sm text-gray-600 uppercase">Description</th>
<th className="text-center p-3 text-sm text-gray-600 uppercase">Qty</th>
<th className="text-right p-3 text-sm text-gray-600 uppercase">Rate</th>
<th className="text-right p-3 text-sm text-gray-600 uppercase">Amount</th>
</tr>
</thead>
<tbody>
{invoice.items.map((item) => (
<tr key={item.id} className="border-b">
<td className="p-3">{item.description || 'Item description'}</td>
<td className="p-3 text-center">{item.quantity}</td>
<td className="p-3 text-right">{formatCurrency(item.rate)}</td>
<td className="p-3 text-right">{formatCurrency(item.amount)}</td>
</tr>
))}
</tbody>
</table>
<div className="flex justify-end">
<div className="w-64">
<div className="flex justify-between mb-2">
<span className="text-gray-600">Subtotal</span>
<span className="font-bold">{formatCurrency(invoice.subtotal)}</span>
</div>
<div className="flex justify-between mb-2">
<span className="text-gray-600">Tax ({invoice.taxRate}%)</span>
<span className="font-bold">{formatCurrency(invoice.taxAmount)}</span>
</div>
<div className="flex justify-between pt-2 border-t-2 border-gray-900">
<span className="font-bold">Total</span>
<span className="font-bold text-lg">{formatCurrency(invoice.total)}</span>
</div>
</div>
</div>
{invoice.notes && (
<div className="mt-8 p-4 bg-gray-50 rounded">
<p className="font-bold text-sm uppercase text-gray-600 mb-2">Notes</p>
<p>{invoice.notes}</p>
</div>
)}
</div>
</div>
</div>
) : (
<>
<div className="bg-white rounded-lg shadow p-6">
<h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
<input
type="text"
value={invoice.invoiceNumber}
onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
<input
type="date"
value={invoice.date}
onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
<input
type="date"
value={invoice.dueDate}
onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
/>
</div>
</div>
</div>

<div className="bg-white rounded-lg shadow p-6">
<h2 className="text-lg font-semibold mb-4">From</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Your Name / Business</label>
<input
type="text"
value={invoice.fromName}
onChange={(e) => setInvoice({ ...invoice, fromName: e.target.value })}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
placeholder="e.g., Acme Design Co."
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
<input
type="email"
value={invoice.fromEmail}
onChange={(e) => setInvoice({ ...invoice, fromEmail: e.target.value })}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
placeholder="you@example.com"
/>
</div>
</div>
</div>

<div className="bg-white rounded-lg shadow p-6">
<h2 className="text-lg font-semibold mb-4">Bill To</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
<input
type="text"
value={invoice.client.name}
onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, name: e.target.value } })}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
placeholder="e.g., Jane Smith"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
<input
type="email"
value={invoice.client.email}
onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, email: e.target.value } })}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
placeholder="client@example.com"
/>
</div>
</div>
</div>

<div className="bg-white rounded-lg shadow p-6">
<h2 className="text-lg font-semibold mb-4">Items</h2>
<div className="space-y-3">
{invoice.items.map((item, index) => (
<div key={item.id} className="grid grid-cols-12 gap-3 items-start">
<div className="col-span-5">
<input
type="text"
value={item.description}
onChange={(e) => updateItem(index, 'description', e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
placeholder="Item description"
/>
</div>
<div className="col-span-2">
<input
type="number"
min="1"
value={item.quantity}
onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
/>
</div>
<div className="col-span-2">
<input
type="number"
min="0"
step="0.01"
value={item.rate}
onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
placeholder="0.00"
/>
</div>
<div className="col-span-2">
<div className="px-3 py-2 bg-gray-100 rounded-lg text-right font-medium">
{formatCurrency(item.amount)}
</div>
</div>
<div className="col-span-1">
<button
onClick={() => removeItem(index)}
disabled={invoice.items.length <= 1}
className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
>
<Trash2 size={18} />
</button>
</div>
</div>
))}
</div>
<button
onClick={addItem}
className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
>
<Plus size={18} />
Add Item
</button>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="bg-white rounded-lg shadow p-6">
<h2 className="text-lg font-semibold mb-4">Notes</h2>
<textarea
value={invoice.notes}
onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
rows={4}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
placeholder="Payment terms, thank you message, etc."
/>
</div>
<div className="bg-white rounded-lg shadow p-6">
<h2 className="text-lg font-semibold mb-4">Summary</h2>
<div className="space-y-3">
<div className="flex items-center justify-between">
<label className="text-sm font-medium text-gray-700">Tax Rate (%)</label>
<input
type="number"
min="0"
max="100"
step="0.01"
value={invoice.taxRate}
onChange={(e) => updateTaxRate(parseFloat(e.target.value) || 0)}
className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
/>
</div>
<div className="flex justify-between pt-3 border-t">
<span className="text-gray-600">Subtotal</span>
<span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
</div>
<div className="flex justify-between">
<span className="text-gray-600">Tax</span>
<span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
</div>
<div className="flex justify-between pt-3 border-t-2 border-gray-900">
<span className="font-bold text-lg">Total</span>
<span className="font-bold text-lg">{formatCurrency(invoice.total)}</span>
</div>
</div>
</div>
</div>
</>
)}
</div>
);
}
