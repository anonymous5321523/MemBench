const itemsPerPage = 10; // items per page
const pagesPerGroup = 10; // pages per group
let totalItems = 0;
let totalPages = 0;
let currentPage = 1;
let currentGroup = 1;

let data = [];

const gallery = document.getElementById('gallery');
const pagination = document.getElementById('pagination');
const pageNumbers = document.getElementById('pageNumbers');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const prevGroupBtn = document.getElementById('prevGroupBtn');
const nextGroupBtn = document.getElementById('nextGroupBtn');

async function fetchPrompts() {
    try {
        const response = await fetch('https://membench.s3.ap-southeast-2.amazonaws.com/prompts.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const prompts = text.split('\n').filter(line => line.trim() !== '');
        totalItems = prompts.length;
        totalPages = Math.ceil(totalItems / itemsPerPage);
        data = prompts.map((prompt, index) => ({
            triggerPrompt: prompt,
            images: Array.from({ length: 4 }, (_, i) => `https://membench.s3.ap-southeast-2.amazonaws.com/${String(index).padStart(4, '0')}_${i}.png`)
        }));
        renderGallery(currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error fetching prompts:', error);
    }
}

function renderGallery(page) {
    gallery.innerHTML = '';
    const start = (page - 1) * itemsPerPage;
    const end = page * itemsPerPage;
    const items = data.slice(start, end);

    items.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <h2>${item.triggerPrompt}</h2>
            ${item.images.map(image => `<img src="${image}" loading="lazy" alt="Generated Image">`).join('')}
        `;
        gallery.appendChild(galleryItem);
    });
}

function renderPagination() {
    pageNumbers.innerHTML = '';
    const startPage = (currentGroup - 1) * pagesPerGroup + 1;
    const endPage = Math.min(currentGroup * pagesPerGroup, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        const page = document.createElement('div');
        page.className = `page ${i === currentPage ? 'active' : ''}`;
        page.innerText = i;
        page.addEventListener('click', () => {
            currentPage = i;
            renderGallery(currentPage);
            renderPagination();
            updatePaginationButtons();
        });
        pageNumbers.appendChild(page);
    }
    updatePaginationButtons();
}

function updatePaginationButtons() {
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    prevGroupBtn.disabled = currentGroup === 1;
    nextGroupBtn.disabled = currentGroup === Math.ceil(totalPages / pagesPerGroup);
}

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        if (currentPage < (currentGroup - 1) * pagesPerGroup + 1) {
            currentGroup--;
        }
        renderGallery(currentPage);
        renderPagination();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        if (currentPage > currentGroup * pagesPerGroup) {
            currentGroup++;
        }
        renderGallery(currentPage);
        renderPagination();
    }
});

prevGroupBtn.addEventListener('click', () => {
    if (currentGroup > 1) {
        currentGroup--;
        currentPage = (currentGroup - 1) * pagesPerGroup + 1;
        renderGallery(currentPage);
        renderPagination();
    }
});

nextGroupBtn.addEventListener('click', () => {
    if (currentGroup < Math.ceil(totalPages / pagesPerGroup)) {
        currentGroup++;
        currentPage = (currentGroup - 1) * pagesPerGroup + 1;
        renderGallery(currentPage);
        renderPagination();
    }
});

fetchPrompts();
