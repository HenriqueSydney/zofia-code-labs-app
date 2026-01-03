"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  LayoutDashboard,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  ListChecks,
  Flag,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import ClientsProjectsctivityLog from "./components/ClientsProjectsActivityLog";

// --- Componentes de Estilo para substituir o Shadcn Chart ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            {payload.map((item: any, index: number) => (
              <span
                key={index}
                className="font-bold text-muted-foreground"
                style={{ color: item.color }}
              >
                {item.name}: {item.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// --- Dados ---

const backlogEvolutionData = [
  { month: "Jan", planned: 45, completed: 40 },
  { month: "Fev", planned: 52, completed: 48 },
  { month: "Mar", planned: 48, completed: 51 },
  { month: "Abr", planned: 60, completed: 54 },
  { month: "Mai", planned: 55, completed: 30 },
  { month: "Jun", planned: 65, completed: 45 },
];

const projectStatusData = [
  { name: "Negociação", value: 5, color: "hsl(var(--chart-3))" },
  { name: "Não Iniciado", value: 3, color: "hsl(var(--chart-4))" },
  { name: "Em Andamento", value: 12, color: "hsl(var(--chart-1))" },
  { name: "Concluído", value: 8, color: "hsl(var(--chart-2))" },
];

const clientBlockers = [
  { id: 1, title: "Envio de Logos em Alta Resolução", priority: "Alta" },
  { id: 2, title: "Aprovação do Fluxo de Checkout", priority: "Média" },
  { id: 3, title: "Credenciais de Produção (Gateway)", priority: "Crítica" },
  { id: 5, title: "Documentação de API Externa", priority: "Alta" },
  { id: 6, title: "Definição de Cores de Marca", priority: "Baixa" },
  { id: 7, title: "Validação de Termos de Uso", priority: "Crítica" },
  { id: 8, title: "Revisão de Textos Legais", priority: "Média" },
  { id: 9, title: "Upload de Base de Dados", priority: "Alta" },
];

export default function ClientMacroDashboard() {
  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          label="Projetos Ativos"
          mainInformation="05"
          Icon={LayoutDashboard}
        />
        <StatsCard
          label="Manutenção & Suporte"
          mainInformation="05"
          Icon={Wrench}
        />
        <StatsCard
          label="Ações Pendentes"
          mainInformation="03"
          Icon={ListChecks}
        />
        <StatsCard
          label="Cobranças em Atraso"
          mainInformation="02"
          Icon={AlertTriangle}
        />
        <StatsCard
          label="Próxima Entrega"
          mainInformation="15/Jan"
          Icon={Flag}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Evolução de Entregas */}
        <Card className="lg:col-span-2 h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Evolução das Entregas</CardTitle>
              <CardDescription>
                O que foi planejado vs. o que de fato entregamos.
              </CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={backlogEvolutionData}
                margin={{ left: -20, right: 10 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Line
                  name="Previsto"
                  dataKey="planned"
                  type="monotone"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--chart-2))" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  name="Entregue"
                  dataKey="completed"
                  type="monotone"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--chart-1))" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Componente: Aguardando Definição (Blockers) */}
        <Card className="border-orange-500/20 bg-orange-500/5 h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-5 w-5" /> Aguardando Você
            </CardTitle>
            <CardDescription>
              {clientBlockers.length} ações necessárias para não atrasar o
              cronograma.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1 pr-4 custom-scrollbar">
            <ul className="space-y-4">
              {clientBlockers.map((blocker) => (
                <li
                  key={blocker.id}
                  className="flex items-center justify-between gap-1 border-b pb-4 last:border-0"
                >
                  <span className="text-sm font-medium">{blocker.title}</span>
                  <Badge
                    variant="outline"
                    className="w-fit text-[10px] uppercase"
                  >
                    {blocker.priority}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Pizza: Pipeline */}
        <Card className="flex flex-col h-[530px]">
          <CardHeader>
            <CardTitle>Pipeline de Projetos</CardTitle>
            <CardDescription>Status atual da carteira</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <div style={{ width: "100%", height: "350px", minHeight: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" // Centraliza horizontalmente
                    cy="50%" // Centraliza verticalmente
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || `var(--chart-${index + 1})`}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Calendário de Entregas */}
        <Card className="h-[530px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Calendário de Entregas
            </CardTitle>
            <CardDescription>Previsão de Sprints e reuniões.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              className="rounded-md border shadow w-full max-w-sm"
            />
          </CardContent>
        </Card>

        <ClientsProjectsctivityLog />
      </div>

      {/* Tabela de Projetos */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Projetos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Projeto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prev. Entrega</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Financeiro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">App Acolhe Kids</TableCell>
                <TableCell>
                  <Badge variant="secondary">Em Desenvolvimento</Badge>
                </TableCell>
                <TableCell>15/02/2026</TableCell>
                <TableCell className="text-muted-foreground">
                  Há 2 horas
                </TableCell>
                <TableCell className="text-right">
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    Em dia
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
