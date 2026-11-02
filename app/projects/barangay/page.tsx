"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Inter } from "next/font/google";

const interFontBold = Inter({
  subsets: ["latin"],
  weight: "800",
});

const interFont = Inter({
  weight: "300",
});

export default function Barangay() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full min-h-screen bg-black text-white flex justify-center py-10
      scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <motion.div
        className="relative w-[92vw] md:w-[75vw] lg:w-1/2 mt-6 md:mt-10 mb-10
          bg-gray-900 backdrop-blur-sm rounded-2xl
          p-4 md:p-5 lg:p-6 flex flex-col justify-between"
        whileHover={{ scale: 1.01 }}
        transition={{ ease: ["easeInOut"], stiffness: 300, damping: 20 }}
      >
        {/* Close: back to landing page */}
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute z-10 top-3 right-3 md:top-4 md:right-4 p-1.5 rounded-full
            opacity-60 hover:opacity-100 hover:bg-white/10 transition"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>

        {/* Event label */}
        <p
          className={`text-center opacity-60 text-xs md:text-sm ${interFont.className} tracking-widest uppercase`}
        >
          Barangay 43, Pasay City · July to August 2026
        </p>

        {/* Title */}
        <h1
          className={`mt-2 text-center text-lg md:text-2xl ${interFontBold.className}`}
        >
          Barangay Management System: Digital Records and Services for a Local
          Government Unit
        </h1>

        {/* Role */}
        <p className={`text-center opacity-60 text-sm ${interFont.className}`}>
          Full-Stack Developer · Documents, Households &amp; Security
        </p>

        {/* Demo video */}
        <video
          src="/assets/projects/BMS/BMS-contributions-demo.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Demo of my contributions to the Barangay Management System"
          className="w-full h-auto rounded-lg border mt-5 border-black"
        />

        {/* Description + bullets: stacked on mobile, side-by-side on md+ */}
        <div
          className={`flex flex-col md:flex-row mt-5 gap-4 items-start ${interFont.className}`}
        >
          {/* Description */}
          <div className="flex-1">
            <p className="text-justify font-extralight text-sm md:text-base opacity-60">
              A web system for Barangay 43, Zone 06 in Pasay City that replaces
              paper records with one place to manage residents, households,
              document requests, duty schedules, announcements, and reports.
              Staff sign in with role-based accounts, and every action is
              recorded in an audit trail.{" "}
              <br className="hidden md:block" />
              <br className="hidden md:block" />
              <span className="block mt-3 md:mt-0">
                I joined once the first version of the modules was in place and
                built the next phase on top of it: the official certificates
                and reports, the household succession rules, and fixes to
                security and the audit trail.
              </span>
            </p>
          </div>

          {/* Bullet list */}
          <div className="flex-1">
            <ul
              className={`list-none space-y-2 font-extralight text-sm md:text-base ${interFont.className}`}
            >
              {[
                "Designed five official certificate templates, from Barangay Clearance to Certificate of Guardianship, each rendered as a branded PDF",
                "Added an optional Punong Barangay e-signature, with a name and signature image that staff can update from the app",
                "Implemented household succession rules, promoting the secondary head automatically when the primary head is deactivated",
                "Fixed the audit trail so every change, login, and report export records the correct staff member",
                "Tightened access with admin-only pages, two role tiers, duplicate resident checks, and a 10-minute idle timeout",
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="opacity-60 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key features I built */}
        <h2 className={`mt-6 text-sm md:text-base ${interFontBold.className}`}>
          Key features I built
        </h2>
        <ol
          className={`mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 ${interFont.className}`}
        >
          {[
            {
              step: "Certificates & Reports",
              text: "Each document type has its own template with the barangay seal and details like the resident's relationship or years of cohabitation. I also built the cleanup drive attendance sheet and added the barangay header to the other report PDFs.",
            },
            {
              step: "Household Succession",
              text: "When a primary head is deactivated, the secondary head takes over automatically. Reactivated residents return as regular members, and a household left without a head shows a warning with a dialog to assign new heads.",
            },
            {
              step: "Security & Audit",
              text: "The audit log could not see users signed in with JWT, so I attached the signed-in user to every request and added login and export logging. Admin-only pages are now blocked, and admins cannot change their own role.",
            },
          ].map(({ step, text }, i) => (
            <li key={step} className="rounded-lg bg-black/40 p-3">
              <p className={`text-xs opacity-60 ${interFontBold.className}`}>
                {i + 1}. {step}
              </p>
              <p className="mt-1 text-sm font-extralight opacity-80">{text}</p>
            </li>
          ))}
        </ol>

        {/* Tech stack */}
        <ul className={`mt-5 flex flex-wrap gap-2 ${interFont.className}`}>
          {[
            "Python",
            "Django",
            "Django REST Framework",
            "MySQL",
            "React",
            "WeasyPrint",
            "django-auditlog",
          ].map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-white/20 px-3 py-1 text-xs opacity-80"
            >
              {tech}
            </li>
          ))}
        </ul>

        {/* Closing statement */}
        <h2
          className={`mt-5 text-justify font-extralight text-sm md:text-base opacity-60 ${interFont.className}`}
        >
          This project taught me to extend a system someone else started. Most
          of my work came from barangay stakeholder feedback, like the official
          certificate layouts and the rules for who heads a household, so I had
          to fit new requirements into models and screens that were already in
          use.
        </h2>

        {/* Repository is private, so no public link */}
        <h3 className={`text-right mt-5 text-sm opacity-60 ${interFont.className}`}>
          Source code available on request
        </h3>
      </motion.div>
    </motion.main>
  );
}
