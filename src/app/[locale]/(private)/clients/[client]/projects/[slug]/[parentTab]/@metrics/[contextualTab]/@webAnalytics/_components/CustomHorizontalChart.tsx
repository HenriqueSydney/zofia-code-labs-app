import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Data = {
  name: string;
  value: number;
};

interface ICustomHorizontalChart {
  title: string;
  description: string;
  data: Data[];
}

export function CustomHorizontalChart({
  title,
  description,
  data,
}: ICustomHorizontalChart) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{item.name}</span>
                <span className="text-muted-foreground">
                  {item.value.toLocaleString()}
                </span>
              </div>
              <Progress
                value={item.value > 0 ? (item.value / total) * 100 : 0}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
