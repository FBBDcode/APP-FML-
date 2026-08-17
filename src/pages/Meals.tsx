import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Utensils, Trash2, Edit2, Info } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export function Meals() {
  const { meals, recipes, addMeal, updateMeal, deleteMeal } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [open, setOpen] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  
  const [date, setDate] = useState('');
  const [type, setType] = useState('lunch');
  const [recipeId, setRecipeId] = useState('none');
  const [name, setName] = useState('');
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as start
  
  const resetForm = () => {
    setEditingId(null);
    setDate('');
    setType('lunch');
    setRecipeId('none');
    setName('');
  };

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  }, [startDate]);

  const mealsByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    weekDays.forEach(day => {
      map.set(format(day, 'yyyy-MM-dd'), []);
    });
    
    meals.forEach(meal => {
      const mealDate = meal.date;
      if (map.has(mealDate)) {
        const r = meal.recipeId ? recipes.find(rec => rec.id === meal.recipeId) : null;
        map.get(mealDate)?.push({ ...meal, recipe: r });
      }
    });
    
    // Sort meals inside each day by type order
    const typeOrder = { breakfast: 1, lunch: 2, dinner: 3, other: 4 };
    map.forEach(dayMeals => {
      dayMeals.sort((a, b) => typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder]);
    });
    
    return map;
  }, [meals, recipes, weekDays]);

  const handleEdit = (meal: any) => {
    setEditingId(meal.id);
    setDate(meal.date);
    setType(meal.type);
    setRecipeId(meal.recipeId || 'none');
    setName(meal.name || '');
    setOpen(true);
  };

  const handleAddForDate = (d: string) => {
    resetForm();
    setDate(d);
    setOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    
    const mealData = {
      date,
      type: type as any,
      recipeId: recipeId !== 'none' ? recipeId : undefined,
      name: recipeId === 'none' ? name : undefined,
    };

    if (editingId) {
      updateMeal(editingId, mealData);
      toast.success('Refeição atualizada!');
    } else {
      addMeal(mealData);
      toast.success('Refeição agendada!');
    }
    setOpen(false);
  };

  const getTypeLabel = (t: string) => {
    switch(t) {
      case 'breakfast': return 'Café da Manhã';
      case 'lunch': return 'Almoço';
      case 'dinner': return 'Jantar';
      default: return 'Outros';
    }
  };

  const viewRecipe = (id: string) => {
    setSelectedRecipeId(id);
    setRecipeOpen(true);
  };

  const selectedRecipe = useMemo(() => recipes.find(r => r.id === selectedRecipeId), [recipes, selectedRecipeId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refeições</h1>
          <p className="text-muted-foreground mt-1">Planeje o cardápio da semana.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border rounded-lg p-1">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium px-2 min-w-[140px] text-center">
            {format(startDate, "d 'de' MMM", { locale: ptBR })} - {format(addDays(startDate, 6), "d 'de' MMM", { locale: ptBR })}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Refeição' : 'Planejar Refeição'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Refeição</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Café da Manhã</SelectItem>
                    <SelectItem value="lunch">Almoço</SelectItem>
                    <SelectItem value="dinner">Jantar</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipe">Receita</Label>
              <Select value={recipeId} onValueChange={setRecipeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (Apenas nome)</SelectItem>
                  {recipes.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {recipeId === 'none' && (
              <div className="space-y-2">
                <Label htmlFor="name">O que será servido?</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Macarrão com Salsicha" />
              </div>
            )}
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={recipeOpen} onOpenChange={setRecipeOpen}>
        <DialogContent>
          {selectedRecipe ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="font-normal">{selectedRecipe.category}</Badge>
                  <span className="text-sm text-muted-foreground">{selectedRecipe.prepTime} minutos</span>
                </div>
              </DialogHeader>
              {selectedRecipe.photoUrl && (
                <div className="w-full h-48 rounded-md overflow-hidden bg-muted mt-4">
                  <img src={selectedRecipe.photoUrl} alt={selectedRecipe.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-6 pt-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Ingredientes</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {selectedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Modo de Preparo</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedRecipe.instructions}</p>
                </div>
                {selectedRecipe.notes && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Observações</h4>
                    <p className="text-muted-foreground">{selectedRecipe.notes}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">Receita não encontrada.</div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayMeals = mealsByDay.get(dateStr) || [];
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card key={dateStr} className={`overflow-hidden flex flex-col ${isToday ? 'border-primary ring-1 ring-primary/20' : ''}`}>
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-semibold capitalize">{format(day, 'EEEE', { locale: ptBR })}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(day, "dd 'de' MMM", { locale: ptBR })}</p>
                </div>
                <Button variant="ghost" size="icon-sm" className=" text-muted-foreground" onClick={() => handleAddForDate(dateStr)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3 pt-4">
                {dayMeals.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 opacity-30">
                    <Utensils className="h-8 w-8 mb-2" />
                    <span className="text-xs font-medium">Sem planejamento</span>
                  </div>
                ) : (
                  dayMeals.map(meal => (
                    <div key={meal.id} className="p-2.5 rounded-lg border bg-card text-sm group relative">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{getTypeLabel(meal.type)}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {meal.recipe && (
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => viewRecipe(meal.recipe.id)}>
                              <Info className="h-3 w-3" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleEdit(meal)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive" onClick={() => deleteMeal(meal.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="font-medium truncate pr-16">{meal.recipe?.name || meal.name || 'Receita Excluída'}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
