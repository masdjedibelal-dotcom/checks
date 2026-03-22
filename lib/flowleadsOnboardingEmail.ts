import {
  buildOnboardingEmail,
  buildOnboardingEmailSubject,
  type OnboardingEmailParams,
} from "@/lib/flowleadsEmail";

export type { OnboardingEmailParams };

export function buildOnboardingEmailHtml(p: OnboardingEmailParams): string {
  return buildOnboardingEmail(p).html;
}

export function onboardingEmailSubject(slug: string): string {
  return buildOnboardingEmailSubject(slug);
}
