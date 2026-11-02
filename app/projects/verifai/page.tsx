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

export default function VerifAI() {
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
          HackFest GDG Loyola · March 2026
        </p>

        {/* Title */}
        <h1
          className={`mt-2 text-center text-lg md:text-2xl ${interFontBold.className}`}
        >
          VerifAI: AI-Powered Source Verification for Student Research Papers
        </h1>

        {/* Role */}
        <p className={`text-center opacity-60 text-sm ${interFont.className}`}>
          Lead Developer · Backend &amp; AI Integration
        </p>

        {/* Demo video */}
        <video
          src="/assets/projects/VerifAI/VerifAI-demo-loop.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="VerifAI demo"
          className="w-full h-auto rounded-lg border mt-5 border-black"
        />

        {/* Description + bullets: stacked on mobile, side-by-side on md+ */}
        <div
          className={`flex flex-col md:flex-row mt-5 gap-4 items-start ${interFont.className}`}
        >
          {/* Description */}
          <div className="flex-1">
            <p className="text-justify font-extralight text-sm md:text-base opacity-60">
              At HackFest GDG Loyola, my team built VerifAI, a research
              assistant prototype set inside a Google Docs style editor. A
              student highlights a claim in their paper, and the tool finds
              related peer-reviewed literature, checks that each source exists,
              and shows where the paper supports or contradicts the claim.{" "}
              <br className="hidden md:block" />
              <br className="hidden md:block" />
              <span className="block mt-3 md:mt-0">
                I led development of the backend and AI integration, covering
                the Flask server, the Gemini and CrossRef pipeline, and the
                credibility rubric. My teammates focused on the interface and
                visual design.
              </span>
            </p>
          </div>

          {/* Bullet list */}
          <div className="flex-1">
            <ul
              className={`list-none space-y-2 font-extralight text-sm md:text-base ${interFont.className}`}
            >
              {[
                "Built the Flask backend and a server-side proxy for the Gemini API, so the API key never reaches the browser",
                "Designed a two-step source check: Gemini suggests papers, then parallel CrossRef lookups confirm each DOI, title, and author list",
                "Developed the 100-point credibility rubric, which scores each source on recency and relevance",
                "Wrote the technical documentation, including data flow diagrams, use cases, and the SRS",
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
              step: "Discover",
              text: "Gemini returns candidate papers for the highlighted claim. The backend verifies each one against CrossRef and falls back to a Google Scholar search when no match is found.",
            },
            {
              step: "Ground",
              text: "The student pastes the paper's text. Gemini labels the result as an exact match, a related passage, or a contradiction of the claim.",
            },
            {
              step: "Review",
              text: "Relevant passages are highlighted in the paper by color, alongside the rubric verdict, an APA citation, and a synthesis paragraph.",
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
            "Flask",
            "Gemini 2.5 Flash",
            "CrossRef API",
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
          The main lesson I took from this project was how to make LLM output
          dependable: rather than trusting the model&apos;s answers directly, I
          validated them against an authoritative source before showing them to
          the user.
        </h2>

        {/* GitHub link */}
        <h3 className={`text-right mt-5 text-sm ${interFont.className}`}>
          <Link href="https://github.com/renzoboyy/Verifork" target="_blank">
            View on GitHub
          </Link>
        </h3>
      </motion.div>
    </motion.main>
  );
}