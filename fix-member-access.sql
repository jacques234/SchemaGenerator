-- ============================================
-- POLÍTICAS SIMPLIFICADAS SIN RECURSIÓN (Ejecutar en Supabase SQL Editor)
-- ============================================

-- PASO 1: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "projects_select" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;
DROP POLICY IF EXISTS "projects_delete" ON projects;

DROP POLICY IF EXISTS "project_members_select" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_delete" ON project_members;

DROP POLICY IF EXISTS "schemas_select" ON schemas;
DROP POLICY IF EXISTS "schemas_insert" ON schemas;
DROP POLICY IF EXISTS "schemas_update" ON schemas;
DROP POLICY IF EXISTS "schemas_delete" ON schemas;

-- ============================================
-- OPCIÓN TEMPORAL: Deshabilitar RLS para desarrollo
-- (Más fácil para desarrollo, habilitar después en producción)
-- ============================================

-- Deshabilitar RLS en todas las tablas
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE schemas DISABLE ROW LEVEL SECURITY;

-- ============================================
-- FIN - Ahora debería funcionar sin errores de políticas
-- ============================================

-- NOTA: Para producción, habilitaremos RLS con políticas correctas.
-- Por ahora, esto permite que la app funcione mientras desarrollas.
