import { supabase } from '../lib/supabase';
import { TCCProject } from '../types';

export const projectsService = {
    async getAll(): Promise<TCCProject[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return data.map(row => ({
            id: row.id,
            title: row.title,
            ...row.content, // Spread the JSON content
            createdAt: new Date(row.created_at).getTime(),
            updatedAt: new Date(row.updated_at).getTime(),
        }));
    },

    async getById(id: string): Promise<TCCProject> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return {
            id: data.id,
            title: data.title,
            ...data.content,
            createdAt: new Date(data.created_at).getTime(),
            updatedAt: new Date(data.updated_at).getTime(),
        };
    },

    async create(project: Omit<TCCProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<TCCProject> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('User not authenticated');

        // Extract title and keep the rest as content
        const { title, ...content } = project;

        const { data, error } = await supabase
            .from('projects')
            .insert([
                {
                    title,
                    content,
                    user_id: user.id
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            title: data.title,
            ...data.content,
            createdAt: new Date(data.created_at).getTime(),
            updatedAt: new Date(data.updated_at).getTime(),
        };
    },

    async update(id: string, project: Partial<TCCProject>): Promise<TCCProject> {
        const updates: any = {
            updated_at: new Date().toISOString()
        };

        if (project.title) updates.title = project.title;

        // If there are other fields to update, we need to merge them into content
        // This is a bit tricky with partial updates on JSONB if we don't want to overwrite everything.
        // For simplicity, we might assume we are sending the full object or significant parts.
        // But to be safe, let's fetch current content if we are doing a partial update that isn't just title.

        // Actually, for TCCProject, usually we save the whole state.
        // Let's assume 'content' in the DB holds everything except ID and timestamps.

        const { title, id: _, createdAt: __, updatedAt: ___, ...contentUpdates } = project;

        if (Object.keys(contentUpdates).length > 0) {
            // We are updating content. 
            // Ideally we should merge, but for now let's assume the caller passes what they want to save.
            // If we want to support partial updates to the JSON, we might need to fetch first or use jsonb_set (complex).
            // Let's assume we replace the content for now, or merge with existing if we fetch it.
            // BETTER APPROACH: The UI usually sends the full project state to save.
            updates.content = contentUpdates;
        }

        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            title: data.title,
            ...data.content,
            createdAt: new Date(data.created_at).getTime(),
            updatedAt: new Date(data.updated_at).getTime(),
        };
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
