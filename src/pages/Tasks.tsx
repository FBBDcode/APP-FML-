import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Plus, Trash2, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '../components/ui/empty-state';

export function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, family } = useStore();
  const [open, setOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [assigneeId, setAssigneeId] = useState<string>('unassigned');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    addTask({
      title,
      status: 'pending',
      priority,
      assigneeId: assigneeId === 'unassigned' ? undefined : assigneeId
    });
    
    setTitle('');
    setPriority('normal');
    setAssigneeId('unassigned');
    setOpen(false);
    toast.success('Tarefa adicionada!');
  };

  const getPriorityBadgeProps = (p: string) => {
    switch(p) {
      case 'urgent': return { variant: 'destructive' as const, label: 'Urgente' };
      case 'high': return { variant: 'default' as const, label: 'Alta' };
      case 'low': return { variant: 'outline' as const, label: 'Baixa' };
      default: return { variant: 'secondary' as const, label: 'Normal' };
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by status first (completed last)
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // Sort by priority
    const pWeight = { urgent: 4, high: 3, normal: 2, low: 1 };
    return pWeight[b.priority] - pWeight[a.priority];
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground mt-1">Gerencie as tarefas da casa.</p>
        </div>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setTitle('');
            setPriority('normal');
            setAssigneeId('unassigned');
          }
        }}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nova Tarefa</span>
            <span className="inline sm:hidden">Nova</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Tarefa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Descrição da Tarefa</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Limpar a garagem" />
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sem responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sem responsável</SelectItem>
                    {family.members.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Criar Tarefa</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <EmptyState 
            icon={CheckSquare}
            title="Tudo limpo por aqui!"
            description="Você não tem nenhuma tarefa no momento."
          />
        ) : (
          <div className="border rounded-md divide-y overflow-hidden bg-card">
            {sortedTasks.map(task => {
              const isCompleted = task.status === 'completed';
              const assignee = family.members.find(m => m.id === task.assigneeId);
              const badge = getPriorityBadgeProps(task.priority);
              
              return (
                <div key={task.id} className={`group flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${isCompleted ? 'opacity-60 bg-muted/20' : ''}`}>
                  <Checkbox 
                    checked={isCompleted}
                    onCheckedChange={(checked) => {
                      updateTask(task.id, { status: checked ? 'completed' : 'pending' });
                    }}
                    className="h-5 w-5 rounded-full"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0 h-5">{badge.label}</Badge>
                      {assignee && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="h-4 w-4 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-[9px]">
                            {assignee.name.charAt(0)}
                          </span>
                          <span className="truncate max-w-[100px]">{assignee.name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon-sm" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
