// ===== Supabase Configuration =====
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import CONFIG from "./config.js";

// Crear cliente de Supabase (global)
const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// ===== State Management =====
const state = {
    user: null,
    currentProject: null,
    userRole: null,  // 'owner', 'editor', o 'viewer'
    properties: [],
    savedSchemas: [],
    editIndex: -1,
    realtimeSubscription: null,
    currentSchemaId: null,  // ID del schema cargado actualmente
    autoSaveTimeout: null,   // Timeout para autoguardado
    diagramZoom: 1,
    diagramPan: { x: 0, y: 0 },
    diagramDragging: false,
    diagramLastPos: { x: 0, y: 0 }
};

// ===== DOM Elements (initialized after DOM load) =====
let elements = {};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    checkAuth();
});

// ===== Initialize DOM Elements =====
function initializeElements() {
    elements = {
        // Auth
        authSection: document.getElementById('authSection'),
        loginForm: document.getElementById('loginForm'),
        loginEmail: document.getElementById('loginEmail'),
        loginPassword: document.getElementById('loginPassword'),
        authError: document.getElementById('authError'),
        
        // User
        userSection: document.getElementById('userSection'),
        userEmail: document.getElementById('userEmail'),
        logoutBtn: document.getElementById('logoutBtn'),
        
        // Main Content
        mainContent: document.getElementById('mainContent'),
        
        // Project
        projectSelect: document.getElementById('projectSelect'),
        newProjectBtn: document.getElementById('newProjectBtn'),
        editProjectBtn: document.getElementById('editProjectBtn'),
        deleteProjectBtn: document.getElementById('deleteProjectBtn'),
        projectInfo: document.getElementById('projectInfo'),
        projectName: document.getElementById('projectName'),
        projectMembersList: document.getElementById('projectMembersList'),
        syncStatus: document.getElementById('syncStatus'),
        inviteMemberBtn: document.getElementById('inviteMemberBtn'),
        
        // Project Modal
        projectModal: document.getElementById('projectModal'),
        projectModalTitle: document.getElementById('projectModalTitle'),
        projectForm: document.getElementById('projectForm'),
        projectId: document.getElementById('projectId'),
        newProjectName: document.getElementById('newProjectName'),
        newProjectDesc: document.getElementById('newProjectDesc'),
        submitProjectBtn: document.getElementById('submitProjectBtn'),
        closeProjectModal: document.getElementById('closeProjectModal'),
        cancelProjectBtn: document.getElementById('cancelProjectBtn'),
        
        // Member Modal
        memberModal: document.getElementById('memberModal'),
        memberForm: document.getElementById('memberForm'),
        memberSelect: document.getElementById('memberSelect'),
        memberRole: document.getElementById('memberRole'),
        closeMemberModal: document.getElementById('closeMemberModal'),
        cancelMemberBtn: document.getElementById('cancelMemberBtn'),
        
        // Sections
        schemasSection: document.getElementById('schemasSection'),
        schemaCount: document.getElementById('schemaCount'),
        schemaSearch: document.getElementById('schemaSearch'),
        gridViewBtn: document.getElementById('gridViewBtn'),
        listViewBtn: document.getElementById('listViewBtn'),
        collectionsSection: document.getElementById('collectionsSection'),
        collectionsChips: document.getElementById('collectionsChips'),
        copyCollectionsBtn: document.getElementById('copyCollectionsBtn'),
        copyCollectionsArrayBtn: document.getElementById('copyCollectionsArrayBtn'),
        twoColumnLayout: document.querySelector('.two-column-layout'),
        entitySection: document.getElementById('entitySection'),
        propertiesSection: document.getElementById('propertiesSection'),
        outputSection: document.getElementById('outputSection'),
        
        // Entity form
        entityName: document.getElementById('entityName'),
        version: document.getElementById('version'),
        mutable: document.getElementById('mutable'),
        
        // Inheritance
        isBase: document.getElementById('isBase'),
        extendsSelect: document.getElementById('extendsSelect'),
        strategy: document.getElementById('strategy'),
        extendsFields: document.querySelectorAll('.extends-fields'),
        
        // Properties
        propertiesList: document.getElementById('propertiesList'),
        emptyState: document.getElementById('emptyState'),
        addPropertyBtn: document.getElementById('addPropertyBtn'),
        
        // Saved Schemas
        savedSchemasList: document.getElementById('savedSchemasList'),
        savedEmptyState: document.getElementById('savedEmptyState'),
        saveSchemaBtn: document.getElementById('saveSchemaBtn'),
        newSchemaBtn: document.getElementById('newSchemaBtn'),
        viewDiagramBtn: document.getElementById('viewDiagramBtn'),
        exportProjectBtn: document.getElementById('exportProjectBtn'),
        importProjectBtn: document.getElementById('importProjectBtn'),
        importFileInput: document.getElementById('importFileInput'),
        
        // Export Modal
        exportModal: document.getElementById('exportModal'),
        closeExportModal: document.getElementById('closeExportModal'),
        cancelExportBtn: document.getElementById('cancelExportBtn'),
        exportSingleFileBtn: document.getElementById('exportSingleFileBtn'),
        exportMultipleFilesBtn: document.getElementById('exportMultipleFilesBtn'),
        
        // Diagram Modal
        diagramModal: document.getElementById('diagramModal'),
        diagramContainer: document.getElementById('diagramContainer'),
        diagramContent: document.getElementById('diagramContent'),
        diagramLoading: document.getElementById('diagramLoading'),
        diagramEmpty: document.getElementById('diagramEmpty'),
        closeDiagramBtn: document.getElementById('closeDiagramBtn'),
        refreshDiagramBtn: document.getElementById('refreshDiagramBtn'),
        exportDiagramBtn: document.getElementById('exportDiagramBtn'),
        exportMermaidBtn: document.getElementById('exportMermaidBtn'),
        zoomInBtn: document.getElementById('zoomInBtn'),
        zoomOutBtn: document.getElementById('zoomOutBtn'),
        zoomResetBtn: document.getElementById('zoomResetBtn'),
        zoomLevel: document.getElementById('zoomLevel'),
        
        // Modal
        propertyModal: document.getElementById('propertyModal'),
        modalTitle: document.getElementById('modalTitle'),
        propertyForm: document.getElementById('propertyForm'),
        closeModal: document.getElementById('closeModal'),
        cancelBtn: document.getElementById('cancelBtn'),
        editIndex: document.getElementById('editIndex'),
        
        // Property form fields
        propKey: document.getElementById('propKey'),
        propName: document.getElementById('propName'),
        propType: document.getElementById('propType'),
        propOrder: document.getElementById('propOrder'),
        propDescription: document.getElementById('propDescription'),
        propGroup: document.getElementById('propGroup'),
        propMaxLength: document.getElementById('propMaxLength'),
        propRequired: document.getElementById('propRequired'),
        propHidden: document.getElementById('propHidden'),
        propIsPrimaryKey: document.getElementById('propIsPrimaryKey'),
        propIsUnique: document.getElementById('propIsUnique'),
        propIsSerchable: document.getElementById('propIsSerchable'),
        propIsSortable: document.getElementById('propIsSortable'),
        propIsReference: document.getElementById('propIsReference'),
        propMutable: document.getElementById('propMutable'),
        
        // Relation
        relationSection: document.getElementById('relationSection'),
        relationKind: document.getElementById('relationKind'),
        relationTargetEntity: document.getElementById('relationTargetEntity'),
        relationLocalField: document.getElementById('relationLocalField'),
        relationTargetField: document.getElementById('relationTargetField'),
        relationCardinality: document.getElementById('relationCardinality'),
        
        // Output
        jsonOutput: document.getElementById('jsonOutput'),
        generateBtn: document.getElementById('generateBtn'),
        copyBtn: document.getElementById('copyBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        
        // Toast & Loading
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage'),
        loadingOverlay: document.getElementById('loadingOverlay')
    };
}

// ===== Event Listeners =====
function initializeEventListeners() {
    // Login form
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Project select
    if (elements.projectSelect) {
        elements.projectSelect.addEventListener('change', handleProjectChange);
    }
    
    // New project
    if (elements.newProjectBtn) {
        elements.newProjectBtn.addEventListener('click', function() {
            openProjectModal();
        });
    }
    
    // Edit project
    if (elements.editProjectBtn) {
        elements.editProjectBtn.addEventListener('click', function() {
            openProjectModal(state.currentProject.id);
        });
    }
    
    // Delete project
    if (elements.deleteProjectBtn) {
        elements.deleteProjectBtn.addEventListener('click', function() {
            handleDeleteProject();
        });
    }
    
    // Project modal
    if (elements.closeProjectModal) {
        elements.closeProjectModal.addEventListener('click', closeProjectModal);
    }
    if (elements.cancelProjectBtn) {
        elements.cancelProjectBtn.addEventListener('click', closeProjectModal);
    }
    if (elements.projectForm) {
        elements.projectForm.addEventListener('submit', handleCreateProject);
    }
    if (elements.projectModal) {
        elements.projectModal.addEventListener('click', function(e) {
            if (e.target === elements.projectModal) closeProjectModal();
        });
    }
    
    // Invite member
    if (elements.inviteMemberBtn) {
        elements.inviteMemberBtn.addEventListener('click', function() {
            openMemberModal();
        });
    }
    
    // Member modal
    if (elements.closeMemberModal) {
        elements.closeMemberModal.addEventListener('click', closeMemberModal);
    }
    if (elements.cancelMemberBtn) {
        elements.cancelMemberBtn.addEventListener('click', closeMemberModal);
    }
    if (elements.memberForm) {
        elements.memberForm.addEventListener('submit', handleInviteMember);
    }
    if (elements.memberModal) {
        elements.memberModal.addEventListener('click', function(e) {
            if (e.target === elements.memberModal) closeMemberModal();
        });
    }
    
    // Inheritance toggle
    if (elements.isBase) {
        elements.isBase.addEventListener('change', handleIsBaseChange);
    }
    
    // Reference checkbox
    if (elements.propIsReference) {
        elements.propIsReference.addEventListener('change', handleReferenceChange);
    }
    
    // Target field change
    if (elements.relationTargetField) {
        elements.relationTargetField.addEventListener('change', handleTargetFieldChange);
    }
    
    // Target entity change
    if (elements.relationTargetEntity) {
        elements.relationTargetEntity.addEventListener('change', handleTargetEntityChange);
    }
    
    // Add property button
    if (elements.addPropertyBtn) {
        elements.addPropertyBtn.addEventListener('click', function() {
            openModal();
        });
    }
    
    // Save schema button
    if (elements.saveSchemaBtn) {
        elements.saveSchemaBtn.addEventListener('click', function() {
            saveCurrentSchema();
        });
    }
    
    // New schema button
    if (elements.newSchemaBtn) {
        elements.newSchemaBtn.addEventListener('click', function() {
            createNewSchema();
        });
    }
    
    // View diagram button
    if (elements.viewDiagramBtn) {
        elements.viewDiagramBtn.addEventListener('click', function() {
            openDiagramViewer();
        });
    }
    
    // Close diagram modal
    if (elements.closeDiagramBtn) {
        elements.closeDiagramBtn.addEventListener('click', function() {
            closeDiagramViewer();
        });
    }
    
    // Refresh diagram
    if (elements.refreshDiagramBtn) {
        elements.refreshDiagramBtn.addEventListener('click', function() {
            renderDiagram();
        });
    }
    
    // Export diagram
    if (elements.exportDiagramBtn) {
        elements.exportDiagramBtn.addEventListener('click', function() {
            exportDiagram();
        });
    }
    
    // Export mermaid code
    if (elements.exportMermaidBtn) {
        elements.exportMermaidBtn.addEventListener('click', function() {
            exportMermaidCode();
        });
    }
    
    // Zoom controls
    if (elements.zoomInBtn) {
        elements.zoomInBtn.addEventListener('click', function() {
            zoomDiagram(0.5);
        });
    }
    if (elements.zoomOutBtn) {
        elements.zoomOutBtn.addEventListener('click', function() {
            zoomDiagram(-0.5);
        });
    }
    if (elements.zoomResetBtn) {
        elements.zoomResetBtn.addEventListener('click', function() {
            resetZoom();
        });
    }
    
    // Export project button
    if (elements.exportProjectBtn) {
        elements.exportProjectBtn.addEventListener('click', function() {
            openExportModal();
        });
    }
    
    // Export modal controls
    if (elements.closeExportModal) {
        elements.closeExportModal.addEventListener('click', closeExportModal);
    }
    if (elements.cancelExportBtn) {
        elements.cancelExportBtn.addEventListener('click', closeExportModal);
    }
    if (elements.exportModal) {
        elements.exportModal.addEventListener('click', function(e) {
            if (e.target === elements.exportModal) closeExportModal();
        });
    }
    if (elements.exportSingleFileBtn) {
        elements.exportSingleFileBtn.addEventListener('click', function() {
            exportProjectSingleFile();
            closeExportModal();
        });
    }
    if (elements.exportMultipleFilesBtn) {
        elements.exportMultipleFilesBtn.addEventListener('click', function() {
            exportProjectMultipleFiles();
            closeExportModal();
        });
    }
    
    // Import project button
    if (elements.importProjectBtn) {
        elements.importProjectBtn.addEventListener('click', function() {
            if (elements.importFileInput) elements.importFileInput.click();
        });
    }
    
    // Import file input change
    if (elements.importFileInput) {
        elements.importFileInput.addEventListener('change', function(e) {
            handleImportFile(e);
        });
    }
    
    // Copy collections button
    if (elements.copyCollectionsBtn) {
        elements.copyCollectionsBtn.addEventListener('click', function() {
            copyCollections();
        });
    }
    
    // Copy collections as array button
    if (elements.copyCollectionsArrayBtn) {
        elements.copyCollectionsArrayBtn.addEventListener('click', function() {
            copyCollectionsArray();
        });
    }
    
    // Schema search
    if (elements.schemaSearch) {
        elements.schemaSearch.addEventListener('input', function() {
            filterSchemas();
        });
    }
    
    // View toggle buttons
    if (elements.gridViewBtn) {
        elements.gridViewBtn.addEventListener('click', function() {
            setSchemaView('grid');
        });
    }
    if (elements.listViewBtn) {
        elements.listViewBtn.addEventListener('click', function() {
            setSchemaView('list');
        });
    }
    
    // Modal controls
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeModal);
    }
    if (elements.cancelBtn) {
        elements.cancelBtn.addEventListener('click', closeModal);
    }
    if (elements.propertyModal) {
        elements.propertyModal.addEventListener('click', function(e) {
            if (e.target === elements.propertyModal) closeModal();
        });
    }
    
    // Property form submit
    if (elements.propertyForm) {
        elements.propertyForm.addEventListener('submit', handlePropertySubmit);
    }
    
    // Output actions
    if (elements.generateBtn) {
        elements.generateBtn.addEventListener('click', function() {
            generateSchema();
        });
    }
    if (elements.copyBtn) {
        elements.copyBtn.addEventListener('click', function() {
            copyToClipboard();
        });
    }
    if (elements.downloadBtn) {
        elements.downloadBtn.addEventListener('click', function() {
            downloadSchema();
        });
    }
    
    // Auto-generate on entity changes
    if (elements.entityName) {
        elements.entityName.addEventListener('input', debounce(generateSchema, 300));
    }
    if (elements.version) {
        elements.version.addEventListener('input', debounce(generateSchema, 300));
    }
    if (elements.mutable) {
        elements.mutable.addEventListener('change', generateSchema);
    }
    if (elements.extendsSelect) {
        elements.extendsSelect.addEventListener('change', generateSchema);
    }
    if (elements.strategy) {
        elements.strategy.addEventListener('change', generateSchema);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeProjectModal();
        }
    });
}

