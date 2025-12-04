"use client";

import { useState, useEffect } from "react";
import { isPasscode } from "../lib/validate";
import { filterPasscode } from "../lib/filter";

export default function Home() {
  const [passcode, setPasscode] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Check for passcode in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlPasscode = urlParams.get('passcode');
    
    if (urlPasscode) {
      // Filter and validate the URL passcode
      const filteredValue = filterPasscode(urlPasscode)
      setPasscode(filteredValue);

      
      // Validate the passcode
      const valid = isPasscode(filteredValue);
      setIsValid(valid);
    }
  }, []);

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filteredValue = filterPasscode(e.target.value);
    setPasscode(filteredValue);
    setIsValid(isPasscode(filteredValue));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-heading md:text-5xl lg:text-6xl">Unified Event Solutions</h1>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Enter Passcode to get started.
          </h1>
          <div className="w-full max-w-md">
            <input
              type="text"
              value={passcode}
              onChange={handlePasscodeChange}
              placeholder="Enter 6-letter passcode"
              maxLength={6}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none text-black dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400 ${
                passcode.length === 0 
                  ? 'border-gray-300 dark:border-zinc-600 focus:ring-blue-500' 
                  : isValid 
                    ? 'border-green-500 dark:border-green-500 focus:ring-green-500' 
                    : 'border-red-500 dark:border-red-500 focus:ring-red-500'
              }`}
            />
            {passcode.length > 0 && !isValid && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Passcode must be exactly 6 letters (a-z)
              </p>
            )}
            {passcode.length > 0 && isValid && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                Valid passcode ✓
              </p>
            )}
          </div>
          <button
            disabled={!isValid || passcode.length === 0}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 transition-colors md:w-[158px] ${
              isValid && passcode.length > 0
                ? 'bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-zinc-700 dark:text-zinc-400'
            }`}
            onClick={() => {
              if (isValid && passcode.length > 0) {
                // Handle valid passcode submission here
                console.log('Valid passcode entered:', passcode);
              }
            }}
          >
            Get Started
          </button>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Don't have a passcode? {" "}
            <a href="/faq" className="font-medium text-zinc-950 dark:text-zinc-50 hover:underline">
              Check our FAQ
            </a>
            {" "} for help getting started.
          </p>
           {/*  <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Questions
          </a> */}
        </div>
      </main>
    </div>
  );
}
