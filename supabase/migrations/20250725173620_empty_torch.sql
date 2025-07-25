/*
  # Fix User Registration Issues

  1. Database Functions
    - Update `handle_new_user` function to properly handle user metadata
    - Ensure profile creation works correctly with all required fields

  2. Security
    - Maintain RLS policies
    - Ensure proper data validation

  3. Triggers
    - Update trigger to handle new user registration properly
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user(uuid, text);

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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to insert their own profile (for manual profile creation if needed)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);