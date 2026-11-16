import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  PawPrint,
  ArrowUpRight,
  Headset,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import { getCompanyContact } from "../../service/company-contact.service";
import type { CompanyContact } from "../../service/company-contact.service";

const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/MLPQZENcwCSn7iek9";
interface ContactCard {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  href: string;
  action: string;
  color: string;
  external?: boolean;
}

const normalizeUrl = (url: string): string => {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};

const Contact = () => {
  const [contact, setContact] = useState<CompanyContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchContactDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCompanyContact();

      setContact(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to load company contact details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactDetails();
  }, []);

  const contactCards: ContactCard[] = contact
    ? [
        {
          title: "Phone Number",
          value: contact.phone,
          description: "Call us for assistance",
          icon: Phone,
          href: `tel:${contact.phone.replace(/[^\d+]/g, "")}`,
          action: "Call Now",
          color: "bg-teal-50 text-[#269DA3]",
        },
        {
          title: "Email Address",
          value: contact.email,
          description: "Send us your inquiries",
          icon: Mail,

          // Opens Gmail compose window
          href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
            contact.email
          )}`,

          action: "Send Email",
          color: "bg-blue-50 text-blue-600",
          external: true,
        },
        ...(contact.website
          ? [
              {
                title: "Website",
                value: contact.website,
                description: "Explore our website",
                icon: Globe,
                href: normalizeUrl(contact.website),
                action: "Visit Website",
                color: "bg-purple-50 text-purple-600",
                external: true,
              },
            ]
          : []),
      ]
    : [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-6xl space-y-7">

        {/* Header */}
        <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#18365C] to-[#245B72] p-6 text-white shadow-md sm:p-9">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-teal-300">
              <PawPrint size={18} />
              PAWPATH CUSTOMER SUPPORT
            </div>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Contact Us
            </h1>

            <p className="mt-3 text-sm leading-7 text-blue-100 sm:text-base">
              We're always happy to help you and your furry friends.
              Get in touch with our team for assistance, inquiries,
              or more information about our pet care services.
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-teal-200">
              <Headset size={18} />
              We're here to help you!
            </div>
          </div>

          <PawPrint
            size={170}
            className="absolute -bottom-10 -right-7 text-white/10"
          />
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-[#269DA3]" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading contact information...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Mail size={25} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-800">
              Contact Details Unavailable
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {error}
            </p>

            <button
              onClick={fetchContactDetails}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#269DA3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#21878C]"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Contact Information */}
        {!loading && !error && contact && (
          <>
            {/* Company Introduction */}
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-[#269DA3]">
                  <PawPrint size={32} />
                </div>

                <div>
                  <p className="text-xs font-bold tracking-wider text-[#269DA3]">
                    GET IN TOUCH WITH
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-[#18365C]">
                    {contact.companyName}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Contact our team for information about pets,
                    training programs and our services.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Cards */}
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-[#18365C]">
                  Contact Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose your preferred way to contact us.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {contactCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}
                      >
                        <Icon size={23} />
                      </div>

                      <h3 className="mt-5 text-base font-bold text-[#18365C]">
                        {item.title}
                      </h3>

                      <p className="mt-2 break-all text-sm font-semibold text-slate-700">
                        {item.value}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.description}
                      </p>

                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={
                          item.external
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#269DA3] transition hover:text-[#18365C]"
                      >
                        {item.action}
                        <ArrowUpRight size={16} />
                      </a>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Address and Opening Hours */}
            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              {/* Address */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#269DA3]">
                    <MapPin size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#18365C]">
                      Our Location
                    </h3>

                    <p className="text-xs text-slate-400">
                      Visit our company
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {contact.address}
                </p>

                {/* Exact Google Maps Link */}
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-[#21878C] transition hover:bg-teal-100"
                >
                  Get Directions
                  <ExternalLink size={16} />
                </a>
              </div>

              {/* Opening Hours */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#18365C]/5 text-[#18365C]">
                    <Clock size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#18365C]">
                      Opening Hours
                    </h3>

                    <p className="text-xs text-slate-400">
                      When you can reach us
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold leading-7 text-slate-700">
                    {contact.openingHours}
                  </p>
                </div>

                <p className="mt-4 text-xs leading-6 text-slate-400">
                  Please contact us during our business hours
                  for assistance.
                </p>
              </div>
            </section>

            {/* Social Media */}
            {(contact.facebook || contact.instagram) && (
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-[#18365C]">
                    Connect With Us
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Follow PawPath on social media and stay connected.
                  </p>
                </div>
              </section>
            )}

            {/* Bottom Banner */}
            <section className="rounded-2xl bg-linear-to-r from-[#18365C] to-[#245B72] p-6 text-center text-white sm:p-8">
              <Headset
                size={30}
                className="mx-auto text-teal-300"
              />

              <h2 className="mt-3 text-xl font-bold">
                Need More Assistance?
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-blue-100">
                Our team is ready to help you with your questions
                about pets, training programs and PawPath services.
              </p>

              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                  contact.email
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#269DA3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#21878C]"
              >
                <Mail size={17} />
                Contact Our Team
                <ArrowUpRight size={16} />
              </a>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Contact;

