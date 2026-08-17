import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { BookOpen, Plus, Search, Trash2, Heart, Clock, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '../components/ui/empty-state';

export function Recipes() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useStore();
  const [search, setSearch] = useState('');
  
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('');
    setIngredientsText('');
    setInstructions('');
    setPrepTime('');
    setNotes('');
    setPhotoUrl('');
  };

  const handleEdit = (recipe: any) => {
    setEditingId(recipe.id);
    setName(recipe.name);
    setCategory(recipe.category);
    setIngredientsText(recipe.ingredients.join('\n'));
    setInstructions(recipe.instructions);
    setPrepTime(recipe.prepTime.toString());
    setNotes(recipe.notes || '');
    setPhotoUrl(recipe.photoUrl || '');
    setOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipeData = {
      name,
      category: category || 'Sem categoria',
      ingredients: ingredientsText.split('\n').filter(i => i.trim()),
      instructions,
      prepTime: parseInt(prepTime) || 0,
      notes,
      photoUrl,
    };

    if (editingId) {
      updateRecipe(editingId, recipeData);
      toast.success('Receita atualizada!');
    } else {
      addRecipe({ ...recipeData, isFavorite: false });
      toast.success('Receita adicionada!');
    }
    setOpen(false);
  };

  const toggleFavorite = (id: string, current: boolean) => {
    updateRecipe(id, { isFavorite: !current });
  };

  const filteredRecipes = useMemo(() => {
    return recipes
      .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [recipes, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu caderno de receitas da família.</p>
        </div>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nova Receita</span>
            <span className="inline sm:hidden">Nova</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Receita' : 'Adicionar Receita'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Receita</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Torta de Frango" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Sobremesa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Tempo (minutos)</Label>
                  <Input id="prepTime" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredientes (um por linha)</Label>
                <Textarea 
                  id="ingredients" 
                  value={ingredientsText} 
                  onChange={(e) => setIngredientsText(e.target.value)} 
                  required 
                  placeholder="500g de farinha&#10;2 ovos"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Modo de Preparo</Label>
                <Textarea 
                  id="instructions" 
                  value={instructions} 
                  onChange={(e) => setInstructions(e.target.value)} 
                  required 
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photoUrl">URL da Foto (opcional)</Label>
                <Input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
              </div>
              <Button type="submit" className="w-full">Salvar Receita</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-dashed bg-muted/30">
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar receitas por nome ou categoria..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {filteredRecipes.length === 0 ? (
        <EmptyState 
          icon={BookOpen}
          title="Nenhuma receita encontrada"
          description={recipes.length === 0 ? 'Adicione sua primeira receita para começar.' : 'Tente uma busca diferente.'}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map(recipe => (
            <Card key={recipe.id} className="overflow-hidden group flex flex-col">
              {recipe.photoUrl && (
                <div className="h-48 w-full relative overflow-hidden bg-muted">
                  <img src={recipe.photoUrl} alt={recipe.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-3 flex-none">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-lg truncate">{recipe.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="font-normal">{recipe.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {recipe.prepTime} min
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`flex-shrink-0 -mr-2 -mt-2 ${recipe.isFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => toggleFavorite(recipe.id, recipe.isFavorite)}
                  >
                    <Heart className={`h-5 w-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                    <span className="sr-only">Favoritar</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-muted-foreground">
                <p className="line-clamp-3 mb-4">
                  <span className="font-semibold text-foreground">Ingredientes: </span>
                  {recipe.ingredients.join(', ')}
                </p>
                <div className="flex items-center gap-2 mt-auto pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(recipe)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={() => deleteRecipe(recipe.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
