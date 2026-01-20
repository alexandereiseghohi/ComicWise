"use client";

import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface PasswordStrengthMeterProps {
  /**
   * Password string to evaluate
   */
  password: string;
  /**
   * Callback when strength changes
   */
  onStrengthChange?(strength: PasswordStrength): void;
}

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

/**
 * Calculate password strength based on complexity rules
 * @param password
 */
function calculateStrength(password: string): PasswordStrength {
  if (!password) return "weak";

  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Complexity scoring
  if (/[a-z]/.test(password)) score += 1; // lowercase
  if (/[A-Z]/.test(password)) score += 1; // uppercase
  if (/\d/.test(password)) score += 1; // numbers
  if (/[!"#$%&'()*+,./:;<=>?@[\\\]^_{|}\-]/.test(password)) score += 1; // special chars

  if (score <= 2) return "weak";
  if (score <= 4) return "fair";
  if (score <= 5) return "good";
  return "strong";
}

/**
 * Get visual feedback for password strength
 * @param strength
 */
function getStrengthConfig(strength: PasswordStrength) {
  const configs = {
    weak: {
      color: "bg-destructive",
      label: "Weak",
      percent: 25,
      textColor: "text-destructive",
    },
    fair: {
      color: "bg-yellow-500",
      label: "Fair",
      percent: 50,
      textColor: "text-yellow-600",
    },
    good: {
      color: "bg-blue-500",
      label: "Good",
      percent: 75,
      textColor: "text-blue-600",
    },
    strong: {
      color: "bg-green-500",
      label: "Strong",
      percent: 100,
      textColor: "text-green-600",
    },
  };

  return configs[strength];
}

/**
 * Password Strength Meter Component
 * Displays visual feedback and requirements for password complexity
 *
 * @param root0
 * @param root0.password
 * @param root0.onStrengthChange
 * @example
 * ```tsx
 * const [password, setPassword] = useState("");
 *
 * return (
 *   <>
 *     <input
 *       type="password"
 *       value={password}
 *       onChange={(e) => setPassword(e.target.value)}
 *     />
 *     <PasswordStrengthMeter password={password} />
 *   </>
 * );
 * ```
 */
export function PasswordStrengthMeter({ password, onStrengthChange }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState<PasswordStrength>("weak");

  useEffect(() => {
    const newStrength = calculateStrength(password);
    setStrength(newStrength);
    onStrengthChange?.(newStrength);
  }, [password, onStrengthChange]);

  const config = getStrengthConfig(strength);

  // Password requirements
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letters", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letters", met: /[a-z]/.test(password) },
    { label: "Contains numbers", met: /\d/.test(password) },
    {
      label: "Contains special characters",
      met: /[!"#$%&'()*+,./:;<=>?@[\\\]^_{|}\-]/.test(password),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Password Strength:</span>
          <span className={`font-semibold ${config.textColor}`}>{config.label}</span>
        </div>
        <Progress value={config.percent} className="h-2" />
      </div>

      {/* Requirements Checklist */}
      {password && (
        <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
          <p className="font-medium">Requirements:</p>
          <ul className="space-y-1.5">
            {requirements.map((req) => (
              <li key={req.label} className="flex items-center gap-2">
                {req.met ? (
                  <CheckCircle2 className="size-4 text-green-600" />
                ) : (
                  <XCircle className="size-4 text-muted-foreground" />
                )}
                <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
                  {req.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips */}
      {!password && (
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>
            💡 Use a mix of uppercase, lowercase, numbers, and special characters for maximum
            security.
          </p>
        </div>
      )}
    </div>
  );
}
