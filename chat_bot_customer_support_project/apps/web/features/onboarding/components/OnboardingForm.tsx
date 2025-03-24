"use client";

import { User } from "@supabase/supabase-js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import { Loader2, Check } from "lucide-react";
import { DatabaseFunctions, OrganizationGoal } from "@repo/supabase";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  organization: z.object({
    name: z
      .string()
      .min(2, "Organization name must be at least 2 characters")
      .max(50),
    billing_email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Billing email is required"),
  }),
  brand: z.object({
    name: z.string().min(2, "Brand name must be at least 2 characters").max(50),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  }),
  roleType: z.enum([
    "support_team_member",
    "support_team_manager",
    "sales_representative",
    "business_owner",
    "developer",
    "marketing_specialist",
    "other",
  ] as const),
  goals: z
    .array(
      z.enum([
        "customer_support",
        "sales_automation",
        "lead_generation",
        "personalized_responses",
        "multilingual_support",
        "reduce_response_time",
        "knowledge_management",
        "other",
      ] as const)
    )
    .min(1)
    .max(3),
  referralSource: z
    .enum([
      "google_search",
      "friend_colleague",
      "influencer",
      "newsletter",
      "ads",
      "community",
      "podcast",
      "cant_remember",
    ] as const)
    .optional(),
});

const STEPS = [
  {
    id: "organization",
    title: "Let's create your company",
    description: null,
  },
  {
    id: "brand",
    title: "Tell us about your brand",
    description: "This is your first brand within the organization",
  },
  {
    id: "roleType",
    title: "What describes you best?",
    description: "Choose the most accurate role.",
  },
  {
    id: "goals",
    title: "What are your top goals?",
    description: "Select up to 3 options.",
  },
  {
    id: "referralSource",
    title: "Where did you hear about us?",
    description: null,
  },
];

type FormSchema = z.infer<typeof formSchema>;
type RoleType = FormSchema["roleType"];
type GoalType = FormSchema["goals"][number];
type ReferralType = NonNullable<FormSchema["referralSource"]>;

const ROLE_OPTIONS: Array<{ value: RoleType; label: string }> = [
  { value: "support_team_member", label: "I'm a support team member" },
  { value: "support_team_manager", label: "I manage a support team" },
  { value: "sales_representative", label: "I'm a sales representative" },
  { value: "business_owner", label: "I own a business" },
  { value: "developer", label: "I'm a developer" },
  { value: "marketing_specialist", label: "I'm a marketing specialist" },
  { value: "other", label: "Other" },
];

const GOAL_OPTIONS: Array<{ value: GoalType; label: string }> = [
  {
    value: "customer_support",
    label: "Improve customer support efficiency",
  },
  {
    value: "sales_automation",
    label: "Automate sales conversations",
  },
  {
    value: "lead_generation",
    label: "Generate and qualify leads",
  },
  { value: "personalized_responses", label: "Provide personalized responses" },
  { value: "multilingual_support", label: "Offer multilingual support" },
  {
    value: "reduce_response_time",
    label: "Reduce customer response time",
  },
  {
    value: "knowledge_management",
    label: "Improve knowledge management",
  },
  { value: "other", label: "Other" },
];

const REFERRAL_OPTIONS: Array<{ value: ReferralType; label: string }> = [
  { value: "google_search", label: "Searched on Google" },
  { value: "friend_colleague", label: "Friend / colleague" },
  { value: "influencer", label: "Influencer" },
  { value: "newsletter", label: "Newsletter" },
  { value: "ads", label: "Ads" },
  { value: "community", label: "Community" },
  { value: "podcast", label: "Podcast" },
  { value: "cant_remember", label: "Can't remember" },
];

interface OnboardingFormProps {
  user: User;
}

