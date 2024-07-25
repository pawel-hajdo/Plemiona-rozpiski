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
