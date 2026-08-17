import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { ScrollArea } from '../components/ui/scroll-area';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '../components/ui/empty-state';

export function Shopping() {
  const { lists, addList, deleteList, addItemToList, updateListItem, deleteListItem } = useStore();
  const [newListOpen, setNewListOpen] = useState(false);
  const [listName, setListName] = useState('');
  
  // Local state for quick item adds per list
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;
    addList(listName);
    setListName('');
    setNewListOpen(false);
    toast.success('Lista criada!');
  };

  const handleAddItem = (listId: string) => {
    const desc = newItemInputs[listId];
    if (!desc?.trim()) return;
    
    addItemToList(listId, {
      description: desc,
      completed: false,
      quantity: 1
    });
    
    setNewItemInputs(prev => ({ ...prev, [listId]: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Listas e Compras</h1>
          <p className="text-muted-foreground mt-1">Organize suas idas ao mercado.</p>
        </div>
        <Dialog open={newListOpen} onOpenChange={(val) => {
          setNewListOpen(val);
          if (!val) setListName('');
        }}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nova Lista</span>
            <span className="inline sm:hidden">Nova</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Lista</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddList} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="listName">Nome da Lista</Label>
                <Input id="listName" value={listName} onChange={(e) => setListName(e.target.value)} required placeholder="Ex: Mercado da Semana" />
              </div>
              <Button type="submit" className="w-full">Criar Lista</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
        {lists.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={ShoppingCart}
              title="Nenhuma lista"
              description="Crie sua primeira lista de compras para começar."
            />
          </div>
        ) : (
          lists.map(list => {
            const completedCount = list.items.filter(i => i.completed).length;
            const totalCount = list.items.length;
            const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

            return (
              <Card key={list.id} className="overflow-hidden flex flex-col max-h-[500px]">
                <CardHeader className="pb-4 border-b">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{list.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {completedCount} de {totalCount} itens ({progress}%)
                      </p>
                    </div>
                    <Button variant="ghost" size="icon-sm" className=" text-destructive flex-shrink-0" onClick={() => deleteList(list.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir lista</span>
                    </Button>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-secondary rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col min-h-0 pt-4 pb-0 px-0">
                  <ScrollArea className="flex-1">
                    <div className="px-4 space-y-1">
                      {list.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">A lista está vazia.</p>
                      ) : (
                        list.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between group py-1.5 border-b last:border-0 border-border/50">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Checkbox 
                                checked={item.completed}
                                onCheckedChange={(checked) => updateListItem(list.id, item.id, { completed: !!checked })}
                                className="flex-shrink-0"
                              />
                              <span className={`text-sm truncate ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {item.description}
                              </span>
                            </div>
                            <Button variant="ghost" size="icon-xs" className=" opacity-0 group-hover:opacity-100 flex-shrink-0" onClick={() => deleteListItem(list.id, item.id)}>
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              <span className="sr-only">Remover item</span>
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                
                <div className="p-3 border-t bg-card mt-auto">
                  <form 
                    className="flex items-center gap-2"
                    onSubmit={(e) => { e.preventDefault(); handleAddItem(list.id); }}
                  >
                    <Input 
                      placeholder="Adicionar item..." 
                      className="h-9 text-sm"
                      value={newItemInputs[list.id] || ''}
                      onChange={(e) => setNewItemInputs(prev => ({ ...prev, [list.id]: e.target.value }))}
                    />
                    <Button type="submit" size="sm" className="h-9 px-4">Adicionar</Button>
                  </form>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
