import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
} from "@/components/ui/table";
import { date } from "@/lib/dayjs";
import { CheckCircle2, Clock, GitBranch, XCircle, Loader2 } from "lucide-react";
import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

interface ICICDTable {
  slug: string;
}

export async function CICDTable({ slug }: ICICDTable) {
  // 1. Coleta os dados do cache (contendo latestRuns do GitHubService)
  const metrics = await getCachedGitHubMetrics(slug);
  const runs = metrics.pipeline.latestRuns;

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">Últimas Execuções</CardTitle>
        <CardDescription className="text-gray-400">
          GitHub Actions workflows detectados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-400">Workflow</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Duração</TableHead>
              <TableHead className="text-gray-400 text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.length > 0 ? (
              runs.map((run: any) => (
                <TableRow
                  key={run.id}
                  className="border-gray-800 hover:bg-gray-800/30"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-white truncate max-w-[200px]">
                        {run.name}
                      </p>
                      <p className="text-xs text-gray-500">por {run.author}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {run.status === "success" || run.status === "completed" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 border hover:bg-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Sucesso
                      </Badge>
                    ) : run.status === "in_progress" ||
                      run.status === "queued" ? (
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 border hover:bg-blue-500/20">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Em curso
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 border hover:bg-rose-500/20">
                        <XCircle className="w-3 h-3 mr-1" />
                        Falhou
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-300 text-sm">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {/* Formata segundos para MM:SS */}
                      {Math.floor(run.duration / 60)}m{" "}
                      {Math.floor(run.duration % 60)}s
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-gray-400 text-sm">
                    {date(run.createdAt).fromNow()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-gray-500"
                >
                  Nenhuma execução de workflow encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
