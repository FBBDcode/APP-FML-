import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Plus, Trash2, ArrowDownCircle, ArrowUpCircle, DollarSign, FileSpreadsheet, Upload, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useIntegration } from '../hooks/useIntegration';
import { Link } from 'react-router-dom';

import { EmptyState } from '../components/ui/empty-state';

export function Finance() {
  const { transactions, addTransaction, deleteTransaction } = useStore();
  const { config: sheetsConfig, sync: syncSheets } = useIntegration('sheets');
  const [open, setOpen] = useState(false);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('Outros');

  const expenseCategories = ['Moradia', 'Alimentação', 'Transporte', 'Educação', 'Saúde', 'Lazer', 'Contas', 'Outros'];
  const incomeCategories = ['Salário', 'Benefícios', 'Renda Extra', 'Outros'];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Preencha um valor válido e descrição.');
      return;
    }
    
    addTransaction({
      description,
      amount: numAmount,
      type,
      date: new Date(date).toISOString(),
      category
    });
    
    setDescription('');
    setAmount('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setOpen(false);
    toast.success('Lançamento registrado!');
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Acompanhe as receitas e despesas.</p>
        </div>
        
        <div className="flex gap-2 flex-wrap items-center">
          {sheetsConfig.status === 'connected' ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => syncSheets()}>
                <Download className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success('Dados exportados para a planilha vinculada!')}>
                <Upload className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20 py-1.5 hidden lg:flex">
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Sheets Conectado
              </Badge>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="hidden sm:flex" nativeButton={false} render={<Link to="/configuracoes/integracoes" />}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Conectar Planilha
            </Button>
          )}

          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
            setDescription('');
            setAmount('');
            setDate(format(new Date(), 'yyyy-MM-dd'));
            setType('expense');
            setCategory('Outros');
          }
        }}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Novo Lançamento</span>
            <span className="inline sm:hidden">Novo</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Transação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <Tabs value={type} onValueChange={(v) => { setType(v as 'income' | 'expense'); setCategory('Outros'); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expense" className="data-[state=active]:text-destructive">Despesa</TabsTrigger>
                  <TabsTrigger value="income" className="data-[state=active]:text-emerald-600 dark:text-emerald-500 dark:data-[state=active]:text-emerald-500">Receita</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Ex: Supermercado" />
              </div>
              
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(type === 'expense' ? expenseCategories : incomeCategories).map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Registrar</Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Saldo Atual</p>
                <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive'}`}>
                  R$ {balance.toFixed(2)}
                </h3>
              </div>
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Receitas</p>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">R$ {totalIncome.toFixed(2)}</h3>
              </div>
              <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <ArrowUpCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Despesas</p>
                <h3 className="text-2xl font-bold text-destructive">R$ {totalExpense.toFixed(2)}</h3>
              </div>
              <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <ArrowDownCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
            <EmptyState 
              icon={DollarSign}
              title="Nenhum lançamento"
              description="Nenhum lançamento encontrado neste mês."
              className="border-0 shadow-none bg-transparent"
            />
          ) : (
            <div className="divide-y">
              {sortedTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-4 group">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex flex-shrink-0 items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                      {t.type === 'income' ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(t.date), "dd/MM/yyyy")}</span>
                        <Badge variant="secondary" className="font-normal text-[10px] py-0">{t.category}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-foreground'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                    </span>
                    <Button variant="ghost" size="icon-sm" className=" text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={() => deleteTransaction(t.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
