import {VisibilityState} from "@tanstack/react-table";

export const saveLinksToOpenCount = (count: any) => {
    localStorage.setItem('linksToOpenCount', count);
};

export const loadLinksToOpenCount = () => {
    if (typeof window !== 'undefined') {
        const linksToOpenCount = localStorage.getItem('linksToOpenCount');
        return linksToOpenCount ? parseInt(linksToOpenCount, 10) : 10;
    }
    return 10;
};

export const saveSortingPreference = (sorting: any) => {
    localStorage.setItem('sortingPreference', JSON.stringify(sorting));
};

export const loadSortingPreference = () => {
    if (typeof window !== 'undefined') {
        const sortingPreference = localStorage.getItem('sortingPreference');
        return sortingPreference ? JSON.parse(sortingPreference) : { id: "maxTime", desc: false };
    }
    return { id: "maxTime", desc: false };
};

export const loadPageSize = () => {
    if (typeof window !== 'undefined') {
        const pageSize = localStorage.getItem('pageSize');
        return pageSize ? parseInt(pageSize, 10) : 10;
    }
    return 10;
};

export const savePageSize = (size: any) => {
    localStorage.setItem('pageSize', size);
};

export const saveColumnVisibility = (visibility: VisibilityState) => {
    localStorage.setItem('columnVisibility', JSON.stringify(visibility));
};

export const loadColumnVisibility = (): VisibilityState => {
    if (typeof window !== 'undefined') {
        const savedVisibility = localStorage.getItem('columnVisibility');
        return savedVisibility ? JSON?.parse(savedVisibility) : {};
    }
    return  {};
};

export const saveColumnVisibilityAdmin = (visibility: VisibilityState) => {
    localStorage.setItem('columnVisibilityAdmin', JSON.stringify(visibility));
};

export const loadColumnVisibilityAdmin = (): VisibilityState => {
    if (typeof window !== 'undefined') {
        const savedVisibility = localStorage.getItem('columnVisibilityAdmin');
        return savedVisibility ? JSON?.parse(savedVisibility) : {};
    }
    return  {};
};

export const loadWorldFilters = (availableWorlds: string[]): Record<string, boolean> => {
    const defaultFilters = Object.fromEntries(availableWorlds.map(w => [w, true]));

    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('selectedWorldFilters');
        if (saved) {
            try {
                const parsed: Record<string, boolean> = JSON.parse(saved);
                const updated: Record<string, boolean> = {};
                availableWorlds.forEach(world => {
                    updated[world] = parsed.hasOwnProperty(world) ? parsed[world] : true;
                });
                localStorage.setItem('selectedWorldFilters', JSON.stringify(updated));
                return updated;
            } catch {
                localStorage.setItem('selectedWorldFilters', JSON.stringify(defaultFilters));
                return defaultFilters;
            }
        }
    }

    localStorage.setItem('selectedWorldFilters', JSON.stringify(defaultFilters));
    return defaultFilters;
};


export const saveWorldFilters = (worlds: Record<string, boolean>) => {
    localStorage.setItem('selectedWorldFilters', JSON.stringify(worlds));
};

export const saveCommandsFilter = (filter: "all" | "important") => {
    localStorage.setItem('adminCommandFilter', filter);
};

export const loadCommandsFilter = (): "all" | "important" => {
    if (typeof window !== "undefined") {
        const filter = localStorage.getItem('adminCommandFilter');
        if (filter === "important" || filter === "all") {
            return filter;
        }
    }
    return "all";
};

export const saveFetchLimit = (limit: number) => {
    localStorage.setItem('fetchLimit', limit.toString());
};

export const loadFetchLimit = () => {
    if (typeof window !== 'undefined') {
        const limit = localStorage.getItem('fetchLimit');
        return limit ? parseInt(limit, 10) : 5000; // default = 5000
    }
    return 1000;
};

