import React from "react";
import { config } from "@/config";

export default function PrivacyPolicyPage() {
  const prompt = `Generate a comprehensive Privacy Policy for a web application with the following details:
- App Name: ${config.name}
- Company Name: [Insert your company name]
- Types of data collected: [e.g., email addresses, names, usage data]
- Purpose of data collection: [e.g., account creation, improving user experience]
- Data sharing practices: [e.g., third-party service providers, analytics]
- User rights: [e.g., access, correction, deletion of personal data]
- Data retention period: [e.g., as long as the account is active, X years after account closure]
- Security measures: [e.g., encryption, access controls]
- Use of cookies or similar technologies: [Yes/No, and for what purposes]
- International data transfers: [Yes/No, and to which countries if applicable]
- Age restrictions: [e.g., minimum age for using the service]
- Updates to the policy: [How users will be notified of changes]
- Contact information for privacy-related queries

Please structure the policy in clear sections, use plain language, and ensure compliance with GDPR and CCPA regulations.`;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy Generator</h1>
      <p className="mb-4">
        To generate a custom Privacy Policy for your application, please follow
        these steps:
      </p>
      <ol className="list-decimal list-inside mb-6">
        <li>Copy the prompt below</li>
        <li>Paste it into ChatGPT</li>
        <li>
          Fill in the missing details based on your specific application and
          requirements
        </li>
        <li>Review and edit the generated Privacy Policy as needed</li>
      </ol>
      <div className="bg-gray-100 p-4 rounded-md">
        <pre className="whitespace-pre-wrap">{prompt}</pre>
      </div>
      <p className="mt-6 text-sm text-gray-600">
        Note: While this AI-generated document can serve as a starting point,
        it&apos;s recommended to have a legal professional review the final
        version to ensure full compliance with all applicable laws and
        regulations.
      </p>
    </div>
  );
}
