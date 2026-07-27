// apps/web/app/legal/terms-of-service/page.tsx
/**
 * Static Terms of Service Page
 */

export const metadata = {
    title: "Terms of Service | Audit Gen",
    description: "Terms of Service for Audit Gen",
};

export default function TermsOfServicePage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 prose prose-slate dark:prose-invert">
            <h1>Audit Gen - Terms of Service</h1>
            <p><strong>Version:</strong> 1.0</p>
            <p><strong>Effective Date:</strong> July 25, 2026</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
                By accessing or using Audit Gen ("Service"), operated by 100 Hours Productions  ("Company", "we", "us", "our"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
                Audit Gen provides a diagnostic tool that connects to your QuickBooks Online (QuickBooks Online) account(s) to analyze financial data, identify potential discrepancies or risks ("Issues"), and generate reports and health scores. The Service offers both limited free features and premium features accessible via subscription.
            </p>

            <h2>3. Eligibility</h2>
            <p>
                You must be at least 18 years old or the age of majority in your jurisdiction to use this Service.
            </p>

            <h2>4. Account Registration and Security</h2>
            <ul>
                <li><strong>Registration:</strong> Access to certain features of the Service may require creating an account. You agree to provide accurate, current, and complete information during registration and update it as necessary.</li>
                <li><strong>Security:</strong> You are responsible for safeguarding your account credentials and for any activities or actions taken under your account. Notify us immediately of any unauthorized access or breach of security.</li>
                <li><strong>Clerk Integration:</strong> Authentication is managed by Clerk. By using the Service, you agree to Clerk's terms of service for authentication services.</li>
            </ul>

            <h2>5. Data Access and Authorization</h2>
            <ul>
                <li><strong>QuickBooks Online Connection:</strong> To use the core diagnostic features, you must connect your QuickBooks Online account. This connection is facilitated via secure OAuth 2.0 protocols provided by Intuit.</li>
                <li><strong>Authorization Scope:</strong> Your authorization permits the Service to access specific data types within your QuickBooks Online company file as detailed in our Data Authorization Policy. This includes financial records, customer/vendor information, and company metadata.</li>
                <li><strong>Purpose:</strong> The retrieved data is used solely for the purposes outlined in our Data Authorization Policy: diagnostic analysis, issue identification, reporting, and operational necessity.</li>
                <li><strong>Ownership:</strong> You retain ownership of all data within your QuickBooks Online account. Our access is limited to the scope granted by you and governed by this agreement and our Data Authorization Policy.</li>
                <li><strong>Revocation:</strong> You can revoke the Service's access to your QuickBooks Online account at any time by disconnecting the connection within the Service or via your QuickBooks Online account settings.</li>
            </ul>

            <h2>6. Subscription and Payment</h2>
            <ul>
                <li><strong>Premium Access:</strong> Full diagnostic capabilities (unlimited audits, detailed findings) require an active subscription.</li>
                <li><strong>Payment Processing:</strong> Subscriptions are processed securely by Paystack. You agree to Paystack's terms of service for payment processing.</li>
                <li><strong>Pricing:</strong> Subscription fees are as displayed on the Service at the time of purchase. Prices are subject to change upon prior notice.</li>
                <li><strong>Billing:</strong> Recurring billing occurs according to the selected subscription plan. You are responsible for all applicable taxes.</li>
                <li><strong>Cancellation:</strong> You can cancel your subscription via the Service or Paystack. Cancellation takes effect at the end of the current billing period.</li>
                <li><strong>Refunds:</strong> Refund eligibility is determined by our refund policy (if applicable) and Paystack's policies.</li>
            </ul>

            <h2>7. Use of the Service</h2>
            <ul>
                <li><strong>License:</strong> Subject to these Terms, you are granted a limited, non-exclusive, non-transferable license to use the Service for your internal business purposes.</li>
                <li><strong>Acceptable Use:</strong> You agree not to misuse the Service or help anyone else do so. This includes, but is not limited to:
                    <ul>
                        <li>Violating laws or regulations.</li>
                        <li>Violating the QuickBooks Online Acceptable Use Policy or API Terms.</li>
                        <li>Attempting to gain unauthorized access to the Service or its systems.</li>
                        <li>Using the Service to harm others (e.g., uploading malicious data).</li>
                        <li>Interfering with the normal operation of the Service.</li>
                    </ul>
                </li>
                <li><strong>Prohibited Uses:</strong> The Service is intended for legitimate financial health monitoring. Using it for fraudulent or illegal activities is strictly prohibited.</li>
            </ul>

            <h2>8. Intellectual Property</h2>
            <ul>
                <li><strong>Ownership:</strong> The Service, including its software, structure, organization, and algorithms (excluding your data), are owned by Audit Gen and are protected by intellectual property laws.</li>
                <li><strong>Restrictions:</strong> You may not copy, modify, distribute, sell, or reverse engineer any aspect of the Service without explicit written permission.</li>
            </ul>

            <h2>9. Data and Content</h2>
            <ul>
                <li><strong>Your Data:</strong> As stated in our Data Authorization Policy, your financial data retrieved from QuickBooks Online remains yours. We access it only as authorized.</li>
                <li><strong>Generated Reports:</strong> Diagnostic reports and health scores generated by the Service based on your data are provided to you. However, the underlying algorithms and methodologies used to generate them remain our intellectual property.</li>
                <li><strong>Aggregated Data:</strong> We may use aggregated, anonymized data (not identifying individual users or companies) for analytics, improving the Service, and research purposes.</li>
            </ul>

            <h2>10. Disclaimers and Limitations of Liability</h2>
            <ul>
                <li><strong>As Is:</strong> The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</li>
                <li><strong>Accuracy:</strong> While we strive for accuracy, the diagnostic findings are based on data analysis and rules. They are not a substitute for professional financial advice or auditing. Always verify findings independently.</li>
                <li><strong>Limitation of Liability:</strong> To the fullest extent permitted by law, Audit Gen shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (i) your use or inability to use the Service; (ii) any unauthorized access to or use of our servers and/or any personal information stored therein; (iii) any interruption or cessation of transmission to or from the Service; (iv) any bugs, viruses, trojan horses, or the like that may be transmitted to or through the Service by any third party; (v) any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available through the Service.</li>
                <li><strong>Maximum Liability:</strong> Our total liability to you for any claim arising out of or relating to these Terms or the Service shall not exceed the amount you paid to us for the Service in the twelve (12) months preceding the event giving rise to the claim.</li>
            </ul>

            <h2>11. Indemnification</h2>
            <p>
                You agree to defend, indemnify, and hold harmless Audit Gen and its officers, directors, employees, agents, licensors, and suppliers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service, including, but not limited to, your submission of any Content that infringes the rights of a third party.
            </p>

            <h2>12. Termination</h2>
            <ul>
                <li><strong>By You:</strong> You may stop using the Service at any time.</li>
                <li><strong>By Us:</strong> We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, and with or without notice.</li>
                <li><strong>Effect of Termination:</strong> Upon termination, your right to access and use the Service will cease. Data associated with your account may be deleted according to our data retention policy.</li>
            </ul>

            <h2>13. Governing Law</h2>
            <p>
                These Terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
            </p>

            <h2>14. Changes to Terms</h2>
            <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. Your continued use of the Service after any such changes constitutes acceptance of the new Terms.
            </p>

            <h2>15. Contact Us</h2>
            <p>
                <strong>If you have any questions about these Terms, please contact us at.</strong>
            </p>
            <a href="mailto:auditgenhours@gmail.com">
                auditgenhours@gmail.com
            </a>
        </div>
    );
}