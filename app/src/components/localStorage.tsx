export const saveLinksToOpenCount = (count) => {
    localStorage.setItem('linksToOpenCount', count);
};

export const loadLinksToOpenCount = () => {
    if (typeof window !== 'undefined'){
        return parseInt(localStorage.getItem('linksToOpenCount'), 10);
    }
    return 10;
};

export const saveSortingPreference = (sorting) => {
    localStorage.setItem('sortingPreference', JSON.stringify(sorting));
};

export const loadSortingPreference = () => {
    if (typeof window !== 'undefined'){
        return JSON.parse(localStorage.getItem('sortingPreference'))
    }
    return { id: "commandNumberId", desc: false };
};

export const loadPageSize = () => {
    if (typeof window !== 'undefined'){
        return parseInt(localStorage.getItem('pageSize'),10);
    }
    return 10;
};

export const savePageSize = (size) => {
    localStorage.setItem('pageSize', size);
};
