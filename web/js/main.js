import { setupAuth, ready as authReady } from './auth.js';
import { setupLists } from './lists.js';
import { setupItems } from './items.js';
import { setupSettings } from './settings.js';
import { AppState } from './app-state.js';

if (!firebase.apps.length) {
  firebase.initializeApp(window.firebaseConfig);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Hide both panels initially
  const listsPanel = document.getElementById('lists-panel');
  const mainListView = document.getElementById('main-list-view');
  const listsBtn = document.getElementById('lists-btn');
  listsPanel.style.display = 'none';
  mainListView.style.display = 'none';

  const appState = new AppState();
  setupAuth(appState); // Pass appState here
  setupSettings();
  await authReady;
  setupLists(appState);
  setupItems(appState);

  // Listen to state changes and show/hide panels
  appState.addEventListener('listref-changed', (e) => {
    const listRef = e.detail.listRef;
    if (listRef) {
      mainListView.style.display = '';
      listsPanel.style.display = 'none';
      listsBtn.style.display = '';
    } else {
      mainListView.style.display = 'none';
      listsBtn.style.display = 'none';
      if (appState.signedIn) listsPanel.style.display = '';
    }
  });

  // Listen to auth state changes to hide lists-panel on sign out
  appState.addEventListener('auth-changed', (e) => {
    const user = e.detail.user;
    if (user) {
      const lastListId = localStorage.getItem('yasl-last-list-' + user.uid);
      if (lastListId) {
        window.renderUserLists(lastListId);
        listsPanel.style.display = 'none';
        mainListView.style.display = '';
      } else {
        window.renderUserLists();
        listsPanel.style.display = '';
        mainListView.style.display = 'none';
      }
    } else {
      listsPanel.style.display = 'none';
      mainListView.style.display = 'none';
      listsBtn.style.display = 'none';
    }
  });
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupListsBtnVisibility);
}
