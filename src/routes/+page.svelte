<script>
  import { contacts, notificationSettings } from '$lib/stores/notification';
  import { wallpapers, selectedWallpaper } from '$lib/stores/wallpaper';
  import { savedNotifications } from '$lib/stores/saved-notifications';
  import { lastNotification } from '$lib/stores/last-notification';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  /** @typedef {{
    name: string,
    avatar: string,
    customAvatar?: string
  }} Contact */

  let isEditMode = false;
  let showControls = false;
  let newContactName = '';
  let newContactAvatar = '';
  let customWallpaperUrl = '';
  let showNotification = true;
  
  // Keyboard shortcuts
  onMount(() => {
    /** @param {KeyboardEvent} e */
    const handleKeydown = (e) => {
      console.log('Key pressed:', e.key, 'Alt:', e.altKey); // Debug log
      
      // Command + K to toggle controls
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        showControls = !showControls;
        console.log('Cmd+K pressed, showControls:', showControls); // Debug log
      }
      
      // Command + E to replay animation
      if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        replayNotification();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  function replayNotification() {
    showNotification = false;
    showControls = false;
    
    // Reduced delay from 2000ms to 500ms
    setTimeout(() => {
      requestAnimationFrame(() => {
        showNotification = true;
      });
    }, 500);
  }

  function addContact() {
    if (newContactName.trim()) {
      $contacts = [...$contacts, {
        name: newContactName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newContactName}`,
        customAvatar: newContactAvatar
      }];
      newContactName = '';
      newContactAvatar = '';
    }
  }

  function saveCurrentNotification() {
    $savedNotifications = [...$savedNotifications, {
      ...$notificationSettings,
      id: Date.now(),
      wallpaper: $selectedWallpaper
    }];
  }

  function loadSavedNotification(notification) {
    $notificationSettings = {
      message: notification.message,
      sender: notification.sender,
      channel: notification.channel,
      timestamp: notification.timestamp
    };
    $selectedWallpaper = notification.wallpaper;
  }

  /** @param {Contact} contact */
  function selectContact(contact) {
    $notificationSettings.sender = contact;
  }

  /** @param {Contact} contact */
  function getDisplayAvatar(contact) {
    return contact.customAvatar || contact.avatar;
  }

  function updateCustomWallpaper() {
    if (customWallpaperUrl.trim()) {
      $selectedWallpaper = customWallpaperUrl;
    }
  }

  // Update last notification whenever settings change
  $: {
    if (browser) {
      localStorage.setItem('last_notification_config', JSON.stringify({
        ...$notificationSettings,
        wallpaper: $selectedWallpaper
      }));
    }
  }
</script>

<div class="relative h-screen w-screen overflow-hidden">
  <!-- Background -->
  <div class="absolute inset-0">
    <img src={$selectedWallpaper} alt="wallpaper" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30" />
  </div>

  <!-- Notification -->
  {#if showNotification}
    <div class="absolute top-4 right-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 w-96 animate-slide-in">
        <div class="flex items-start gap-3">
          <img 
            src={getDisplayAvatar($notificationSettings.sender)} 
            alt="avatar" 
            class="w-10 h-10 rounded-lg"
          />
          <div class="flex-1">
            <div class="flex items-center justify-between mb-0.5">
              <span class="font-medium text-gray-900">{$notificationSettings.sender.name}</span>
              <span class="text-[#333333] font-medium text-sm">#{$notificationSettings.channel}</span>
            </div>
            <div class="text-gray-700">{$notificationSettings.message}</div>
            <div class="text-xs text-gray-500 mt-1">{$notificationSettings.timestamp}</div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Edit Panel -->
  {#if showControls}
    <div class="absolute bottom-4 left-4">
      <button 
        class="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:bg-white/100 transition-colors"
        on:click={() => isEditMode = !isEditMode}
      >
        {isEditMode ? 'Close Editor' : 'Open Editor'}
        <span class="ml-2 text-sm text-gray-500">⌘K to hide UI, ⌘E to replay</span>
      </button>

      {#if isEditMode}
        <div class="mt-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-lg">Edit Notification</h3>
            <button 
              class="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors"
              on:click={saveCurrentNotification}
            >
              Save Notification
            </button>
          </div>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium mb-1">Message</label>
              <input 
                type="text" 
                bind:value={$notificationSettings.message}
                class="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Channel</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">#</span>
                <input 
                  type="text" 
                  bind:value={$notificationSettings.channel}
                  class="w-full pl-7 pr-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Wallpaper</label>
              <div class="grid grid-cols-3 gap-2 mb-2">
                {#each wallpapers as wallpaper}
                  <button
                    class="relative h-20 rounded-lg overflow-hidden border-2"
                    class:border-blue-500={$selectedWallpaper === wallpaper.url}
                    class:border-transparent={$selectedWallpaper !== wallpaper.url}
                    on:click={() => $selectedWallpaper = wallpaper.url}
                  >
                    <img src={wallpaper.url} alt={wallpaper.name} class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/40 flex items-end p-1">
                      <span class="text-xs text-white">{wallpaper.name}</span>
                    </div>
                  </button>
                {/each}
              </div>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  bind:value={customWallpaperUrl}
                  placeholder="Custom wallpaper URL"
                  class="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                />
                <button 
                  on:click={updateCustomWallpaper}
                  class="bg-blue-500 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Add Contact</label>
              <div class="space-y-2">
                <input 
                  type="text" 
                  bind:value={newContactName}
                  placeholder="Contact name"
                  class="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <input 
                  type="text" 
                  bind:value={newContactAvatar}
                  placeholder="Custom avatar URL (optional)"
                  class="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <button 
                  on:click={addContact}
                  class="bg-blue-500 text-white px-3 py-2 rounded-md w-full hover:bg-blue-600 transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Select Sender</label>
              <div class="space-y-1 max-h-40 overflow-y-auto">
                {#each $contacts as contact}
                  <button
                    class="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-md transition-colors"
                    class:bg-gray-100={$notificationSettings.sender.name === contact.name}
                    on:click={() => selectContact(contact)}
                  >
                    <img src={getDisplayAvatar(contact)} alt={contact.name} class="w-8 h-8 rounded-full" />
                    <span class="font-medium">{contact.name}</span>
                  </button>
                {/each}
              </div>
            </div>

            <!-- New section for saved notifications -->
            <div>
              <label class="block text-sm font-medium mb-2">Saved Notifications</label>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                {#each $savedNotifications as notification}
                  <button
                    class="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-md transition-colors text-left"
                    on:click={() => loadSavedNotification(notification)}
                  >
                    <img src={getDisplayAvatar(notification.sender)} alt={notification.sender.name} class="w-8 h-8 rounded-full" />
                    <div>
                      <div class="font-medium">{notification.sender.name}</div>
                      <div class="text-sm text-gray-600 truncate">{notification.message}</div>
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
</style>
