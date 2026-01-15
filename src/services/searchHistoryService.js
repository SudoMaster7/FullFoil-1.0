// Search History Service - LocalStorage based
class SearchHistoryService {
    constructor(maxItems = 5) {
        this.maxItems = maxItems;
        this.storageKey = 'fullfoil_search_history';
    }

    add(query) {
        if (!query || query.trim().length === 0) return;

        const history = this.get();
        // Remove duplicates and add to front
        const filtered = history.filter(q => q.toLowerCase() !== query.toLowerCase());
        const updated = [query, ...filtered].slice(0, this.maxItems);

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(updated));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    get() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading search history:', error);
            return [];
        }
    }

    clear() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Error clearing search history:', error);
        }
    }

    remove(query) {
        const history = this.get();
        const updated = history.filter(q => q !== query);

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(updated));
        } catch (error) {
            console.error('Error removing from search history:', error);
        }
    }
}

// Export singleton instance
const searchHistoryService = new SearchHistoryService(5);
export default searchHistoryService;
