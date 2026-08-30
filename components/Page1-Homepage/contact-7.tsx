"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropdown } from "@/components/Elements/dropdown";
import { submitContact } from "@/app/actions/contact";
import { cn } from "@/lib/utils";

type EnquiryOption = { value: string; label: string };

const fieldClasses =
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function SubmitButton({ text }: { text?: string }) {
  const t = useTranslations("Home");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t("contact.sending") : (text ?? t("contact.buttonText"))}
    </Button>
  );
}

export function Contact7({
  subheading,
  heading,
  nameLabel = "Full Name",
  namePlaceholder,
  emailLabel = "Email Address",
  emailPlaceholder,
  phoneLabel = "Phone Number",
  phonePlaceholder,
  enquiryLabel = "Enquiry Type",
  enquiryPlaceholder = "Select an enquiry type",
  enquiryOptions = [],
  messageLabel = "Message",
  messagePlaceholder,
  agreementText,
  buttonText = "Send Message",
}: {
  subheading?: string;
  heading?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  enquiryLabel?: string;
  enquiryPlaceholder?: string;
  enquiryOptions?: EnquiryOption[];
  messageLabel?: string;
  messagePlaceholder?: string;
  agreementText?: string;
  buttonText?: string;
}) {
  const [state, formAction] = useFormState(submitContact, {});

  return (
    <section id="contact" className="relative overflow-hidden border-t border-zinc-200 bg-white py-16 sm:py-24">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e7e5e4 1px, transparent 1px),
            linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
        {subheading ? (
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {subheading}
          </p>
        ) : null}
        {heading ? (
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            {heading}
          </h2>
        ) : null}

        <form action={formAction} className="mt-10 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={nameLabel} htmlFor="contact-name">
              <Input id="contact-name" name="name" placeholder={namePlaceholder} required />
            </Field>
            <Field label={emailLabel} htmlFor="contact-email">
              <Input
                id="contact-email"
                name="email"
                type="email"
                placeholder={emailPlaceholder}
                required
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={phoneLabel} htmlFor="contact-phone">
              <Input
                id="contact-phone"
                name="phone"
                type="tel"
                placeholder={phonePlaceholder}
                required
              />
            </Field>
            <Field label={enquiryLabel} htmlFor="contact-enquiry">
              <Dropdown
                options={enquiryOptions}
                name="enquiry"
                defaultValue=""
                placeholder={enquiryPlaceholder}
                title="Enquiry type"
              />
            </Field>
          </div>

          <Field label={messageLabel} htmlFor="contact-message">
            <textarea
              id="contact-message"
              name="message"
              placeholder={messagePlaceholder}
              required
              rows={5}
              className={cn(
                fieldClasses,
                "h-auto min-h-[120px] resize-y py-2.5 leading-7",
              )}
            />
          </Field>

          {agreementText ? (
            <label className="flex items-start gap-2.5 text-sm text-zinc-600">
              <input
                type="checkbox"
                name="agreement"
                required
                className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600"
              />
              <span>{agreementText}</span>
            </label>
          ) : null}

          {state.error ? (
            <p className="text-sm font-medium text-red-600">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="text-sm font-medium text-emerald-700">{state.success}</p>
          ) : null}

          <div className="pt-1">
            <SubmitButton text={buttonText} />
          </div>
        </form>
      </div>
    </section>
  );
}
