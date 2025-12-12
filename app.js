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
    realtimeSubscription: null
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
        registerForm: document.getElementById('registerForm'),
        loginEmail: document.getElementById('loginEmail'),
        loginPassword: document.getElementById('loginPassword'),
        registerEmail: document.getElementById('registerEmail'),
        registerPassword: document.getElementById('registerPassword'),
        registerPasswordConfirm: document.getElementById('registerPasswordConfirm'),
        googleLoginBtn: document.getElementById('googleLoginBtn'),
        authError: document.getElementById('authError'),
        authTabs: document.querySelectorAll('.auth-tab'),
        
        // User
        userSection: document.getElementById('userSection'),
        userEmail: document.getElementById('userEmail'),
        logoutBtn: document.getElementById('logoutBtn'),
        
        // Main Content
        mainContent: document.getElementById('mainContent'),
        
        // Project
        projectSelect: document.getElementById('projectSelect'),
        newProjectBtn: document.getElementById('newProjectBtn'),
        projectInfo: document.getElementById('projectInfo'),
        projectName: document.getElementById('projectName'),
        projectMembersList: document.getElementById('projectMembersList'),
        syncStatus: document.getElementById('syncStatus'),
        inviteMemberBtn: document.getElementById('inviteMemberBtn'),
        
        // Project Modal
        projectModal: document.getElementById('projectModal'),
        projectForm: document.getElementById('projectForm'),
        newProjectName: document.getElementById('newProjectName'),
        newProjectDesc: document.getElementById('newProjectDesc'),
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
        propIsHeritable: document.getElementById('propIsHeritable'),
        propIsPrimaryKey: document.getElementById('propIsPrimaryKey'),
        propIsUnique: document.getElementById('propIsUnique'),
        propIsSerchable: document.getElementById('propIsSerchable'),
        propIsSortable: document.getElementById('propIsSortable'),
        propIsReference: document.getElementById('propIsReference'),
        
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
    // Auth tabs
    if (elements.authTabs) {
        elements.authTabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                switchAuthTab(tabName);
            });
        });
    }
    
    // Login form
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', handleRegister);
    }
    
    // Google login
    if (elements.googleLoginBtn) {
        elements.googleLoginBtn.addEventListener('click', handleGoogleLogin);
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

function switchAuthTab(tabName) {
    elements.authTabs.forEach(function(tab) {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });
    
    if (tabName === 'login') {
        elements.loginForm.style.display = 'block';
        elements.registerForm.style.display = 'none';
    } else {
        elements.loginForm.style.display = 'none';
        elements.registerForm.style.display = 'block';
    }
    
    hideAuthError();
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

async function handleRegister(e) {
    e.preventDefault();
    showLoading(true);
    hideAuthError();
    
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    const passwordConfirm = elements.registerPasswordConfirm.value;
    
    if (password !== passwordConfirm) {
        showAuthError('Las contraseñas no coinciden');
        showLoading(false);
        return;
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        showToast('Cuenta creada. Revisa tu email para confirmar.');
        switchAuthTab('login');
    } catch (error) {
        showAuthError(error.message);
    }
    
    showLoading(false);
}

async function handleGoogleLogin() {
    showLoading(true);
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
    } catch (error) {
        showAuthError(error.message);
        showLoading(false);
    }
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
    if (elements.entitySection) elements.entitySection.style.display = 'block';
    if (elements.propertiesSection) elements.propertiesSection.style.display = 'block';
    if (elements.outputSection) elements.outputSection.style.display = 'block';
}

function hideProjectSections() {
    if (elements.schemasSection) elements.schemasSection.style.display = 'none';
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

function applyRoleRestrictions() {
    const canEdit = state.userRole === 'owner' || state.userRole === 'editor';
    
    // Botones de guardar y agregar
    if (elements.saveSchemaBtn) {
        elements.saveSchemaBtn.style.display = canEdit ? 'inline-flex' : 'none';
    }
    if (elements.addPropertyBtn) {
        elements.addPropertyBtn.style.display = canEdit ? 'inline-flex' : 'none';
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

function openProjectModal() {
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
    
    const name = elements.newProjectName.value.trim();
    const description = elements.newProjectDesc.value.trim();
    
    try {
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
        
        closeProjectModal();
        await loadProjects();
        
        // Select the new project
        elements.projectSelect.value = data.id;
        await handleProjectChange();
        
        showToast('Proyecto creado: ' + name);
        
    } catch (error) {
        console.error('Error creating project:', error);
        showToast('Error al crear proyecto: ' + error.message, 'error');
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
        const { data, error } = await supabaseClient
            .from('project_members')
            .select('id, role, user_id, joined_at')
            .eq('project_id', state.currentProject.id);
        
        if (error) throw error;
        
        renderProjectMembers(data || []);
        
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
    
    let html = '<div class="members-list">';
    members.forEach(function(member) {
        const isOwner = member.role === 'owner';
        const roleLabel = isOwner ? '👑 Owner' : (member.role === 'editor' ? '✏️ Editor' : '👁️ Viewer');
        
        html += '<div class="member-item">';
        html += '<span class="member-role">' + roleLabel + '</span>';
        if (!isOwner && state.currentProject.owner_id === state.user.id) {
            html += '<button class="btn btn-danger btn-xs" onclick="removeMember(\'' + member.id + '\')" title="Eliminar">✕</button>';
        }
        html += '</div>';
    });
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
            inheritance: buildInheritanceObject(),
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
    
    if (elements.isBase && !elements.isBase.checked) {
        if (elements.extendsSelect && elements.extendsSelect.value) {
            inheritance.extends = elements.extendsSelect.value;
        }
        if (elements.strategy && elements.strategy.value) {
            inheritance.strategy = elements.strategy.value;
        }
    }
    
    return inheritance;
}

function createNewSchema() {
    const hasUnsavedWork = (elements.entityName && elements.entityName.value.trim() !== '') || state.properties.length > 0;
    
    if (hasUnsavedWork) {
        if (!confirm('¿Deseas crear un nuevo schema? Los cambios no guardados se perderán.')) {
            return;
        }
    }
    
    // Clear fields
    if (elements.entityName) elements.entityName.value = '';
    if (elements.version) elements.version.value = 1;
    if (elements.mutable) elements.mutable.checked = true;
    if (elements.isBase) elements.isBase.checked = true;
    if (elements.extendsSelect) elements.extendsSelect.value = '';
    if (elements.strategy) elements.strategy.value = 'override';
    
    state.properties = [];
    
    handleIsBaseChange();
    renderProperties();
    generateSchema();
    
    if (elements.entityName) elements.entityName.focus();
    
    showToast('Formulario limpiado - Listo para nuevo schema');
}

function loadSchema(schemaId) {
    const schema = state.savedSchemas.find(s => s.id === schemaId);
    if (!schema) return;
    
    // Load entity info
    if (elements.entityName) elements.entityName.value = schema.entity;
    if (elements.version) elements.version.value = schema.version || 1;
    if (elements.mutable) elements.mutable.checked = schema.mutable !== false;
    
    // Load inheritance
    if (elements.isBase) elements.isBase.checked = schema.inheritance?.isBase !== false;
    if (elements.extendsSelect) elements.extendsSelect.value = schema.inheritance?.extends || '';
    if (elements.strategy) elements.strategy.value = schema.inheritance?.strategy || 'override';
    
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
        html += '<h4>' + schema.entity + '</h4>';
        html += '<span class="schema-meta">';
        html += 'v' + (schema.version || 1) + ' • ' + propCount + ' propiedades';
        if (isBase) html += ' <span class="badge">Base</span>';
        if (extendsFrom) html += ' <span class="badge">extends: ' + extendsFrom + '</span>';
        html += '</span>';
        html += '</div>';
        html += '<div class="schema-actions">';
        html += '<button class="btn btn-secondary btn-icon" onclick="loadSchema(\'' + schema.id + '\')" title="Cargar">📂</button>';
        if (canEdit) {
            html += '<button class="btn btn-danger btn-icon" onclick="deleteSchema(\'' + schema.id + '\')" title="Eliminar">🗑️</button>';
        }
        html += '</div>';
        html += '</div>';
    });
    
    elements.savedSchemasList.innerHTML = html;
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
        html += '<option value="' + fieldKey + '">' + label + '</option>';
    });
    elements.relationTargetField.innerHTML = html;
}

// ===== Inheritance Toggle =====
function handleIsBaseChange() {
    if (!elements.isBase || !elements.extendsFields) return;
    
    const showExtendsFields = !elements.isBase.checked;
    elements.extendsFields.forEach(function(field) {
        field.style.display = showExtendsFields ? 'flex' : 'none';
    });
    updateEntitySelectors();
    generateSchema();
}

// ===== Reference Checkbox Handler =====
function handleReferenceChange() {
    if (!elements.propIsReference || !elements.relationSection) return;
    
    const isReference = elements.propIsReference.checked;
    elements.relationSection.style.display = isReference ? 'block' : 'none';
    
    if (isReference) {
        updateEntitySelectors();
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
    if (elements.propIsHeritable) elements.propIsHeritable.checked = property.isHeritable || false;
    if (elements.propIsPrimaryKey) elements.propIsPrimaryKey.checked = property.IsPrimaryKey || false;
    if (elements.propIsUnique) elements.propIsUnique.checked = property.IsUnique || false;
    if (elements.propIsSerchable) elements.propIsSerchable.checked = property.IsSerchable || false;
    if (elements.propIsSortable) elements.propIsSortable.checked = property.IsSortable || false;
    
    if (property.Relation) {
        if (elements.propIsReference) elements.propIsReference.checked = true;
        if (elements.relationSection) elements.relationSection.style.display = 'block';
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
        isHeritable: elements.propIsHeritable ? elements.propIsHeritable.checked : false,
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
    
    const canEdit = state.userRole === 'owner' || state.userRole === 'editor';
    
    let html = '';
    state.properties.forEach(function(prop, index) {
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
        if (prop.isHeritable) html += '<span class="badge">Heritable</span>';
        if (prop.Relation) html += '<span class="badge relation">Reference</span>';
        html += '</div>';
        html += '</div>';
        if (canEdit) {
            html += '<div class="property-actions">';
            html += '<button class="btn btn-secondary btn-icon" onclick="editProperty(' + index + ')" title="Editar">✏️</button>';
            html += '<button class="btn btn-danger btn-icon" onclick="deleteProperty(' + index + ')" title="Eliminar">🗑️</button>';
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
    
    return schema;
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

// ===== Loading Overlay =====
function showLoading(show) {
    if (elements.loadingOverlay) {
        elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
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
window.removeMember = removeMember;
