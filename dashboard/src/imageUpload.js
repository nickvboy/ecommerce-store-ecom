let selectedImages = [];

export function setupImageUpload() {
    const script = document.createElement('script');
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    document.head.appendChild(script);

    script.onload = () => {
        const uploadButton = document.getElementById('uploadButton');
        if (uploadButton) {
            initializeCloudinaryWidget(uploadButton);
        }
    };
}

function initializeCloudinaryWidget(button) {
    const cloudName = 'dwnf5wg7w';
    const uploadPreset = 'product_images';

    const myWidget = cloudinary.createUploadWidget(
        {
            cloudName: cloudName,
            uploadPreset: uploadPreset,
            multiple: true,
            maxFiles: 5,
            sources: ['local', 'url', 'camera'],
            showAdvancedOptions: false,
            cropping: false,
            showUploadMoreButton: true,
            styles: {
                palette: {
                    window: "#FFFFFF",
                    windowBorder: "#90A0B3",
                    tabIcon: "#0078FF",
                    menuIcons: "#5A616A",
                    textDark: "#000000",
                    textLight: "#FFFFFF",
                    link: "#0078FF",
                    action: "#FF620C",
                    inactiveTabIcon: "#0E2F5A",
                    error: "#F44235",
                    inProgress: "#0078FF",
                    complete: "#20B832",
                    sourceBg: "#E4EBF1"
                }
            }
        },
        (error, result) => {
            if (error) {
                console.error('Upload error:', error);
            }
            if (!error && result && result.event === "success") {
                const imageUrl = result.info.secure_url;
                addImageToSelection(imageUrl);
            }
        }
    );

    button.addEventListener('click', () => {
        myWidget.open();
    });
}

function addImageToSelection(imageUrl) {
    const order = selectedImages.length;
    selectedImages.push({ url: imageUrl, order });
    updateImageDisplay();
}

function updateImageDisplay() {
    const container = document.getElementById('selectedImages');
    container.innerHTML = '';
    
    // Create a wrapper for drag-and-drop functionality
    const wrapper = document.createElement('div');
    wrapper.className = 'grid grid-cols-2 md:grid-cols-4 gap-4';
    
    selectedImages.sort((a, b) => a.order - b.order).forEach((image, index) => {
        const div = document.createElement('div');
        div.className = 'relative bg-gray-100 rounded-lg cursor-move';
        div.draggable = true;
        div.dataset.index = index;
        
        // Square aspect ratio container
        div.innerHTML = `
            <div class="relative pt-[100%]"> <!-- Creates 1:1 aspect ratio -->
                <img src="${image.url}" 
                     class="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                     alt="Product image ${index + 1}">
                <div class="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                    #${index + 1}
                </div>
                <button onclick="window.removeImage(${index})" 
                        class="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 hover:bg-red-100">
                    <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;

        // Add drag and drop events
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragover', handleDragOver);
        div.addEventListener('drop', handleDrop);
        div.addEventListener('dragenter', handleDragEnter);
        div.addEventListener('dragleave', handleDragLeave);

        wrapper.appendChild(div);
    });

    container.appendChild(wrapper);
}

// Drag and drop handlers
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = e.target;
    e.target.classList.add('opacity-50');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.closest('.relative')?.classList.add('bg-blue-100');
}

function handleDragLeave(e) {
    e.target.closest('.relative')?.classList.remove('bg-blue-100');
}

function handleDrop(e) {
    e.preventDefault();
    const dropTarget = e.target.closest('.relative');
    if (dropTarget && draggedItem !== dropTarget) {
        const draggedIndex = parseInt(draggedItem.dataset.index);
        const droppedIndex = parseInt(dropTarget.dataset.index);

        // Reorder the array
        const [movedImage] = selectedImages.splice(draggedIndex, 1);
        selectedImages.splice(droppedIndex, 0, movedImage);

        // Update all orders to match new positions
        selectedImages.forEach((img, idx) => {
            img.order = idx;
        });

        // Reset styles and update display
        dropTarget.classList.remove('bg-blue-100');
        draggedItem.classList.remove('opacity-50');
        updateImageDisplay();
    }
}

window.removeImage = (index) => {
    selectedImages.splice(index, 1);
    // Reorder remaining images
    selectedImages.forEach((img, idx) => {
        img.order = idx;
    });
    updateImageDisplay();
};

export function getSelectedImages() {
    return selectedImages;
}

export function clearSelectedImages() {
    selectedImages = [];
    updateImageDisplay();
} 