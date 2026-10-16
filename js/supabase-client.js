/**
 * RK DIGITAL STUDIO — Supabase Database & API Client
 * Secure Supabase integration for Projects CMS, Leads CRM, and Public Enquiries.
 * Supports live Supabase PostgreSQL + Storage with intelligent local fallback.
 */

(function (window) {
  'use strict';

  // Configuration storage keys
  const STORAGE_KEY_URL = 'rk_supabase_url';
  const STORAGE_KEY_KEY = 'rk_supabase_key';
  const STORAGE_LOCAL_PROJECTS = 'rk_local_projects';
  const STORAGE_LOCAL_LEADS = 'rk_local_leads';
  const STORAGE_LOCAL_ACTIVITIES = 'rk_local_activities';
  const STORAGE_LOCAL_NOTES = 'rk_local_notes';
  const STORAGE_LOCAL_AUTH = 'rk_local_demo_auth';

  // Seed data for initial local state (matches schema.sql seed)
  const DEFAULT_PROJECTS = [
    {
      id: 'proj-001',
      title: 'Sunbeam English School Bhagwanpur',
      slug: 'sunbeam-english-school-bhagwanpur',
      category: 'School Website',
      short_description: 'Modern responsive school website designed to present school information, facilities, activities and admission-related information online.',
      description: 'Official responsive website developed for Sunbeam English School Bhagwanpur. Built with accessible navigation, structured admissions overview, leadership message, campus facilities gallery, and fast mobile performance.',
      cover_image_url: 'assets/sunbeam-school-preview.jpg',
      gallery_images: ['assets/sunbeam-school-preview.jpg', 'assets/service-school.jpg'],
      live_url: 'https://sunbeam-school-mocha.vercel.app/',
      client_name: 'Sunbeam English School',
      is_featured: true,
      status: 'published',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'proj-002',
      title: 'Academe Coaching Institute Concept',
      slug: 'academe-coaching-institute-concept',
      category: 'Coaching Website',
      short_description: 'Concept architecture & UI prototype for competitive coaching institutes, featuring batch timetables, faculty credentials, and quick WhatsApp registration.',
      description: 'Designed for regional coaching institutes in Varanasi and Mirzapur. Features course breakdowns for JEE/NEET, batch schedules, faculty profiles, and student admission inquiry forms.',
      cover_image_url: 'assets/service-coaching.jpg',
      gallery_images: ['assets/service-coaching.jpg'],
      live_url: 'https://www.rkdigitalstudio.in/services/coaching-website-development',
      client_name: 'Concept Prototype',
      is_featured: false,
      status: 'published',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'proj-003',
      title: 'Artisan & Co. — Handloom & Pottery Demo',
      slug: 'artisan-co-handloom-pottery-demo',
      category: 'E-commerce Website',
      short_description: 'Demonstration catalog & ordering prototype for regional handlooms and Chunar pottery, showcasing rich silk weaves, product filtering, and instant WhatsApp ordering.',
      description: 'Tailored e-commerce showcase highlighting Chunar red clay pottery and Banarasi handloom products. Includes catalog filtering, product showcases, cart drawer, and WhatsApp checkout.',
      cover_image_url: 'assets/service-ecommerce.jpg',
      gallery_images: ['assets/service-ecommerce.jpg'],
      live_url: 'https://www.rkdigitalstudio.in/services/ecommerce-website-development',
      client_name: 'Concept Prototype',
      is_featured: false,
      status: 'published',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  const DEFAULT_LEADS = [
    {
      id: 'lead-001',
      name: 'Dr. Anand Kumar',
      phone: '9839123456',
      email: 'anand.school@example.com',
      business_name: 'Varanasi Public Academy',
      business_type: 'School / Institution',
      service: 'School Website',
      requirements: 'Need a bilingual school website with online admissions inquiry form, syllabus downloads, and teacher portal.',
      budget: '₹10,000 – ₹20,000',
      preferred_contact: 'WhatsApp',
      source: 'Website Enquiry Form',
      status: 'Contacted',
      priority: 'High',
      assigned_to: 'Rishabh Pal',
      next_follow_up_at: new Date(Date.now() + 86400000).toISOString(),
      internal_notes: 'Spoke over WhatsApp. Sent sample demo link of Sunbeam school. Scheduled a call for tomorrow at 4 PM.',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'lead-002',
      name: 'Rajesh Mishra',
      phone: '9450123789',
      email: 'rajesh.mishra@example.com',
      business_name: 'Mishra Trading Co.',
      business_type: 'Wholesale & Retail',
      service: 'Business Website',
      requirements: 'Looking for a 5-page clean corporate website with product showcase and WhatsApp inquiry.',
      budget: '₹5,000 – ₹10,000',
      preferred_contact: 'Phone Call',
      source: 'Website Enquiry Form',
      status: 'New',
      priority: 'Urgent',
      assigned_to: 'Rishabh Pal',
      next_follow_up_at: new Date(Date.now() + 2 * 3600000).toISOString(),
      internal_notes: 'Urgent enquiry submitted from Chunar market.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  // Client singleton
  let _supabase = null;

  function getSavedConfig() {
    return {
      url: localStorage.getItem(STORAGE_KEY_URL) || window.ENV?.SUPABASE_URL || window.ENV?.NEXT_PUBLIC_SUPABASE_URL || '',
      key: localStorage.getItem(STORAGE_KEY_KEY) || window.ENV?.SUPABASE_ANON_KEY || window.ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    };
  }

  function initSupabaseClient() {
    const { url, key } = getSavedConfig();
    if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        _supabase = window.supabase.createClient(url.trim(), key.trim(), {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        return _supabase;
      } catch (e) {
        console.warn('Failed to initialize Supabase client:', e);
        _supabase = null;
      }
    }
    return null;
  }

  function getClient() {
    if (!_supabase) {
      initSupabaseClient();
    }
    return _supabase;
  }

  function isConfigured() {
    const { url, key } = getSavedConfig();
    return !!(url && key);
  }

  // --- Local Fallback Repository ---
  function getLocalData(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      return JSON.parse(stored);
    } catch (e) {
      return fallback;
    }
  }

  function setLocalData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage write error:', e);
    }
  }

  // ========================================================
  // 1. PROJECTS API
  // ========================================================
  async function getProjects(options = {}) {
    const client = getClient();
    const { status, category, search, includeDeleted = false } = options;

    if (client) {
      try {
        let query = client.from('projects').select('*').order('created_at', { ascending: false });

        if (!includeDeleted) {
          query = query.is('deleted_at', null);
        }
        if (status) {
          query = query.eq('status', status);
        }
        if (category && category !== 'All') {
          query = query.eq('category', category);
        }
        if (search) {
          query = query.or(`title.ilike.%${search}%,short_description.ilike.%${search}%,client_name.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase projects fetch error, falling back to local data:', err);
      }
    }

    // Local fallback
    let items = getLocalData(STORAGE_LOCAL_PROJECTS, DEFAULT_PROJECTS);
    if (!includeDeleted) {
      items = items.filter(p => !p.deleted_at);
    }
    if (status) {
      items = items.filter(p => p.status === status);
    }
    if (category && category !== 'All') {
      items = items.filter(p => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.short_description && p.short_description.toLowerCase().includes(q)) ||
        (p.client_name && p.client_name.toLowerCase().includes(q))
      );
    }
    return items;
  }

  async function getProjectBySlug(slug) {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('projects')
          .select('*')
          .eq('slug', slug)
          .is('deleted_at', null)
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getProjectBySlug error:', e);
      }
    }
    const items = getLocalData(STORAGE_LOCAL_PROJECTS, DEFAULT_PROJECTS);
    return items.find(p => p.slug === slug && !p.deleted_at) || null;
  }

  async function saveProject(projectData) {
    const client = getClient();
    const isNew = !projectData.id;

    const payload = {
      ...projectData,
      slug: (projectData.slug || slugify(projectData.title)).toLowerCase(),
      updated_at: new Date().toISOString()
    };

    if (isNew) {
      payload.created_at = new Date().toISOString();
    }

    if (client) {
      try {
        if (isNew) {
          const { data, error } = await client
            .from('projects')
            .insert([payload])
            .select()
            .single();
          if (error) throw error;
          // Sync local copy
          syncLocalProject(data);
          return { success: true, project: data };
        } else {
          const { data, error } = await client
            .from('projects')
            .update(payload)
            .eq('id', projectData.id)
            .select()
            .single();
          if (error) throw error;
          syncLocalProject(data);
          return { success: true, project: data };
        }
      } catch (err) {
        console.warn('Supabase saveProject error, saving locally:', err);
      }
    }

    // Local save
    const items = getLocalData(STORAGE_LOCAL_PROJECTS, DEFAULT_PROJECTS);
    let saved;
    if (isNew) {
      saved = {
        ...payload,
        id: 'proj-' + Date.now()
      };
      items.unshift(saved);
    } else {
      const idx = items.findIndex(p => p.id === projectData.id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...payload };
        saved = items[idx];
      } else {
        saved = payload;
        items.unshift(saved);
      }
    }
    setLocalData(STORAGE_LOCAL_PROJECTS, items);
    return { success: true, project: saved };
  }

  function syncLocalProject(proj) {
    if (!proj) return;
    const items = getLocalData(STORAGE_LOCAL_PROJECTS, DEFAULT_PROJECTS);
    const idx = items.findIndex(p => p.id === proj.id || p.slug === proj.slug);
    if (idx !== -1) {
      items[idx] = proj;
    } else {
      items.unshift(proj);
    }
    setLocalData(STORAGE_LOCAL_PROJECTS, items);
  }

  async function deleteProject(id, soft = true) {
    const client = getClient();
    if (client) {
      try {
        if (soft) {
          const { error } = await client
            .from('projects')
            .update({ deleted_at: new Date().toISOString(), status: 'archived' })
            .eq('id', id);
          if (error) throw error;
        } else {
          const { error } = await client.from('projects').delete().eq('id', id);
          if (error) throw error;
        }
      } catch (err) {
        console.warn('Supabase deleteProject error:', err);
      }
    }

    const items = getLocalData(STORAGE_LOCAL_PROJECTS, DEFAULT_PROJECTS);
    if (soft) {
      const p = items.find(x => x.id === id);
      if (p) {
        p.deleted_at = new Date().toISOString();
        p.status = 'archived';
      }
    } else {
      const filtered = items.filter(x => x.id !== id);
      setLocalData(STORAGE_LOCAL_PROJECTS, filtered);
      return { success: true };
    }
    setLocalData(STORAGE_LOCAL_PROJECTS, items);
    return { success: true };
  }

  async function uploadProjectImage(file) {
    const client = getClient();
    if (!client) {
      // In local/offline mode, convert file to data URL for immediate preview
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: reader.result });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    try {
      const ext = file.name.split('.').pop();
      const fileName = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `covers/${fileName}`;

      const { data, error } = await client.storage
        .from('project-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: publicUrlData } = client.storage
        .from('project-images')
        .getPublicUrl(filePath);

      return { url: publicUrlData.publicUrl };
    } catch (err) {
      console.warn('Storage upload error, using local data URL fallback:', err);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: reader.result, fallback: true });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  }

  // ========================================================
  // 2. LEADS / CRM API
  // ========================================================
  async function getLeads(options = {}) {
    const client = getClient();
    const { status, service, search, sortBy = 'newest', limit } = options;

    if (client) {
      try {
        let query = client.from('leads').select('*').is('deleted_at', null);

        if (status && status !== 'All') {
          query = query.eq('status', status);
        }
        if (service && service !== 'All') {
          query = query.eq('service', service);
        }
        if (search) {
          query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,business_name.ilike.%${search}%`);
        }

        if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'oldest') {
          query = query.order('created_at', { ascending: true });
        } else if (sortBy === 'follow_up') {
          query = query.order('next_follow_up_at', { ascending: true, nullsFirst: false });
        }

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase leads fetch error, falling back to local data:', err);
      }
    }

    // Local fallback
    let items = getLocalData(STORAGE_LOCAL_LEADS, DEFAULT_LEADS).filter(l => !l.deleted_at);
    if (status && status !== 'All') {
      items = items.filter(l => l.status === status);
    }
    if (service && service !== 'All') {
      items = items.filter(l => l.service === service);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(l =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.business_name && l.business_name.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'newest') {
      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'follow_up') {
      items.sort((a, b) => {
        if (!a.next_follow_up_at) return 1;
        if (!b.next_follow_up_at) return -1;
        return new Date(a.next_follow_up_at) - new Date(b.next_follow_up_at);
      });
    }

    if (limit) items = items.slice(0, limit);
    return items;
  }

  async function getLeadById(id) {
    const client = getClient();
    let lead = null;
    let notes = [];
    let activities = [];

    if (client) {
      try {
        const [leadRes, notesRes, actRes] = await Promise.all([
          client.from('leads').select('*').eq('id', id).single(),
          client.from('lead_notes').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
          client.from('lead_activities').select('*').eq('lead_id', id).order('created_at', { ascending: false })
        ]);

        if (!leadRes.error && leadRes.data) {
          lead = leadRes.data;
          notes = notesRes.data || [];
          activities = actRes.data || [];
          return { lead, notes, activities };
        }
      } catch (err) {
        console.warn('Supabase getLeadById error, falling back locally:', err);
      }
    }

    const items = getLocalData(STORAGE_LOCAL_LEADS, DEFAULT_LEADS);
    lead = items.find(l => l.id === id) || null;
    const allNotes = getLocalData(STORAGE_LOCAL_NOTES, []);
    notes = allNotes.filter(n => n.lead_id === id);
    const allActs = getLocalData(STORAGE_LOCAL_ACTIVITIES, []);
    activities = allActs.filter(a => a.lead_id === id);

    return { lead, notes, activities };
  }

  async function saveLead(leadData, userEmail = 'Admin') {
    const client = getClient();
    const isNew = !leadData.id;

    const payload = {
      ...leadData,
      phone: normalizePhone(leadData.phone),
      updated_at: new Date().toISOString()
    };

    if (isNew) {
      payload.created_at = new Date().toISOString();
      payload.status = payload.status || 'New';
      payload.priority = payload.priority || 'Medium';
      payload.source = payload.source || 'Manual Admin Entry';
    }

    if (client) {
      try {
        if (isNew) {
          const { data, error } = await client.from('leads').insert([payload]).select().single();
          if (error) throw error;
          // Record initial activity
          await logActivity(data.id, null, data.status, userEmail, 'Lead created');
          syncLocalLead(data);
          return { success: true, lead: data };
        } else {
          // Check for status change to record activity
          const prev = await getLeadById(leadData.id);
          const oldStatus = prev?.lead?.status;

          const { data, error } = await client.from('leads').update(payload).eq('id', leadData.id).select().single();
          if (error) throw error;

          if (oldStatus && oldStatus !== data.status) {
            await logActivity(data.id, oldStatus, data.status, userEmail, `Status changed from ${oldStatus} to ${data.status}`);
          }
          syncLocalLead(data);
          return { success: true, lead: data };
        }
      } catch (err) {
        console.warn('Supabase saveLead error, saving locally:', err);
      }
    }

    // Local save
    const items = getLocalData(STORAGE_LOCAL_LEADS, DEFAULT_LEADS);
    let saved;
    if (isNew) {
      saved = {
        ...payload,
        id: 'lead-' + Date.now()
      };
      items.unshift(saved);
      logActivityLocal(saved.id, null, saved.status, userEmail, 'Lead created');
    } else {
      const idx = items.findIndex(l => l.id === leadData.id);
      if (idx !== -1) {
        const oldStatus = items[idx].status;
        items[idx] = { ...items[idx], ...payload };
        saved = items[idx];
        if (oldStatus !== saved.status) {
          logActivityLocal(saved.id, oldStatus, saved.status, userEmail, `Status changed from ${oldStatus} to ${saved.status}`);
        }
      } else {
        saved = payload;
        items.unshift(saved);
      }
    }
    setLocalData(STORAGE_LOCAL_LEADS, items);
    return { success: true, lead: saved };
  }

  function syncLocalLead(lead) {
    if (!lead) return;
    const items = getLocalData(STORAGE_LOCAL_LEADS, DEFAULT_LEADS);
    const idx = items.findIndex(l => l.id === lead.id);
    if (idx !== -1) {
      items[idx] = lead;
    } else {
      items.unshift(lead);
    }
    setLocalData(STORAGE_LOCAL_LEADS, items);
  }

  async function updateLeadStatus(id, newStatus, userEmail = 'Admin', notes = '') {
    const client = getClient();
    const prev = await getLeadById(id);
    const oldStatus = prev?.lead?.status || 'Unknown';

    if (client) {
      try {
        const { data, error } = await client
          .from('leads')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;

        await logActivity(id, oldStatus, newStatus, userEmail, notes || `Status updated to ${newStatus}`);
        syncLocalLead(data);
        return { success: true, lead: data };
      } catch (err) {
        console.warn('Supabase updateLeadStatus error, applying locally:', err);
      }
    }

    const items = getLocalData(STORAGE_LOCAL_LEADS, DEFAULT_LEADS);
    const lead = items.find(l => l.id === id);
    if (lead) {
      lead.status = newStatus;
      lead.updated_at = new Date().toISOString();
      setLocalData(STORAGE_LOCAL_LEADS, items);
      logActivityLocal(id, oldStatus, newStatus, userEmail, notes || `Status updated to ${newStatus}`);
      return { success: true, lead };
    }
    return { success: false, error: 'Lead not found' };
  }

  async function addLeadNote(leadId, noteText, authorEmail = 'Admin') {
    const client = getClient();
    const payload = {
      lead_id: leadId,
      author_email: authorEmail,
      note_text: noteText.trim(),
      created_at: new Date().toISOString()
    };

    if (client) {
      try {
        const { data, error } = await client.from('lead_notes').insert([payload]).select().single();
        if (error) throw error;
        return { success: true, note: data };
      } catch (err) {
        console.warn('Supabase addLeadNote error, saving locally:', err);
      }
    }

    const allNotes = getLocalData(STORAGE_LOCAL_NOTES, []);
    const newNote = { ...payload, id: 'note-' + Date.now() };
    allNotes.unshift(newNote);
    setLocalData(STORAGE_LOCAL_NOTES, allNotes);
    return { success: true, note: newNote };
  }

  async function deleteLead(id, soft = true) {
    const client = getClient();
    if (client) {
      try {
        if (soft) {
          const { error } = await client.from('leads').update({ deleted_at: new Date().toISOString() }).eq('id', id);
          if (error) throw error;
        } else {
          const { error } = await client.from('leads').delete().eq('id', id);
          if (error) throw error;
        }
      } catch (err) {
        console.warn('Supabase deleteLead error:', err);
      }
    }

    const items = getLocalData(STORAGE_LOCAL_LEADS, DEFAULT_LEADS);
    if (soft) {
      const l = items.find(x => x.id === id);
      if (l) l.deleted_at = new Date().toISOString();
    } else {
      const filtered = items.filter(x => x.id !== id);
      setLocalData(STORAGE_LOCAL_LEADS, filtered);
      return { success: true };
    }
    setLocalData(STORAGE_LOCAL_LEADS, items);
    return { success: true };
  }

  async function logActivity(leadId, previousStatus, newStatus, changedBy, notes) {
    const client = getClient();
    const payload = {
      lead_id: leadId,
      action_type: 'status_change',
      previous_status: previousStatus,
      new_status: newStatus,
      changed_by: changedBy,
      notes: notes,
      created_at: new Date().toISOString()
    };

    if (client) {
      try {
        await client.from('lead_activities').insert([payload]);
      } catch (err) {
        console.warn('Supabase activity log error:', err);
      }
    }
    logActivityLocal(leadId, previousStatus, newStatus, changedBy, notes);
  }

  function logActivityLocal(leadId, previousStatus, newStatus, changedBy, notes) {
    const allActs = getLocalData(STORAGE_LOCAL_ACTIVITIES, []);
    allActs.unshift({
      id: 'act-' + Date.now(),
      lead_id: leadId,
      action_type: 'status_change',
      previous_status: previousStatus,
      new_status: newStatus,
      changed_by: changedBy,
      notes: notes,
      created_at: new Date().toISOString()
    });
    setLocalData(STORAGE_LOCAL_ACTIVITIES, allActs);
  }

  // ========================================================
  // 3. DASHBOARD METRICS API
  // ========================================================
  async function getDashboardStats() {
    const [projects, leads] = await Promise.all([
      getProjects({ includeDeleted: false }),
      getLeads({ sortBy: 'newest' })
    ]);

    const totalProjects = projects.length;
    const publishedProjects = projects.filter(p => p.status === 'published').length;
    const draftProjects = projects.filter(p => p.status === 'draft' || p.status === 'archived').length;

    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === 'New').length;
    const contactedLeads = leads.filter(l => l.status === 'Contacted').length;
    const interestedLeads = leads.filter(l => l.status === 'Interested').length;
    const proposalLeads = leads.filter(l => l.status === 'Proposal Sent').length;
    const convertedLeads = leads.filter(l => l.status === 'Converted').length;
    const lostLeads = leads.filter(l => l.status === 'Lost').length;

    const now = new Date();
    const upcomingFollowUps = leads
      .filter(l => l.next_follow_up_at && l.status !== 'Converted' && l.status !== 'Lost')
      .sort((a, b) => new Date(a.next_follow_up_at) - new Date(b.next_follow_up_at));

    return {
      projects: {
        total: totalProjects,
        published: publishedProjects,
        draft: draftProjects
      },
      leads: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        interested: interestedLeads,
        proposal: proposalLeads,
        converted: convertedLeads,
        lost: lostLeads
      },
      recentEnquiries: leads.slice(0, 5),
      upcomingFollowUps: upcomingFollowUps.slice(0, 6)
    };
  }

  // ========================================================
  // 4. PUBLIC ENQUIRY SUBMISSION (Client & REST safe)
  // ========================================================
  async function submitPublicEnquiry(formData) {
    // 1. Normalize and validate phone
    const cleanPhone = normalizePhone(formData.phone);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new Error('Please enter a valid 10-digit Indian phone number.');
    }

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      throw new Error('Please enter your full name (at least 2 characters).');
    }

    if (!formData.message || formData.message.trim().length < 6) {
      throw new Error('Please describe your requirements.');
    }

    const payload = {
      name: formData.fullName.trim(),
      phone: cleanPhone,
      email: formData.email ? formData.email.trim() : null,
      business_name: formData.businessName ? formData.businessName.trim() : null,
      business_type: formData.businessType ? formData.businessType.trim() : null,
      service: formData.service || 'Business Website',
      budget: formData.budget || 'Not Specified',
      requirements: formData.message.trim(),
      preferred_contact: formData.preferredContact || 'WhatsApp',
      source: 'Website Enquiry Form',
      status: 'New',
      priority: 'Medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let synced = false;
    let savedRecord = null;
    const client = getClient();

    // 1. Attempt Supabase direct insert
    if (client) {
      try {
        const { data, error } = await client.from('leads').insert([payload]).select().single();
        if (!error && data) {
          synced = true;
          savedRecord = data;
          syncLocalLead(data);
        }
      } catch (err) {
        console.warn('Public enquiry Supabase insert failed:', err);
      }
    }

    // 2. Always persist locally for offline durability
    if (!synced) {
      const items = getLocalData(STORAGE_LOCAL_LEADS, DEFAULT_LEADS);
      savedRecord = {
        ...payload,
        id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
      };
      items.unshift(savedRecord);
      setLocalData(STORAGE_LOCAL_LEADS, items);
      logActivityLocal(savedRecord.id, null, 'New', 'System', 'Enquiry submitted via website form');
    }

    return {
      success: true,
      recordId: savedRecord ? savedRecord.id : null,
      syncedToCloud: synced,
      lead: savedRecord
    };
  }

  // ========================================================
  // UTILITY HELPERS
  // ========================================================
  function normalizePhone(phone) {
    if (!phone) return '';
    return phone.toString().trim().replace(/^(\+91|91|0)/, '').replace(/[\s-]/g, '');
  }

  function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  async function testConnection(url, key) {
    const targetUrl = (url || getSavedConfig().url || '').trim().replace(/\/$/, '');
    const targetKey = (key || getSavedConfig().key || '').trim();

    if (!targetUrl || !targetKey) {
      return { ok: false, error: 'Supabase URL or Key missing' };
    }

    try {
      const res = await fetch(`${targetUrl}/rest/v1/projects?select=count`, {
        method: 'HEAD',
        headers: {
          apikey: targetKey,
          Authorization: `Bearer ${targetKey}`
        }
      });
      return { ok: res.ok, status: res.status };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  function setConfig(url, key) {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    _supabase = null;
    initSupabaseClient();
  }

  function disconnect() {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    _supabase = null;
  }

  // Export to global scope
  window.RK_CLIENT = {
    getClient,
    isConfigured,
    getSavedConfig,
    setConfig,
    disconnect,
    testConnection,
    // Projects
    getProjects,
    getProjectBySlug,
    saveProject,
    deleteProject,
    uploadProjectImage,
    // Leads / CRM
    getLeads,
    getLeadById,
    saveLead,
    updateLeadStatus,
    addLeadNote,
    deleteLead,
    // Dashboard & Public
    getDashboardStats,
    submitPublicEnquiry,
    normalizePhone,
    slugify
  };

})(window);
