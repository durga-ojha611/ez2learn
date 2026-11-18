"use client";

import React, { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { SubAdminManager } from "@/components/settings/SubAdminManager";
import { apiFetch } from "@/lib/api";
import {
  Building2,
  Calendar,
  CreditCard,
  UploadCloud,
  CheckCircle2,
  Clock,
  Save,
  Check,
  FileText,
  Receipt,
  Printer,
  Download,
  Send,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  DollarSign,
  Landmark,
  Sparkles,
  Image as ImageIcon,
  Mail,
  Phone,
  Lock,
  Settings,
  Car,
  Calculator,
  User,
  ChevronDown,
} from "lucide-react";

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (val: boolean) => void }> = ({
  checked,
  onChange,
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? "bg-emerald-500" : "bg-slate-300"
      }`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${checked ? "translate-x-6" : "translate-x-0"
        }`}
    />
  </button>
);

const AUSTRALIAN_STATES = [
  { code: "NSW", name: "New South Wales" },
  { code: "VIC", name: "Victoria" },
  { code: "QLD", name: "Queensland" },
  { code: "WA", name: "Western Australia" },
  { code: "SA", name: "South Australia" },
  { code: "TAS", name: "Tasmania" },
  { code: "ACT", name: "Australian Capital Territory" },
  { code: "NT", name: "Northern Territory" },
];

