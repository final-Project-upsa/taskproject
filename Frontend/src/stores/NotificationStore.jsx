import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  unreadMessages: 0,
  
  addNotification: (notification) => {
    //console.log('Adding notification:', notification); // Debug log
    
    set(state => {
      // Check if notification with same content and timestamp already exists
      const isDuplicate = state.notifications.some(
        n => n.message === notification.message && 
            n.timestamp === notification.timestamp &&
            n.chatId === notification.chatId
      );
      
      if (isDuplicate) {
        //console.log('Duplicate notification detected, skipping...'); // Debug log
        return state; 
      }
      
      //console.log('New notification added'); // Debug log
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        unreadMessages: notification.type === 'message' ? 
          state.unreadMessages + 1 : state.unreadMessages
      };
    });
  },
  
  getNotification: (id) => {
    return get().notifications.find(n => n.id === id);
  },
  
  markAllAsRead: () => {
    set({ unreadCount: 0, unreadMessages: 0 });
  },
  
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0, unreadMessages: 0 });
  }
}));

export default useNotificationStore;