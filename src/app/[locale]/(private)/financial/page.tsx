"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Building2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Financial = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("month");

  const stats = [
    {
      title: "Receita Total",
      value: "R$ 850.000",
      icon: DollarSign,
      trend: "+15%",
      trendUp: true,
      description: "Últimos 12 meses",
    },
    {
      title: "Receita Mensal",
      value: "R$ 142.000",
      icon: Wallet,
      trend: "+8%",
      trendUp: true,
      description: "Mês atual",
    },
    {
      title: "Despesas",
      value: "R$ 320.000",
      icon: TrendingDown,
      trend: "-5%",
      trendUp: true,
      description: "Últimos 12 meses",
    },
    {
      title: "Lucro Líquido",
      value: "R$ 530.000",
      icon: TrendingUp,
      trend: "+22%",
      trendUp: true,
      description: "Últimos 12 meses",
    },
  ];

  const revenueData = [
    { month: "Jan", receita: 65000, despesas: 28000 },
    { month: "Fev", receita: 78000, despesas: 32000 },
    { month: "Mar", receita: 82000, despesas: 29000 },
    { month: "Abr", receita: 95000, despesas: 35000 },
    { month: "Mai", receita: 88000, despesas: 31000 },
    { month: "Jun", receita: 102000, despesas: 38000 },
    { month: "Jul", receita: 115000, despesas: 42000 },
    { month: "Ago", receita: 125000, despesas: 45000 },
    { month: "Set", receita: 118000, despesas: 41000 },
    { month: "Out", receita: 132000, despesas: 48000 },
    { month: "Nov", receita: 142000, despesas: 52000 },
    { month: "Dez", receita: 108000, despesas: 39000 },
  ];

  const categoryData = [
    { name: "Desenvolvimento", value: 45, color: "hsl(var(--primary))" },
    { name: "Consultoria", value: 25, color: "hsl(var(--secondary))" },
    { name: "Manutenção", value: 20, color: "hsl(var(--accent))" },
    { name: "Outros", value: 10, color: "hsl(var(--muted))" },
  ];

  const transactions = [
    {
      id: 1,
      date: "2024-01-15",
      description: "Pagamento Projeto Alpha",
      type: "income",
      amount: 45000,
      client: "Tech Corp",
      project: "Alpha",
      status: "confirmed",
    },
    {
      id: 2,
      date: "2024-01-14",
      description: "Licença Software",
      type: "expense",
      amount: 2500,
      category: "Software",
      project: "Geral",
      status: "confirmed",
    },
    {
      id: 3,
      date: "2024-01-13",
      description: "Pagamento Consultoria",
      type: "income",
      amount: 12000,
      client: "StartUp Inc",
      project: "Beta",
      status: "pending",
    },
    {
      id: 4,
      date: "2024-01-12",
      description: "Infraestrutura Cloud",
      type: "expense",
      amount: 8500,
      category: "Infraestrutura",
      project: "Alpha",
      status: "confirmed",
    },
    {
      id: 5,
      date: "2024-01-11",
      description: "Sinal Projeto Gamma",
      type: "income",
      amount: 25000,
      client: "Enterprise SA",
      project: "Gamma",
      status: "confirmed",
    },
    {
      id: 6,
      date: "2024-01-10",
      description: "Equipamentos",
      type: "expense",
      amount: 15000,
      category: "Hardware",
      project: "Geral",
      status: "confirmed",
    },
    {
      id: 7,
      date: "2024-01-09",
      description: "Manutenção Mensal",
      type: "income",
      amount: 8000,
      client: "Retail Co",
      project: "Delta",
      status: "pending",
    },
    {
      id: 8,
      date: "2024-01-08",
      description: "Marketing Digital",
      type: "expense",
      amount: 3200,
      category: "Marketing",
      project: "Geral",
      status: "confirmed",
    },
  ];

  const pendingPayments = [
    {
      id: 1,
      client: "Tech Corp",
      project: "Alpha",
      amount: 45000,
      dueDate: "2024-01-20",
      daysOverdue: 0,
    },
    {
      id: 2,
      client: "StartUp Inc",
      project: "Beta",
      amount: 18000,
      dueDate: "2024-01-25",
      daysOverdue: 0,
    },
    {
      id: 3,
      client: "Enterprise SA",
      project: "Gamma",
      amount: 35000,
      dueDate: "2024-01-10",
      daysOverdue: 5,
    },
    {
      id: 4,
      client: "Retail Co",
      project: "Delta",
      amount: 12000,
      dueDate: "2024-01-05",
      daysOverdue: 10,
    },
  ];

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      confirmed: "default",
      pending: "secondary",
      cancelled: "destructive",
    };
    const labels: Record<string, string> = {
      confirmed: "Confirmado",
      pending: "Pendente",
      cancelled: "Cancelado",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Financeiro</h2>
          <p className="text-muted-foreground">
            Visão geral das finanças da empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs flex items-center ${
                      stat.trendUp ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.trend}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Receitas vs Despesas</CardTitle>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mensal</SelectItem>
                  <SelectItem value="quarter">Trimestral</SelectItem>
                  <SelectItem value="year">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorReceita"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorDespesas"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--destructive))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--destructive))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any) => [
                      `R$ ${Number(value || 0).toLocaleString()}`,
                      "",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorReceita)"
                    name="Receita"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke="hsl(var(--destructive))"
                    fillOpacity={1}
                    fill="url(#colorDespesas)"
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any) => [`${Number(value || 0)}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryData.map((cat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-medium">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Transactions and Pending */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="pending">Pagamentos Pendentes</TabsTrigger>
          <TabsTrigger value="projections">Projeções</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Histórico de Transações</CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar transação..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="income">Receitas</SelectItem>
                      <SelectItem value="expense">Despesas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell>{transaction.project}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-destructive" />
                          )}
                          <span
                            className={
                              transaction.type === "income"
                                ? "text-primary"
                                : "text-destructive"
                            }
                          >
                            {transaction.type === "income"
                              ? "Receita"
                              : "Despesa"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.type === "income"
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"} R${" "}
                        {transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {payment.client}
                        </div>
                      </TableCell>
                      <TableCell>{payment.project}</TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(payment.dueDate).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.daysOverdue > 0 ? (
                          <Badge variant="destructive">
                            {payment.daysOverdue} dias atrasado
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No prazo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          Enviar Lembrete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Projeção de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData.slice(-6)}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis
                        className="text-xs"
                        tickFormatter={(v) => `${v / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: any) => [
                          `R$ ${Number(value || 0).toLocaleString()}`,
                          "",
                        ]}
                      />
                      <Bar
                        dataKey="receita"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        name="Receita"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo de Projeções</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Receita Prevista (Próx. 3 meses)
                    </span>
                    <span className="font-medium">R$ 420.000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Despesas Previstas
                    </span>
                    <span className="font-medium">R$ 145.000</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="font-medium">Lucro Projetado</span>
                    <span className="font-bold text-primary">R$ 275.000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    Principais Entradas Previstas
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                      <span>Projeto Alpha - 2ª Parcela</span>
                      <span className="font-medium">R$ 85.000</span>
                    </div>
                    <div className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                      <span>Projeto Beta - Entrega Final</span>
                      <span className="font-medium">R$ 120.000</span>
                    </div>
                    <div className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                      <span>Manutenções Mensais</span>
                      <span className="font-medium">R$ 45.000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;
