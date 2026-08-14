import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export const metadata = {
  title: "Privacy Policy",
  description: "How GURU collects, uses and protects your personal data.",
};

const CONTACT = "support@gurupoint.ng";
const UPDATED = "14 August 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated={UPDATED}
      intro="This Privacy Policy explains what personal data GURU collects, why we collect it, who we share it with, and the rights you have. We handle your data in line with the Nigeria Data Protection Act, 2023 (NDPA). By using GURU, you agree to this policy."
    >
      <LegalSection heading="1. Who we are">
        <p>
          GURU is an exam-preparation app for Nigerian students. For the purposes of the NDPA, GURU
          (the operator of this app) is the data controller of the personal data described here. You
          can reach us at <span className="font-semibold text-chalk">{CONTACT}</span>.
        </p>
      </LegalSection>

      <LegalSection heading="2. Data we collect">
        <p>
          <span className="font-semibold text-chalk">Account details</span> — your name, username,
          email address, password (stored only in a securely hashed form, never in plain text), and
          optionally your phone number, school, class, state, and a profile picture if you add one.
        </p>
        <p>
          <span className="font-semibold text-chalk">Your activity</span> — the practice papers and
          tests you attempt, your scores and progress, and messages you send in study groups.
        </p>
        <p>
          <span className="font-semibold text-chalk">Device and sign-in information</span> — a device
          label (e.g. “Chrome on Android”), your approximate IP address, and session times. We use
          this to keep your account secure and to prevent account sharing.
        </p>
        <p>
          <span className="font-semibold text-chalk">Payment records</span> — when you buy Premium,
          we keep a record of the transaction (reference, amount, date, plan). Payments are handled
          by Paystack; we do not see or store your card or bank details.
        </p>
      </LegalSection>

      <LegalSection heading="3. Why we use your data">
        <p>
          We use your data to: provide and run the app; show your progress and results; run study
          groups; keep accounts secure and prevent login sharing; process Premium payments; send you
          account emails such as password resets and email confirmation; provide support; and meet
          our legal obligations.
        </p>
      </LegalSection>

      <LegalSection heading="4. Our legal basis (NDPA)">
        <p>
          We rely on: your <span className="font-semibold text-chalk">consent</span> (which you give
          when you create an account and can withdraw); the{" "}
          <span className="font-semibold text-chalk">performance of our agreement</span> with you (to
          give you the service you signed up for); and our{" "}
          <span className="font-semibold text-chalk">legitimate interests</span> in keeping the
          platform safe and preventing abuse — balanced against your rights.
        </p>
      </LegalSection>

      <LegalSection heading="5. Who we share data with">
        <p>We do not sell your personal data. We share it only with trusted providers who help us run GURU:</p>
        <p>
          • <span className="font-semibold text-chalk">Paystack</span> — to process payments
          securely. • <span className="font-semibold text-chalk">Resend</span> — to send account
          emails (like password resets and confirmation links). •{" "}
          <span className="font-semibold text-chalk">Our hosting provider</span> — to store the app
          and its database on secure servers.
        </p>
        <p>
          We may also disclose data if required by law, to protect our rights or the safety of
          users, or as part of a business transfer — in which case we will protect your data as
          described here.
        </p>
      </LegalSection>

      <LegalSection heading="6. How we protect your data">
        <p>
          We take reasonable steps to protect your data: passwords are stored using strong one-way
          hashing, data is sent over encrypted (HTTPS) connections, sessions use secure cookies, and
          access to accounts is limited. No system is perfectly secure, but we work to keep your data
          safe and to fix problems quickly.
        </p>
      </LegalSection>

      <LegalSection heading="7. How long we keep it">
        <p>
          We keep your data for as long as your account is active. If you delete your account (or ask
          us to), we remove your personal data, except for limited records we are required to keep by
          law, such as payment records for tax and accounting.
        </p>
      </LegalSection>

      <LegalSection heading="8. Your rights">
        <p>Under the NDPA, you have the right to:</p>
        <p>
          • access the personal data we hold about you; • ask us to correct data that is wrong; • ask
          us to delete your data; • withdraw your consent at any time; • object to or restrict
          certain uses; • ask for a copy of your data in a portable form; and • complain to the
          Nigeria Data Protection Commission (NDPC) if you believe we have mishandled your data.
        </p>
        <p>
          To use any of these rights, email us at{" "}
          <span className="font-semibold text-chalk">{CONTACT}</span>. You can also update your
          profile or delete your account from within the app.
        </p>
      </LegalSection>

      <LegalSection heading="9. Children and students">
        <p>
          Many GURU users are secondary-school students who may be under 18. If you are under 18, you
          should use GURU only with a parent or guardian&apos;s consent. A parent or guardian may
          contact us to review, correct, or delete their child&apos;s data. We collect only the data
          needed to provide the study service and do not knowingly use children&apos;s data for
          advertising.
        </p>
      </LegalSection>

      <LegalSection heading="10. Cookies">
        <p>
          GURU uses only essential cookies — a secure sign-in cookie that keeps you logged in, and a
          device cookie that helps prevent account sharing. We do not use advertising or third-party
          tracking cookies.
        </p>
      </LegalSection>

      <LegalSection heading="11. Where your data is stored">
        <p>
          Your data is stored on secure servers operated by our hosting provider, which may be
          located outside Nigeria. Where data is transferred abroad, we take steps to ensure it
          remains protected to a standard consistent with the NDPA.
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes to this policy">
        <p>
          We may update this policy from time to time. We will change the “Last updated” date above
          and, for important changes, tell you in the app. Please check back so you stay informed.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact us">
        <p>
          For any privacy question or request, email{" "}
          <span className="font-semibold text-chalk">{CONTACT}</span>. If you are not satisfied with
          our response, you may contact the Nigeria Data Protection Commission (NDPC).
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