// ===== Authentication =====
async function checkAuth() {
    showLoading(true);
    
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            state.user = session.user;
            showAuthenticatedUI();
            await loadProjects();
        } else {
            showLoginUI();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showLoginUI();
    }
    
    showLoading(false);
    
    // Listen for auth changes
    supabaseClient.auth.onAuthStateChange(function(event, session) {
        if (event === 'SIGNED_IN' && session) {
            state.user = session.user;
            showAuthenticatedUI();
            loadProjects();
        } else if (event === 'SIGNED_OUT') {
            state.user = null;
            showLoginUI();
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    showLoading(true);
    hideAuthError();
    
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        showToast('Sesión iniciada correctamente');
    } catch (error) {
        showAuthError(error.message);
    }
    
    showLoading(false);
}

async function handleLogout() {
    showLoading(true);
    
    try {
        // Unsubscribe from realtime
        if (state.realtimeSubscription) {
            supabaseClient.removeChannel(state.realtimeSubscription);
        }
        
        await supabaseClient.auth.signOut();
        state.user = null;
        state.currentProject = null;
        state.userRole = null;
        state.savedSchemas = [];
        state.properties = [];
        
        // Mostrar pantalla de login
        showLoginUI();
        showToast('Sesión cerrada');
    } catch (error) {
        console.error('Error logout:', error);
        showToast('Error al cerrar sesión', 'error');
    }
    
    showLoading(false);
}

function showAuthenticatedUI() {
    if (elements.authSection) elements.authSection.style.display = 'none';
    if (elements.mainContent) elements.mainContent.style.display = 'block';
    if (elements.userSection) elements.userSection.style.display = 'flex';
    if (elements.userEmail && state.user) {
        elements.userEmail.textContent = state.user.email;
    }
}

function showLoginUI() {
    if (elements.authSection) elements.authSection.style.display = 'block';
    if (elements.mainContent) elements.mainContent.style.display = 'none';
    if (elements.userSection) elements.userSection.style.display = 'none';
}

function showAuthError(message) {
    if (elements.authError) {
        elements.authError.textContent = message;
        elements.authError.style.display = 'block';
    }
}

function hideAuthError() {
    if (elements.authError) {
        elements.authError.style.display = 'none';
    }
}

// ===== Projects =====
async function loadProjects() {
    try {
        // Get projects where user is owner
        const { data: ownedProjects, error: ownedError } = await supabaseClient
            .from('projects')
            .select('*')
            .eq('owner_id', state.user.id);
        
        if (ownedError) throw ownedError;
        
        // Get projects where user is member
        const { data: memberProjects, error: memberError } = await supabaseClient
            .from('project_members')
            .select('project_id, projects(*)')
            .eq('user_id', state.user.id);
        
        if (memberError) throw memberError;
        
        // Combine and deduplicate
        const allProjects = [...(ownedProjects || [])];
        if (memberProjects) {
            memberProjects.forEach(function(m) {
                if (m.projects && !allProjects.find(p => p.id === m.projects.id)) {
                    allProjects.push(m.projects);
                }
            });
        }
        
        // Populate select
        populateProjectSelect(allProjects);
        
        // If only one project, select it automatically
        if (allProjects.length === 1) {
            elements.projectSelect.value = allProjects[0].id;
            await handleProjectChange();
        }
        
    } catch (error) {
        console.error('Error loading projects:', error);
        showToast('Error al cargar proyectos', 'error');
    }
}

function populateProjectSelect(projects) {
    if (!elements.projectSelect) return;
    
    let html = '<option value="">-- Seleccionar Proyecto --</option>';
    projects.forEach(function(project) {
        html += '<option value="' + project.id + '">' + project.name + '</option>';
    });
    elements.projectSelect.innerHTML = html;
}

async function handleProjectChange() {
    const projectId = elements.projectSelect.value;
    
    if (!projectId) {
        state.currentProject = null;
        hideProjectSections();
        return;
    }
    
    showLoading(true);
    
    try {
        // Get project details
        const { data: project, error } = await supabaseClient
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();
        
        if (error) throw error;
        
        state.currentProject = project;
        
        // Determinar rol del usuario en este proyecto
        await determineUserRole(projectId);
        
        showProjectSections();
        applyRoleRestrictions();
        
        // Update project info
        if (elements.projectName) {
            elements.projectName.textContent = project.name;
        }
        if (elements.projectInfo) {
            elements.projectInfo.style.display = 'flex';
        }
        
        // Load schemas and members
        await loadSchemas();
        await loadProjectMembers();
        
        // Re-renderizar con restricciones de rol aplicadas
        renderSavedSchemas();
        renderProperties();
        updateProjectButtons();
        
        // Subscribe to realtime
        subscribeToSchemas();
        
    } catch (error) {
        console.error('Error loading project:', error);
        showToast('Error al cargar proyecto', 'error');
    }
    
    showLoading(false);
}

function showProjectSections() {
    if (elements.schemasSection) elements.schemasSection.style.display = 'block';
    if (elements.collectionsSection) elements.collectionsSection.style.display = 'block';
    if (elements.twoColumnLayout) elements.twoColumnLayout.style.display = 'grid';
    if (elements.entitySection) elements.entitySection.style.display = 'block';
    if (elements.propertiesSection) elements.propertiesSection.style.display = 'block';
    if (elements.outputSection) elements.outputSection.style.display = 'block';
}

function hideProjectSections() {
    if (elements.schemasSection) elements.schemasSection.style.display = 'none';
    if (elements.collectionsSection) elements.collectionsSection.style.display = 'none';
    if (elements.twoColumnLayout) elements.twoColumnLayout.style.display = 'none';
    if (elements.entitySection) elements.entitySection.style.display = 'none';
    if (elements.propertiesSection) elements.propertiesSection.style.display = 'none';
    if (elements.outputSection) elements.outputSection.style.display = 'none';
    if (elements.projectInfo) elements.projectInfo.style.display = 'none';
}

async function determineUserRole(projectId) {
    if (!state.user || !state.currentProject) {
        state.userRole = null;
        return;
    }
    
    // Si es el owner del proyecto
    if (state.currentProject.owner_id === state.user.id) {
        state.userRole = 'owner';
        return;
    }
    
    // Buscar en project_members
    try {
        const { data, error } = await supabaseClient
            .from('project_members')
            .select('role')
            .eq('project_id', projectId)
            .eq('user_id', state.user.id)
            .single();
        
        if (error) {
            state.userRole = 'viewer'; // Por defecto viewer si hay error
        } else {
            state.userRole = data.role || 'viewer';
        }
    } catch (err) {
        state.userRole = 'viewer';
    }
}

function updateProjectButtons() {
    const isOwner = state.userRole === 'owner';
    const canEdit = isOwner || state.userRole === 'editor';
    
    // Botones de proyecto (solo owner)
    if (elements.editProjectBtn) {
        elements.editProjectBtn.style.display = isOwner ? 'inline-block' : 'none';
    }
    if (elements.deleteProjectBtn) {
        elements.deleteProjectBtn.style.display = isOwner ? 'inline-block' : 'none';
    }
    if (elements.inviteMemberBtn) {
        elements.inviteMemberBtn.style.display = isOwner ? 'inline-block' : 'none';
    }
}

function applyRoleRestrictions() {
    const canEdit = state.userRole === 'owner' || state.userRole === 'editor';
    
    // Botones de guardar y agregar
    if (elements.saveSchemaBtn) {
        elements.saveSchemaBtn.style.display = canEdit ? 'inline-flex' : 'none';
    }
    if (elements.addPropertyBtn) {
        elements.addPropertyBtn.style.display = canEdit ? 'inline-flex' : 'none';
    }
    if (elements.importProjectBtn) {
        elements.importProjectBtn.style.display = canEdit ? 'inline-flex' : 'none';
    }

    if (elements.inviteMemberBtn) {
        // Solo owner puede invitar
        elements.inviteMemberBtn.style.display = state.userRole === 'owner' ? 'inline-flex' : 'none';
    }
    
    // Mostrar indicador de rol si es viewer
    if (state.userRole === 'viewer') {
        showToast('Modo solo lectura (Viewer)', 'info');
    }
}

function openProjectModal(projectId) {
    if (projectId) {
        // Modo edición
        const project = state.currentProject;
        if (!project) return;
        
        if (elements.projectModalTitle) elements.projectModalTitle.textContent = 'Editar Proyecto';
        if (elements.projectId) elements.projectId.value = project.id;
        if (elements.newProjectName) elements.newProjectName.value = project.name;
        if (elements.newProjectDesc) elements.newProjectDesc.value = project.description || '';
        if (elements.submitProjectBtn) elements.submitProjectBtn.textContent = 'Guardar Cambios';
    } else {
        // Modo creación
        if (elements.projectModalTitle) elements.projectModalTitle.textContent = 'Nuevo Proyecto';
        if (elements.projectId) elements.projectId.value = '';
        if (elements.projectForm) elements.projectForm.reset();
        if (elements.submitProjectBtn) elements.submitProjectBtn.textContent = 'Crear Proyecto';
    }
    
    if (elements.projectModal) elements.projectModal.classList.add('active');
    if (elements.newProjectName) elements.newProjectName.focus();
}

function closeProjectModal() {
    if (elements.projectModal) elements.projectModal.classList.remove('active');
    if (elements.projectForm) elements.projectForm.reset();
}

async function handleCreateProject(e) {
    e.preventDefault();
    showLoading(true);
    
    const projectId = elements.projectId ? elements.projectId.value : '';
    const name = elements.newProjectName.value.trim();
    const description = elements.newProjectDesc.value.trim();
    
    try {
        if (projectId) {
            // Actualizar proyecto existente
            const { error } = await supabaseClient
                .from('projects')
                .update({
                    name: name,
                    description: description
                })
                .eq('id', projectId);
            
            if (error) throw error;
            
            showToast('Proyecto actualizado: ' + name);
        } else {
            // Crear nuevo proyecto
            const { data, error } = await supabaseClient
                .from('projects')
                .insert({
                    name: name,
                    description: description,
                    owner_id: state.user.id
                })
                .select()
                .single();
            
            if (error) throw error;
            
            // Add owner as member
            await supabaseClient
                .from('project_members')
                .insert({
                    project_id: data.id,
                    user_id: state.user.id,
                    role: 'owner'
                });
            
            // Select the new project
            elements.projectSelect.value = data.id;
            
            showToast('Proyecto creado: ' + name);
        }
        
        closeProjectModal();
        await loadProjects();
        await handleProjectChange();
        
    } catch (error) {
        console.error('Error saving project:', error);
        showToast('Error al guardar proyecto: ' + error.message, 'error');
    }
    
    showLoading(false);
}

async function handleDeleteProject() {
    if (!state.currentProject) {
        showToast('No hay proyecto seleccionado', 'error');
        return;
    }
    
    // Solo el owner puede eliminar
    if (state.userRole !== 'owner') {
        showToast('Solo el propietario puede eliminar el proyecto', 'error');
        return;
    }
    
    const projectName = state.currentProject.name;
    
    if (!confirm('¿Estás seguro de eliminar el proyecto "' + projectName + '"?\n\nEsta acción eliminará también todos los schemas y miembros asociados y no se puede deshacer.')) {
        return;
    }
    
    showLoading(true);
    
    try {
        // Eliminar proyecto (cascade eliminará schemas y members automáticamente si está configurado)
        const { error } = await supabaseClient
            .from('projects')
            .delete()
            .eq('id', state.currentProject.id);
        
        if (error) throw error;
        
        showToast('Proyecto "' + projectName + '" eliminado correctamente');
        
        // Limpiar estado
        state.currentProject = null;
        state.userRole = null;
        state.savedSchemas = [];
        state.properties = [];
        
        // Recargar proyectos y ocultar secciones
        await loadProjects();
        hideProjectSections();
        
    } catch (error) {
        console.error('Error deleting project:', error);
        showToast('Error al eliminar proyecto: ' + error.message, 'error');
    }
    
    showLoading(false);
}

// ===== Project Members =====
function closeMemberModal() {
    if (elements.memberModal) elements.memberModal.classList.remove('active');
    if (elements.memberForm) elements.memberForm.reset();
}

async function loadProjectMembers() {
    if (!state.currentProject || !elements.projectMembersList) return;
    
    try {
        // Get project members
        const { data: members, error: membersError } = await supabaseClient
            .from('project_members')
            .select('id, role, user_id, joined_at')
            .eq('project_id', state.currentProject.id);
        
        if (membersError) throw membersError;
        
        // Get profiles for all user_ids
        const userIds = members.map(m => m.user_id);
        const { data: profiles, error: profilesError } = await supabaseClient
            .from('profiles')
            .select('id, email')
            .in('id', userIds);
        
        if (profilesError) throw profilesError;
        
        // Map emails to members
        const profilesMap = {};
        profiles.forEach(p => {
            profilesMap[p.id] = p.email;
        });
        
        const membersWithEmails = members.map(m => ({
            ...m,
            email: profilesMap[m.user_id] || 'Usuario'
        }));
        
        renderProjectMembers(membersWithEmails || []);
        
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

function renderProjectMembers(members) {
    if (!elements.projectMembersList) return;
    
    if (members.length === 0) {
        elements.projectMembersList.innerHTML = '<span class="no-members">Sin colaboradores</span>';
        return;
    }
    
    // Check if current user is owner
    const isOwner = state.currentProject.owner_id === state.user.id;
    
    let html = '<div class="members-list">';
    
    if (isOwner) {
        // If owner, show all members with emails and delete option
        // Remove duplicates by user_id (keep only the first occurrence)
        const uniqueMembers = [];
        const seenUserIds = new Set();
        
        members.forEach(function(member) {
            if (!seenUserIds.has(member.user_id)) {
                seenUserIds.add(member.user_id);
                uniqueMembers.push(member);
            }
        });
        
        uniqueMembers.forEach(function(member) {
            const isMemberOwner = member.role === 'owner';
            const isCurrentUser = member.user_id === state.user.id;
            const email = member.email || 'Usuario';
            
            // Determine role label
            let roleLabel = '';
            if (member.role === 'owner') {
                roleLabel = '👑 Owner';
            } else if (member.role === 'editor') {
                roleLabel = '✏️ Editor';
            } else {
                roleLabel = '👁️ Viewer';
            }
            
            html += '<div class="member-item">';
            html += '<span class="member-email">' + email + '</span>';
            html += '<span class="member-role">' + roleLabel + '</span>';
            
            // Only show remove button if it's not themselves and not owner role
            if (!isCurrentUser && !isMemberOwner) {
                html += '<button class="btn btn-danger btn-xs" onclick="removeMember(\'' + member.id + '\')" title="Eliminar">✕</button>';
            }
            html += '</div>';
        });
    } else {
        // If not owner, show only current user's role
        const currentUserMember = members.find(m => m.user_id === state.user.id);
        
        if (!currentUserMember) {
            elements.projectMembersList.innerHTML = '<span class="no-members">No eres miembro</span>';
            return;
        }
        
        // Determine role label
        let roleLabel = '';
        if (currentUserMember.role === 'owner') {
            roleLabel = '👑 Owner';
        } else if (currentUserMember.role === 'editor') {
            roleLabel = '✏️ Editor';
        } else {
            roleLabel = '👁️ Viewer';
        }
        
        html += '<div class="member-item">';
        html += '<span class="member-role">' + roleLabel + '</span>';
        html += '</div>';
    }
    
    html += '</div>';
    elements.projectMembersList.innerHTML = html;
}

async function openMemberModal() {
    if (elements.memberModal) elements.memberModal.classList.add('active');
    
    // Load available users
    await loadAvailableUsers();
}

async function loadAvailableUsers() {
    if (!elements.memberSelect) return;
    
    try {
        // Get all profiles
        const { data: profiles, error: profilesError } = await supabaseClient
            .from('profiles')
            .select('id, email');
        
        if (profilesError) throw profilesError;
        
        // Get current project members to exclude them
        const { data: members, error: membersError } = await supabaseClient
            .from('project_members')
            .select('user_id')
            .eq('project_id', state.currentProject.id);
        
        if (membersError) throw membersError;
        
        const memberIds = (members || []).map(m => m.user_id);
        
        // Filter out users who are already members
        const availableUsers = (profiles || []).filter(p => !memberIds.includes(p.id));
        
        // Populate select
        let html = '<option value="">-- Seleccionar usuario --</option>';
        availableUsers.forEach(function(user) {
            html += '<option value="' + user.id + '">' + user.email + '</option>';
        });
        elements.memberSelect.innerHTML = html;
        
        if (availableUsers.length === 0) {
            elements.memberSelect.innerHTML = '<option value="">No hay usuarios disponibles</option>';
        }
        
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error al cargar usuarios. Ejecuta create-profiles.sql', 'error');
    }
}

async function handleInviteMember(e) {
    e.preventDefault();
    
    const userId = elements.memberSelect ? elements.memberSelect.value : '';
    const role = elements.memberRole ? elements.memberRole.value : 'editor';
    
    if (!userId) {
        showToast('Selecciona un usuario', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const { error } = await supabaseClient
            .from('project_members')
            .insert({
                project_id: state.currentProject.id,
                user_id: userId,
                role: role
            });
        
        if (error) throw error;
        
        closeMemberModal();
        await loadProjectMembers();
        showToast('Miembro agregado correctamente');
        
    } catch (error) {
        console.error('Error inviting member:', error);
        showToast('Error al invitar: ' + error.message, 'error');
    }
    
    showLoading(false);
}

async function removeMember(memberId) {
    if (!confirm('¿Estás seguro de eliminar este colaborador?')) return;
    
    showLoading(true);
    
    try {
        const { error } = await supabaseClient
            .from('project_members')
            .delete()
            .eq('id', memberId);
        
        if (error) throw error;
        
        await loadProjectMembers();
        showToast('Colaborador eliminado');
        
    } catch (error) {
        console.error('Error removing member:', error);
        showToast('Error al eliminar: ' + error.message, 'error');
    }
    
    showLoading(false);
}

// ===== Schemas (Supabase) =====
async function loadSchemas() {
    if (!state.currentProject) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('schemas')
            .select('*')
            .eq('project_id', state.currentProject.id)
            .order('entity');
        
        if (error) throw error;
        
        state.savedSchemas = data || [];
        renderSavedSchemas();
        renderCollections();
        updateEntitySelectors();
        
    } catch (error) {
        console.error('Error loading schemas:', error);
        showToast('Error al cargar schemas', 'error');
    }
}

function subscribeToSchemas() {
    if (!state.currentProject) return;
    
    // Unsubscribe from previous
    if (state.realtimeSubscription) {
        supabaseClient.removeChannel(state.realtimeSubscription);
    }
    
    // Subscribe to changes
    state.realtimeSubscription = supabaseClient
        .channel('schemas-changes')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'schemas',
                filter: 'project_id=eq.' + state.currentProject.id
            }, 
            function(payload) {
                console.log('Realtime update:', payload);
                handleRealtimeChange(payload);
            }
        )
        .subscribe();
    
    updateSyncStatus('synced');
}

function handleRealtimeChange(payload) {
    updateSyncStatus('syncing');
    
    if (payload.eventType === 'INSERT') {
        // Add new schema
        const exists = state.savedSchemas.find(s => s.id === payload.new.id);
        if (!exists) {
            state.savedSchemas.push(payload.new);
            showToast('Nuevo schema: ' + payload.new.entity);
        }
    } else if (payload.eventType === 'UPDATE') {
        // Update existing schema
        const index = state.savedSchemas.findIndex(s => s.id === payload.new.id);
        if (index >= 0) {
            state.savedSchemas[index] = payload.new;
            showToast('Schema actualizado: ' + payload.new.entity);
        }
    } else if (payload.eventType === 'DELETE') {
        // Remove deleted schema
        state.savedSchemas = state.savedSchemas.filter(s => s.id !== payload.old.id);
        showToast('Schema eliminado');
    }
    
    renderSavedSchemas();
    updateEntitySelectors();
    
    setTimeout(function() {
        updateSyncStatus('synced');
    }, 1000);
}

function updateSyncStatus(status) {
    if (!elements.syncStatus) return;
    
    const indicator = elements.syncStatus.querySelector('.sync-indicator');
    const text = elements.syncStatus.querySelector('span:last-child');
    
    if (indicator) {
        indicator.className = 'sync-indicator ' + status;
    }
    if (text) {
        text.textContent = status === 'synced' ? 'Sincronizado' : 'Sincronizando...';
    }
}

// ===== Check Circular Inheritance =====
function checkCircularInheritance(entityName, parentEntity) {
    // Si el padre es el mismo que la entidad actual
    if (entityName === parentEntity) {
        return 'Error: Una entidad no puede heredar de sí misma';
    }
    
    // Buscar la cadena de herencia
    const visited = new Set();
    let currentEntity = parentEntity;
    
    while (currentEntity) {
        // Si ya visitamos esta entidad, hay un ciclo
        if (visited.has(currentEntity)) {
            return 'Error: Se detectó herencia circular en la cadena: ' + Array.from(visited).join(' → ') + ' → ' + currentEntity;
        }
        
        // Si el padre eventualmente hereda de la entidad actual, es circular
        if (currentEntity === entityName) {
            return 'Error: Herencia circular detectada - "' + parentEntity + '" no puede heredar de "' + entityName + '" porque crearía un ciclo';
        }
        
        visited.add(currentEntity);
        
        // Buscar el schema del padre actual
        const parentSchema = state.savedSchemas.find(s => s.entity === currentEntity);
        
        // Si no existe o no hereda de nadie, terminamos
        if (!parentSchema || !parentSchema.inheritance || !parentSchema.inheritance.extends) {
            break;
        }
        
        // Continuar con el siguiente padre
        currentEntity = parentSchema.inheritance.extends;
    }
    
    // No hay herencia circular
    return null;
}

async function saveCurrentSchema() {
    if (!state.currentProject) {
        showToast('Selecciona un proyecto primero', 'error');
        return;
    }
    
    const entityName = elements.entityName ? elements.entityName.value.trim() : '';
    
    if (!entityName) {
        showToast('Ingresa el nombre de la entidad primero', 'error');
        return;
    }
    
    // Validar herencia circular
    const inheritanceObj = buildInheritanceObject();
    if (inheritanceObj.extends) {
        const circularError = checkCircularInheritance(entityName, inheritanceObj.extends);
        if (circularError) {
            showToast(circularError, 'error');
            return;
        }
    }
    
    showLoading(true);
    updateSyncStatus('syncing');
    
    try {
        // Build schema object
        const schemaData = {
            project_id: state.currentProject.id,
            entity: entityName,
            version: elements.version ? parseInt(elements.version.value) || 1 : 1,
            mutable: elements.mutable ? elements.mutable.checked : true,
            properties: buildPropertiesObject(),
            inheritance: inheritanceObj,
            updated_by: state.user.id
        };
        
        // Check if exists
        const existing = state.savedSchemas.find(s => s.entity === entityName);
        
        if (existing) {
            // Update
            const { error } = await supabaseClient
                .from('schemas')
                .update(schemaData)
                .eq('id', existing.id);
            
            if (error) throw error;
            showToast('Schema "' + entityName + '" actualizado');
        } else {
            // Insert
            schemaData.created_by = state.user.id;
            
            const { error } = await supabaseClient
                .from('schemas')
                .insert(schemaData);
            
            if (error) throw error;
            showToast('Schema "' + entityName + '" guardado');
        }
        
        await loadSchemas();
        
    } catch (error) {
        console.error('Error saving schema:', error);
        showToast('Error al guardar: ' + error.message, 'error');
    }
    
    showLoading(false);
    updateSyncStatus('synced');
}

function buildPropertiesObject() {
    const props = {};
    state.properties.forEach(function(prop) {
        const propObj = {
            Type: prop.Type,
            Name: prop.Name,
            Required: prop.Required,
            Hidden: prop.Hidden,
            Mutable: prop.Mutable !== undefined ? prop.Mutable : false,
            isHeritable: prop.isHeritable,
            Order: prop.Order,
            IsPrimaryKey: prop.IsPrimaryKey,
            IsUnique: prop.IsUnique,
            IsSerchable: prop.IsSerchable,
            IsSortable: prop.IsSortable
        };
        
        if (prop.Description) propObj.Description = prop.Description;
        if (prop.Group) propObj.Group = prop.Group;
        if (prop.MaxLength && prop.MaxLength > 0) propObj.MaxLength = prop.MaxLength;
        if (prop.Relation) propObj.Relation = prop.Relation;
        
        props[prop.key] = propObj;
    });
    return props;
}

function buildInheritanceObject() {
    const inheritance = {
        isBase: elements.isBase ? elements.isBase.checked : true
    };
    
    // Ahora una entidad puede ser base y heredar al mismo tiempo
    // Solo incluir extends y strategy si tienen valores seleccionados
    if (elements.extendsSelect && elements.extendsSelect.value) {
        inheritance.extends = elements.extendsSelect.value;
    }
    if (elements.strategy && elements.strategy.value && elements.strategy.value !== '') {
        inheritance.strategy = elements.strategy.value;
    }
    
    return inheritance;
}

function createNewSchema() {
    // Clear fields
    if (elements.entityName) elements.entityName.value = '';
    if (elements.version) elements.version.value = 1;
    if (elements.mutable) elements.mutable.checked = true;
    if (elements.isBase) elements.isBase.checked = true;
    if (elements.extendsSelect) elements.extendsSelect.value = '';
    if (elements.strategy) elements.strategy.value = '';
    
    state.properties = [];
    state.currentSchemaId = null;  // Limpiar ID para crear nuevo
    
    handleIsBaseChange();
    renderProperties();
    generateSchema();
    
    if (elements.entityName) elements.entityName.focus();
    
    showToast('Listo para crear nuevo schema');
}

function loadSchema(schemaId) {
    const schema = state.savedSchemas.find(s => s.id === schemaId);
    if (!schema) return;
    
    // Guardar ID del schema actual para autoguardado
    state.currentSchemaId = schemaId;
    
    // Load entity info
    if (elements.entityName) elements.entityName.value = schema.entity;
    if (elements.version) elements.version.value = schema.version || 1;
    if (elements.mutable) elements.mutable.checked = schema.mutable !== false;
    
    // Load inheritance
    if (elements.isBase) elements.isBase.checked = schema.inheritance?.isBase !== false;
    if (elements.extendsSelect) elements.extendsSelect.value = schema.inheritance?.extends || '';
    if (elements.strategy) elements.strategy.value = schema.inheritance?.strategy || '';
    
    // Load properties
    state.properties = Object.entries(schema.properties || {}).map(function([key, prop]) {
        return {
            key: key,
            Type: prop.Type,
            Name: prop.Name,
            Description: prop.Description,
            MaxLength: prop.MaxLength,
            Required: prop.Required,
            Hidden: prop.Hidden,
            Mutable: prop.Mutable !== undefined ? prop.Mutable : false,
            isHeritable: prop.isHeritable,
            Group: prop.Group,
            Order: prop.Order,
            IsPrimaryKey: prop.IsPrimaryKey,
            IsUnique: prop.IsUnique,
            IsSerchable: prop.IsSerchable,
            IsSortable: prop.IsSortable,
            Relation: prop.Relation
        };
    });
    
    handleIsBaseChange();
    renderProperties();
    generateSchema();
    
    showToast('Schema "' + schema.entity + '" cargado');
}

async function deleteSchema(schemaId) {
    // Verificar permisos
    const canEdit = state.userRole === 'owner' || state.userRole === 'editor';
    if (!canEdit) {
        showToast('No tienes permisos para eliminar schemas', 'error');
        return;
    }
    
    const schema = state.savedSchemas.find(s => s.id === schemaId);
    if (!schema) return;
    
    if (!confirm('¿Estás seguro de eliminar el schema "' + schema.entity + '"?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        const { error } = await supabaseClient
            .from('schemas')
            .delete()
            .eq('id', schemaId);
        
        if (error) throw error;
        
        await loadSchemas();
        showToast('Schema "' + schema.entity + '" eliminado');
        
    } catch (error) {
        console.error('Error deleting schema:', error);
        showToast('Error al eliminar: ' + error.message, 'error');
    }
    
    showLoading(false);
}

function renderSavedSchemas() {
    if (!elements.savedSchemasList) return;
    
    if (state.savedSchemas.length === 0) {
        elements.savedSchemasList.innerHTML = '<div class="empty-state"><p>No hay schemas en este proyecto</p><small>Crea un schema para empezar</small></div>';
        return;
    }
    
    const canEdit = state.userRole === 'owner' || state.userRole === 'editor';
    
    let html = '';
    state.savedSchemas.forEach(function(schema) {
        const propCount = Object.keys(schema.properties || {}).length;
        const isBase = schema.inheritance?.isBase;
        const extendsFrom = schema.inheritance?.extends;
        
        html += '<div class="saved-schema-card" data-id="' + schema.id + '">';
        html += '<div class="schema-info">';
        html += '<h4 title="' + schema.entity + '">' + schema.entity + '</h4>';
        html += '<span class="schema-meta">';
        html += 'v' + (schema.version || 1) + ' • ' + propCount + ' propiedades';
        if (isBase) html += ' <span class="badge">Base</span>';
        if (extendsFrom) html += ' <span class="badge" title="Extiende de: ' + extendsFrom + '">extends: ' + extendsFrom + '</span>';
        html += '</span>';
        html += '</div>';
        html += '<div class="schema-actions">';
        html += '<button class="btn btn-secondary btn-icon" onclick="loadSchema(\'' + schema.id + '\')" title="Cargar">📂</button>';
        html += '<button class="btn btn-secondary btn-icon" onclick="exportSchema(\'' + schema.id + '\')" title="Exportar">📤</button>';
        if (canEdit) {
            html += '<button class="btn btn-danger btn-icon" onclick="deleteSchema(\'' + schema.id + '\')" title="Eliminar">🗑️</button>';
        }
        html += '</div>';
        html += '</div>';
    });
    
    elements.savedSchemasList.innerHTML = html;
}

// ===== Render Collections (Chips) =====
function renderCollections() {
    if (!elements.collectionsChips) return;
    
    if (state.savedSchemas.length === 0) {
        elements.collectionsChips.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">No hay collections aún</span>';
        return;
    }
    
    let html = '';
    state.savedSchemas.forEach(function(schema) {
        html += '<div class="collection-chip" onclick="copyCollectionName(\'' + schema.entity + '\')" title="Click para copiar">';
        html += '<span class="chip-name">' + schema.entity + '</span>';
        html += '<span class="chip-copy">📋</span>';
        html += '</div>';
    });
    
    elements.collectionsChips.innerHTML = html;
    
    // Update schema count
    if (elements.schemaCount) {
        elements.schemaCount.textContent = '(' + state.savedSchemas.length + ')';
    }
}

function copyCollectionName(name) {
    navigator.clipboard.writeText(name).then(function() {
        showToast('"' + name + '" copiado');
    }).catch(function() {
        showToast('Error al copiar', 'error');
    });
}

function copyCollections() {
    const collections = state.savedSchemas.map(function(schema) {
        return schema.entity;
    });
    
    const output = {
        collections: collections
    };
    
    const json = JSON.stringify(output, null, 2);
    
    navigator.clipboard.writeText(json).then(function() {
        showToast('JSON copiado al portapapeles');
    }).catch(function() {
        showToast('Error al copiar', 'error');
    });
}

function copyCollectionsArray() {
    const collections = state.savedSchemas.map(function(schema) {
        return schema.entity;
    });
    
    const json = JSON.stringify(collections);
    
    navigator.clipboard.writeText(json).then(function() {
        showToast('Array copiado: ' + collections.length + ' items');
    }).catch(function() {
        showToast('Error al copiar', 'error');
    });
}

// ===== Schema View Toggle =====
function setSchemaView(view) {
    if (!elements.savedSchemasList) return;
    
    if (view === 'grid') {
        elements.savedSchemasList.classList.remove('saved-schemas-list');
        elements.savedSchemasList.classList.add('saved-schemas-grid');
        if (elements.gridViewBtn) elements.gridViewBtn.classList.add('active');
        if (elements.listViewBtn) elements.listViewBtn.classList.remove('active');
    } else {
        elements.savedSchemasList.classList.remove('saved-schemas-grid');
        elements.savedSchemasList.classList.add('saved-schemas-list');
        if (elements.listViewBtn) elements.listViewBtn.classList.add('active');
        if (elements.gridViewBtn) elements.gridViewBtn.classList.remove('active');
    }
}

// ===== Filter Schemas =====
function filterSchemas() {
    const searchTerm = elements.schemaSearch ? elements.schemaSearch.value.toLowerCase().trim() : '';
    const cards = document.querySelectorAll('.saved-schema-card');
    
    cards.forEach(function(card) {
        const schemaName = card.querySelector('h4')?.textContent.toLowerCase() || '';
        if (searchTerm === '' || schemaName.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== Export Single Schema =====
function exportSchema(schemaId) {
    const schema = state.savedSchemas.find(s => s.id === schemaId);
    if (!schema) return;
    
    const exportData = {
        entity: schema.entity,
        version: schema.version || 1,
        mutable: schema.mutable !== false,
        properties: schema.properties || {},
        inheritance: schema.inheritance || { isBase: true }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = schema.entity + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Schema "' + schema.entity + '" exportado');
}

// ===== Import Project or Schema =====
async function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset input para permitir reimportar el mismo archivo
    e.target.value = '';
    
    if (!state.currentProject) {
        showToast('Selecciona un proyecto primero', 'error');
        return;
    }
    
    // Verificar permisos
    const canEdit = state.userRole === 'owner' || state.userRole === 'editor';
    if (!canEdit) {
        showToast('No tienes permisos para importar schemas', 'error');
        return;
    }
    
    try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        // Detectar si es un schema individual o un proyecto
        let schemas = [];
        let sourceName = 'archivo';
        
        if (importData.schemas && Array.isArray(importData.schemas)) {
            // Es un proyecto exportado
            schemas = importData.schemas;
            sourceName = importData.projectName || 'proyecto';
        } else if (importData.entity) {
            // Es un schema individual
            schemas = [importData];
            sourceName = importData.entity;
        } else {
            showToast('Archivo inválido: formato no reconocido', 'error');
            return;
        }
        
        if (schemas.length === 0) {
            showToast('El archivo no contiene schemas', 'error');
            return;
        }
        
        // Confirmar importación
        const isMultiple = schemas.length > 1;
        const msg = isMultiple 
            ? '¿Importar ' + schemas.length + ' schemas de "' + sourceName + '"?\n\nLos schemas existentes con el mismo nombre serán actualizados.'
            : '¿Importar schema "' + schemas[0].entity + '"?\n\nSi ya existe, será actualizado.';
        if (!confirm(msg)) return;
        
        showLoading(true);
        
        let imported = 0;
        let updated = 0;
        let errors = 0;
        
        for (const schema of schemas) {
            try {
                // Verificar si ya existe
                const existing = state.savedSchemas.find(s => s.entity === schema.entity);
                
                const schemaData = {
                    project_id: state.currentProject.id,
                    entity: schema.entity,
                    version: schema.version || 1,
                    mutable: schema.mutable !== false,
                    properties: schema.properties || {},
                    inheritance: schema.inheritance || { isBase: true },
                    updated_by: state.user.id
                };
                
                if (existing) {
                    // Update
                    const { error } = await supabaseClient
                        .from('schemas')
                        .update(schemaData)
                        .eq('id', existing.id);
                    
                    if (error) throw error;
                    updated++;
                } else {
                    // Insert
                    schemaData.created_by = state.user.id;
                    
                    const { error } = await supabaseClient
                        .from('schemas')
                        .insert(schemaData);
                    
                    if (error) throw error;
                    imported++;
                }
            } catch (err) {
                console.error('Error importing schema:', schema.entity, err);
                errors++;
            }
        }
        
        await loadSchemas();
        
        let message = 'Importación completada: ';
        if (imported > 0) message += imported + ' nuevos';
        if (updated > 0) message += (imported > 0 ? ', ' : '') + updated + ' actualizados';
        if (errors > 0) message += (imported > 0 || updated > 0 ? ', ' : '') + errors + ' errores';
        
        showToast(message);
        
    } catch (error) {
        console.error('Error parsing import file:', error);
        showToast('Error al leer archivo: formato inválido', 'error');
    }
    
    showLoading(false);
}

// ===== Update Entity Selectors =====
function updateEntitySelectors() {
    if (!elements.extendsSelect || !elements.relationTargetEntity) return;
    
    const currentEntity = elements.entityName ? elements.entityName.value.trim() : '';
    
    // Guardar valor actual antes de reconstruir
    const currentExtendsValue = elements.extendsSelect.value;
    const currentTargetValue = elements.relationTargetEntity.value;
    
    // Update extends selector
    let extendsHtml = '<option value="">-- Seleccionar entidad --</option>';
    state.savedSchemas.forEach(function(schema) {
        if (schema.entity !== currentEntity) {
            const selected = schema.entity === currentExtendsValue ? ' selected' : '';
            extendsHtml += '<option value="' + schema.entity + '"' + selected + '>' + schema.entity + '</option>';
        }
    });
    elements.extendsSelect.innerHTML = extendsHtml;
    
    // Update relation target entity selector
    let targetHtml = '<option value="">-- Seleccionar entidad --</option>';
    state.savedSchemas.forEach(function(schema) {
        const selected = schema.entity === currentTargetValue ? ' selected' : '';
        targetHtml += '<option value="' + schema.entity + '"' + selected + '>' + schema.entity + '</option>';
    });
    elements.relationTargetEntity.innerHTML = targetHtml;
}

// ===== Handle Target Entity Change =====
function handleTargetEntityChange() {
    if (!elements.relationTargetEntity || !elements.relationTargetField) return;
    
    const targetEntityName = elements.relationTargetEntity.value;
    
    elements.relationTargetField.innerHTML = '<option value="">-- Seleccionar campo --</option>';
    
    if (!targetEntityName) return;
    
    const targetSchema = state.savedSchemas.find(s => s.entity === targetEntityName);
    if (!targetSchema || !targetSchema.properties) return;
    
    let html = '<option value="">-- Seleccionar campo --</option>';
    Object.keys(targetSchema.properties).forEach(function(fieldKey) {
        const prop = targetSchema.properties[fieldKey];
        let label = fieldKey + ' (' + prop.Type + ')';
        if (prop.IsPrimaryKey) {
            label += ' 🔑';
        }
        html += '<option value="' + fieldKey + '" data-type="' + prop.Type + '">' + label + '</option>';
    });
    elements.relationTargetField.innerHTML = html;
}

// ===== Handle Target Field Change =====
function handleTargetFieldChange() {
    if (!elements.relationTargetField || !elements.propType) return;
    if (!elements.propIsReference || !elements.propIsReference.checked) return;
    
    const selectedOption = elements.relationTargetField.options[elements.relationTargetField.selectedIndex];
    const targetType = selectedOption ? selectedOption.getAttribute('data-type') : null;
    
    if (targetType) {
        elements.propType.value = targetType;
    }
}

// ===== Inheritance Toggle =====
function handleIsBaseChange() {
    // Los campos de herencia ahora siempre están visibles
    // Solo regeneramos el schema cuando cambia el checkbox
    updateEntitySelectors();
    generateSchema();
}

// ===== Reference Checkbox Handler =====
function handleReferenceChange() {
    if (!elements.propIsReference || !elements.relationSection) return;
    
    const isReference = elements.propIsReference.checked;
    elements.relationSection.style.display = isReference ? 'block' : 'none';
    
    if (elements.propType) {
        elements.propType.disabled = isReference;
    }
    
    if (isReference) {
        updateEntitySelectors();
        // Si ya hay un target field seleccionado, actualizar el tipo
        if (elements.relationTargetField && elements.relationTargetField.value) {
            handleTargetFieldChange();
        }
    }
}

// ===== Modal Functions =====
function openModal(index) {
    if (index === undefined) index = -1;
    
    state.editIndex = index;
    if (elements.editIndex) elements.editIndex.value = index;
    
    updateEntitySelectors();
    
    if (index >= 0) {
        if (elements.modalTitle) elements.modalTitle.textContent = 'Editar Propiedad';
        populateForm(state.properties[index]);
    } else {
        if (elements.modalTitle) elements.modalTitle.textContent = 'Agregar Propiedad';
        resetForm();
        if (elements.propOrder) elements.propOrder.value = state.properties.length + 1;
    }
    
    if (elements.propertyModal) elements.propertyModal.classList.add('active');
    if (elements.propKey) elements.propKey.focus();
}

function closeModal() {
    if (elements.propertyModal) elements.propertyModal.classList.remove('active');
    resetForm();
    state.editIndex = -1;
}

function resetForm() {
    if (elements.propertyForm) elements.propertyForm.reset();
    if (elements.propOrder) elements.propOrder.value = 1;
    if (elements.propMaxLength) elements.propMaxLength.value = 0;
    if (elements.relationSection) elements.relationSection.style.display = 'none';
    if (elements.propType) elements.propType.disabled = false;
    if (elements.relationTargetField) {
        elements.relationTargetField.innerHTML = '<option value="">-- Primero selecciona entidad --</option>';
    }
}

function populateForm(property) {
    if (!property) return;
    
    if (elements.propKey) elements.propKey.value = property.key || '';
    if (elements.propName) elements.propName.value = property.Name || '';
    if (elements.propType) elements.propType.value = property.Type || 'string';
    if (elements.propOrder) elements.propOrder.value = property.Order || 1;
    if (elements.propDescription) elements.propDescription.value = property.Description || '';
    if (elements.propGroup) elements.propGroup.value = property.Group || '';
    if (elements.propMaxLength) elements.propMaxLength.value = property.MaxLength || 0;
    if (elements.propRequired) elements.propRequired.checked = property.Required || false;
    if (elements.propHidden) elements.propHidden.checked = property.Hidden || false;
    if (elements.propMutable) elements.propMutable.checked = property.Mutable || false;
    if (elements.propIsPrimaryKey) elements.propIsPrimaryKey.checked = property.IsPrimaryKey || false;
    if (elements.propIsUnique) elements.propIsUnique.checked = property.IsUnique || false;
    if (elements.propIsSerchable) elements.propIsSerchable.checked = property.IsSerchable || false;
    if (elements.propIsSortable) elements.propIsSortable.checked = property.IsSortable || false;
    
    if (property.Relation) {
        if (elements.propIsReference) elements.propIsReference.checked = true;
        if (elements.relationSection) elements.relationSection.style.display = 'block';
        if (elements.propType) elements.propType.disabled = true;
        if (elements.relationKind) elements.relationKind.value = property.Relation.Kind || 'lookup';
        if (elements.relationTargetEntity) elements.relationTargetEntity.value = property.Relation.TargetEntity || '';
        if (elements.relationLocalField) elements.relationLocalField.value = property.Relation.LocalField || '';
        if (elements.relationCardinality) elements.relationCardinality.value = property.Relation.Cardinality || 'one-to-one';
        
        handleTargetEntityChange();
        setTimeout(function() {
            if (elements.relationTargetField) {
                elements.relationTargetField.value = property.Relation.TargetField || '';
            }
        }, 50);
    } else {
        if (elements.propIsReference) elements.propIsReference.checked = false;
        if (elements.relationSection) elements.relationSection.style.display = 'none';
        if (elements.propType) elements.propType.disabled = false;
    }
}

// ===== Property Form Submit =====
function handlePropertySubmit(e) {
    e.preventDefault();
    
    const property = {
        key: elements.propKey ? elements.propKey.value.trim() : '',
        Type: elements.propType ? elements.propType.value : 'string',
        Name: elements.propName ? elements.propName.value.trim() : '',
        Required: elements.propRequired ? elements.propRequired.checked : false,
        Hidden: elements.propHidden ? elements.propHidden.checked : false,
        Mutable: elements.propMutable ? elements.propMutable.checked : false,
        Order: elements.propOrder ? (parseInt(elements.propOrder.value) || 1) : 1,
        IsPrimaryKey: elements.propIsPrimaryKey ? elements.propIsPrimaryKey.checked : false,
        IsUnique: elements.propIsUnique ? elements.propIsUnique.checked : false,
        IsSerchable: elements.propIsSerchable ? elements.propIsSerchable.checked : false,
        IsSortable: elements.propIsSortable ? elements.propIsSortable.checked : false
    };
    
    if (elements.propDescription) {
        const description = elements.propDescription.value.trim();
        if (description) property.Description = description;
    }
    
    if (elements.propGroup) {
        const group = elements.propGroup.value.trim();
        if (group) property.Group = group;
    }
    
    if (elements.propMaxLength) {
        const maxLength = parseInt(elements.propMaxLength.value);
        if (maxLength > 0) property.MaxLength = maxLength;
    }
    
    if (elements.propIsReference && elements.propIsReference.checked) {
        const kind = elements.relationKind ? elements.relationKind.value : 'lookup';
        const targetEntity = elements.relationTargetEntity ? elements.relationTargetEntity.value : '';
        const localField = elements.relationLocalField ? elements.relationLocalField.value.trim() : '';
        const targetField = elements.relationTargetField ? elements.relationTargetField.value : '';
        const cardinality = elements.relationCardinality ? elements.relationCardinality.value : 'one-to-one';
        
        if (targetEntity || localField || targetField) {
            property.Relation = {
                Kind: kind,
                TargetEntity: targetEntity,
                LocalField: localField,
                TargetField: targetField,
                Cardinality: cardinality
            };
        }
    }
    
    if (state.editIndex >= 0) {
        state.properties[state.editIndex] = property;
        showToast('Propiedad actualizada');
    } else {
        state.properties.push(property);
        showToast('Propiedad agregada');
    }
    
    state.properties.sort(function(a, b) {
        return a.Order - b.Order;
    });
    
    renderProperties();
    generateSchema();
    closeModal();
}

// ===== Render Properties =====
function renderProperties() {
    if (!elements.propertiesList) return;
    
    if (state.properties.length === 0) {
        elements.propertiesList.innerHTML = '<div class="empty-state" id="emptyState"><div class="empty-icon">📭</div><p>No hay propiedades definidas</p><small>Haz clic en "Agregar Propiedad" para comenzar</small></div>';
        return;
    }
    
    // Ordenar propiedades por Order antes de renderizar
    const sortedProperties = [...state.properties].sort((a, b) => a.Order - b.Order);
    
    const canEdit = state.userRole === 'owner' || state.userRole === 'editor';
    
    let html = '';
    sortedProperties.forEach(function(prop, index) {
        const actualIndex = state.properties.indexOf(prop);
        html += '<div class="property-card" data-index="' + index + '">';
        html += '<div class="property-info">';
        html += '<div class="property-order">' + prop.Order + '</div>';
        html += '<div class="property-details">';
        html += '<h4>' + prop.key + '</h4>';
        html += '<span>' + prop.Type + ' • ' + prop.Name + '</span>';
        if (prop.Relation) {
            html += '<span class="relation-info">→ ' + prop.Relation.TargetEntity + '.' + prop.Relation.TargetField + '</span>';
        }
        html += '</div>';
        html += '<div class="property-badges">';
        if (prop.Required) html += '<span class="badge required">Required</span>';
        if (prop.IsPrimaryKey) html += '<span class="badge primary">Primary Key</span>';
        if (prop.IsUnique) html += '<span class="badge">Unique</span>';
        if (prop.Relation) html += '<span class="badge relation">Reference</span>';
        html += '</div>';
        html += '</div>';
        if (canEdit) {
            html += '<div class="property-actions">';
            html += '<button class="btn btn-secondary btn-icon" onclick="editProperty(' + actualIndex + ')" title="Editar">✏️</button>';
            html += '<button class="btn btn-danger btn-icon" onclick="deleteProperty(' + actualIndex + ')" title="Eliminar">🗑️</button>';
            html += '</div>';
        }
        html += '</div>';
    });
    
    elements.propertiesList.innerHTML = html;
}

// ===== Property Actions =====
function editProperty(index) {
    openModal(index);
}

function deleteProperty(index) {
    if (confirm('¿Estás seguro de eliminar esta propiedad?')) {
        state.properties.splice(index, 1);
        renderProperties();
        generateSchema();
        showToast('Propiedad eliminada');
    }
}

// ===== Generate Schema =====
function generateSchema() {
    if (!elements.entityName) return null;
    
    const entityName = elements.entityName.value.trim();
    
    if (!entityName) {
        if (elements.jsonOutput) {
            elements.jsonOutput.innerHTML = '<code>{ "message": "Ingresa el nombre de la entidad para generar el schema" }</code>';
        }
        return null;
    }
    
    const schema = {
        entity: entityName,
        version: elements.version ? (parseInt(elements.version.value) || 1) : 1,
        mutable: elements.mutable ? elements.mutable.checked : true,
        properties: buildPropertiesObject(),
        inheritance: buildInheritanceObject()
    };
    
    const json = JSON.stringify(schema, null, 2);
    if (elements.jsonOutput) {
        elements.jsonOutput.innerHTML = '<code>' + highlightJson(json) + '</code>';
    }
    
    // Activar autoguardado si hay un schema cargado o hay nombre de entidad
    triggerAutoSave();
    
    return schema;
}

// ===== Auto Save =====
function triggerAutoSave() {
    // Solo autoguardar si el usuario puede editar
    const canEdit = state.userRole === 'owner' || state.userRole === 'editor';
    if (!canEdit || !state.currentProject) return;
    
    const entityName = elements.entityName ? elements.entityName.value.trim() : '';
    if (!entityName) return;
    
    // Cancelar timeout anterior
    if (state.autoSaveTimeout) {
        clearTimeout(state.autoSaveTimeout);
    }
    
    // Mostrar indicador de "guardando..."
    updateSyncStatus('syncing');
    
    // Debounce: esperar 2 segundos antes de guardar
    state.autoSaveTimeout = setTimeout(function() {
        autoSaveSchema();
    }, 2000);
}

async function autoSaveSchema() {
    const entityName = elements.entityName ? elements.entityName.value.trim() : '';
    if (!entityName || !state.currentProject) return;
    
    try {
        const schemaData = {
            project_id: state.currentProject.id,
            entity: entityName,
            version: elements.version ? parseInt(elements.version.value) || 1 : 1,
            mutable: elements.mutable ? elements.mutable.checked : true,
            properties: buildPropertiesObject(),
            inheritance: buildInheritanceObject(),
            updated_by: state.user.id
        };
        
        // Buscar si ya existe por nombre o por ID
        const existing = state.currentSchemaId 
            ? state.savedSchemas.find(s => s.id === state.currentSchemaId)
            : state.savedSchemas.find(s => s.entity === entityName);
        
        if (existing) {
            // Update
            const { error } = await supabaseClient
                .from('schemas')
                .update(schemaData)
                .eq('id', existing.id);
            
            if (error) throw error;
            state.currentSchemaId = existing.id;
        } else {
            // Insert
            schemaData.created_by = state.user.id;
            
            const { data, error } = await supabaseClient
                .from('schemas')
                .insert(schemaData)
                .select('id')
                .single();
            
            if (error) throw error;
            state.currentSchemaId = data.id;
        }
        
        await loadSchemas();
        updateSyncStatus('synced');
        
    } catch (error) {
        console.error('Error auto-saving:', error);
        updateSyncStatus('error');
    }
}

// ===== JSON Syntax Highlighting =====
function highlightJson(json) {
    return json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
}

// ===== Copy to Clipboard =====
function copyToClipboard() {
    const schema = generateSchema();
    if (!schema) {
        showToast('No hay schema para copiar', 'error');
        return;
    }
    
    const text = JSON.stringify(schema, null, 2);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showToast('JSON copiado al portapapeles');
        }).catch(function() {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showToast('JSON copiado al portapapeles');
    } catch (err) {
        showToast('Error al copiar', 'error');
    }
    document.body.removeChild(textArea);
}

// ===== Download Schema =====
function downloadSchema() {
    const schema = generateSchema();
    if (!schema) {
        showToast('No hay schema para descargar', 'error');
        return;
    }
    
    const json = JSON.stringify(schema, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = (schema.entity || 'schema') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Schema descargado');
}

// ===== Toast Notification =====
function showToast(message, type) {
    if (!type) type = 'success';
    
    if (elements.toastMessage) {
        elements.toastMessage.textContent = message;
    }
    if (elements.toast) {
        elements.toast.style.borderColor = type === 'error' ? 'var(--error)' : 'var(--success)';
        elements.toast.classList.add('show');
        
        setTimeout(function() {
            elements.toast.classList.remove('show');
        }, 3000);
    }
}

// ===== Diagram Viewer Functions =====

/**
 * Opens the diagram viewer modal
 */
function openDiagramViewer() {
    if (!elements.diagramModal) return;
    
    // Reset zoom and pan
    state.diagramZoom = 1;
    state.diagramPan = { x: 0, y: 0 };
    
    elements.diagramModal.style.display = 'flex';
    renderDiagram();
    
    // Setup pan and zoom after a short delay to ensure diagram is rendered
    setTimeout(setupDiagramInteraction, 100);
}

/**
 * Closes the diagram viewer modal
 */
function closeDiagramViewer() {
    if (!elements.diagramModal) return;
    elements.diagramModal.style.display = 'none';
}

/**
 * Generates Mermaid diagram syntax from saved schemas
 */
function generateMermaidDiagram() {
    if (!state.savedSchemas || state.savedSchemas.length === 0) {
        return null;
    }
    
    let mermaidCode = 'erDiagram\n';
    const relationships = [];
    const entities = new Set();
    
    // Mapa de tipos de datos a tipos más simples para Mermaid
    const typeMap = {
        'Int': 'int',
        'Integer': 'int',
        'String': 'string',
        'Text': 'text',
        'Boolean': 'boolean',
        'Bool': 'boolean',
        'DateTime': 'datetime',
        'Date': 'date',
        'Time': 'time',
        'Float': 'float',
        'Double': 'double',
        'Decimal': 'decimal',
        'UUID': 'uuid',
        'Json': 'json',
        'Array': 'array',
        'Object': 'object',
        'Email': 'email',
        'Url': 'url',
        'Phone': 'phone',
        'Relation': 'relation'
    };
    
    // Process each schema
    state.savedSchemas.forEach(schema => {
        const entityName = schema.entity || 'Unknown';
        entities.add(entityName);
        
        // Add entity with attributes
        const props = schema.properties || {};
        const propKeys = Object.keys(props);
        
        if (propKeys.length > 0) {
            mermaidCode += `    ${entityName} {\n`;
            
            propKeys.forEach(key => {
                const prop = props[key];
                // Usar Type con mayúscula (la estructura real)
                const rawType = prop.Type || prop.type || 'String';
                const type = typeMap[rawType] || rawType.toLowerCase();
                const isPK = prop.IsPrimaryKey ? ' PK' : '';
                const isFK = prop.Relation ? ' FK' : '';
                
                // En Mermaid ER, la sintaxis es: type name [PK|FK]
                // No se pueden agregar múltiples comentarios
                mermaidCode += `        ${type} ${key}${isPK}${isFK}\n`;
            });
            
            mermaidCode += `    }\n`;
        }
        
        // Collect relationships from Relation property
        propKeys.forEach(key => {
            const prop = props[key];
            // Buscar Relation con mayúscula (estructura real)
            const relation = prop.Relation || prop.relation;
            
            if (relation) {
                const targetEntity = relation.TargetEntity || relation.targetEntity;
                if (targetEntity) {
                    entities.add(targetEntity);
                    
                    // Determine cardinality for mermaid
                    let cardinalitySymbol = '||--||'; // default: one to one
                    const cardinality = relation.Cardinality || relation.cardinality;
                    const kind = relation.Kind || relation.kind || key;
                    
                    if (cardinality === 'one-to-many' || cardinality === '1:N') {
                        cardinalitySymbol = '||--o{';
                    } else if (cardinality === 'many-to-one' || cardinality === 'N:1') {
                        cardinalitySymbol = '}o--||';
                    } else if (cardinality === 'many-to-many' || cardinality === 'N:M') {
                        cardinalitySymbol = '}o--o{';
                    } else if (cardinality === 'one-to-one' || cardinality === '1:1') {
                        cardinalitySymbol = '||--||';
                    }
                    
                    relationships.push({
                        from: entityName,
                        to: targetEntity,
                        cardinality: cardinalitySymbol,
                        label: kind
                    });
                }
            }
        });
        
        // Check for inheritance (extends)
        const inheritance = schema.inheritance || {};
        const extendsFrom = inheritance.extends || schema.extends;
        
        if (extendsFrom && extendsFrom !== '') {
            entities.add(extendsFrom);
            relationships.push({
                from: entityName,
                to: extendsFrom,
                cardinality: '||--||',
                label: 'extends'
            });
        }
    });
    
    // Add relationships
    relationships.forEach(rel => {
        mermaidCode += `    ${rel.from} ${rel.cardinality} ${rel.to} : "${rel.label}"\n`;
    });
    
    console.log('Generated Mermaid code:', mermaidCode);
    
    return mermaidCode;
}

/**
 * Renders the diagram using Mermaid
 */
async function renderDiagram() {
    if (!elements.diagramContent || !elements.diagramLoading || !elements.diagramEmpty) {
        console.error('Missing required DOM elements for diagram');
        return;
    }
    
    console.log('Starting diagram render...');
    console.log('Saved schemas count:', state.savedSchemas?.length || 0);
    
    // Show loading
    elements.diagramLoading.style.display = 'block';
    elements.diagramContent.style.display = 'none';
    elements.diagramEmpty.style.display = 'none';
    
    try {
        const mermaidCode = generateMermaidDiagram();
        
        if (!mermaidCode) {
            console.log('No mermaid code generated');
            // No diagrams to show
            elements.diagramLoading.style.display = 'none';
            elements.diagramEmpty.style.display = 'block';
            return;
        }
        
        console.log('Mermaid code length:', mermaidCode.length);
        
        // Clear previous content
        elements.diagramContent.innerHTML = '';
        
        // Create a unique ID for this diagram
        const diagramId = 'mermaid-diagram-' + Date.now();
        const diagramDiv = document.createElement('div');
        diagramDiv.className = 'mermaid';
        diagramDiv.id = diagramId;
        diagramDiv.setAttribute('data-processed', 'false');
        diagramDiv.textContent = mermaidCode;
        
        elements.diagramContent.appendChild(diagramDiv);
        console.log('Diagram div added to DOM');
        
        // Render with Mermaid
        if (!window.mermaid) {
            throw new Error('Mermaid library not loaded');
        }
        
        console.log('Running mermaid.run...');
        const { svg } = await window.mermaid.render(diagramId + '-svg', mermaidCode);
        
        if (svg) {
            diagramDiv.innerHTML = svg;
            console.log('SVG inserted into DOM');
            
            // Ensure SVG is visible
            const svgElement = diagramDiv.querySelector('svg');
            if (svgElement) {
                svgElement.style.maxWidth = '100%';
                svgElement.style.height = 'auto';
                svgElement.style.display = 'block';
                console.log('SVG element found and styled');
            } else {
                console.warn('SVG element not found after render');
            }
        } else {
            console.warn('No SVG returned from mermaid.render');
        }
        
        // Show diagram
        elements.diagramLoading.style.display = 'none';
        elements.diagramContent.style.display = 'block';
        
        console.log('Diagram rendered successfully');
        showToast('Diagrama generado exitosamente');
        
    } catch (error) {
        console.error('Error rendering diagram:', error);
        console.error('Error stack:', error.stack);
        elements.diagramLoading.style.display = 'none';
        elements.diagramEmpty.style.display = 'block';
        
        const errorMsg = 'Error: ' + (error.message || 'Error desconocido');
        if (elements.diagramEmpty.querySelector('p')) {
            elements.diagramEmpty.querySelector('p').textContent = errorMsg;
        }
        
        showToast('Error al generar el diagrama', 'error');
    }
}

/**
 * Exports the diagram as SVG
 */
function exportDiagram() {
    try {
        const svgElement = elements.diagramContent.querySelector('svg');
        
        if (!svgElement) {
            showToast('No hay diagrama para exportar', 'error');
            return;
        }
        
        // Clone the SVG to avoid modifying the original
        const svgClone = svgElement.cloneNode(true);
        
        // Add white background for better visibility
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', '#1a1a2e');
        svgClone.insertBefore(rect, svgClone.firstChild);
        
        // Serialize SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgClone);
        
        // Create blob and download
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = (state.currentProject?.name || 'project') + '-diagram.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Diagrama exportado como SVG');
    } catch (error) {
        console.error('Error exporting diagram:', error);
        showToast('Error al exportar el diagrama', 'error');
    }
}

/**
 * Exports the Mermaid diagram code
 */
function exportMermaidCode() {
    try {
        const mermaidCode = generateMermaidDiagram();
        
        if (!mermaidCode) {
            showToast('No hay código para exportar', 'error');
            return;
        }
        
        // Create blob with Mermaid code
        const blob = new Blob([mermaidCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = (state.currentProject?.name || 'project') + '-diagram.mmd';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Código Mermaid exportado');
    } catch (error) {
        console.error('Error exporting mermaid code:', error);
        showToast('Error al exportar el código', 'error');
    }
}

/**
 * Setup pan and zoom interaction for the diagram
 */
function setupDiagramInteraction() {
    if (!elements.diagramContent) return;
    
    const content = elements.diagramContent;
    
    // Mouse wheel zoom
    content.addEventListener('wheel', function(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomDiagram(delta);
    }, { passive: false });
    
    // Pan with mouse drag
    content.addEventListener('mousedown', function(e) {
        if (e.button === 0) { // Left click
            state.diagramDragging = true;
            state.diagramLastPos = { x: e.clientX, y: e.clientY };
            content.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (state.diagramDragging) {
            const deltaX = e.clientX - state.diagramLastPos.x;
            const deltaY = e.clientY - state.diagramLastPos.y;
            
            state.diagramPan.x += deltaX;
            state.diagramPan.y += deltaY;
            state.diagramLastPos = { x: e.clientX, y: e.clientY };
            
            applyTransform();
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (state.diagramDragging) {
            state.diagramDragging = false;
            if (elements.diagramContent) {
                elements.diagramContent.style.cursor = 'grab';
            }
        }
    });
    
    // Set initial cursor
    content.style.cursor = 'grab';
}

/**
 * Zoom the diagram
 */
function zoomDiagram(delta) {
    state.diagramZoom = Math.max(0.1, Math.min(5, state.diagramZoom + delta));
    applyTransform();
    updateZoomLevel();
}

/**
 * Reset zoom and pan
 */
function resetZoom() {
    state.diagramZoom = 1;
    state.diagramPan = { x: 0, y: 0 };
    applyTransform();
    updateZoomLevel();
}

/**
 * Apply transform to diagram
 */
function applyTransform() {
    if (!elements.diagramContent) return;
    
    const svg = elements.diagramContent.querySelector('svg');
    if (svg) {
        svg.style.transform = `translate(${state.diagramPan.x}px, ${state.diagramPan.y}px) scale(${state.diagramZoom})`;
        svg.style.transformOrigin = 'center center';
        svg.style.transition = 'transform 0.1s ease-out';
    }
}

/**
 * Update zoom level display
 */
function updateZoomLevel() {
    if (elements.zoomLevel) {
        elements.zoomLevel.textContent = Math.round(state.diagramZoom * 100) + '%';
    }
}

// ===== End of Diagram Functions =====
function showLoading(show) {
    if (elements.loadingOverlay) {
        elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// ===== Export Modal Functions =====
function openExportModal() {
    if (!state.currentProject) {
        showToast('Selecciona un proyecto primero', 'error');
        return;
    }
    
    if (state.savedSchemas.length === 0) {
        showToast('No hay schemas para exportar', 'error');
        return;
    }
    
    if (elements.exportModal) {
        elements.exportModal.classList.add('active');
    }
}

function closeExportModal() {
    if (elements.exportModal) {
        elements.exportModal.classList.remove('active');
    }
}

// ===== Export Project (Single File) =====
function exportProjectSingleFile() {
    if (!state.currentProject) {
        showToast('Selecciona un proyecto primero', 'error');
        return;
    }
    
    if (state.savedSchemas.length === 0) {
        showToast('No hay schemas para exportar', 'error');
        return;
    }
    
    // Crear objeto de exportación
    const exportData = {
        projectName: state.currentProject.name,
        projectDescription: state.currentProject.description || '',
        exportDate: new Date().toISOString(),
        version: '1.0',
        schemas: state.savedSchemas.map(function(schema) {
            return {
                entity: schema.entity,
                version: schema.version || 1,
                mutable: schema.mutable !== false,
                properties: schema.properties || {},
                inheritance: schema.inheritance || { isBase: true }
            };
        })
    };
    
    // Descargar archivo
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.currentProject.name.replace(/\s+/g, '_') + '_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Proyecto exportado: ' + state.savedSchemas.length + ' schemas');
}

// ===== Export Project (Multiple Files - ZIP) =====
async function exportProjectMultipleFiles() {
    if (!state.currentProject) {
        showToast('Selecciona un proyecto primero', 'error');
        return;
    }
    
    if (state.savedSchemas.length === 0) {
        showToast('No hay schemas para exportar', 'error');
        return;
    }
    
    // Verificar que JSZip esté disponible
    if (typeof JSZip === 'undefined') {
        showToast('Error: Librería JSZip no disponible', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // Crear instancia de JSZip
        const zip = new JSZip();
        
        // Crear carpeta con el nombre del proyecto
        const folderName = state.currentProject.name.replace(/\s+/g, '_');
        const folder = zip.folder(folderName);
        
        // Añadir cada schema como archivo JSON al ZIP
        state.savedSchemas.forEach(function(schema) {
            const exportData = {
                entity: schema.entity,
                version: schema.version || 1,
                mutable: schema.mutable !== false,
                properties: schema.properties || {},
                inheritance: schema.inheritance || { isBase: true }
            };
            
            const content = JSON.stringify(exportData, null, 2);
            folder.file(schema.entity + '.json', content);
        });
        
        // Generar el archivo ZIP
        const zipBlob = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });
        
        // Descargar el archivo ZIP
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = folderName + '_schemas.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        
        showToast('ZIP creado con ' + state.savedSchemas.length + ' schemas');
        
    } catch (error) {
        console.error('Error exporting ZIP:', error);
        showToast('Error al crear archivo ZIP: ' + error.message, 'error');
    }
    
    showLoading(false);
}

// ===== Utility Functions =====
function debounce(func, wait) {
    let timeout;
    return function() {
        const args = arguments;
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

// ===== Make functions available globally =====
window.editProperty = editProperty;
window.deleteProperty = deleteProperty;
window.loadSchema = loadSchema;
window.deleteSchema = deleteSchema;
window.exportSchema = exportSchema;
window.removeMember = removeMember;
window.copyCollectionName = copyCollectionName;
