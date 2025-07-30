/*
  # Fix Database Schema Issues
  
  1. Create missing tables
    - Create profiles table if it doesn't exist
    - Ensure all required tables are present
  
  2. Fix Triggers and Functions
    - Update handle_new_user function
    - Ensure proper user registration flow
  
  3. Remove references to non-existent tables
    - Remove any references to 'subscribers' table
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users(id) primary key,
  email text,
  nome text,
  sobrenome text,
  telefone text,
  "cpf/cnpj" text,
  cep text,
  endereco text,
  cidade text,
  estado text,
  conta text default 'Cliente',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create tipo-conta-usuario enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public."tipo-conta-usuario" AS ENUM ('Cliente', 'Mecanico');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update profiles table to use the enum
ALTER TABLE public.profiles 
ALTER COLUMN conta TYPE public."tipo-conta-usuario" 
USING conta::public."tipo-conta-usuario";

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    sobrenome,
    telefone,
    "cpf/cnpj",
    cep,
    endereco,
    cidade,
    estado,
    conta,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'sobrenome', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf_cnpj', ''),
    COALESCE(NEW.raw_user_meta_data->>'cep', ''),
    COALESCE(NEW.raw_user_meta_data->>'endereco', ''),
    COALESCE(NEW.raw_user_meta_data->>'cidade', ''),
    COALESCE(NEW.raw_user_meta_data->>'estado', ''),
    COALESCE(NEW.raw_user_meta_data->>'conta', 'Cliente')::public."tipo-conta-usuario",
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN duplicate_object THEN
    -- If profile already exists, update it
    UPDATE public.profiles SET
      email = NEW.email,
      nome = COALESCE(NEW.raw_user_meta_data->>'nome', profiles.nome),
      sobrenome = COALESCE(NEW.raw_user_meta_data->>'sobrenome', profiles.sobrenome),
      telefone = COALESCE(NEW.raw_user_meta_data->>'telefone', profiles.telefone),
      "cpf/cnpj" = COALESCE(NEW.raw_user_meta_data->>'cpf_cnpj', profiles."cpf/cnpj"),
      cep = COALESCE(NEW.raw_user_meta_data->>'cep', profiles.cep),
      endereco = COALESCE(NEW.raw_user_meta_data->>'endereco', profiles.endereco),
      cidade = COALESCE(NEW.raw_user_meta_data->>'cidade', profiles.cidade),
      estado = COALESCE(NEW.raw_user_meta_data->>'estado', profiles.estado),
      conta = COALESCE(NEW.raw_user_meta_data->>'conta', profiles.conta::text)::public."tipo-conta-usuario",
      updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update profile on user update
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_update();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated; 