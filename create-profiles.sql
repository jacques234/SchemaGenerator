-- ============================================
-- CREAR TABLA DE PROFILES (Ejecutar en Supabase SQL Editor)
-- ============================================
-- Esta tabla sincroniza automáticamente con auth.users

-- Crear tabla de profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: cualquier usuario autenticado puede ver los profiles
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- FUNCIÓN: Crear profile cuando se registra un usuario
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SINCRONIZAR USUARIOS EXISTENTES
-- ============================================
-- Insertar usuarios que ya existen en auth.users
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- ============================================
-- FIN - Los usuarios ahora aparecerán en el dropdown
-- ============================================
