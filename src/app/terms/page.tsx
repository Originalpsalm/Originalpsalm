import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of GURU.",
};

const CONTACT = "support@gurupoint.ng";
const UPDATED = "14 August 2026";

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated={UPDATED}
      intro="These Terms of Service (“Terms”) govern your use of GURU (“GURU”, “we”, “us”, “our”), an exam-preparation app for Nigerian students. By creating an account or using GURU, you agree to these Terms. If you do not agree, please do not use GURU."
    >
      <LegalSection heading="1. Who can use GURU">
        <p>
          GURU is intended for students preparing for Nigerian examinations. You may create an
          account if you can form a binding agreement under Nigerian law.
        </p>
        <p>
          <span className="font-semibold text-chalk">If you are under 18</span>, you may only use
          GURU with the knowledge and consent of a parent or guardian, who accepts these Terms on
          your behalf and is responsible for your use of the app. A parent or guardian may contact
          us at any time to review or remove a child&apos;s account.
        </p>
      </LegalSection>

      <LegalSection heading="2. Your account">
        <p>
          Each account is personal to one student. You are responsible for keeping your password
          safe and for everything done through your account. To protect against account sharing,
          GURU limits how many devices may be signed in at once and how many different devices an
          account may use within a period; unusual activity may temporarily lock an account.
        </p>
        <p>
          You agree to provide accurate information and to keep it up to date. Do not impersonate
          anyone or use another person&apos;s account.
        </p>
      </LegalSection>

      <LegalSection heading="3. What GURU is — and is not">
        <p>
          GURU is an independent study aid that provides practice past questions, worked answers,
          timed practice and study groups. GURU is a learning tool only.
        </p>
        <p>
          <span className="font-semibold text-chalk">
            GURU is not affiliated with, endorsed by, or connected to WAEC, JAMB, NECO, NABTEB
          </span>{" "}
          or any examination body. “WAEC”, “JAMB”, “NECO”, “NABTEB” and related names are the
          property of their respective owners and are used here only to describe the examinations
          our practice materials relate to.
        </p>
        <p>
          We work to keep questions and answers accurate, but we do not guarantee that any material
          is error-free, current, or that it will appear in any real examination. GURU does not
          guarantee any examination result, admission, or grade. Your results depend on your own
          effort.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <p>You agree not to:</p>
        <p>
          • share your login or let others use your account; • copy, resell, scrape, or
          redistribute GURU&apos;s questions or content; • upload or send unlawful, abusive,
          harassing, or misleading content in study groups; • attempt to break, overload, or gain
          unauthorised access to the app or other users&apos; data; • use GURU for anything illegal
          or that infringes another person&apos;s rights.
        </p>
        <p>
          We may remove content and suspend or close accounts that break these rules or put other
          users at risk.
        </p>
      </LegalSection>

      <LegalSection heading="5. Premium subscriptions and payments">
        <p>
          Some features require a paid Premium subscription. Prices are shown in the app in Nigerian
          Naira. Payments are processed securely by our payment partner (Paystack); we do not store
          your card details.
        </p>
        <p>
          Premium is sold for a fixed period (for example, one month) and does not renew
          automatically — you choose to renew. Access continues until the end of the period you paid
          for. We may change prices or plans from time to time; changes do not affect a period you
          have already paid for.
        </p>
        <p>
          Because Premium unlocks digital content immediately, payments are generally
          non-refundable, except where a refund is required by law or where you were charged in
          error or could not access what you paid for. If something went wrong with a payment,
          contact us at {CONTACT} and we will look into it.
        </p>
      </LegalSection>

      <LegalSection heading="6. Content you post">
        <p>
          You keep ownership of the messages and content you post in study groups. By posting, you
          allow us to store and display that content to other members of the same group so the
          feature can work. You are responsible for what you post, and you must have the right to
          post it. We may moderate or remove content and are not responsible for content posted by
          other users.
        </p>
      </LegalSection>

      <LegalSection heading="7. Our content">
        <p>
          The GURU app, its design, logo, text, and practice materials are owned by us or our
          licensors and are protected by law. You may use them only to study on GURU for your own
          personal, non-commercial use. You may not copy, distribute, or create competing products
          from our content.
        </p>
      </LegalSection>

      <LegalSection heading="8. Suspension and closing accounts">
        <p>
          We may suspend or close an account that breaks these Terms, is used for account sharing or
          abuse, or where we are required to by law. You may close your account at any time; when an
          account is deleted, its data is removed as described in our Privacy Policy (some records,
          such as payment records, may be kept where the law requires).
        </p>
      </LegalSection>

      <LegalSection heading="9. Disclaimers">
        <p>
          GURU is provided “as is” and “as available”. To the fullest extent allowed by law, we make
          no warranties of any kind about the app or its content, including that it will be
          uninterrupted, secure, error-free, or fit for a particular purpose. You use GURU at your
          own discretion and risk.
        </p>
      </LegalSection>

      <LegalSection heading="10. Limitation of liability">
        <p>
          To the fullest extent allowed by law, GURU and its operators will not be liable for any
          indirect or consequential loss, or for loss of grades, admission, opportunity, data, or
          profit, arising from your use of (or inability to use) GURU. Where we are found liable,
          our total liability to you will not exceed the amount you paid us in the three (3) months
          before the event giving rise to the claim. Nothing in these Terms limits any liability
          that cannot be limited under Nigerian law.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes">
        <p>
          We may update GURU and these Terms from time to time. If we make an important change, we
          will update the “Last updated” date and, where appropriate, tell you in the app.
          Continuing to use GURU after a change means you accept the updated Terms.
        </p>
      </LegalSection>

      <LegalSection heading="12. Governing law">
        <p>
          These Terms are governed by the laws of the Federal Republic of Nigeria, and the Nigerian
          courts will have jurisdiction over any dispute, without affecting any right you have as a
          consumer under mandatory law.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact us">
        <p>
          Questions about these Terms? Email us at{" "}
          <span className="font-semibold text-chalk">{CONTACT}</span>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
