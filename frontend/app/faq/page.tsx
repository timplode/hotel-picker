import Link from "next/link";
import Accordion from "../components/Accordion";
import EmailComponent from "../components/EmailComponent";
import PhoneComponent from "../components/PhoneComponent";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Find answers to common questions about hotel reservations and our platform.
          </p>
        </div>

        <div className="space-y-4">
          <Accordion title="What if I have a disability and cannot use this website?" isOpen={true}>
            <p>Please contact Unified Event Solutions directly at <EmailComponent/> or <PhoneComponent/>. 
                We will be happy to help you enter your information into the website.
            </p>
          </Accordion>
          
          <Accordion title="What is this website for?">
            <p>Organizing a conference with thousands of students is complicated. 
               The people in charge of your conference have contracted with Unified Event Solutions (UES) to help.
               UES reserved large blocks of hotel rooms near the conference location at special rates.
               This website allows your chapter to request rooms in those blocks.
               UES will collect those requests and forward them to the hotels.
            </p>
          </Accordion>
          
          <Accordion title="Do I need to make payment at time of reservation?">
            <p>A credit card is required to be on file to hold your rooms. 
                The card will not be charged at the time you make your reservation.
            </p>
          </Accordion>
          
          <Accordion title="What if I was not given a Conference Pass Code?">
            <p>The Pass Code should be available on HOSA's website, HOSA.org 
            </p>
          </Accordion>
          
          <Accordion title="What if I don't know the name of everyone in our group?">
            <p>If you do not yet know the names of everyone in your group, please add the primary contact that will be on-site
                for the hotel check-in and responsible for each of the rooms. The systems uses the number and type of person 
                that will be in a room to set room-type that will be chosen. If you plan on having four students in a room, please
                use additional placeholder names to populate the fields so the system gives you the correct room type.
            </p>
          </Accordion>
          
          <Accordion title="What happens if my organization does not have a credit card?">
            <p>All hotels require a credit card to confirm the reservation. The card will not be charged at the time of booking.
                It is possible that special accommodations can be arranged if this is not an option for your group. Please call our office. 
            </p>
          </Accordion>
          
          <Accordion title="Can I use a debit card instead of a credit card?">
            <p>Each hotel's policies regarding room payment are different. 
                As a general rule, hotels withdrawal deposits from debit cards to guarantee funds are on hand for the stay. 
                If you are using a debit card and concerned about hotel payment policies, 
                please contact our office for assistance.
            </p>
          </Accordion>
          
          <Accordion title="Should I use my personal credit card?">
            <p>If you are planning on paying via check, 
                your personal credit card may be used to place a hold on rooms. Most hotels will not send you an invoice
                that is tax exempt without payment on-file from the tax exempt entity.
            </p>
          </Accordion>
          
          <Accordion title="My organization is tax exempt, how do I get my invoice updated?">
            <p>Each hotel's process for getting a tax exempt invoice is different. 
                Please check the details of your hotel on the hotel page in the booking process.
            </p>
          </Accordion>
          
          <Accordion title="What if I don't have my tax exemption certificate now?">
            <p>
                A tax exemption certification is not required to submit your room reservation.
                If you do not submit the tax exemption, the hotel invoice will include tax.
                You may submit your tax exemption to the hotel at a later date and they can update your bill.
            </p>
          </Accordion>
          
          <Accordion title="Who should I put as the contact person for the hotel?">
            <p>You should put the person who will be on-site for the conference to check in the rooms.
            </p>
          </Accordion>
          
          <Accordion title="Can I specify that a room needs a King bed? Or two beds?">
            <p>For student groups, the majority of the rooms that we block are rooms with two beds. 
                A small number of rooms may be kings with a sofa bed, 
                and a handful of rooms are single bed kings. 
                We determine what room type is assigned to who with the goal of getting everyone their own bed. 
                This means that all rooms with more than one person will likely be in a room with two beds. 
                If your group ends up assigned to a room with a bed and a pullout sofa, 
                it is because that was the only option available in the block. 
                Chaperone rooms with only one occupant will be assigned a single king room, 
                if a king room is available.
            </p>
          </Accordion>
          <Accordion title="What if a member of my group has special needs at the hotel?">
        <p>There is a place to enter a message to the hotel when you enter your rooming list. Please give us the details in this field
            Any requests will be forwarded to the hotel.
        </p>
    </Accordion>
    <Accordion title="Can I get the exact price my organization will pay?">
        <p>UES makes its best effort to give an accurate estimate of charges at the time of booking.
            In the event of a discrepancy between our price estimate and the actual charges from the hotel, the actual charges from the 
            hotel will prevail. After confirming your booking with your credit card, you should get an accurate invoice from the Hotel.
        </p>
    </Accordion>
    <Accordion title="How do I contact Unified Event Solutions?">
        <p>You may email us at <EmailComponent/>, or call our office at <PhoneComponent/> M-F 9am-5pm Central Time.
        </p>
    </Accordion>
    <Accordion title="What do I do if the website isn't working properly?">
        <p>Please call our office at <PhoneComponent/> so we can address the issue.
        </p>
    </Accordion>
    <Accordion title="I have submitted my request on the website.  What happens next?">
        <p>Please call our office at <PhoneComponent/> so one of our customer service representatives can confirm your room reservation.
        </p>
    </Accordion>
        </div>

        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Still have questions?
          </h3>
          <p className="text-blue-800 dark:text-blue-200">
            If you can't find the answer you're looking for, please contact your event organizer or system administrator for further assistance.
          </p>
        </div>
      </main>
    </div>
  );
}