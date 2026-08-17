-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- 1. FAMILIES
create table public.families (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROFILES (Extends Supabase Auth Users)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. FAMILY MEMBERS
create table public.family_members (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    role text not null check (role in ('admin', 'member')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(family_id, user_id)
);

-- 4. TASKS
create table public.tasks (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    title text not null,
    description text,
    status text not null check (status in ('pending', 'in_progress', 'completed')),
    priority text not null check (priority in ('low', 'normal', 'high', 'urgent')),
    assignee_id uuid references public.profiles(id) on delete set null,
    due_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. EVENTS
create table public.events (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    title text not null,
    date timestamp with time zone not null,
    category text not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. SHOPPING LISTS
create table public.shopping_lists (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. SHOPPING LIST ITEMS
create table public.shopping_items (
    id uuid primary key default uuid_generate_v4(),
    list_id uuid not null references public.shopping_lists(id) on delete cascade,
    name text not null,
    is_completed boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. TRANSACTIONS
create table public.transactions (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    description text not null,
    amount numeric(12,2) not null,
    type text not null check (type in ('income', 'expense')),
    date timestamp with time zone not null,
    category text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. RECIPES
create table public.recipes (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    name text not null,
    category text not null,
    prep_time integer,
    ingredients text[] not null default '{}',
    instructions text not null,
    is_favorite boolean default false not null,
    photo_url text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. MEALS
create table public.meals (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    date date not null,
    type text not null check (type in ('breakfast', 'lunch', 'dinner', 'snack')),
    recipe_id uuid references public.recipes(id) on delete set null,
    name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. DOCUMENTS
create table public.documents (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    name text not null,
    category text not null,
    description text,
    owner_id uuid references public.profiles(id) on delete set null,
    document_date date not null,
    expiration_date date,
    status text not null,
    notes text,
    file_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. HOME ITEMS (Equipamentos)
create table public.home_items (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    name text not null,
    category text not null,
    purchase_date date,
    warranty_end_date date,
    location text,
    notes text,
    supplier_id uuid, -- Referência para contacts, criada mais adiante
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. CONTACTS
create table public.contacts (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    name text not null,
    company text,
    role text,
    phone text,
    email text,
    category text not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add foreign key for home_items to contacts
alter table public.home_items
add constraint home_items_supplier_id_fkey
foreign key (supplier_id) references public.contacts(id) on delete set null;

-- 14. MAINTENANCES
create table public.maintenances (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    home_item_id uuid references public.home_items(id) on delete cascade,
    service_name text not null,
    location text,
    date date not null,
    is_completed boolean default false not null,
    supplier_id uuid references public.contacts(id) on delete set null,
    cost numeric(12,2),
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. BOARD POSTS
create table public.board_posts (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    author_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    content text not null,
    type text not null,
    priority text not null,
    is_pinned boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. NOTIFICATIONS
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    family_id uuid not null references public.families(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade, -- if null, implies family-wide
    title text not null,
    message text not null,
    type text not null,
    is_read boolean default false not null,
    link_to text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS CONFIGURATION
alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.family_members enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.transactions enable row level security;
alter table public.recipes enable row level security;
alter table public.meals enable row level security;
alter table public.documents enable row level security;
alter table public.home_items enable row level security;
alter table public.contacts enable row level security;
alter table public.maintenances enable row level security;
alter table public.board_posts enable row level security;
alter table public.notifications enable row level security;

-- POLICIES

-- Helper Function para pegar o family_id do usuario
create or function public.get_user_families()
returns setof uuid
language sql security definer stable
as $$
  select family_id from public.family_members where user_id = auth.uid()
$$;

-- PROFILES: Users can read and update their own profile
create policy "Users can read all profiles in their families" on public.profiles
for select using (
  id in (select user_id from public.family_members where family_id in (select public.get_user_families()))
  or id = auth.uid()
);

create policy "Users can update own profile" on public.profiles
for update using (id = auth.uid());

-- FAMILIES: Users can view families they belong to
create policy "Users can view their families" on public.families
for select using (id in (select public.get_user_families()));

create policy "Users can insert families" on public.families
for insert with check (true);

create policy "Users can update their families" on public.families
for update using (id in (select public.get_user_families()));

-- FAMILY MEMBERS:
create policy "Users can view members of their families" on public.family_members
for select using (family_id in (select public.get_user_families()) or user_id = auth.uid());

create policy "Users can insert members if they are admin" on public.family_members
for insert with check (
  family_id in (select family_id from public.family_members where user_id = auth.uid() and role = 'admin')
  or user_id = auth.uid() -- Allows initial creator to add themselves
);

create policy "Users can update members if they are admin" on public.family_members
for update using (family_id in (select family_id from public.family_members where user_id = auth.uid() and role = 'admin'));

create policy "Users can delete members if they are admin" on public.family_members
for delete using (family_id in (select family_id from public.family_members where user_id = auth.uid() and role = 'admin'));


-- GENERAL POLICY TEMPLATE FOR FAMILY-ISOLATED TABLES
-- (tasks, events, shopping_lists, transactions, recipes, meals, documents, home_items, contacts, maintenances, board_posts, notifications)

-- TASKS
create policy "View family tasks" on public.tasks for select using (family_id in (select public.get_user_families()));
create policy "Insert family tasks" on public.tasks for insert with check (family_id in (select public.get_user_families()));
create policy "Update family tasks" on public.tasks for update using (family_id in (select public.get_user_families()));
create policy "Delete family tasks" on public.tasks for delete using (family_id in (select public.get_user_families()));

-- EVENTS
create policy "View family events" on public.events for select using (family_id in (select public.get_user_families()));
create policy "Insert family events" on public.events for insert with check (family_id in (select public.get_user_families()));
create policy "Update family events" on public.events for update using (family_id in (select public.get_user_families()));
create policy "Delete family events" on public.events for delete using (family_id in (select public.get_user_families()));

-- SHOPPING LISTS
create policy "View family shopping lists" on public.shopping_lists for select using (family_id in (select public.get_user_families()));
create policy "Insert family shopping lists" on public.shopping_lists for insert with check (family_id in (select public.get_user_families()));
create policy "Update family shopping lists" on public.shopping_lists for update using (family_id in (select public.get_user_families()));
create policy "Delete family shopping lists" on public.shopping_lists for delete using (family_id in (select public.get_user_families()));

-- SHOPPING ITEMS (Nested, check via list_id)
create policy "View family shopping items" on public.shopping_items for select using (list_id in (select id from public.shopping_lists where family_id in (select public.get_user_families())));
create policy "Insert family shopping items" on public.shopping_items for insert with check (list_id in (select id from public.shopping_lists where family_id in (select public.get_user_families())));
create policy "Update family shopping items" on public.shopping_items for update using (list_id in (select id from public.shopping_lists where family_id in (select public.get_user_families())));
create policy "Delete family shopping items" on public.shopping_items for delete using (list_id in (select id from public.shopping_lists where family_id in (select public.get_user_families())));

-- TRANSACTIONS
create policy "View family transactions" on public.transactions for select using (family_id in (select public.get_user_families()));
create policy "Insert family transactions" on public.transactions for insert with check (family_id in (select public.get_user_families()));
create policy "Update family transactions" on public.transactions for update using (family_id in (select public.get_user_families()));
create policy "Delete family transactions" on public.transactions for delete using (family_id in (select public.get_user_families()));

-- RECIPES
create policy "View family recipes" on public.recipes for select using (family_id in (select public.get_user_families()));
create policy "Insert family recipes" on public.recipes for insert with check (family_id in (select public.get_user_families()));
create policy "Update family recipes" on public.recipes for update using (family_id in (select public.get_user_families()));
create policy "Delete family recipes" on public.recipes for delete using (family_id in (select public.get_user_families()));

-- MEALS
create policy "View family meals" on public.meals for select using (family_id in (select public.get_user_families()));
create policy "Insert family meals" on public.meals for insert with check (family_id in (select public.get_user_families()));
create policy "Update family meals" on public.meals for update using (family_id in (select public.get_user_families()));
create policy "Delete family meals" on public.meals for delete using (family_id in (select public.get_user_families()));

-- DOCUMENTS
create policy "View family documents" on public.documents for select using (family_id in (select public.get_user_families()));
create policy "Insert family documents" on public.documents for insert with check (family_id in (select public.get_user_families()));
create policy "Update family documents" on public.documents for update using (family_id in (select public.get_user_families()));
create policy "Delete family documents" on public.documents for delete using (family_id in (select public.get_user_families()));

-- HOME ITEMS
create policy "View family home items" on public.home_items for select using (family_id in (select public.get_user_families()));
create policy "Insert family home items" on public.home_items for insert with check (family_id in (select public.get_user_families()));
create policy "Update family home items" on public.home_items for update using (family_id in (select public.get_user_families()));
create policy "Delete family home items" on public.home_items for delete using (family_id in (select public.get_user_families()));

-- CONTACTS
create policy "View family contacts" on public.contacts for select using (family_id in (select public.get_user_families()));
create policy "Insert family contacts" on public.contacts for insert with check (family_id in (select public.get_user_families()));
create policy "Update family contacts" on public.contacts for update using (family_id in (select public.get_user_families()));
create policy "Delete family contacts" on public.contacts for delete using (family_id in (select public.get_user_families()));

-- MAINTENANCES
create policy "View family maintenances" on public.maintenances for select using (family_id in (select public.get_user_families()));
create policy "Insert family maintenances" on public.maintenances for insert with check (family_id in (select public.get_user_families()));
create policy "Update family maintenances" on public.maintenances for update using (family_id in (select public.get_user_families()));
create policy "Delete family maintenances" on public.maintenances for delete using (family_id in (select public.get_user_families()));

-- BOARD POSTS
create policy "View family board posts" on public.board_posts for select using (family_id in (select public.get_user_families()));
create policy "Insert family board posts" on public.board_posts for insert with check (family_id in (select public.get_user_families()));
create policy "Update family board posts" on public.board_posts for update using (family_id in (select public.get_user_families()));
create policy "Delete family board posts" on public.board_posts for delete using (family_id in (select public.get_user_families()));

-- NOTIFICATIONS
create policy "View family notifications" on public.notifications for select using (family_id in (select public.get_user_families()) and (user_id is null or user_id = auth.uid()));
create policy "Insert family notifications" on public.notifications for insert with check (family_id in (select public.get_user_families()));
create policy "Update family notifications" on public.notifications for update using (family_id in (select public.get_user_families()) and (user_id is null or user_id = auth.uid()));
create policy "Delete family notifications" on public.notifications for delete using (family_id in (select public.get_user_families()) and (user_id is null or user_id = auth.uid()));

