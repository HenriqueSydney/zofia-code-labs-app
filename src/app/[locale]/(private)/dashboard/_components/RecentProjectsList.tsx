import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRecentProjectsAction } from "@/actions/stats/getRecentProjectsAction";
import { date } from "@/lib/dayjs";

export async function RecentProjectsList() {
  const { data: projects } = await getRecentProjectsAction();

  if (!projects) return null;

  // Helpers para Badges
  const getStatusVariant = (status: string) => {
    const map: Record<
      string,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      COMPLETED: "default",
      IN_PROGRESS: "secondary",
      PLANNED: "outline",
      CANCELLED: "destructive",
    };
    return map[status] || "secondary";
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "ON_TRACK":
        return "bg-green-500";
      case "AT_RISK":
        return "bg-yellow-500";
      case "OFF_TRACK":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Projetos Recentes</CardTitle>
        <CardDescription>Últimas atualizações na carteira.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projeto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Orçamento</TableHead>
              <TableHead className="text-center">Início</TableHead>
              <TableHead className="text-center">Conclusão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={project.client.logo || ""}
                        alt={project.client.value}
                      />
                      <AvatarFallback>
                        {project.client.value.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {project.name.value}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {project.client.value}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={getStatusVariant(project.status.value)}
                      className="w-fit text-[10px] px-2 py-0"
                    >
                      {project.status.value.replace("_", " ")}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div
                        className={`h-2 w-2 rounded-full ${getHealthColor(project.status.health)}`}
                      />
                      <span className="capitalize">
                        {project.status.health.toLowerCase().replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {project.budget.value}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {project.date.original
                    ? date(project.date.original).format("DD/MM/YYYY")
                    : "--"}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {project.date.endDate
                    ? date(project.date.endDate).format("DD/MM/YYYY")
                    : "---"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
