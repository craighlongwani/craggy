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

export default function Revora() {
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
          INFODBM Course Project · August 2026
        </p>

        {/* Title */}
        <h1
          className={`mt-2 text-center text-lg md:text-2xl ${interFontBold.className}`}
        >
          Revora: Verified Onboarding for a Circular Material Exchange
        </h1>

        {/* Role */}
        <p className={`text-center opacity-60 text-sm ${interFont.className}`}>
          Lead Developer · Database &amp; Full-Stack
        </p>

        {/* Demo video */}
        <video
          src="/assets/projects/Revora/Revora-ssms-demo.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Revora database and admin dashboard demo"
          className="w-full h-auto rounded-lg border mt-5 border-black"
        />

        {/* Description + bullets: stacked on mobile, side-by-side on md+ */}
        <div
          className={`flex flex-col md:flex-row mt-5 gap-4 items-start ${interFont.className}`}
        >
          {/* Description */}
          <div className="flex-1">
            <p className="text-justify font-extralight text-sm md:text-base opacity-60">
              Revora connects waste generators with upcyclers so surplus
              materials go back into production instead of landfills. Before
              anyone can take part, the platform verifies them: each person or
              business registers with a government ID, businesses add a TIN and
              branch details, and an administrator approves or rejects the
              account.{" "}
              <br className="hidden md:block" />
              <br className="hidden md:block" />
              <span className="block mt-3 md:mt-0">
                I designed and built nearly all of it, including the SQL Server
                database, the Node.js and Express API, and most of the
                interface. My focus was putting the business rules and security
                in the database itself, so they hold no matter which application
                connects.
              </span>
            </p>
          </div>

          {/* Bullet list */}
          <div className="flex-1">
            <ul
              className={`list-none space-y-2 font-extralight text-sm md:text-base ${interFont.className}`}
            >
              {[
                "Designed a normalized 15-table schema and ER diagram, including a Region, Province, City, and Barangay address hierarchy",
                "Wrote registration as a single T-SQL transaction that saves the address, ID, branch, entity, and user records together or not at all",
                "Used triggers to hash passwords and write an audit log entry for every submission and status change",
                "Built a least-privilege security model with three SQL Server logins, explicit DENY rules, and Dynamic Data Masking on personal data",
                "Built the admin dashboard, with an approval queue, SLA flags, a review panel, and live counters",
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="opacity-60 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How it works */}
        <h2 className={`mt-6 text-sm md:text-base ${interFontBold.className}`}>
          How it works
        </h2>
        <ol
          className={`mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 ${interFont.className}`}
        >
          {[
            {
              step: "Register",
              text: "A seven-step form submits to sp_RegisterUser, which only the revora_api login can run. In one transaction it finds or creates the address and inserts the ID, branch, entity, and user rows, while triggers hash the password and log the submission.",
            },
            {
              step: "Review",
              text: "Administrators work through a pending queue where a SQL function flags each application as On Track, Due Soon, or Overdue. Only the revora_staff login can run the approval procedures, and every decision and note is written to the audit log.",
            },
            {
              step: "Secure",
              text: "Each login gets only the access it needs. An attempted DELETE as revora_api fails with SQL Server error 229, and the staff and API logins see masked emails, phone numbers, and ID numbers.",
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
            "SQL Server",
            "T-SQL",
            "SSMS",
            "Node.js",
            "Express",
            "JavaScript",
            "HTML/CSS",
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
          My biggest takeaway was treating the database as the last line of
          defense. Constraints, transactions, and permissions keep the data
          correct and private even if the application layer gets something
          wrong.
        </h2>

        {/* Repository is private, so no public link */}
        <h3 className={`text-right mt-5 text-sm opacity-60 ${interFont.className}`}>
          Source code available on request
        </h3>
      </motion.div>
    </motion.main>
  );
}
