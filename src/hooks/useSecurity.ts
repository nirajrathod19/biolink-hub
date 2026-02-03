import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LockoutStatus {
  locked: boolean;
  remaining_minutes?: number;
  failed_attempts?: number;
  message?: string;
  recent_failed_attempts?: number;
  max_attempts?: number;
  attempts_remaining?: number;
}

interface RecordAttemptResult {
  locked?: boolean;
  locked_until?: string;
  attempts_remaining?: number;
  message?: string;
  success?: boolean;
}

interface SecurityStats {
  failed_attempts_24h: number;
  locked_accounts: number;
  recent_events: Array<{
    id: string;
    user_id: string | null;
    event_type: string;
    event_data: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    success: boolean;
    created_at: string;
  }>;
  flagged_ips: Array<{ ip: string; attempts: number }>;
}

export const useCheckLockout = () => {
  return useMutation({
    mutationFn: async (email: string): Promise<LockoutStatus> => {
      const { data, error } = await supabase.functions.invoke("security-check", {
        body: { action: "check_lockout", email },
      });

      if (error) throw error;
      return data;
    },
  });
};

export const useRecordLoginAttempt = () => {
  return useMutation({
    mutationFn: async ({
      email,
      success,
      failure_reason,
    }: {
      email: string;
      success: boolean;
      failure_reason?: string;
    }): Promise<RecordAttemptResult> => {
      const { data, error } = await supabase.functions.invoke("security-check", {
        body: { action: "record_attempt", email, success, failure_reason },
      });

      if (error) throw error;
      return data;
    },
  });
};

export const useLogSecurityEvent = () => {
  return useMutation({
    mutationFn: async ({
      event_type,
      event_data,
      user_id,
      success = true,
    }: {
      event_type: string;
      event_data?: Record<string, unknown>;
      user_id?: string;
      success?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke("security-check", {
        body: { action: "log_event", event_type, event_data, user_id, success },
      });

      if (error) throw error;
      return data;
    },
  });
};

export const useSecurityStats = () => {
  return useQuery({
    queryKey: ["security-stats"],
    queryFn: async (): Promise<SecurityStats> => {
      const { data, error } = await supabase.functions.invoke("security-check", {
        body: { action: "get_stats" },
      });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Use at least 8 characters");
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include lowercase letters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include uppercase letters");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include numbers");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include special characters (!@#$%^&*)");
  }

  // Check for common patterns
  const commonPatterns = [
    /^password/i,
    /^123/,
    /^qwerty/i,
    /^admin/i,
    /^letmein/i,
    /^welcome/i,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push("Avoid common password patterns");
  }

  return {
    score,
    feedback,
    isStrong: score >= 4 && password.length >= 8,
  };
};

// Session security helpers
export const getDeviceFingerprint = (): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("fingerprint", 2, 2);
  }
  
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
    canvas.toDataURL(),
  ].join("|");

  // Simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};
