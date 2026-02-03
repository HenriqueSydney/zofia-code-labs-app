"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";

interface Transaction {
  id: string;
  date: Date;
  description: string;
  type: "income" | "expense";
  amount: number;
  categoryOrClient: string;
  projectName: string;
  status: string;
}

export function RecentTransactionsTableClient({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchTerm.toLowerCase());
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
    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
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
                <TableCell>{transaction.projectName}</TableCell>
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
                      {transaction.type === "income" ? "Receita" : "Despesa"}
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
                  {transaction.type === "income" ? "+" : "-"}{" "}
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              </TableRow>
            ))}
            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
