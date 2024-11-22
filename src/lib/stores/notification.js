import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Load contacts from localStorage
const storedContacts = browser ? JSON.parse(localStorage.getItem('contacts') || '[]') : [];

// Load last notification from localStorage
const lastConfig = browser ? JSON.parse(localStorage.getItem('last_notification_config') || 'null') : null;

export const contacts = writable(storedContacts);

// Save contacts to localStorage when updated
contacts.subscribe(value => {
  if (browser) {
    localStorage.setItem('contacts', JSON.stringify(value));
  }
});

/** @param {Date} date */
function getHumanFriendlyTime(date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleTimeString();
}

// Initialize with last saved config or default values
export const notificationSettings = writable(lastConfig || {
  message: 'Hey, can you review this?',
  sender: storedContacts[0] || { 
    name: 'John Doe', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    customAvatar: '' 
  },
  channel: 'general',
  timestamp: getHumanFriendlyTime(new Date()),
});

// Update timestamp every minute
if (browser) {
  setInterval(() => {
    notificationSettings.update(settings => ({
      ...settings,
      timestamp: getHumanFriendlyTime(new Date())
    }));
  }, 60000);
} 