import { SUPPORT_PHONE } from "../../lib/constants";

export default function PhoneComponent() {
  return (
    <a 
      href={`tel:${SUPPORT_PHONE}`}
      className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
    >
      {SUPPORT_PHONE}
    </a>
  );
}