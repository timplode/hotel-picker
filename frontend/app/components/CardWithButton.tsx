interface CardWithButtonProps {
  title: string;
  body?: string;
  buttonText: string;
  buttonHref: string;
}

const CardWithButton = ({ title, body, buttonText, buttonHref }: CardWithButtonProps) => (
  <div className="bg-neutral-primary-soft block max-w-sm p-6 border border-default rounded-base shadow-xs rounded-b-md">
     <h6 className="mb-3 text-xl font-semibold tracking-tight text-heading leading-6">{title}</h6>
    <p className="text-body mb-6">{body}</p>
    <a 
      href={buttonHref} 
      className="inline-flex items-center text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
    >
      {buttonText}
      <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
      </svg>
    </a>
  </div>
);

export default CardWithButton;