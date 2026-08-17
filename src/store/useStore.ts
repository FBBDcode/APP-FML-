import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Family, Task, Event, ShoppingList, Transaction, Member, ShoppingItem, Recipe, Meal, Document, Contact, HomeItem, Maintenance, BoardPost, AppNotification, IntegrationConfig, IntegrationProvider, MemoryAlbum } from '../types';
import { mockRecipes, mockMeals, mockDocuments, mockContacts, mockHomeItems, mockMaintenances, mockPosts, mockNotifications, mockIntegrations, mockMemories } from './mockData';

interface AppState {
  family: Family;
  tasks: Task[];
  events: Event[];
  lists: ShoppingList[];
  transactions: Transaction[];
  recipes: Recipe[];
  meals: Meal[];
  documents: Document[];
  contacts: Contact[];
  homeItems: HomeItem[];
  maintenances: Maintenance[];
  posts: BoardPost[];
  notifications: AppNotification[];
  integrations: IntegrationConfig[];
  memories: MemoryAlbum[];
  
  // Actions
  updateFamilyName: (name: string) => void;
  addMember: (member: Omit<Member, 'id'>) => void;
  removeMember: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  addEvent: (event: Omit<Event, 'id'>) => void;
  deleteEvent: (id: string) => void;
  
  addList: (name: string) => void;
  deleteList: (id: string) => void;
  addItemToList: (listId: string, item: Omit<ShoppingItem, 'id'>) => void;
  updateListItem: (listId: string, itemId: string, updates: Partial<ShoppingItem>) => void;
  deleteListItem: (listId: string, itemId: string) => void;
  
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  
  // Recipes Actions
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  
  // Meals Actions
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  
  // Documents Actions
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  
  // Contacts Actions
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  
  // HomeItems Actions
  addHomeItem: (item: Omit<HomeItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHomeItem: (id: string, updates: Partial<HomeItem>) => void;
  deleteHomeItem: (id: string) => void;
  
  // Maintenances Actions
  addMaintenance: (maintenance: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMaintenance: (id: string, updates: Partial<Maintenance>) => void;
  deleteMaintenance: (id: string) => void;
  
  // Board Posts Actions
  addPost: (post: Omit<BoardPost, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePost: (id: string, updates: Partial<BoardPost>) => void;
  deletePost: (id: string) => void;
  
  // Notifications Actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Integration Actions
  updateIntegration: (provider: IntegrationProvider, updates: Partial<IntegrationConfig>) => void;
  
  // Memories Actions
  addMemory: (memory: Omit<MemoryAlbum, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemory: (id: string, updates: Partial<MemoryAlbum>) => void;
  deleteMemory: (id: string) => void;
}

const generateId = () => crypto.randomUUID();

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      family: {
        id: generateId(),
        name: 'Minha Família',
        members: [{ id: generateId(), name: 'Admin', role: 'admin' }],
      },
      tasks: [],
      events: [],
      lists: [],
      transactions: [],
      recipes: mockRecipes,
      meals: mockMeals,
      documents: mockDocuments,
      contacts: mockContacts,
      homeItems: mockHomeItems,
      maintenances: mockMaintenances,
      posts: mockPosts,
      notifications: mockNotifications,
      integrations: mockIntegrations,
      memories: mockMemories,

      updateFamilyName: (name) =>
        set((state) => ({ family: { ...state.family, name } })),
        
      addMember: (member) =>
        set((state) => ({
          family: {
            ...state.family,
            members: [...state.family.members, { ...member, id: generateId() }],
          },
        })),
        
      removeMember: (id) =>
        set((state) => ({
          family: {
            ...state.family,
            members: state.family.members.filter((m) => m.id !== id),
          },
        })),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: generateId(), createdAt: new Date().toISOString() }],
        })),
        
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
        
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: generateId() }],
        })),
        
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),

      addList: (name) =>
        set((state) => ({
          lists: [
            ...state.lists,
            { id: generateId(), name, items: [], createdAt: new Date().toISOString() },
          ],
        })),
        
      deleteList: (id) =>
        set((state) => ({
          lists: state.lists.filter((l) => l.id !== id),
        })),
        
      addItemToList: (listId, item) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? { ...l, items: [...l.items, { ...item, id: generateId() }] }
              : l
          ),
        })),
        
      updateListItem: (listId, itemId, updates) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: l.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
                }
              : l
          ),
        })),
        
      deleteListItem: (listId, itemId) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
              : l
          ),
        })),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
        
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
        
      addRecipe: (recipe) =>
        set((state) => ({
          recipes: [
            ...state.recipes,
            { ...recipe, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
        
      updateRecipe: (id, updates) =>
        set((state) => ({
          recipes: state.recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
        
      deleteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        })),
        
      addMeal: (meal) =>
        set((state) => ({
          meals: [...state.meals, { ...meal, id: generateId() }],
        })),
        
      updateMeal: (id, updates) =>
        set((state) => ({
          meals: state.meals.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
        
      deleteMeal: (id) =>
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== id),
        })),
        
      addDocument: (doc) =>
        set((state) => ({
          documents: [
            ...state.documents,
            { ...doc, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        })),
        
      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)),
        })),
        
      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),
        
      addContact: (contact) =>
        set((state) => ({
          contacts: [
            ...state.contacts,
            { ...contact, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        })),
        
      updateContact: (id, updates) =>
        set((state) => ({
          contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)),
        })),
        
      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),
        
      addHomeItem: (item) =>
        set((state) => ({
          homeItems: [
            ...state.homeItems,
            { ...item, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        })),
        
      updateHomeItem: (id, updates) =>
        set((state) => ({
          homeItems: state.homeItems.map((hi) => (hi.id === id ? { ...hi, ...updates, updatedAt: new Date().toISOString() } : hi)),
        })),
        
      deleteHomeItem: (id) =>
        set((state) => ({
          homeItems: state.homeItems.filter((hi) => hi.id !== id),
        })),
        
      addMaintenance: (maintenance) =>
        set((state) => ({
          maintenances: [
            ...state.maintenances,
            { ...maintenance, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        })),
        
      updateMaintenance: (id, updates) =>
        set((state) => ({
          maintenances: state.maintenances.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m)),
        })),
        
      deleteMaintenance: (id) =>
        set((state) => ({
          maintenances: state.maintenances.filter((m) => m.id !== id),
        })),
        
      addPost: (post) =>
        set((state) => ({
          posts: [
            ...state.posts,
            { ...post, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        })),
        
      updatePost: (id, updates) =>
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)),
        })),
        
      deletePost: (id) =>
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        })),
        
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
        
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        })),
        
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
        
      updateIntegration: (provider, updates) =>
        set((state) => {
          const exists = state.integrations.find(i => i.provider === provider);
          if (exists) {
            return {
              integrations: state.integrations.map(i => i.provider === provider ? { ...i, ...updates } : i)
            };
          }
          return {
            integrations: [...state.integrations, { provider, status: 'disconnected', ...updates } as IntegrationConfig]
          };
        }),
        
      addMemory: (memory) =>
        set((state) => ({
          memories: [
            ...state.memories,
            { ...memory, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        })),
        
      updateMemory: (id, updates) =>
        set((state) => ({
          memories: state.memories.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m)),
        })),
        
      deleteMemory: (id) =>
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id),
        })),
    }),
    {
      name: 'family-hub-storage',
      // Optional: Since it's mock data, we might want to merge correctly or we can just leave default persist behavior
    }
  )
);
