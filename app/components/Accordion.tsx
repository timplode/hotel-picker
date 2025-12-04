"use client";

import { useState } from "react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
}

export default function Accordion({ title, children, isOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(isOpen);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <h3 className="text-lg font-semibold text-black dark:text-white">
          {title}
        </h3>
        <span className="text-2xl text-zinc-500 dark:text-zinc-400">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-4">
          <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}