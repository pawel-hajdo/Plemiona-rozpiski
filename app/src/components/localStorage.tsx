export const saveLinksToOpenCount = (count) => {
    localStorage.setItem('linksToOpenCount', count);
};

export const loadLinksToOpenCount = () => {
    const count = localStorage.getItem('linksToOpenCount');
    return count ? parseInt(count, 10) : 10;
};

export const saveSortingPreference = (sorting) => {
    localStorage.setItem('sortingPreference', JSON.stringify(sorting));
};

export const loadSortingPreference = () => {
    const sorting = localStorage.getItem('sortingPreference');
    return sorting ? JSON.parse(sorting) : { id: "commandNumberId", desc: false };
};

export const loadPageSize = () => {
    const size = localStorage.getItem('pageSize');
    return size ? parseInt(size, 10) : 10;
};

export const savePageSize = (size) => {
    localStorage.setItem('pageSize', size);
};


