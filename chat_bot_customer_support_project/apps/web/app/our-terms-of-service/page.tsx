import React from "react";
import { config } from "@/config";

export default function TermsOfServicePage() {
  const prompt = `Create a comprehensive Terms of Service document for a web application with the following details:
- App Name: ${config.name}
- Company Name: [Insert your company name]
- Service description: [Brief description of what your app does]
- User registration requirements: [e.g., age restrictions, account creation process]
- User responsibilities: [e.g., providing accurate information, maintaining account security]
- Prohibited activities: [e.g., illegal use, unauthorized access, content restrictions]
- Intellectual property rights: [Your company's rights and user-generated content policies]
- Payment terms (if applicable): [Pricing, billing cycles, refund policies]
- Termination clauses: [Conditions under which you may terminate user accounts]
- Limitation of liability: [Your legal protections and disclaimers]
- Dispute resolution: [e.g., arbitration, jurisdiction for legal proceedings]
- Modifications to the service: [Your right to modify or discontinue the service]
- Changes to the terms: [How and when you may update these terms]
- Governing law: [Which country/state laws apply]
- Contact information for legal notices

Please structure the document in clear sections, use plain language, and ensure it's comprehensive enough to protect your business legally.`;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service Generator</h1>
      <p className="mb-4">
        To generate custom Terms of Service for your application, please follow
        these steps:
      </p>
      <ol className="list-decimal list-inside mb-6">
        <li>Copy the prompt below</li>
        <li>Paste it into ChatGPT</li>
        <li>
          Fill in the missing details based on your specific application and
          requirements
        </li>
        <li>Review and edit the generated Terms of Service as needed</li>
      </ol>
      <div className="bg-gray-100 p-4 rounded-md">
        <pre className="whitespace-pre-wrap">{prompt}</pre>
      </div>
      <p className="mt-6 text-sm text-gray-600">
        Note: While this AI-generated document can serve as a starting point,
        it&apos;s recommended to have a legal professional review the final
        version to ensure it adequately protects your business and complies with
        all applicable laws.
      </p>
    </div>
  );
}
