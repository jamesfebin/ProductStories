import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedNotifications = browser ? JSON.parse(localStorage.getItem('saved_notifications') || '[]') : [];

export const savedNotifications = writable(storedNotifications);

savedNotifications.subscribe(value => {
  if (browser) {
    localStorage.setItem('saved_notifications', JSON.stringify(value));
  }
}); 