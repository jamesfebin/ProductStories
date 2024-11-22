import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const wallpapers = [
  {
    name: 'Mountain Lake',
    url: 'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?q=80'
  },
  {
    name: 'Night City',
    url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80'
  },
  {
    name: 'Ocean Sunset',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80'
  },
  {
    name: 'Forest',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80'
  },
  {
    name: 'Desert',
    url: 'https://images.unsplash.com/photo-1682686580024-580519d4b2d2?q=80'
  },
  {
    name: 'Northern Lights',
    url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?q=80'
  },
  {
    name: 'Cityscape',
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80'
  },
  {
    name: 'Snow Mountains',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80'
  },
  {
    name: 'Autumn Forest',
    url: 'https://images.unsplash.com/photo-1445964047600-cdbdb873673d?q=80'
  }
];

// Load last notification config to get the wallpaper
const lastConfig = browser ? JSON.parse(localStorage.getItem('last_notification_config') || 'null') : null;

// Initialize with last saved wallpaper or default
export const selectedWallpaper = writable(
  lastConfig?.wallpaper || wallpapers[0].url
); 