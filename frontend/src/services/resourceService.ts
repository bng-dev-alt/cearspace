import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { TaskResource } from '../types/kanban';

export const resourceService = {
  /**
   * Upload a resource file for a task
   */
  async uploadResource(taskId: string, file: File, uploadedBy: string): Promise<TaskResource> {
    const id = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fileExt = file.name.split('.').pop();
    const storagePath = `tasks/${taskId}/${id}.${fileExt}`;

    let downloadUrl: string | undefined;

    if (hasSupabaseConfig && supabase) {
      // 1. Upload to Supabase storage bucket 'task-resources'
      const { error: uploadErr } = await supabase.storage
        .from('task-resources')
        .upload(storagePath, file, { upsert: true });

      if (uploadErr) {
        console.warn('Storage upload error (falling back to object URL):', uploadErr);
        downloadUrl = URL.createObjectURL(file);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('task-resources')
          .getPublicUrl(storagePath);
        downloadUrl = publicUrlData?.publicUrl;
      }

      // 2. Insert metadata into DB
      const { data, error: dbErr } = await supabase
        .from('task_resources')
        .insert({
          id,
          task_id: taskId,
          storage_path: storagePath,
          filename: file.name,
          mime_type: file.type || 'application/octet-stream',
          size: file.size,
          uploaded_by: uploadedBy,
        })
        .select()
        .single();

      if (!dbErr && data) {
        return {
          id: data.id,
          taskId: data.task_id,
          storagePath: data.storage_path,
          filename: data.filename,
          mimeType: data.mime_type,
          size: data.size,
          uploadedBy: data.uploaded_by,
          createdAt: data.created_at,
          downloadUrl: downloadUrl || URL.createObjectURL(file),
        };
      }
    }

    // Mock fallback for client-side testing without active Supabase backend
    return {
      id,
      taskId,
      storagePath,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      uploadedBy,
      createdAt: new Date().toISOString(),
      downloadUrl: URL.createObjectURL(file),
    };
  },

  /**
   * Fetch resources for a task
   */
  async fetchTaskResources(taskId: string): Promise<TaskResource[]> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase
        .from('task_resources')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to fetch task resources:', error);
        return [];
      }

      return (data || []).map((row) => {
        const { data: publicUrlData } = supabase.storage
          .from('task-resources')
          .getPublicUrl(row.storage_path);

        return {
          id: row.id,
          taskId: row.task_id,
          storagePath: row.storage_path,
          filename: row.filename,
          mimeType: row.mime_type,
          size: row.size,
          uploadedBy: row.uploaded_by,
          createdAt: row.created_at,
          downloadUrl: publicUrlData?.publicUrl,
        };
      });
    }

    return [];
  },

  /**
   * Delete a task resource
   */
  async deleteResource(resourceId: string, storagePath: string): Promise<boolean> {
    if (hasSupabaseConfig && supabase) {
      // 1. Delete from Storage
      await supabase.storage.from('task-resources').remove([storagePath]);

      // 2. Delete from DB
      const { error } = await supabase
        .from('task_resources')
        .delete()
        .eq('id', resourceId);

      return !error;
    }
    return true;
  },
};
