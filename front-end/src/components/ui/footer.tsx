import React from "react";

import { IssuesForm } from "../forms";
import TosModal from "../forms/tos";
import Contact from "./alerts/contact";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-darkMode fixed bottom-0 left-0 right-0 mt-5 hidden max-h-10 w-full flex-row items-center justify-around border-t border-t-gray-300 bg-opacity-90 p-2 text-gray-600 backdrop-blur-md dark:text-gray-300 sm:flex">
      <div className="flex items-center text-center">
        <a href="https://laurel.k12.mt.us" target="_blank">
          © {year} Laurel Public Schools
        </a>
      </div>
      <span>
        <IssuesForm />
      </span>
      <span className="mx-2">
        <TosModal />
      </span>
      <span>
        <Contact />
      </span>
      <div className="right-0 text-center">
        <a
          href="https://github.com/biohackerellie/OpenFacilities"
          target="_blank"
        >
          Powered by Open Facilities
        </a>
      </div>
    </footer>
  );
}
