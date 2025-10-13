-- Create tool categories enum
CREATE TYPE public.tool_category AS ENUM ('profile', 'fabric', 'membrane', 'light', 'mounting_plate');

-- Create object types enum  
CREATE TYPE public.object_type AS ENUM ('apartment', 'house', 'commercial');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create tool_options table
CREATE TABLE public.tool_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id tool_category NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  default_material_price NUMERIC NOT NULL DEFAULT 0,
  default_labor_price NUMERIC NOT NULL DEFAULT 0,
  size_label TEXT,
  default_colors INTEGER DEFAULT 0,
  calc_strategy TEXT NOT NULL DEFAULT 'linear',
  is_active BOOLEAN DEFAULT TRUE,
  roll_width_m NUMERIC,
  max_panel_height_m NUMERIC,
  origin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tool_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tool options" ON public.tool_options FOR SELECT USING (true);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  object_type object_type NOT NULL,
  total_rooms INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rooms of own projects" ON public.rooms FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = rooms.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create rooms for own projects" ON public.rooms FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = rooms.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update rooms of own projects" ON public.rooms FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = rooms.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete rooms of own projects" ON public.rooms FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = rooms.project_id AND projects.user_id = auth.uid()));

-- Create walls table
CREATE TABLE public.walls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  length_m NUMERIC NOT NULL DEFAULT 0,
  height_m NUMERIC NOT NULL DEFAULT 0,
  area_m2 NUMERIC NOT NULL DEFAULT 0,
  canvas_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.walls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view walls of own projects" ON public.walls FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.rooms JOIN public.projects ON rooms.project_id = projects.id WHERE rooms.id = walls.room_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create walls for own projects" ON public.walls FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.rooms JOIN public.projects ON rooms.project_id = projects.id WHERE rooms.id = walls.room_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update walls of own projects" ON public.walls FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.rooms JOIN public.projects ON rooms.project_id = projects.id WHERE rooms.id = walls.room_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete walls of own projects" ON public.walls FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.rooms JOIN public.projects ON rooms.project_id = projects.id WHERE rooms.id = walls.room_id AND projects.user_id = auth.uid()));

-- Create estimates table
CREATE TABLE public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wall_id UUID NOT NULL REFERENCES public.walls(id) ON DELETE CASCADE,
  tool_option_id UUID NOT NULL REFERENCES public.tool_options(id),
  quantity NUMERIC NOT NULL DEFAULT 0,
  material_cost NUMERIC NOT NULL DEFAULT 0,
  labor_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view estimates of own projects" ON public.estimates FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.walls JOIN public.rooms ON walls.room_id = rooms.id JOIN public.projects ON rooms.project_id = projects.id WHERE walls.id = estimates.wall_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create estimates for own projects" ON public.estimates FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.walls JOIN public.rooms ON walls.room_id = rooms.id JOIN public.projects ON rooms.project_id = projects.id WHERE walls.id = estimates.wall_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update estimates of own projects" ON public.estimates FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.walls JOIN public.rooms ON walls.room_id = rooms.id JOIN public.projects ON rooms.project_id = projects.id WHERE walls.id = estimates.wall_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete estimates of own projects" ON public.estimates FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.walls JOIN public.rooms ON walls.room_id = rooms.id JOIN public.projects ON rooms.project_id = projects.id WHERE walls.id = estimates.wall_id AND projects.user_id = auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_walls_updated_at BEFORE UPDATE ON public.walls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tool_options_updated_at BEFORE UPDATE ON public.tool_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();