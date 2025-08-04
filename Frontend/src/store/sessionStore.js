/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const useSessionStore = create(
  devtools(
    (set, get) => ({
      // State
      sessions: [],
      userSessions: [],
      currentSession: null,
      categories: [],
      loading: false,
      filters: {
        category: '',
        difficulty: '',
        search: '',
        sort: 'newest',
        page: 1,
        limit: 12
      },
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_sessions: 0,
        has_next: false,
        has_prev: false
      },

      // Draft session for auto-save
      draftSession: {
        title: '',
        description: '',
        category: '',
        tags: [],
        difficulty: 'beginner',
        duration: 30,
        json_file_url: '',
        content: {
          instructions: [],
          equipment: [],
          calories_burned: 0,
          nutritional_info: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0
          },
          equipment_needed: [],
          target_muscles: []
        },
        privacy: 'public'
      },
      draftId: null,
      autoSaveStatus: 'saved', // 'saving', 'saved', 'error'

      // Actions
      fetchSessions: async (filters = {}) => {
        try {
          set({ loading: true });
          
          // Merge provided filters with default filters
          const mergedFilters = { ...get().filters, ...filters };
          const params = new URLSearchParams();
          
          // Only include non-empty parameters
          Object.entries(mergedFilters).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
              params.append(key, value);
            }
          });

          const response = await api.get(`/sessions?${params}`);
          const { sessions, pagination } = response.data.data;

          set({
            sessions,
            pagination,
            filters: mergedFilters,
            loading: false
          });
        } catch (error) {
          set({ loading: false });
          toast.error('Failed to fetch sessions');
        }
      },

      fetchSessionById: async (id) => {
        try {
          set({ loading: true });
          
          const response = await api.get(`/sessions/${id}`);
          const session = response.data.data;

          set({
            currentSession: session,
            loading: false
          });

          return session;
        } catch (error) {
          set({ loading: false });
          toast.error('Failed to fetch session details');
          return null;
        }
      },

      fetchUserSessions: async (filters = {}) => {
        try {
          set({ loading: true });
          
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
              params.append(key, value);
            }
          });
          const response = await api.get(`/sessions/my/all?${params}`);
          const { sessions, pagination } = response.data.data;

          set({
            userSessions: sessions,
            pagination,
            loading: false
          });
        } catch (error) {
          set({ loading: false });
          toast.error('Failed to fetch your sessions');
        }
      },

      fetchCategories: async () => {
        try {
          const response = await api.get('/categories');
          const categories = response.data.data;

          set({ categories });
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        }
      },

      createDraftSession: async (sessionData) => {
        try {
          set({ autoSaveStatus: 'saving' });
          
          const response = await api.post('/sessions/save-draft', sessionData);
          const savedSession = response.data.data;

          set({
            draftId: savedSession._id,
            autoSaveStatus: 'saved'
          });

          return savedSession;
        } catch (error) {
          set({ autoSaveStatus: 'error' });
          toast.error('Failed to save draft');
          return null;
        }
      },

      updateDraftSession: async (sessionData) => {
        try {
          const { draftId } = get();
          if (!draftId) return null;

          set({ autoSaveStatus: 'saving' });
          
          const response = await api.post('/sessions/save-draft', {
            ...sessionData,
            sessionId: draftId
          });

          set({ autoSaveStatus: 'saved' });
          return response.data.data;
        } catch (error) {
          set({ autoSaveStatus: 'error' });
          toast.error('Failed to auto-save draft');
          return null;
        }
      },

      publishSession: async (sessionId) => {
        try {
          set({ loading: true });
          
          const response = await api.post('/sessions/publish', { sessionId });
          const publishedSession = response.data.data;

          set({ loading: false });
          toast.success('Session published successfully!');
          
          return publishedSession;
        } catch (error) {
          set({ loading: false });
          const message = error.response?.data?.message || 'Failed to publish session';
          toast.error(message);
          return null;
        }
      },

      deleteSession: async (sessionId) => {
        try {
          await api.delete(`/sessions/delete/${sessionId}`);
          
          // Remove from userSessions
          set((state) => ({
            userSessions: state.userSessions.filter(s => s._id !== sessionId)
          }));

          toast.success('Session deleted successfully');
          return true;
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to delete session';
          toast.error(message);
          return false;
        }
      },

      toggleLike: async (sessionId) => {
        try {
          const response = await api.post(`/sessions/${sessionId}/like`);
          const { isLiked, likesCount } = response.data.data;

          // Update current session if it's the one being liked
          set((state) => ({
            currentSession: state.currentSession?._id === sessionId
              ? { ...state.currentSession, isLiked, 'engagement.likes_count': likesCount }
              : state.currentSession,
            sessions: state.sessions.map(session =>
              session._id === sessionId
                ? { ...session, isLiked, 'engagement.likes_count': likesCount }
                : session
            )
          }));

          return { isLiked, likesCount };
        } catch (error) {
          toast.error('Failed to update like status');
          return null;
        }
      },

      addComment: async (sessionId, content, parentCommentId = null) => {
        try {
          const response = await api.post(`/sessions/${sessionId}/comment`, {
            content,
            parentCommentId
          });

          toast.success('Comment added successfully');
          return response.data.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to add comment';
          toast.error(message);
          return null;
        }
      },

      completeSession: async (sessionData) => {
        try {
          const response = await api.post('/analytics/complete', sessionData);
          
          toast.success('Session completed! Great job! 🎉');
          return response.data.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to record session completion';
          toast.error(message);
          return null;
        }
      },

      // Utility functions
      updateFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      resetFilters: () => {
        set({
          filters: {
            category: '',
            difficulty: '',
            search: '',
            sort: 'newest',
            page: 1,
            limit: 12
          }
        });
      },

      updateDraft: (draftData) => {
        set((state) => ({
          draftSession: { ...state.draftSession, ...draftData }
        }));
      },

      resetDraft: () => {
        set({
          draftSession: {
            title: '',
            description: '',
            category: '',
            tags: [],
            difficulty: 'beginner',
            duration: 30,
            json_file_url: '',
            content: {
              instructions: [],
              equipment: [],
              calories_burned: 0,
              nutritional_info: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0
              },
              equipment_needed: [],
              target_muscles: []
            },
            privacy: 'public'
          },
          draftId: null,
          autoSaveStatus: 'saved'
        });
      }
    }),
    {
      name: 'session-store'
    }
  )
);

export { useSessionStore };