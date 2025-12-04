import { SUPPORT_EMAIL } from "../../lib/constants";

export default function EmailComponent() {
  return (
    <a 
      href={`mailto:${SUPPORT_EMAIL}`}
      className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
    >
      {SUPPORT_EMAIL}
    </a>
  );
}