// apps/web/app/legal/privacy-policy/page.tsx
/**
 * Static Privacy Policy Page
 */

export const metadata = {
    title: "Privacy Policy | Audit Gen",
    description: "Privacy Policy for Audit Gen",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 prose prose-slate dark:prose-invert">
            <h1>Audit Gen - Privacy Policy</h1>
            <p><strong>Version:</strong> 1.0</p>
            <p><strong>Effective Date:</strong> July 25, 2026</p>

            <h2>1. Introduction</h2>
            <p>
                100 Hours Productions  ("Company", "we", "us", "our") operates Audit Gen ("Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
            <p>
                By using the Service, you consent to the collection and use of information in accordance with this Privacy Policy.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We may collect different types of information for various purposes.</p>
            <ul>
                <li><strong>Information You Provide Directly:</strong>
                    <ul>
                        <li><strong>Account Information:</strong> When you register for an account (e.g., via Clerk), we may collect your name and email address.</li>
                        <li><strong>Payment Information:</strong> When you subscribe, payment details (processed securely by Paystack) are collected by Paystack, not stored directly by us.</li>
                    </ul>
                </li>
                <li><strong>Information Retrieved from Connected Services (QuickBooks Online):</strong>
                    <ul>
                        <li>As detailed in our Data Authorization Policy, upon connecting your QuickBooks Online account, we access specific data types within your QuickBooks Online company file (e.g., transactions, accounts, customers, vendors) solely for diagnostic analysis.<strong>We do not store your QuickBooks Online login credentials.</strong> </li>
                    </ul>
                </li>
                <li><strong>Automatically Collected Information:</strong>
                    <ul>
                        <li><strong>Usage Data:</strong> We may collect information about how you interact with the Service (e.g., pages visited, time spent).</li>
                        <li><strong>Log Data:</strong> When you access the Service, we may log information such as your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other statistics. This may be collected via server logs or analytics tools.</li>
                        <li><strong>Device Information:</strong> Information about the device you use to access the Service (e.g., operating system, browser).</li>
                    </ul>
                </li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for various purposes:</p>
            <ul>
                <li>To provide and maintain the Service: Including authenticating you, managing your account, and delivering the diagnostic features.</li>
                <li>To perform data analysis and diagnostics: To analyze your QuickBooks Online data as authorized, generate reports, and provide insights.</li>
                <li>To improve the Service: To monitor performance, identify trends, and improve the functionality and user experience.</li>
                <li>To communicate with you: To send you updates, notifications, and respond to your requests.</li>
                <li>To comply with legal obligations: To fulfill our legal duties and comply with applicable laws.</li>
            </ul>

            <h2>4. Sharing Your Information</h2>
            <p>We may share your information in the following situations:</p>
            <ul>
                <li><strong>With Service Providers:</strong> We may share your information with trusted third-party service providers who perform services on our behalf (e.g., payment processing via Paystack, hosting, analytics, customer support). These providers are contractually obligated to maintain the confidentiality and security of your data and are prohibited from using it for any other purpose.</li>
                <li><strong>With QuickBooks Online (Intuit):</strong> Access to your QuickBooks Online data occurs via secure API calls as authorized by you through OAuth 2.0.</li>
                <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., court orders, government agencies).</li>
                <li><strong>With Your Consent:</strong> We may share your information with or without  your explicit consent.</li>
            </ul>

            <h2>5. Data Retention</h2>
            <ul>
                <li><strong>Account Data:</strong> We retain your account information (name, email) as long as your account is active or as needed to provide the Service.</li>
                <li><strong>QuickBooks Online Data:</strong> Data retrieved from your QuickBooks Online account is retained as long as your connection to the Service is active and your account exists. Upon disconnection or account deletion, this data is deleted from our systems according to our data retention and deletion policies (as outlined in the Data Authorization Policy).</li>
                <li><strong>Payment Data:</strong> Payment details are handled and retained by Paystack according to their own policies.</li>
                <li><strong>Log Data:</strong> Log data is retained for operational and security purposes for a limited period.</li>
            </ul>

            <h2>6. Security of Your Information</h2>
            <p>
                We implement appropriate technical and organizational security measures designed to protect the security of your Personal Data both during transmission and once received by our systems. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>

            <h2>7. Links to Other Sites</h2>
            <p>
                Our Service may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
                Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
            </p>

            <h2>9. Changes to This Privacy Policy</h2>
            <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date". You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>

            <h2>10. Contact Us</h2>
            <p>
                <strong>If you have any questions about these Terms, please contact us at.</strong>

                <a href="mailto:auditgenhours@gmail.com">
                    auditgenhours@gmail.com
                </a>
            </p>
        </div>
    );
}