import axios from 'axios';

const API_URL = '/api';

export async function loadCategories() {
    try {
        const response = await axios.get(`${API_URL}/categories/tree`);
        const categorySelect = document.querySelector('select[name="category"]');
        if (categorySelect) {
            // Clear existing options except the first one (placeholder)
            while (categorySelect.options.length > 1) {
                categorySelect.remove(1);
            }
            populateCategoryDropdown(categorySelect, response.data);
        }
        return response.data;
    } catch (error) {
        console.error('Error loading categories:', error);
        alert('Error loading categories: ' + error.message);
        return [];
    }
}

function populateCategoryDropdown(select, categories, level = 0) {
    categories.forEach(category => {
        // Create indentation based on level
        const indent = '—'.repeat(level);
        const option = document.createElement('option');
        option.value = category._id;
        option.textContent = indent + ' ' + category.name;
        
        // If this is a parent category, add a class for styling
        if (category.children && category.children.length > 0) {
            option.classList.add('font-semibold', 'dark:text-gray-300');
        } else {
            option.classList.add('dark:text-gray-400');
        }
        
        select.appendChild(option);

        // Recursively add child categories with increased indentation
        if (category.children && category.children.length > 0) {
            populateCategoryDropdown(select, category.children, level + 1);
        }
    });
}

// Helper function to get category path string
export function getCategoryPath(category) {
    if (!category) return 'Uncategorized';
    let path = category.name;
    if (category.parent) {
        path = getCategoryPath(category.parent) + ' > ' + path;
    }
    return path;
}

// Theme toggle functionality
export function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeText = themeToggleBtn.querySelector('span:last-child');
    
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
        themeText.textContent = 'Light Mode';
    } else {
        themeText.textContent = 'Dark Mode';
    }

    // Toggle theme
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        themeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Update category select styling
        const categorySelect = document.querySelector('select[name="category"]');
        if (categorySelect) {
            categorySelect.classList.toggle('dark-select', isDark);
        }
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const shouldBeDark = e.matches;
            document.documentElement.classList.toggle('dark', shouldBeDark);
            themeText.textContent = shouldBeDark ? 'Light Mode' : 'Dark Mode';
        }
    });
} 