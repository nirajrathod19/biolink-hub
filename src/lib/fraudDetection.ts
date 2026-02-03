// Fraud detection utilities for withdrawal requests

export interface FraudFlag {
  code: string;
  message: string;
  severity: "low" | "medium" | "high";
}

export interface FraudCheckResult {
  score: number; // 0-100, higher = more suspicious
  flags: FraudFlag[];
  isFlagged: boolean;
}

// Disposable email domains to flag
const DISPOSABLE_EMAIL_DOMAINS = [
  "tempmail.com", "throwaway.com", "guerrillamail.com", "mailinator.com",
  "10minutemail.com", "trashmail.com", "fakeinbox.com", "getnada.com",
  "temp-mail.org", "dispostable.com", "maildrop.cc", "yopmail.com",
  "sharklasers.com", "guerrillamail.info", "grr.la", "spam4.me",
  "tempail.com", "mohmal.com", "minuteinbox.com"
];

// Suspicious PayPal email patterns
const SUSPICIOUS_PATTERNS = [
  /^[a-z]{1,3}\d{5,}@/i, // Random letters + many numbers
  /test|fake|temp|dummy|spam/i,
  /\d{8,}@/, // Very long number sequence
];

export const checkPayPalEmail = (email: string): FraudFlag[] => {
  const flags: FraudFlag[] = [];
  const emailLower = email.toLowerCase();
  const domain = emailLower.split("@")[1] || "";

  // Check disposable email domains
  if (DISPOSABLE_EMAIL_DOMAINS.some(d => domain.includes(d))) {
    flags.push({
      code: "DISPOSABLE_EMAIL",
      message: "PayPal email uses a disposable email service",
      severity: "high",
    });
  }

  // Check suspicious patterns
  if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(emailLower))) {
    flags.push({
      code: "SUSPICIOUS_EMAIL_PATTERN",
      message: "PayPal email matches suspicious patterns",
      severity: "medium",
    });
  }

  // Check for mismatched domain (non-standard)
  const suspiciousDomains = ["protonmail.com", "tutanota.com", "mail.ru", "yandex.com"];
  if (suspiciousDomains.some(d => domain === d)) {
    flags.push({
      code: "ANONYMOUS_EMAIL_PROVIDER",
      message: "PayPal email uses an anonymous/privacy-focused provider",
      severity: "low",
    });
  }

  return flags;
};

export const checkWithdrawalAmount = (
  amount: number,
  walletBalance: number,
  previousWithdrawals: { amount: number; created_at: string }[]
): FraudFlag[] => {
  const flags: FraudFlag[] = [];

  // Check if withdrawing entire balance (potential exit scam)
  if (amount === walletBalance && amount > 50) {
    flags.push({
      code: "FULL_BALANCE_WITHDRAWAL",
      message: "Withdrawing entire wallet balance (100%)",
      severity: "medium",
    });
  }

  // Check for rapid successive withdrawals
  const recentWithdrawals = previousWithdrawals.filter(w => {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return new Date(w.created_at) > dayAgo;
  });

  if (recentWithdrawals.length >= 2) {
    flags.push({
      code: "RAPID_WITHDRAWALS",
      message: `${recentWithdrawals.length + 1} withdrawal requests in 24 hours`,
      severity: "high",
    });
  }

  // Check for unusually large withdrawal
  if (amount > 100) {
    flags.push({
      code: "LARGE_WITHDRAWAL",
      message: `Unusually large withdrawal amount ($${amount.toFixed(2)})`,
      severity: "low",
    });
  }

  return flags;
};

export const checkAccountAge = (
  createdAt: string,
  totalClicks: number
): FraudFlag[] => {
  const flags: FraudFlag[] = [];
  const accountAge = Date.now() - new Date(createdAt).getTime();
  const dayInMs = 24 * 60 * 60 * 1000;

  // New account (less than 7 days)
  if (accountAge < 7 * dayInMs) {
    flags.push({
      code: "NEW_ACCOUNT",
      message: "Account is less than 7 days old",
      severity: "medium",
    });
  }

  // Low engagement account
  if (totalClicks < 10) {
    flags.push({
      code: "LOW_ENGAGEMENT",
      message: `Account has very few clicks (${totalClicks})`,
      severity: "low",
    });
  }

  // Suspicious ratio - new account with high earnings
  if (accountAge < 14 * dayInMs && totalClicks > 500) {
    flags.push({
      code: "SUSPICIOUS_GROWTH",
      message: "New account with unusually high click count",
      severity: "high",
    });
  }

  return flags;
};

export const calculateFraudScore = (flags: FraudFlag[]): number => {
  let score = 0;
  
  flags.forEach(flag => {
    switch (flag.severity) {
      case "high":
        score += 30;
        break;
      case "medium":
        score += 15;
        break;
      case "low":
        score += 5;
        break;
    }
  });

  return Math.min(100, score);
};

export const runFraudCheck = (params: {
  paypalEmail?: string;
  amount: number;
  walletBalance: number;
  previousWithdrawals: { amount: number; created_at: string }[];
  accountCreatedAt: string;
  totalClicks: number;
}): FraudCheckResult => {
  const allFlags: FraudFlag[] = [];

  // Check PayPal email
  if (params.paypalEmail) {
    allFlags.push(...checkPayPalEmail(params.paypalEmail));
  }

  // Check withdrawal patterns
  allFlags.push(...checkWithdrawalAmount(
    params.amount,
    params.walletBalance,
    params.previousWithdrawals
  ));

  // Check account characteristics
  allFlags.push(...checkAccountAge(
    params.accountCreatedAt,
    params.totalClicks
  ));

  const score = calculateFraudScore(allFlags);

  return {
    score,
    flags: allFlags,
    isFlagged: score >= 30, // Flag if score is 30 or higher
  };
};