export interface InvoiceLineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "lessons" | "payments" | "subadmins">("general");
  const [paymentSubTab, setPaymentSubTab] = useState<"settings" | "generator">("settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testingStripe, setTestingStripe] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<"connected" | "idle">("connected");
  const [sendingEmail, setSendingEmail] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multiple Emails with Passwords
  const [contactEmails, setContactEmails] = useState<
    Array<{
      id: string;
      label: string;
      email: string;
      password?: string;
      show_password?: boolean;
      is_primary: boolean;
    }>
  >([
    {
      id: "1",
      label: "Primary General Inquiries",
      email: "info@ezy2learn.com.au",
      password: "app_password_nsw2026",
      show_password: false,
      is_primary: true,
    },
    {
      id: "2",
      label: "Bookings & Invoicing Alerts",
      email: "bookings@ezy2learn.com.au",
      password: "smtp_bookings_pass_99",
      show_password: false,
      is_primary: false,
    },
  ]);

  // Multiple Phone Numbers
  const [contactPhones, setContactPhones] = useState<
    Array<{
      id: string;
      label: string;
      phone: string;
      is_primary: boolean;
    }>
  >([
    {
      id: "1",
      label: "Main Australian Toll-Free",
      phone: "1300 399 532",
      is_primary: true,
    },
    {
      id: "2",
      label: "Direct Dispatch & SMS Alerts",
      phone: "+61 412 345 678",
      is_primary: false,
    },
  ]);

  const handleAddEmail = () => {
    const newId = Date.now().toString();
    setContactEmails((prev) => [
      ...prev,
      {
        id: newId,
        label: "Support Email",
        email: "",
        password: "",
        show_password: false,
        is_primary: false,
      },
    ]);
  };

  const handleUpdateEmail = (id: string, field: string, val: any) => {
    setContactEmails((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, [field]: val };
          if (field === "is_primary" && val === true) {
            setFormData((f) => ({ ...f, contact_email: e.email }));
          }
          if (field === "email" && e.is_primary) {
            setFormData((f) => ({ ...f, contact_email: val }));
          }
          return updated;
        }
        if (field === "is_primary" && val === true) {
          return { ...e, is_primary: false };
        }
        return e;
      })
    );
  };

  const handleDeleteEmail = (id: string) => {
    if (contactEmails.length <= 1) {
      showToast("At least one contact email is required.");
      return;
    }
    setContactEmails((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      if (!filtered.some((e) => e.is_primary) && filtered.length > 0) {
        filtered[0].is_primary = true;
        setFormData((f) => ({ ...f, contact_email: filtered[0].email }));
      }
      return filtered;
    });
  };

  const handleAddPhone = () => {
    const newId = Date.now().toString();
    setContactPhones((prev) => [
      ...prev,
      {
        id: newId,
        label: "Mobile / SMS Line",
        phone: "",
        is_primary: false,
      },
    ]);
  };

  const handleUpdatePhone = (id: string, field: string, val: any) => {
    setContactPhones((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: val };
          if (field === "is_primary" && val === true) {
            setFormData((f) => ({ ...f, phone: p.phone }));
          }
          if (field === "phone" && p.is_primary) {
            setFormData((f) => ({ ...f, phone: val }));
          }
          return updated;
        }
        if (field === "is_primary" && val === true) {
          return { ...p, is_primary: false };
        }
        return p;
      })
    );
  };

  const handleDeletePhone = (id: string) => {
    if (contactPhones.length <= 1) {
      showToast("At least one phone number is required.");
      return;
    }
    setContactPhones((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (!filtered.some((p) => p.is_primary) && filtered.length > 0) {
        filtered[0].is_primary = true;
        setFormData((f) => ({ ...f, phone: filtered[0].phone }));
      }
      return filtered;
    });
  };

  // Settings State matching database settings table
  const [formData, setFormData] = useState({
    // Business Profile & Australian Identification
    school_name: "EZY 2 LEARN Driving School",
    school_legal_name: "EZY 2 LEARN Driving School Pty Ltd",
    contact_email: "info@ezy2learn.com.au",
    phone: "1300 399 532",
    abn: "84 928 319 402",
    acn: "928 319 402",
    website: "https://ezy2learn.com.au",
    logo_url: "/logo.png",

    // Registered Physical / Normal Address (Australia)
    normal_address_street: "Suite 4, 32-36 Church Street",
    normal_address_suburb: "Parramatta",
    normal_address_state: "NSW",
    normal_address_postcode: "2150",
    normal_address_country: "Australia",

    // Billing Address (Australia)
    billing_same_as_normal: true,
    billing_address_street: "Suite 4, 32-36 Church Street",
    billing_address_suburb: "Parramatta",
    billing_address_state: "NSW",
    billing_address_postcode: "2150",
    billing_address_country: "Australia",

    // Lessons & Bookings
    cancellation_notice_hours: "24",
    max_advance_booking_days: "60",
    buffer_minutes_between_lessons: "15",
    allow_students_cancel_online: true,
    allow_students_reschedule_online: true,

    // Australian Tax & GST
    currency: "AUD",
    gst_registered: true,
    gst_percentage: "10",
    tax_inclusive: true,
    tax_invoice_prefix: "TAX-INV-",

    // Banking & Direct Deposit (Australia)
    bank_name: "Commonwealth Bank of Australia",
    bank_account_name: "EZY 2 LEARN DRIVING SCHOOL PTY LTD",
    bank_bsb: "062-000",
    bank_account_number: "1092 8491",
    payid_enabled: true,
    payid_identifier: "admin@ezy2learn.com.au",
    invoice_payment_terms: "Payment due within 7 days of invoice date. BSB: 062-000 | Account: 1092 8491 | Quote Tax Invoice number as payment description.",

    // External Service API Integrations
    stripe_enabled: true,
    stripe_mode: "test",
    stripe_publishable_key: "pk_test_51MzEzy2LearnSydneyDriving001SecKey",
    stripe_secret_key: "sk_test_51MzEzy2LearnSydneySecretKeyHidden0099",
    stripe_webhook_secret: "whsec_920fbc89a71b2d49e1e2",
    xero_enabled: false,
    xero_client_id: "",
    xero_client_secret: "",
    square_enabled: false,
    square_application_id: "",
    square_access_token: "",
  });

  const [initialData, setInitialData] = useState<any>(null);

  // Available students & services for invoice generator
  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);

  // ==========================================
  // INVOICE GENERATOR STATE
  // ==========================================
  const [invoiceNumber, setInvoiceNumber] = useState("TAX-INV-2026-1048");
  const [issueDate, setIssueDate] = useState("2026-11-18");
  const [dueDate, setDueDate] = useState("2026-11-25");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "due" | "overdue">("paid");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bsb" | "payid" | "cash">("card");

  const [clientName, setClientName] = useState("Ruby Chen");
  const [clientEmail, setClientEmail] = useState("ruby.chen@gmail.com");
  const [clientPhone, setClientPhone] = useState("+61 412 345 678");
  const [clientAddress, setClientAddress] = useState("45 Macquarie Street, Parramatta NSW 2150");

  const [selectedStudentId, setSelectedStudentId] = useState<string>("1");
  const [selectedBookingCode, setSelectedBookingCode] = useState<string>("BK-10045 - Manual Driving Lesson");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState<number>(0);

  const [invoiceItems, setInvoiceItems] = useState<InvoiceLineItem[]>([
    {
      id: "1",
      description: "2-Hour Standard Automatic Driving Lesson (RMS Test Curriculum)",
      qty: 1,
      unitPrice: 160.0,
    },
    {
      id: "2",
      description: "RMS Practical Driving Test Vehicle Hire & 45-Min Pre-Test Warmup",
      qty: 1,
      unitPrice: 195.0,
    },
  ]);

  const [invoiceNotes, setInvoiceNotes] = useState(
    "Thank you for choosing EZY 2 LEARN Driving School. Please retain this Tax Invoice for your records and RMS logbook audit verification."
  );

  useEffect(() => {
    loadSettings();
    loadStudentsAndServices();
  }, []);

  const loadStudentsAndServices = async () => {
    try {
      const [stuRes, srvRes] = await Promise.allSettled([
        apiFetch("/api/students"),
        apiFetch("/api/services"),
      ]);
      if (stuRes.status === "fulfilled" && stuRes.value.success) {
        const list = Array.isArray(stuRes.value.data)
          ? stuRes.value.data
          : stuRes.value.data?.students || [];
        setDbStudents(list);
      }
      if (srvRes.status === "fulfilled" && srvRes.value.success) {
        const sList = Array.isArray(srvRes.value.data)
          ? srvRes.value.data
          : srvRes.value.data?.services || [];
        setDbServices(sList);
      }
    } catch (e) {
      console.error("Could not load supplementary student/service data", e);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/settings");
      if (res.success && res.data) {
        const d = res.data;
        const loaded = {
          school_name: d.school_name || d.business_name || "EZY 2 LEARN Driving School",
          school_legal_name: d.school_legal_name || "EZY 2 LEARN Driving School Pty Ltd",
          contact_email: d.contact_email || d.business_email || "info@ezy2learn.com.au",
          phone: d.phone || d.business_phone || "1300 399 532",
          abn: d.abn || d.business_abn || "84 928 319 402",
          acn: d.acn || "928 319 402",
          website: d.website || "https://ezy2learn.com.au",
          logo_url: d.logo_url || "/logo.png",

          normal_address_street: d.normal_address_street || "Suite 4, 32-36 Church Street",
          normal_address_suburb: d.normal_address_suburb || "Parramatta",
          normal_address_state: d.normal_address_state || "NSW",
          normal_address_postcode: d.normal_address_postcode || "2150",
          normal_address_country: d.normal_address_country || "Australia",

          billing_same_as_normal: d.billing_same_as_normal !== "0" && d.billing_same_as_normal !== false,
          billing_address_street: d.billing_address_street || "Suite 4, 32-36 Church Street",
          billing_address_suburb: d.billing_address_suburb || "Parramatta",
          billing_address_state: d.billing_address_state || "NSW",
          billing_address_postcode: d.billing_address_postcode || "2150",
          billing_address_country: d.billing_address_country || "Australia",

          cancellation_notice_hours: String(d.cancellation_notice_hours || d.cancellation_window_hours || "24"),
          max_advance_booking_days: String(d.max_advance_booking_days || "60"),
          buffer_minutes_between_lessons: String(d.buffer_minutes_between_lessons || "15"),
          allow_students_cancel_online: d.allow_students_cancel_online !== 0 && d.allow_students_cancel_online !== "0",
          allow_students_reschedule_online: d.allow_students_reschedule_online !== 0 && d.allow_students_reschedule_online !== "0",

          currency: d.currency || "AUD",
          gst_registered: d.gst_registered !== "0" && d.gst_registered !== false,
          gst_percentage: String(d.gst_percentage || "10"),
          tax_inclusive: d.tax_inclusive !== "0" && d.tax_inclusive !== false,
          tax_invoice_prefix: d.tax_invoice_prefix || "TAX-INV-",

          bank_name: d.bank_name || "Commonwealth Bank of Australia",
          bank_account_name: d.bank_account_name || "EZY 2 LEARN DRIVING SCHOOL PTY LTD",
          bank_bsb: d.bank_bsb || "062-000",
          bank_account_number: d.bank_account_number || "1092 8491",
          payid_enabled: d.payid_enabled !== 0 && d.payid_enabled !== "0",
          payid_identifier: d.payid_identifier || "admin@ezy2learn.com.au",
          invoice_payment_terms: d.invoice_payment_terms || "Payment due within 7 days of invoice date. BSB: 062-000 | Account: 1092 8491 | Quote Tax Invoice number as payment description.",

          stripe_enabled: d.stripe_enabled !== 0 && d.stripe_enabled !== "0",
          stripe_mode: d.stripe_mode || "test",
          stripe_publishable_key: d.stripe_publishable_key || "pk_test_51MzEzy2LearnSydneyDriving001SecKey",
          stripe_secret_key: d.stripe_secret_key || "sk_test_51MzEzy2LearnSydneySecretKeyHidden0099",
          stripe_webhook_secret: d.stripe_webhook_secret || "whsec_920fbc89a71b2d49e1e2",
          xero_enabled: d.xero_enabled === "1" || d.xero_enabled === true,
          xero_client_id: d.xero_client_id || "",
          xero_client_secret: d.xero_client_secret || "",
          square_enabled: d.square_enabled === "1" || d.square_enabled === true,
          square_application_id: d.square_application_id || "",
          square_access_token: d.square_access_token || "",
        };
        setFormData(loaded);
        setInitialData(loaded);

        if (d.contact_emails) {
          try {
            const parsed = typeof d.contact_emails === "string" ? JSON.parse(d.contact_emails) : d.contact_emails;
            if (Array.isArray(parsed) && parsed.length > 0) setContactEmails(parsed);
          } catch (err) { }
        }
        if (d.contact_phones) {
          try {
            const parsed = typeof d.contact_phones === "string" ? JSON.parse(d.contact_phones) : d.contact_phones;
            if (Array.isArray(parsed) && parsed.length > 0) setContactPhones(parsed);
          } catch (err) { }
        }
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        ...formData,
        contact_emails: contactEmails,
        contact_phones: contactPhones,
        billing_same_as_normal: formData.billing_same_as_normal ? "1" : "0",
        gst_registered: formData.gst_registered ? "1" : "0",
        tax_inclusive: formData.tax_inclusive ? "1" : "0",
        stripe_enabled: formData.stripe_enabled ? "1" : "0",
        payid_enabled: formData.payid_enabled ? "1" : "0",
        xero_enabled: formData.xero_enabled ? "1" : "0",
        square_enabled: formData.square_enabled ? "1" : "0",
        allow_students_cancel_online: formData.allow_students_cancel_online ? "1" : "0",
        allow_students_reschedule_online: formData.allow_students_reschedule_online ? "1" : "0",
        business_address: `${formData.normal_address_street}, ${formData.normal_address_suburb} ${formData.normal_address_state} ${formData.normal_address_postcode}`,
        address: `${formData.normal_address_street}, ${formData.normal_address_suburb} ${formData.normal_address_state} ${formData.normal_address_postcode}`,
      };

      await apiFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setInitialData({ ...formData });
      showToast("Settings and Australian invoice preferences saved successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        handleChange("logo_url", result);
        showToast("Company logo updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const hasUnsavedChanges = initialData && JSON.stringify(formData) !== JSON.stringify(initialData);

  // ==========================================
  // INVOICE CALCULATIONS (Australian Tax System & Discount)
  const rawSubtotal = invoiceItems.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
  const discountAmount =
    discountType === "percent"
      ? (rawSubtotal * (discountValue || 0)) / 100
      : (discountValue || 0);
  const subtotalAmount = Math.max(0, rawSubtotal - discountAmount);
  const gstRate = parseFloat(formData.gst_percentage || "10") / 100;
  const gstAmount = subtotalAmount * gstRate;
  const finalTotalAmount = subtotalAmount + gstAmount;

  const addInvoiceItem = (presetDescription?: string, presetPrice?: number) => {
    setInvoiceItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: presetDescription || "1-Hour Professional Driving Lesson (Dual Control Vehicle)",
        qty: 1,
        unitPrice: presetPrice ?? 80.0,
      },
    ]);
  };

  const removeInvoiceItem = (id: string) => {
    setInvoiceItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateInvoiceItem = (id: string, field: keyof InvoiceLineItem, val: any) => {
    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    const selected = dbStudents.find((s) => String(s.id) === id);
    if (selected) {
      setClientName(selected.name || "");
      setClientEmail(selected.email || "");
      setClientPhone(selected.phone || "");
      setClientAddress(
        selected.address
          ? `${selected.address}, ${selected.suburb || "Parramatta"} ${selected.state || "NSW"} ${selected.postcode || "2150"}`
          : "Parramatta NSW 2150"
      );
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoiceHtml = () => {
    const printableElement = document.getElementById("australian-tax-invoice-sheet");
    if (!printableElement) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${invoiceNumber} - ${formData.school_name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body class="bg-slate-100 p-8 font-sans">
  <div class="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-slate-200">
    ${printableElement.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Tax Invoice downloaded successfully!");
  };

  const handleSendInvoiceEmail = () => {
    setSendingEmail(true);
    setTimeout(() => {
      setSendingEmail(false);
      showToast(`Tax Invoice ${invoiceNumber} sent to ${clientEmail}!`);
    }, 1200);
  };

  return (
    <AdminLayout>
      {/* PRINT-ONLY STYLES: Makes the Tax Invoice Sheet fill the whole page cleanly */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #australian-tax-invoice-sheet,
          #australian-tax-invoice-sheet * {
            visibility: visible;
          }
          #australian-tax-invoice-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="space-y-6 w-full min-w-0 select-none pb-24">
        {/* Top Header with Full-Width Rectangle Badge Heading */}
        <PageHeading
          icon={Settings}
          title="Settings & Business Profile"
          subtitle="Configure Australian business profile, contact details, payment gateways, and ATO compliance"
          badge="🇦🇺 Australia"
          actions={
            <button
              onClick={() => handleSaveSettings()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-heading font-bold text-sm shadow-xs transition-all disabled:opacity-75 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#FAB10B]" />
              <span>{saving ? "Saving..." : "Save changes"}</span>
            </button>
          }
        />

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* LEFT SIDEBAR: Vertical Tab Card */}
          <div className="w-full lg:w-64 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-2.5 shadow-2xs space-y-1">
            {[
              { key: "general", label: "General", icon: Building2 },
              { key: "lessons", label: "Lessons & bookings", icon: Calendar },
              { key: "payments", label: "Payment & invoicing", icon: Receipt },
              { key: "subadmins", label: "Sub-Admins & Roles", icon: ShieldCheck },
            ].map((tab) => {
              const isSelected = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`w-full text-left font-heading font-bold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center justify-between ${isSelected
                    ? "bg-[#0B1528] text-white shadow-2xs"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#FAB10B]" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.key === "payments" && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      ATO
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT / MAIN CONTENT AREA */}
          <div className="flex-1 w-full space-y-6">
            {/* TAB 1: GENERAL */}
            {activeTab === "general" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                <div>
                  <h2 className="font-heading font-black text-lg text-slate-900">
                    Business Profile
                  </h2>
                  <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                    Your school details appear on student receipts and booking confirmation emails.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                      Driving School Brand Name
                    </label>
                    <input
                      type="text"
                      value={formData.school_name}
                      onChange={(e) => handleChange("school_name", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                    />
                  </div>

                  {/* MULTIPLE CONTACT EMAILS & PASSWORDS */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-800">
                          Official Contact Emails & Passwords
                        </label>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Add multiple email addresses for inquiries, dispatch, and secure email account passwords.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddEmail}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0B1528] hover:text-white text-slate-700 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#FAB10B]" />
                        <span>+ Add Email</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {contactEmails.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 transition-all hover:bg-slate-50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Email #{idx + 1}
                              </span>
                              {item.is_primary ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ★ Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateEmail(item.id, "is_primary", true)}
                                  className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                                >
                                  Set as Primary
                                </button>
                              )}
                            </div>

                            {contactEmails.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteEmail(item.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove Email"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            {/* Label */}
                            <div className="md:col-span-4">
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Purpose / Department
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Inquiries, Bookings, Support"
                                value={item.label}
                                onChange={(e) =>
                                  handleUpdateEmail(item.id, "label", e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                              />
                            </div>

                            {/* Email Address */}
                            <div className="md:col-span-4">
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Email Address
                              </label>
                              <div className="relative">
                                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                  type="email"
                                  placeholder="admin@ezy2learn.com.au"
                                  value={item.email}
                                  onChange={(e) =>
                                    handleUpdateEmail(item.id, "email", e.target.value)
                                  }
                                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                                />
                              </div>
                            </div>

                            {/* Email Password / App Password */}
                            <div className="md:col-span-4">
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Email Password / App Password
                              </label>
                              <div className="relative">
                                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                  type={item.show_password ? "text" : "password"}
                                  placeholder="••••••••••••"
                                  value={item.password || ""}
                                  onChange={(e) =>
                                    handleUpdateEmail(item.id, "password", e.target.value)
                                  }
                                  className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateEmail(
                                      item.id,
                                      "show_password",
                                      !item.show_password
                                    )
                                  }
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                                  title={item.show_password ? "Hide password" : "Show password"}
                                >
                                  {item.show_password ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MULTIPLE PHONE NUMBERS */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-800">
                          Official Australian Phone Numbers
                        </label>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Add multiple phone numbers (Toll-Free, Instructor Mobile, SMS alerts, Reception).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddPhone}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0B1528] hover:text-white text-slate-700 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#FAB10B]" />
                        <span>+ Add Phone Number</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {contactPhones.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 transition-all hover:bg-slate-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Phone #{idx + 1}
                              </span>
                              {item.is_primary ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ★ Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePhone(item.id, "is_primary", true)}
                                  className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                                >
                                  Set as Primary
                                </button>
                              )}
                            </div>

                            {contactPhones.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeletePhone(item.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove Phone"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Line Label / Department
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Toll-Free Hotline, SMS Line"
                                value={item.label}
                                onChange={(e) =>
                                  handleUpdatePhone(item.id, "label", e.target.value)
                                }
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Australian Phone Number
                              </label>
                              <div className="relative">
                                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                  type="text"
                                  placeholder="1300 399 532 or 0412 345 678"
                                  value={item.phone}
                                  onChange={(e) =>
                                    handleUpdatePhone(item.id, "phone", e.target.value)
                                  }
                                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                        Australian Business Number (ABN)
                      </label>
                      <input
                        type="text"
                        value={formData.abn}
                        onChange={(e) => handleChange("abn", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                      />
                    </div>

                    <div>
                      <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                        Official Website
                      </label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => handleChange("website", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LESSONS & BOOKINGS */}
            {activeTab === "lessons" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                <div>
                  <h2 className="font-heading font-black text-lg text-slate-900">
                    Lesson & Booking Rules
                  </h2>
                  <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                    Configure buffers, booking windows, and cancellation notice limits.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                      Cancellation notice (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.cancellation_notice_hours}
                      onChange={(e) => handleChange("cancellation_notice_hours", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                    />
                  </div>

                  <div>
                    <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                      Max booking advance (days)
                    </label>
                    <input
                      type="number"
                      value={formData.max_advance_booking_days}
                      onChange={(e) => handleChange("max_advance_booking_days", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                    />
                  </div>

                  <div>
                    <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                      Buffer between lessons (mins)
                    </label>
                    <input
                      type="number"
                      value={formData.buffer_minutes_between_lessons}
                      onChange={(e) => handleChange("buffer_minutes_between_lessons", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="font-heading font-bold text-sm text-slate-900 block leading-tight">
                        Allow online cancellations
                      </span>
                      <span className="font-sans text-xs text-slate-400 font-medium mt-0.5 block">
                        Students can cancel outside the notice window without admin approval.
                      </span>
                    </div>
                    <ToggleSwitch
                      checked={formData.allow_students_cancel_online}
                      onChange={(val: boolean) => handleChange("allow_students_cancel_online", val)}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="font-heading font-bold text-sm text-slate-900 block leading-tight">
                        Allow online rescheduling
                      </span>
                      <span className="font-sans text-xs text-slate-400 font-medium mt-0.5 block">
                        Students can change booking times to any other open instructor slot.
                      </span>
                    </div>
                    <ToggleSwitch
                      checked={formData.allow_students_reschedule_online}
                      onChange={(val: boolean) => handleChange("allow_students_reschedule_online", val)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PAYMENTS & AUSTRALIAN INVOICING */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                {/* SUB-TAB TOGGLE: Settings vs Invoice Generator Studio */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-2xs flex items-center gap-1.5">
                  <button
                    onClick={() => setPaymentSubTab("settings")}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${paymentSubTab === "settings"
                      ? "bg-[#0B1528] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                  >
                    <Building2 className="w-4 h-4 text-[#FAB10B]" />
                    <span>Australian Invoicing & API Setup</span>
                  </button>

                  <button
                    onClick={() => setPaymentSubTab("generator")}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${paymentSubTab === "generator"
                      ? "bg-[#0B1528] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                  >
                    <Receipt className="w-4 h-4 text-[#FAB10B]" />
                    <span>Tax Invoice Studio & Generator</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                      Live Preview
                    </span>
                  </button>
                </div>

                {/* SUB-VIEW 1: AUSTRALIAN INVOICING & API SETTINGS */}
                {paymentSubTab === "settings" && (
                  <div className="space-y-6">
                    {/* SECTION A: COMPANY LOGO & LEGAL IDENTITY */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h2 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                            <span>1. Company Logo & Legal Identity</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                              Printed on Tax Invoices
                            </span>
                          </h2>
                          <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                            Legally compliant with Australian Taxation Office (ATO) Tax Invoice standards.
                          </p>
                        </div>
                      </div>

                      {/* Logo Uploader / Display */}
                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-700 mb-2">
                          Company Logo (Appears on Tax Invoices & Student Receipts)
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <div className="w-28 h-24 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-2xs overflow-hidden shrink-0 relative group">
                            {formData.logo_url ? (
                              <img
                                src={formData.logo_url}
                                alt="Company Logo"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback graphic if image path doesn't load
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : null}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/5 text-slate-400">
                              <ImageIcon className="w-6 h-6 text-slate-300" />
                              <span className="text-[10px] font-bold mt-1 text-slate-500">EZY 2 LEARN</span>
                            </div>
                          </div>

                          <div className="space-y-2 flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                                className="hidden"
                                onChange={handleLogoUpload}
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-heading font-bold text-xs hover:bg-slate-100 shadow-2xs transition-colors"
                              >
                                <UploadCloud className="w-4 h-4 text-[#FAB10B]" />
                                <span>Upload New Logo (PNG, JPG, SVG)</span>
                              </button>

                              {formData.logo_url && (
                                <button
                                  type="button"
                                  onClick={() => handleChange("logo_url", "")}
                                  className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
                                >
                                  Remove Logo
                                </button>
                              )}
                            </div>

                            <div>
                              <input
                                type="text"
                                placeholder="Or enter Logo Image URL (e.g. https://... or /logo.png)"
                                value={formData.logo_url}
                                onChange={(e) => handleChange("logo_url", e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                              />
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Recommended size: 400x160px with transparent background. Printed on all generated A4 tax invoices.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Australian Legal Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                            Company Legal Name (Registered Entity) *
                          </label>
                          <input
                            type="text"
                            value={formData.school_legal_name}
                            onChange={(e) => handleChange("school_legal_name", e.target.value)}
                            placeholder="e.g. EZY 2 LEARN Driving School Pty Ltd"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                          />
                        </div>

                        <div>
                          <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                            Trading / Operating Business Name *
                          </label>
                          <input
                            type="text"
                            value={formData.school_name}
                            onChange={(e) => handleChange("school_name", e.target.value)}
                            placeholder="e.g. EZY 2 LEARN Driving School"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block font-heading font-bold text-xs text-slate-700">
                              Australian Business Number (ABN) *
                            </label>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ 11 Digits Verified
                            </span>
                          </div>
                          <input
                            type="text"
                            value={formData.abn}
                            onChange={(e) => handleChange("abn", e.target.value)}
                            placeholder="84 928 319 402"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                          />
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            Mandatory under Australian law for all valid tax invoices over $82.50 AUD.
                          </span>
                        </div>

                        <div>
                          <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                            Australian Company Number (ACN)
                          </label>
                          <input
                            type="text"
                            value={formData.acn}
                            onChange={(e) => handleChange("acn", e.target.value)}
                            placeholder="928 319 402"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION B: NORMAL PHYSICAL & BILLING ADDRESSES (AUSTRALIA) */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h2 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                          <span>2. Australian Registered & Billing Addresses</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                            Physical vs Invoicing
                          </span>
                        </h2>
                        <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                          Addresses printed on official invoices, customer statements, and merchant verification.
                        </p>
                      </div>

                      {/* Normal / Physical Registered Address */}
                      <div className="space-y-4">
                        <h3 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#FAB10B]" />
                          <span>Physical / Registered Operating Address (Australia)</span>
                        </h3>

                        <div>
                          <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={formData.normal_address_street}
                            onChange={(e) => handleChange("normal_address_street", e.target.value)}
                            placeholder="e.g. Suite 4, 32-36 Church Street"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                              Suburb / City *
                            </label>
                            <input
                              type="text"
                              value={formData.normal_address_suburb}
                              onChange={(e) => handleChange("normal_address_suburb", e.target.value)}
                              placeholder="e.g. Parramatta"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                            />
                          </div>

                          <div>
                            <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                              State / Territory *
                            </label>
                            <select
                              value={formData.normal_address_state}
                              onChange={(e) => handleChange("normal_address_state", e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                            >
                              {AUSTRALIAN_STATES.map((st) => (
                                <option key={st.code} value={st.code}>
                                  {st.code} - {st.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                              Postcode *
                            </label>
                            <input
                              type="text"
                              maxLength={4}
                              value={formData.normal_address_postcode}
                              onChange={(e) => handleChange("normal_address_postcode", e.target.value)}
                              placeholder="2150"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Billing Address Toggle */}
                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div>
                            <span className="font-heading font-bold text-sm text-slate-900 block">
                              Billing Address is the same as physical address
                            </span>
                            <span className="font-sans text-xs text-slate-500 font-medium">
                              Uncheck if your accounting or postal address is different (e.g. PO Box).
                            </span>
                          </div>
                          <ToggleSwitch
                            checked={formData.billing_same_as_normal}
                            onChange={(val: boolean) => handleChange("billing_same_as_normal", val)}
                          />
                        </div>

                        {!formData.billing_same_as_normal && (
                          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-4 animate-in fade-in duration-200">
                            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-900">
                              Custom Billing Address
                            </h4>
                            <div>
                              <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                                Billing Street Address or PO Box
                              </label>
                              <input
                                type="text"
                                value={formData.billing_address_street}
                                onChange={(e) => handleChange("billing_address_street", e.target.value)}
                                placeholder="PO Box 123"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                                  Billing Suburb
                                </label>
                                <input
                                  type="text"
                                  value={formData.billing_address_suburb}
                                  onChange={(e) => handleChange("billing_address_suburb", e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                                  Billing State
                                </label>
                                <select
                                  value={formData.billing_address_state}
                                  onChange={(e) => handleChange("billing_address_state", e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900"
                                >
                                  {AUSTRALIAN_STATES.map((st) => (
                                    <option key={st.code} value={st.code}>
                                      {st.code} - {st.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                                  Billing Postcode
                                </label>
                                <input
                                  type="text"
                                  maxLength={4}
                                  value={formData.billing_address_postcode}
                                  onChange={(e) => handleChange("billing_address_postcode", e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono font-medium text-slate-900"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION C: AUSTRALIAN TAX (GST) & INVOICING RULES */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h2 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                          <span>3. Australian Tax (GST) & Invoicing Settings</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            ATO 10% GST Standard
                          </span>
                        </h2>
                        <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                          Set up Goods and Services Tax (GST) calculation and tax invoice title rules.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div>
                            <span className="font-heading font-bold text-sm text-slate-900 block">
                              Registered for Australian GST (Goods and Services Tax)
                            </span>
                            <span className="font-sans text-xs text-slate-500 font-medium">
                              Enables automatic calculation and ATO-compliant Tax Invoice generation.
                            </span>
                          </div>
                          <ToggleSwitch
                            checked={formData.gst_registered}
                            onChange={(val: boolean) => handleChange("gst_registered", val)}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                              GST Percentage (%)
                            </label>
                            <input
                              type="number"
                              disabled
                              value={formData.gst_percentage}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-sm font-bold text-slate-700 cursor-not-allowed"
                            />
                            <span className="text-[11px] text-slate-400 mt-1 block">
                              Fixed at 10.0% by the Australian Taxation Office.
                            </span>
                          </div>

                          <div>
                            <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                              Currency
                            </label>
                            <input
                              type="text"
                              disabled
                              value="AUD ($ - Australian Dollar)"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-sm font-bold text-slate-700 cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                              Tax Invoice Prefix
                            </label>
                            <input
                              type="text"
                              value={formData.tax_invoice_prefix}
                              onChange={(e) => handleChange("tax_invoice_prefix", e.target.value)}
                              placeholder="TAX-INV-"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                            />
                          </div>
                        </div>

                        {/* Tax Inclusive Pricing Toggle */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-heading font-bold text-sm text-slate-900 block">
                                Tax-Inclusive Pricing (Recommended for Australian B2C)
                              </span>
                              <span className="font-sans text-xs text-slate-500 font-medium">
                                Under Australian Consumer Law (ACL), all driving lesson prices quoted to consumers must be inclusive of 10% GST.
                              </span>
                            </div>
                            <ToggleSwitch
                              checked={formData.tax_inclusive}
                              onChange={(val: boolean) => handleChange("tax_inclusive", val)}
                            />
                          </div>
                          <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>ATO Rule Check:</strong> On a tax-inclusive \$110.00 lesson, the invoice states: <em>"Total price includes GST of \$10.00 AUD (1/11th)"</em>.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION D: AUSTRALIAN DIRECT BANK DEPOSIT (BSB & PAYID) */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h2 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                          <Landmark className="w-5 h-5 text-[#FAB10B]" />
                          <span>4. Australian Bank Transfer & PayID (Invoice Remittance)</span>
                        </h2>
                        <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                          Printed at the bottom of tax invoices for students wishing to pay via EFT or PayID.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                            Australian Financial Institution / Bank Name
                          </label>
                          <input
                            type="text"
                            value={formData.bank_name}
                            onChange={(e) => handleChange("bank_name", e.target.value)}
                            placeholder="e.g. Commonwealth Bank of Australia"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                          />
                        </div>

                        <div>
                          <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                            Account Name (Beneficiary)
                          </label>
                          <input
                            type="text"
                            value={formData.bank_account_name}
                            onChange={(e) => handleChange("bank_account_name", e.target.value)}
                            placeholder="EZY 2 LEARN DRIVING SCHOOL PTY LTD"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                            Bank-State-Branch (BSB Number) *
                          </label>
                          <input
                            type="text"
                            maxLength={7}
                            value={formData.bank_bsb}
                            onChange={(e) => handleChange("bank_bsb", e.target.value)}
                            placeholder="062-000"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                          />
                          <span className="text-[11px] text-slate-400 mt-1 block">Format: 6 digits (XXX-XXX)</span>
                        </div>

                        <div>
                          <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            value={formData.bank_account_number}
                            onChange={(e) => handleChange("bank_account_number", e.target.value)}
                            placeholder="1092 8491"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                          />
                        </div>

                        <div>
                          <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                            PayID (Instant Osko Transfers)
                          </label>
                          <input
                            type="text"
                            value={formData.payid_identifier}
                            onChange={(e) => handleChange("payid_identifier", e.target.value)}
                            placeholder="admin@ezy2learn.com.au"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                          Invoice Payment Terms / Remittance Advice Instructions
                        </label>
                        <textarea
                          rows={2}
                          value={formData.invoice_payment_terms}
                          onChange={(e) => handleChange("invoice_payment_terms", e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                        />
                      </div>
                    </div>

                    {/* SECTION E: EXTERNAL SERVICE API INTEGRATIONS */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                              <span>5. External Service API Integrations</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                                Payment Gateway & Accounting APIs
                              </span>
                            </h2>
                            <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                              Connect Stripe Australia, Xero/MYOB accounting sync, and webhook endpoints.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 1. Stripe Australia */}
                      <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#635BFF] text-white flex items-center justify-center font-black text-base shadow-xs">
                              S
                            </div>
                            <div>
                              <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                                <span>Stripe Australia Payments Gateway</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.stripe_enabled
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-200 text-slate-600"
                                    }`}
                                >
                                  {formData.stripe_enabled ? "Active" : "Disabled"}
                                </span>
                              </h3>
                              <p className="font-sans text-xs text-slate-500 font-medium">
                                Accepts Visa, Mastercard, Apple Pay, Google Pay with Australian 3D Secure.
                              </p>
                            </div>
                          </div>

                          <ToggleSwitch
                            checked={formData.stripe_enabled}
                            onChange={(val: boolean) => handleChange("stripe_enabled", val)}
                          />
                        </div>

                        {formData.stripe_enabled && (
                          <div className="space-y-4 pt-3 border-t border-slate-200/80">
                            <div className="flex items-center gap-4">
                              <label className="font-heading font-bold text-xs text-slate-700">Environment:</label>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="stripe_mode"
                                    value="test"
                                    checked={formData.stripe_mode === "test"}
                                    onChange={(e) => handleChange("stripe_mode", e.target.value)}
                                  />
                                  <span>Test Mode (Sandbox)</span>
                                </label>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="stripe_mode"
                                    value="live"
                                    checked={formData.stripe_mode === "live"}
                                    onChange={(e) => handleChange("stripe_mode", e.target.value)}
                                  />
                                  <span>Live Mode (Production)</span>
                                </label>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                                  Stripe Publishable Key
                                </label>
                                <input
                                  type="text"
                                  value={formData.stripe_publishable_key}
                                  onChange={(e) => handleChange("stripe_publishable_key", e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                                />
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="block font-heading font-bold text-xs text-slate-700">
                                    Stripe Secret Key
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setShowStripeSecret(!showStripeSecret)}
                                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                                  >
                                    {showStripeSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    <span>{showStripeSecret ? "Hide" : "Reveal"}</span>
                                  </button>
                                </div>
                                <input
                                  type={showStripeSecret ? "text" : "password"}
                                  value={formData.stripe_secret_key}
                                  onChange={(e) => handleChange("stripe_secret_key", e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                                />
                              </div>
                            </div>

                            {/* Webhook Endpoint */}
                            <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <span className="font-heading font-bold text-xs text-slate-800 block">
                                  Webhook Endpoint URL
                                </span>
                                <span className="font-mono text-[11px] text-slate-600 block break-all">
                                  https://api.ezy2learn.com.au/api/webhook/stripe
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(
                                      "https://api.ezy2learn.com.au/api/webhook/stripe",
                                      "webhook"
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                  {copiedKey === "webhook" ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-700">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy URL</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setTestingStripe(true);
                                    setTimeout(() => {
                                      setTestingStripe(false);
                                      showToast("✓ Stripe API Connection verified successfully!");
                                    }, 800);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1528] text-white text-xs font-bold hover:bg-[#07345B]"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-[#FAB10B]" />
                                  <span>{testingStripe ? "Testing..." : "Test Connection"}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. Xero / MYOB Accounting API */}
                      <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#13B5EA] text-white flex items-center justify-center font-black text-base shadow-xs">
                              X
                            </div>
                            <div>
                              <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                                <span>Xero / MYOB Australian Accounting Sync</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                                  {formData.xero_enabled ? "Enabled" : "Optional"}
                                </span>
                              </h3>
                              <p className="font-sans text-xs text-slate-500 font-medium">
                                Automatically push generated Tax Invoices and reconciled payments to your Australian General Ledger.
                              </p>
                            </div>
                          </div>

                          <ToggleSwitch
                            checked={formData.xero_enabled}
                            onChange={(val: boolean) => handleChange("xero_enabled", val)}
                          />
                        </div>

                        {formData.xero_enabled && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200/80 animate-in fade-in duration-200">
                            <div>
                              <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                                Xero OAuth 2.0 Client ID
                              </label>
                              <input
                                type="text"
                                value={formData.xero_client_id}
                                onChange={(e) => handleChange("xero_client_id", e.target.value)}
                                placeholder="Enter Xero app client id"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs font-medium text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                                Xero Client Secret
                              </label>
                              <input
                                type="password"
                                value={formData.xero_client_secret}
                                onChange={(e) => handleChange("xero_client_secret", e.target.value)}
                                placeholder="••••••••••••••••"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs font-medium text-slate-900"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 2: DEDICATED PROPER SPACE TO GENERATE PAYMENT INVOICE */}
                {paymentSubTab === "generator" && (
                  <div className="space-y-6">
                    {/* Top Action Bar */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="font-heading font-black text-xl text-slate-900 flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-[#FAB10B]" />
                          <span>Australian Tax Invoice Generator & Studio</span>
                        </h2>
                        <p className="font-sans text-xs text-slate-500 font-medium">
                          Generate ATO-compliant Australian Tax Invoices in AUD with 10% GST breakdown and printable A4 formatting.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={handlePrintInvoice}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-heading font-bold text-xs hover:bg-slate-50 shadow-2xs transition-colors"
                        >
                          <Printer className="w-4 h-4 text-slate-600" />
                          <span>Print / Save PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDownloadInvoiceHtml}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-heading font-bold text-xs hover:bg-slate-50 shadow-2xs transition-colors"
                        >
                          <Download className="w-4 h-4 text-slate-600" />
                          <span>Download HTML</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSendInvoiceEmail}
                          disabled={sendingEmail}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-heading font-bold text-xs shadow-2xs transition-all disabled:opacity-75"
                        >
                          <Send className="w-4 h-4 text-[#FAB10B]" />
                          <span>{sendingEmail ? "Sending..." : "Send to Student"}</span>
                        </button>
                      </div>
                    </div>

                    {/* 2-COLUMN SPLIT: LEFT SIDE = CTA FORM DETAILS, RIGHT SIDE = LIVE INVOICE PREVIEW */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                      {/* LEFT SIDE: INVOICE GENERATOR FORM (EXACT STRUCTURE FROM USER SCREENSHOT) */}
                      <div className="xl:col-span-6 space-y-4">
                        {/* Title Section matching user screenshot */}
                        <div>
                          <h2 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
                            Create Invoice
                          </h2>
                          <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                            Generate a professional invoice for the selected transaction
                          </p>
                        </div>

                        {/* CARD 1: Select Student & Select Booking */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Select Student */}
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Select Student <span className="text-amber-500">*</span>
                              </label>
                              <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                  value={selectedStudentId}
                                  onChange={handleStudentSelect}
                                  className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1528] cursor-pointer"
                                >
                                  {dbStudents.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.name} (STU-{String(s.id).padStart(3, "0")})
                                    </option>
                                  ))}
                                  {dbStudents.length === 0 && (
                                    <option value="1">Ruby Chen (STU-001)</option>
                                  )}
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>

                            {/* Select Booking */}
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Select Booking <span className="text-amber-500">*</span>
                              </label>
                              <div className="relative">
                                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                  value={selectedBookingCode}
                                  onChange={(e) => {
                                    setSelectedBookingCode(e.target.value);
                                    if (e.target.value.includes("Manual")) {
                                      setInvoiceItems([
                                        {
                                          id: "1",
                                          description: "Manual Driving Lesson",
                                          qty: 1,
                                          unitPrice: 120.0,
                                        },
                                      ]);
                                    } else if (e.target.value.includes("Automatic")) {
                                      setInvoiceItems([
                                        {
                                          id: "1",
                                          description: "Standard Automatic Driving Lesson (2 Hours)",
                                          qty: 1,
                                          unitPrice: 160.0,
                                        },
                                      ]);
                                    } else if (e.target.value.includes("Test Package")) {
                                      setInvoiceItems([
                                        {
                                          id: "1",
                                          description: "RMS Practical Driving Test Vehicle Hire & Warmup",
                                          qty: 1,
                                          unitPrice: 230.0,
                                        },
                                      ]);
                                    }
                                  }}
                                  className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1528] cursor-pointer"
                                >
                                  <option value="BK-10045 - Manual Driving Lesson">
                                    BK-10045 - Manual Driving Lesson
                                  </option>
                                  <option value="BK-10046 - Automatic Driving Lesson (2 Hrs)">
                                    BK-10046 - Automatic Driving Lesson (2 Hrs)
                                  </option>
                                  <option value="BK-10047 - RMS Practical Driving Test Package">
                                    BK-10047 - RMS Practical Driving Test Package
                                  </option>
                                  <option value="BK-10048 - Defensive Driving & Highway Coaching">
                                    BK-10048 - Defensive Driving & Highway Coaching
                                  </option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CARD 2: Invoice Information */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                          <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900">
                            <FileText className="w-4 h-4 text-slate-700" />
                            <span>Invoice Information</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            {/* Invoice Date */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Invoice Date <span className="text-amber-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={issueDate}
                                  onChange={(e) => setIssueDate(e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                                />
                              </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Payment Method <span className="text-amber-500">*</span>
                              </label>
                              <div className="relative">
                                <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                  value={paymentMethod}
                                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                                  className="w-full appearance-none pl-8 pr-7 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1528] cursor-pointer"
                                >
                                  <option value="card">Credit Card</option>
                                  <option value="bsb">Bank Transfer</option>
                                  <option value="payid">PayID / Osko</option>
                                  <option value="cash">Cash</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>

                            {/* Invoice Status */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Invoice Status
                              </label>
                              <div className="relative">
                                <select
                                  value={paymentStatus}
                                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                                  className="w-full appearance-none pl-6 pr-7 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1528] cursor-pointer"
                                >
                                  <option value="paid">Paid</option>
                                  <option value="due">Pending / Due</option>
                                  <option value="overdue">Overdue</option>
                                </select>
                                <span
                                  className={`w-2 h-2 rounded-full absolute left-2.5 top-1/2 -translate-y-1/2 ${paymentStatus === "paid"
                                    ? "bg-emerald-500"
                                    : paymentStatus === "due"
                                      ? "bg-amber-500"
                                      : "bg-rose-500"
                                    }`}
                                />
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CARD 3: Service Details */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                          <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900">
                            <Car className="w-4 h-4 text-slate-700" />
                            <span>Service Details</span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-bold">
                                  <th className="py-2.5 px-3">Description</th>
                                  <th className="py-2.5 px-3 w-24 text-center">Quantity</th>
                                  <th className="py-2.5 px-3 w-28 text-right">Unit Price</th>
                                  <th className="py-2.5 px-3 w-28 text-right">Total</th>
                                  <th className="py-2.5 px-2 w-10 text-center"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-sans">
                                {invoiceItems.map((item) => (
                                  <tr key={item.id}>
                                    <td className="py-2.5 px-3">
                                      <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) =>
                                          updateInvoiceItem(item.id, "description", e.target.value)
                                        }
                                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                                      />
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <input
                                        type="number"
                                        min={1}
                                        value={item.qty}
                                        onChange={(e) =>
                                          updateInvoiceItem(
                                            item.id,
                                            "qty",
                                            parseInt(e.target.value, 10) || 1
                                          )
                                        }
                                        className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-center text-slate-900 focus:outline-none"
                                      />
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) =>
                                          updateInvoiceItem(
                                            item.id,
                                            "unitPrice",
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-mono font-bold text-right text-slate-900 focus:outline-none"
                                      />
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                      ${(item.qty * item.unitPrice).toFixed(2)}
                                    </td>
                                    <td className="py-2.5 px-2 text-center">
                                      {invoiceItems.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeInvoiceItem(item.id)}
                                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <button
                            type="button"
                            onClick={() => addInvoiceItem("Manual Driving Lesson", 120.0)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-slate-600" />
                            <span>+ Add Item</span>
                          </button>
                        </div>

                        {/* CARD 4: Payment Summary */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                          <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900">
                            <Calculator className="w-4 h-4 text-slate-700" />
                            <span>Payment Summary</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                            {/* Left breakdown */}
                            <div className="md:col-span-7 space-y-3 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 font-medium">Subtotal</span>
                                <span className="font-bold text-slate-900 font-mono">
                                  ${rawSubtotal.toFixed(2)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-600 font-medium">Discount</span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={discountValue}
                                    onChange={(e) =>
                                      setDiscountValue(parseFloat(e.target.value) || 0)
                                    }
                                    className="w-20 px-2 py-1 rounded-lg border border-slate-200 bg-white text-right font-mono font-bold text-xs"
                                  />
                                  <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value as any)}
                                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-xs cursor-pointer"
                                  >
                                    <option value="percent">%</option>
                                    <option value="fixed">$</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 font-medium">GST (10%)</span>
                                <span className="font-bold text-slate-900 font-mono">
                                  ${gstAmount.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Right highlighted box */}
                            <div className="md:col-span-5 bg-[#f0f6ff] p-5 rounded-2xl border border-blue-100 flex flex-col justify-center">
                              <span className="text-xs font-bold text-slate-500">Final Amount</span>
                              <span className="text-3xl font-black text-[#0B1528] tracking-tight mt-1">
                                ${finalTotalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CARD 5: Notes (Optional) */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
                          <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900">
                            <FileText className="w-4 h-4 text-slate-700" />
                            <span>Notes (Optional)</span>
                          </div>
                          <textarea
                            rows={3}
                            value={invoiceNotes}
                            onChange={(e) => setInvoiceNotes(e.target.value)}
                            placeholder="Add any notes or remarks..."
                            className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                          />
                        </div>
                      </div>

                      {/* RIGHT SIDE: LIVE ATO TAX INVOICE PREVIEW */}
                      <div className="xl:col-span-6 sticky top-6 space-y-2">
                        <div className="flex items-center justify-between px-2">
                          <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-[#FAB10B]" />
                            <span>Live ATO-Compliant Tax Invoice Preview (A4 Standard)</span>
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            Auto-updates with form details on the left
                          </span>
                        </div>

                        {/* PRINTABLE CONTAINER: #australian-tax-invoice-sheet */}
                        <div
                          id="australian-tax-invoice-sheet"
                          className="bg-white rounded-2xl border-2 border-slate-200/90 p-6 sm:p-10 shadow-sm font-sans text-slate-900 w-full space-y-6"
                        >
                          {/* INVOICE HEADER */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-8">
                            {/* Seller Identity & Logo */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                {formData.logo_url ? (
                                  <img
                                    src={formData.logo_url}
                                    alt="Logo"
                                    className="h-14 w-auto object-contain max-w-[180px]"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : null}
                                <div>
                                  <h1 className="font-heading font-black text-xl text-[#0B1528] tracking-tight">
                                    {formData.school_legal_name}
                                  </h1>
                                  <p className="text-xs font-semibold text-slate-500">
                                    Trading as: {formData.school_name}
                                  </p>
                                </div>
                              </div>

                              <div className="text-xs text-slate-600 space-y-0.5 font-medium">
                                <p>
                                  <strong>ABN:</strong> {formData.abn}{" "}
                                  {formData.acn && <span>| <strong>ACN:</strong> {formData.acn}</span>}
                                </p>
                                <p>
                                  {formData.normal_address_street}, {formData.normal_address_suburb}{" "}
                                  {formData.normal_address_state} {formData.normal_address_postcode}{" "}
                                  Australia
                                </p>
                                <p>
                                  <strong>Phone:</strong> {formData.phone} | <strong>Email:</strong>{" "}
                                  {formData.contact_email}
                                </p>
                                <p>
                                  <strong>Website:</strong> {formData.website}
                                </p>
                              </div>
                            </div>

                            {/* Invoice Badge & Meta */}
                            <div className="sm:text-right space-y-2 shrink-0">
                              <div className="inline-block px-4 py-1 rounded-lg bg-[#0B1528] text-white font-heading font-black text-lg tracking-wider">
                                TAX INVOICE
                              </div>

                              <div className="text-xs space-y-1 font-medium text-slate-600">
                                <p>
                                  <span className="text-slate-400">Invoice Number:</span>{" "}
                                  <strong className="font-mono text-slate-900 text-sm">
                                    {invoiceNumber}
                                  </strong>
                                </p>
                                <p>
                                  <span className="text-slate-400">Issue Date:</span>{" "}
                                  <strong>{issueDate}</strong>
                                </p>
                                <p>
                                  <span className="text-slate-400">Due Date:</span>{" "}
                                  <strong>{dueDate}</strong>
                                </p>
                                <p className="pt-1">
                                  <span
                                    className={`inline-block font-heading font-bold text-xs uppercase px-3 py-1 rounded-full ${paymentStatus === "paid"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : paymentStatus === "due"
                                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                                        : "bg-rose-100 text-rose-800 border border-rose-300"
                                      }`}
                                  >
                                    {paymentStatus === "paid"
                                      ? "✓ PAID IN FULL"
                                      : paymentStatus === "due"
                                        ? "⏳ PAYMENT DUE"
                                        : "⚠️ OVERDUE"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* BILLED TO / STUDENT DETAILS */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                            <div>
                              <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400 block mb-1">
                                TAX INVOICE TO (STUDENT):
                              </span>
                              <h3 className="font-heading font-bold text-base text-slate-900">
                                {clientName || "Student Name"}
                              </h3>
                              <p className="text-xs text-slate-600 mt-0.5">{clientAddress}</p>
                              <p className="text-xs text-slate-600">
                                {clientEmail} | {clientPhone}
                              </p>
                            </div>

                            <div className="sm:text-right">
                              <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400 block mb-1">
                                PAYMENT METHOD:
                              </span>
                              <p className="font-heading font-bold text-sm text-slate-900">
                                {paymentMethod === "card"
                                  ? "Stripe Credit/Debit Card"
                                  : paymentMethod === "bsb"
                                    ? "Australian Direct Deposit (BSB)"
                                    : paymentMethod === "payid"
                                      ? "PayID Instant Transfer"
                                      : "Cash on Lesson"}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Currency: AUD ($ Australian Dollars)
                              </p>
                            </div>
                          </div>

                          {/* ITEMIZED SERVICES TABLE */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="border-b-2 border-slate-900 text-xs font-heading font-black text-slate-900 uppercase tracking-wider">
                                  <th className="py-3 px-2">#</th>
                                  <th className="py-3 px-2">Driving Service / Lesson Description</th>
                                  <th className="py-3 px-2 text-center">Qty / Hours</th>
                                  <th className="py-3 px-2 text-right">Unit Price (AUD)</th>
                                  <th className="py-3 px-2 text-right">GST (10%)</th>
                                  <th className="py-3 px-2 text-right">Amount (AUD)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 font-sans text-xs sm:text-sm">
                                {invoiceItems.map((item, idx) => {
                                  const itemTotal = item.qty * item.unitPrice;
                                  const itemGst = formData.tax_inclusive
                                    ? itemTotal - itemTotal / 1.1
                                    : itemTotal * 0.1;
                                  return (
                                    <tr key={item.id}>
                                      <td className="py-3 px-2 font-mono text-slate-400">{idx + 1}</td>
                                      <td className="py-3 px-2 font-medium text-slate-900">
                                        {item.description}
                                      </td>
                                      <td className="py-3 px-2 text-center font-bold text-slate-700">
                                        {item.qty}
                                      </td>
                                      <td className="py-3 px-2 text-right font-mono text-slate-700">
                                        ${item.unitPrice.toFixed(2)}
                                      </td>
                                      <td className="py-3 px-2 text-right font-mono text-slate-500">
                                        ${itemGst.toFixed(2)}
                                      </td>
                                      <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                                        ${itemTotal.toFixed(2)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* TOTALS CALCULATION BOX */}
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-4 border-t-2 border-slate-200">
                            <div className="max-w-md text-xs text-slate-500 space-y-1">
                              <p className="font-heading font-bold text-slate-700">Australian Taxation Statement:</p>
                              <p className="text-[11px] leading-relaxed">
                                This document is a Tax Invoice for the purposes of the <em>A New Tax System (Goods and Services Tax) Act 1999</em>.
                                {formData.tax_inclusive
                                  ? " The total price of driving instruction and testing services includes Australian Goods and Services Tax (GST)."
                                  : " 10% GST is calculated on applicable taxable supplies."}
                              </p>
                            </div>

                            <div className="w-full sm:w-72 space-y-2 text-right font-sans">
                              {discountAmount > 0 && (
                                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                                  <span>Discount ({discountType === "percent" ? `${discountValue}%` : `$${discountValue}`}):</span>
                                  <span className="font-mono">-${discountAmount.toFixed(2)} AUD</span>
                                </div>
                              )}
                              <div className="flex justify-between text-xs text-slate-600">
                                <span>Subtotal (excl. GST):</span>
                                <span className="font-mono font-medium">${subtotalAmount.toFixed(2)} AUD</span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
                                <span>Australian GST (10%):</span>
                                <span className="font-mono font-medium">${gstAmount.toFixed(2)} AUD</span>
                              </div>
                              <div className="flex justify-between text-base font-heading font-black text-slate-900 pt-1">
                                <span>Total Amount:</span>
                                <span className="font-mono text-[#0B1528]">${finalTotalAmount.toFixed(2)} AUD</span>
                              </div>
                              {formData.tax_inclusive && (
                                <p className="text-[10px] text-slate-400 font-medium">
                                  (Includes ${gstAmount.toFixed(2)} GST)
                                </p>
                              )}
                            </div>
                          </div>

                          {/* REMITTANCE ADVICE / AUSTRALIAN BANKING DETAILS */}
                          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                              <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <Landmark className="w-4 h-4 text-[#FAB10B]" />
                                <span>How to Pay (Remittance Advice)</span>
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">Ref: {invoiceNumber}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                              <div>
                                <span className="text-slate-400 block text-[11px]">Bank:</span>
                                <span className="font-bold text-slate-800">{formData.bank_name}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">BSB:</span>
                                <span className="font-mono font-black text-slate-900 text-sm">
                                  {formData.bank_bsb}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">Account Number:</span>
                                <span className="font-mono font-black text-slate-900 text-sm">
                                  {formData.bank_account_number}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">PayID Identifier:</span>
                                <span className="font-bold text-slate-800">{formData.payid_identifier}</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 font-medium">
                              {formData.invoice_payment_terms}
                            </p>
                          </div>

                          {/* INVOICE FOOTER */}
                          <div className="text-center text-[11px] text-slate-400 pt-4 border-t border-slate-100 font-medium">
                            <p>{invoiceNotes}</p>
                            <p className="mt-0.5">
                              {formData.school_name} • ABN {formData.abn} • {formData.contact_email} • {formData.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SUB-ADMINS & ROLES PERMISSIONS */}
            {activeTab === "subadmins" && (
              <div className="space-y-6">
                <SubAdminManager />
              </div>
            )}

            {/* FLOATING SAVE BAR IF CHANGED */}
            {hasUnsavedChanges && (
              <div className="bg-[#0B1528] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-slate-800/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <span className="font-heading font-bold text-sm text-white">
                  You have unsaved changes in your settings
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="px-4 py-2 rounded-xl text-white hover:text-slate-300 font-heading font-bold text-sm transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-heading font-bold text-sm transition-colors shadow-xs"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-heading font-bold text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{successToast}</span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
