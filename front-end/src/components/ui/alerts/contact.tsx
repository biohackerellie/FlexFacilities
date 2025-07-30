import React from "react";

import { Button } from "../buttons/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

export default function Contact() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        {/* <Button variant="link" className="text-gray-400 dark:text-gray-300"> */}
        Contact Us
        {/* </Button> */}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-300 bg-opacity-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Have questions regarding a reservation or the reservation process?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          <p className="text-center text-lg font-medium text-black">
            Contact the Activities Director at: <br />
            <a
              className="hover:text-blue-500"
              href="mailto:lpsactivities@laurel.k12.mt.us"
            >
              lpsactivities@laurel.k12.mt.us
            </a>{" "}
            <br />
            or call the Laurel High School Office:
            <br />
            <a className="hover:text-blue-500" href="tel:406-628-3500">
              406-628-3500
            </a>
            .
          </p>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
