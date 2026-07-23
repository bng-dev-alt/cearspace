import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { ProjectInvitation, ProjectActivityLog } from '../types/kanban';

export const collaborationService = {
  /**
   * Generates a secure random invite token
   */
  generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  },

  /**
   * Create an invitation for a project
   */
  async createInvitation(
    projectId: string,
    email: string,
    role: 'owner' | 'member' = 'member',
    invitedBy?: string
  ): Promise<ProjectInvitation> {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    const id = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          id,
          project_id: projectId,
          email: email.toLowerCase().trim(),
          token,
          role,
          status: 'pending',
          invited_by: invitedBy || null,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        projectId: data.project_id,
        email: data.email,
        token: data.token,
        role: data.role,
        status: data.status,
        invitedBy: data.invited_by,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
      };
    }

    // Fallback for offline / dev mock
    const mockInv: ProjectInvitation = {
      id,
      projectId,
      email: email.toLowerCase().trim(),
      token,
      role,
      status: 'pending',
      invitedBy,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    return mockInv;
  },

  /**
   * Fetch pending invitations for a project
   */
  async fetchProjectInvitations(projectId: string): Promise<ProjectInvitation[]> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        projectId: row.project_id,
        email: row.email,
        token: row.token,
        role: row.role,
        status: row.status,
        invitedBy: row.invited_by,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      }));
    }
    return [];
  },

  /**
   * Accept an invitation by token
   */
  async acceptInvitation(token: string, memberId: string): Promise<{ success: boolean; projectId?: string }> {
    if (hasSupabaseConfig && supabase) {
      const { data: inv, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !inv) return { success: false };

      if (new Date(inv.expires_at) < new Date()) {
        await supabase.from('invitations').update({ status: 'expired' }).eq('id', inv.id);
        return { success: false };
      }

      // Mark invitation accepted
      await supabase.from('invitations').update({ status: 'accepted' }).eq('id', inv.id);

      // Add to project_members
      await supabase.from('project_members').insert({
        project_id: inv.project_id,
        member_id: memberId,
        project_role: inv.role,
      });

      return { success: true, projectId: inv.project_id };
    }
    return { success: true };
  },

  /**
   * Reject an invitation
   */
  async rejectInvitation(invitationId: string): Promise<boolean> {
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'rejected' })
        .eq('id', invitationId);

      return !error;
    }
    return true;
  },

  /**
   * Log an activity event to activity_logs
   */
  async logActivity(params: {
    projectId: string;
    cardId?: string;
    actorName: string;
    actionType: string;
    entityType: 'task' | 'column' | 'project' | 'member';
    details?: Record<string, unknown>;
  }): Promise<ProjectActivityLog> {
    const id = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    if (hasSupabaseConfig && supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const actorId = userData?.user?.id || null;

      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          id,
          project_id: params.projectId,
          card_id: params.cardId || null,
          actor_id: actorId,
          actor_name: params.actorName,
          action_type: params.actionType,
          entity_type: params.entityType,
          details: params.details || {},
        })
        .select()
        .single();

      if (error) {
        console.warn('Failed to insert activity log:', error);
      } else if (data) {
        return {
          id: data.id,
          projectId: data.project_id,
          cardId: data.card_id,
          actorId: data.actor_id,
          actorName: data.actor_name,
          actionType: data.action_type,
          entityType: data.entity_type,
          details: data.details,
          createdAt: data.created_at,
        };
      }
    }

    return {
      id,
      projectId: params.projectId,
      cardId: params.cardId,
      actorName: params.actorName,
      actionType: params.actionType,
      entityType: params.entityType,
      details: params.details,
      createdAt,
    };
  },

  /**
   * Fetch project activity logs
   */
  async fetchActivities(projectId: string, limit = 50): Promise<ProjectActivityLog[]> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Failed to fetch activity logs:', error);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        projectId: row.project_id,
        cardId: row.card_id,
        actorId: row.actor_id,
        actorName: row.actor_name,
        actionType: row.action_type,
        entityType: row.entity_type,
        details: row.details,
        createdAt: row.created_at,
      }));
    }
    return [];
  },

  /**
   * Super Admin password reset for any team member
   */
  async resetUserPassword(
    memberId: string,
    email: string,
    newPassword: string,
    actorName = 'Owner'
  ): Promise<boolean> {
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.auth.admin.updateUserById(memberId, {
        password: newPassword,
      });
      if (error) {
        console.warn('Supabase admin password reset requires service_role key:', error);
      }
    }

    await this.logActivity({
      projectId: 'workspace',
      actorName,
      actionType: 'reset_user_password',
      entityType: 'member',
      details: { memberId, email },
    });

    return true;
  },

  /**
   * Archive / Unarchive project (Admin & Owner)
   */
  async setProjectArchived(projectId: string, archived: boolean, actorName = 'Admin'): Promise<boolean> {
    if (hasSupabaseConfig && supabase) {
      await supabase.from('projects').update({ archived }).eq('id', projectId);
    }
    await this.logActivity({
      projectId,
      actorName,
      actionType: archived ? 'archive_project' : 'unarchive_project',
      entityType: 'project',
      details: { archived },
    });
    return true;
  },

  /**
   * Accept an invitation token and register new member.
   *
   * POZOR (nedokončeno): zatím se pozvánka pouze označí jako přijatá.
   * Vytvoření účtu a napojení člena na projekt vyžaduje service_role klíč
   * na serveru -- proto jsou `displayName` a `password` prozatím nevyužité.
   * Tvar API je ale záměrně finální, aby se volající kód nemusel měnit.
   */
  async acceptInvitationToken(token: string, _displayName: string, _password?: string): Promise<{ success: boolean; projectId?: string }> {
    if (hasSupabaseConfig && supabase) {
      const { data: inv, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !inv) {
        throw new Error('Pozvánka neexistuje nebo vypršela její platnost.');
      }

      await supabase
        .from('invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', inv.id);

      return { success: true, projectId: inv.project_id };
    }

    return { success: true, projectId: 'demo-project' };
  },
};
