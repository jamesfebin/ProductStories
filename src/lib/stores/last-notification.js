import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'last_notification_config';

// Load last notification from localStorage
const storedNotification = browser ? JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') : null;

export const lastNotification = writable(storedNotification);

// Save to localStorage when updated
lastNotification.subscribe(value => {
  if (browser && value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }
}); 