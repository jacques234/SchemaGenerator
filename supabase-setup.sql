-- ============================================
-- SCHEMA GENERATOR - Supabase Database Setup
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: projects (Proyectos)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: project_members (Miembros del proyecto)
-- ============================================
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- ============================================
-- TABLA: schemas (Schemas de entidades)
-- ============================================
CREATE TABLE IF NOT EXISTS schemas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    entity TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    mutable BOOLEAN DEFAULT TRUE,
    properties JSONB DEFAULT '{}',
    inheritance JSONB DEFAULT '{"isBase": true}',
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, entity)
);

-- ============================================
-- INDICES para mejor performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_schemas_project_id ON schemas(project_id);
CREATE INDEX IF NOT EXISTS idx_schemas_entity ON schemas(entity);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);

-- ============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schemas_updated_at ON schemas;
CREATE TRIGGER update_schemas_updated_at
    BEFORE UPDATE ON schemas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: projects
-- ============================================

-- Los usuarios pueden ver proyectos donde son miembros o dueños
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT
    USING (
        owner_id = auth.uid() OR
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    );

-- Los usuarios pueden crear proyectos
CREATE POLICY "Users can create projects" ON projects
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Solo el dueño puede actualizar el proyecto
CREATE POLICY "Owners can update projects" ON projects
    FOR UPDATE
    USING (owner_id = auth.uid());

-- Solo el dueño puede eliminar el proyecto
CREATE POLICY "Owners can delete projects" ON projects
    FOR DELETE
    USING (owner_id = auth.uid());

-- ============================================
-- POLÍTICAS: project_members
-- ============================================

-- Los miembros pueden ver otros miembros del mismo proyecto
CREATE POLICY "Members can view project members" ON project_members
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
            UNION
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Solo el dueño puede agregar miembros
CREATE POLICY "Owners can add members" ON project_members
    FOR INSERT
    WITH CHECK (
        project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
    );

-- Solo el dueño puede eliminar miembros
CREATE POLICY "Owners can remove members" ON project_members
    FOR DELETE
    USING (
        project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
    );

-- ============================================
-- POLÍTICAS: schemas
-- ============================================

-- Los miembros pueden ver schemas de sus proyectos
CREATE POLICY "Members can view schemas" ON schemas
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
            UNION
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

-- Owners y editors pueden crear schemas
CREATE POLICY "Editors can create schemas" ON schemas
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
            UNION
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );

-- Owners y editors pueden actualizar schemas
CREATE POLICY "Editors can update schemas" ON schemas
    FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
            UNION
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );

-- Owners y editors pueden eliminar schemas
CREATE POLICY "Editors can delete schemas" ON schemas
    FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
            UNION
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );

-- ============================================
-- HABILITAR REALTIME para schemas
-- ============================================
-- Esto permite sincronización en tiempo real

ALTER PUBLICATION supabase_realtime ADD TABLE schemas;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- Después de ejecutar, ve a Authentication > Providers
-- y habilita Email y/o Google para login
