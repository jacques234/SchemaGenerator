-- ============================================
-- CORREGIR POLÍTICAS RLS (Ejecutar en Supabase SQL Editor)
-- ============================================

-- Primero eliminar las políticas con problemas
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Owners can update projects" ON projects;
DROP POLICY IF EXISTS "Owners can delete projects" ON projects;

DROP POLICY IF EXISTS "Members can view project members" ON project_members;
DROP POLICY IF EXISTS "Owners can add members" ON project_members;
DROP POLICY IF EXISTS "Owners can remove members" ON project_members;

DROP POLICY IF EXISTS "Members can view schemas" ON schemas;
DROP POLICY IF EXISTS "Editors can create schemas" ON schemas;
DROP POLICY IF EXISTS "Editors can update schemas" ON schemas;
DROP POLICY IF EXISTS "Editors can delete schemas" ON schemas;

-- ============================================
-- POLÍTICAS SIMPLIFICADAS PARA PROJECTS
-- ============================================

-- Ver proyectos propios
CREATE POLICY "projects_select" ON projects
    FOR SELECT
    USING (owner_id = auth.uid());

-- Crear proyectos (el usuario es el owner)
CREATE POLICY "projects_insert" ON projects
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Actualizar proyectos propios
CREATE POLICY "projects_update" ON projects
    FOR UPDATE
    USING (owner_id = auth.uid());

-- Eliminar proyectos propios
CREATE POLICY "projects_delete" ON projects
    FOR DELETE
    USING (owner_id = auth.uid());

-- ============================================
-- POLÍTICAS SIMPLIFICADAS PARA PROJECT_MEMBERS
-- ============================================

-- Ver miembros de proyectos propios
CREATE POLICY "project_members_select" ON project_members
    FOR SELECT
    USING (user_id = auth.uid());

-- Agregar miembros (solo a proyectos propios)
CREATE POLICY "project_members_insert" ON project_members
    FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    );

-- Eliminar miembros (solo de proyectos propios)
CREATE POLICY "project_members_delete" ON project_members
    FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    );

-- ============================================
-- POLÍTICAS SIMPLIFICADAS PARA SCHEMAS
-- ============================================

-- Ver schemas de proyectos propios
CREATE POLICY "schemas_select" ON schemas
    FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    );

-- Crear schemas en proyectos propios
CREATE POLICY "schemas_insert" ON schemas
    FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    );

-- Actualizar schemas de proyectos propios
CREATE POLICY "schemas_update" ON schemas
    FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    );

-- Eliminar schemas de proyectos propios
CREATE POLICY "schemas_delete" ON schemas
    FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    );

-- ============================================
-- FIN - Ahora intenta crear un proyecto
-- ============================================
