import { Card, CardContent } from "@/components/ui/card";
import {
  checkPasswordStrength,
  PasswordStrength,
} from "@/utils/checkPasswordStrength";
import { cn } from "@/utils/twMerge";

const strengthColors: Record<PasswordStrength, string> = {
  "Muito fraca": "bg-red-500",
  Fraca: "bg-orange-500",
  Média: "bg-yellow-500",
  Forte: "bg-green-500",
  Excelente: "bg-emerald-600",
};

const strengthLevels: Record<PasswordStrength, number> = {
  "Muito fraca": 20,
  Fraca: 40,
  Média: 60,
  Forte: 80,
  Excelente: 100,
};

type Props = {
  password: string;
};

export function PasswordStrengthBar({ password }: Props) {
  const strength = checkPasswordStrength(password);
  const width = strengthLevels[strength.label];
  const color = strengthColors[strength.label];

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <div className="w-full h-2 rounded-full bg-muted relative overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", color)}
            style={{ width: `${width}%` }}
          />
        </div>

        <p className="text-sm mt-2 font-medium text-muted-foreground">
          Força da senha:{" "}
          <span className="font-semibold text-foreground">
            {strength.label}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