export function OnboardingForm({ user }: OnboardingFormProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: {
        name: "",
        billing_email: user.email || "",
      },
      brand: {
        name: "",
        website: "",
      },
      goals: [],
      roleType: undefined,
      referralSource: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const progress = ((step + 1) / STEPS.length) * 100;

  const onSubmit = async (values: FormSchema) => {
    try {
      if (!user?.id) {
        toast.error("User ID is missing");
        return;
      }

      const supabase = createClient();

      const rpcParams: DatabaseFunctions["create_organization"]["Args"] = {
        p_name: values.organization.name.trim(),
        p_billing_email: values.organization.billing_email.trim(),
        p_user_id: user.id,
        p_team_name: values.brand.name.trim(),
        p_team_website:
          values.brand.website && values.brand.website.trim() !== ""
            ? values.brand.website.trim()
            : undefined,
        p_onboarding_role: values.roleType,
        p_goals: values.goals,
        p_referral_source: values.referralSource || undefined,
      };

      const { error, data } = await supabase.rpc(
        "create_organization",
        rpcParams
      );

      if (error) {
        console.error("Error creating organization:", error);
        toast.error(error.message || "Failed to create organization");
        return;
      }

      if (!data) {
        toast.error("Failed to create organization - no data returned");
        return;
      }

      toast.success("Organization created successfully");
      router.push(`/org`);
    } catch (err) {
      console.error("Error in onSubmit:", err);
      toast.error("An unexpected error occurred");
    }
  };

  async function nextStep() {
    const currentStepId = STEPS[step].id as keyof FormSchema;
    const isValid = await form.trigger(currentStepId);

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  }

  function previousStep() {
    setStep((prev) => Math.max(prev - 1, 0));
  }
  return (
    <Card
      className="w-full max-w-md mx-auto mt-12"
      data-testid="onboarding-welcome"
    >
      <CardHeader className="space-y-8 px-8 pt-8">
        <Progress value={progress} className="h-2" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-center">
            {STEPS[step].title}
          </h2>
          {STEPS[step].description && (
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mt-2">
              {STEPS[step].description}
            </p>
          )}
        </motion.div>
      </CardHeader>
      <CardContent className="px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
            id="onboarding-form"
            data-testid="onboarding-form"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 && (
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="organization.name"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <div>
                            <FormLabel className="text-base font-semibold">
                              Company name
                            </FormLabel>
                            <FormDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                              This is how your company will be displayed across
                              the platform
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Enter your company name"
                              {...field}
                              className="h-12 text-lg px-4"
                              data-testid="org-name-input"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organization.billing_email"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <div>
                            <FormLabel className="text-base font-semibold">
                              Billing email
                            </FormLabel>
                            <FormDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                              We'll send invoices and billing-related
                              communications to this email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="billing@company.com"
                              {...field}
                              className="h-12 text-lg px-4"
                              data-testid="billing-email-input"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="brand.name"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <div>
                            <FormLabel className="text-base font-semibold">
                              Brand name
                            </FormLabel>
                            <FormDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                              Name of your first brand within the organization
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Enter your brand name"
                              {...field}
                              className="h-12 text-lg px-4"
                              data-testid="brand-name-input"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand.website"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <div>
                            <FormLabel className="text-base font-semibold">
                              Brand website
                            </FormLabel>
                            <FormDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                              Optional: Enter your brand's website URL
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://yourbrand.com"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value || "");
                              }}
                              className="h-12 text-lg px-4"
                              data-testid="brand-website-input"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-4 mt-6">
                      {ROLE_OPTIONS.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="roleType"
                          render={({ field }) => (
                            <FormItem>
                              <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <Button
                                  type="button"
                                  variant={
                                    field.value === option.value
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={cn(
                                    "w-full justify-between text-left h-14 hover:bg-secondary/80 px-6",
                                    field.value === option.value &&
                                      "bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-500"
                                  )}
                                  onClick={() => field.onChange(option.value)}
                                  data-testid={`role-${option.value}`}
                                >
                                  {option.label}
                                  {field.value === option.value && (
                                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  )}
                                </Button>
                              </motion.div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2 mt-6">
                      {GOAL_OPTIONS.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="goals"
                          render={({ field }) => (
                            <FormItem>
                              <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <Button
                                  type="button"
                                  variant={
                                    field.value?.includes(option.value)
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={cn(
                                    "w-full justify-between text-left h-14 hover:bg-secondary/80 px-6",
                                    field.value?.includes(option.value) &&
                                      "bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-500"
                                  )}
                                  onClick={() => {
                                    const current = field.value || [];
                                    const updated = current.includes(
                                      option.value
                                    )
                                      ? current.filter(
                                          (v) => v !== option.value
                                        )
                                      : current.length < 3
                                        ? [...current, option.value]
                                        : current;
                                    field.onChange(updated);
                                  }}
                                  data-testid={`goal-${option.value}`}
                                >
                                  {option.label}
                                  {field.value?.includes(option.value) && (
                                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  )}
                                </Button>
                              </motion.div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-2 mt-6">
                      {REFERRAL_OPTIONS.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="referralSource"
                          render={({ field }) => (
                            <FormItem>
                              <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <Button
                                  type="button"
                                  variant={
                                    field.value === option.value
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={cn(
                                    "w-full justify-between text-left h-14 hover:bg-secondary/80 px-6",
                                    field.value === option.value &&
                                      "bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-500"
                                  )}
                                  onClick={() => field.onChange(option.value)}
                                  data-testid={`referral-${option.value}`}
                                >
                                  {option.label}
                                  {field.value === option.value && (
                                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  )}
                                </Button>
                              </motion.div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between px-8 pb-8 pt-6">
        <AnimatePresence>
          {step > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={isSubmitting}
                data-testid="prev-button"
              >
                Previous
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn("ml-auto", step === 0 && "w-full")}
        >
          {step === STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={async () => {
                const isValid = await form.trigger();
                if (isValid) {
                  const formValues = form.getValues();
                  await onSubmit(formValues);
                } else {
                  toast.error(
                    "Please ensure all required fields are filled correctly"
                  );
                }
              }}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90"
              data-testid="submit-button"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Complete Setup
            </Button>
          ) : (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90"
              data-testid="next-button"
            >
              Continue
            </Button>
          )}
        </motion.div>
      </CardFooter>
    </Card>
  );
}
