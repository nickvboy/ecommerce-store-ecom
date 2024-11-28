import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import requests
from decimal import Decimal
import logging
import os
from datetime import datetime
import cloudinary
import cloudinary.uploader
from tkinter import filedialog
from PIL import Image, ImageTk
from dotenv import load_dotenv
import time

# Configure logging
def setup_logging():
    """Configure logging settings"""
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Set up logging with timestamp in filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_filename = f'logs/product_dashboard_{timestamp}.log'
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_filename),
            logging.StreamHandler()  # Also log to console
        ]
    )
    logging.info('Logging initialized')
    return log_filename

# Add this near the top of the file with other imports
API_BASE_URL = 'http://localhost:5000/api'

# After API_BASE_URL definition
load_dotenv()
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

class ProductDashboard:
    def __init__(self, root):
        logging.info('Initializing ProductDashboard')
        self.root = root
        self.root.title("EDC Store Product Dashboard")
        self.root.geometry("1200x800")
        
        # Add pagination state
        self.current_page = 1
        self.items_per_page = 10
        self.total_pages = 1
        
        # Add selection tracking
        self.selected_items = set()
        
        # Store the API base URL as instance variable
        self.api_base_url = API_BASE_URL
        
        self.selected_images = []  # Add this to track selected images
        
        try:
            # Configure style
            logging.debug('Configuring ttk style')
            style = ttk.Style()
            style.theme_use('clam')
            
            # Create main frame
            logging.debug('Creating main frame')
            main_frame = ttk.Frame(root, padding="10")
            main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
            
            # Create and configure treeview
            logging.debug('Setting up treeview')
            self.setup_treeview(main_frame)
            
            # Add scrollbar
            logging.debug('Adding scrollbar')
            self.add_scrollbar(main_frame)
            
            # Add summary frame
            logging.debug('Creating summary frame')
            self.setup_summary_frame(main_frame)
            
            # Add pagination frame
            logging.debug('Creating pagination frame')
            self.setup_pagination_frame(main_frame)
            
            # Add buttons frame
            logging.debug('Creating buttons frame')
            self.setup_buttons_frame(main_frame)
            
            # Configure grid weights
            logging.debug('Configuring grid weights')
            self.configure_grid(main_frame)
            
            # Initial data fetch
            logging.info('Performing initial data fetch')
            self.fetch_products()
            
        except Exception as e:
            logging.error(f'Error during initialization: {str(e)}', exc_info=True)
            messagebox.showerror("Initialization Error", f"Failed to initialize dashboard: {str(e)}")
    
    def setup_treeview(self, main_frame):
        """Set up the treeview widget"""
        logging.debug('Creating treeview columns')
        self.tree = ttk.Treeview(main_frame, columns=(
            "mongo_id",  # Hidden column for full MongoDB ObjectId
            "id",        # Display ID
            "name", 
            "category", 
            "price", 
            "original_price", 
            "stock", 
            "sizes", 
            "rating", 
            "reviews"
        ), show="headings", selectmode="extended")
        
        # Define column headings and widths
        columns_config = {
            "mongo_id": {"text": "MongoDB ID", "width": 0},  # Hidden column
            "id": {"text": "ID", "width": 100},
            "name": {"text": "Name", "width": 250},
            "category": {"text": "Category", "width": 100},
            "price": {"text": "Price", "width": 100},
            "original_price": {"text": "Original Price", "width": 100},
            "stock": {"text": "Stock", "width": 80},
            "sizes": {"text": "Sizes", "width": 100},
            "rating": {"text": "Rating", "width": 100},
            "reviews": {"text": "Reviews", "width": 80}
        }
        
        for col, config in columns_config.items():
            logging.debug(f'Configuring column: {col}')
            self.tree.heading(col, text=config["text"])
            self.tree.column(col, width=config["width"])
            
            # Hide the MongoDB ID column
            if col == "mongo_id":
                self.tree.column(col, width=0, stretch=False)
        
        # Bind selection event
        self.tree.bind('<<TreeviewSelect>>', self.on_select)
    
    def add_scrollbar(self, main_frame):
        """Add scrollbar to treeview"""
        scrollbar = ttk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=1, column=1, sticky=(tk.N, tk.S))
    
    def setup_summary_frame(self, main_frame):
        """Set up the summary frame with labels"""
        self.summary_frame = ttk.LabelFrame(main_frame, text="Summary", padding="10")
        self.summary_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Create summary labels
        self.total_products_label = ttk.Label(self.summary_frame, text="Total Products: 0")
        self.total_stock_label = ttk.Label(self.summary_frame, text="Total Stock: 0")
        self.avg_price_label = ttk.Label(self.summary_frame, text="Average Price: $0.00")
        
        # Position labels
        self.total_products_label.grid(row=0, column=0, padx=10)
        self.total_stock_label.grid(row=0, column=1, padx=10)
        self.avg_price_label.grid(row=0, column=2, padx=10)
    
    def configure_grid(self, main_frame):
        """Configure grid weights for proper resizing"""
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(1, weight=1)
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
    
    def setup_pagination_frame(self, main_frame):
        """Set up the pagination controls"""
        self.pagination_frame = ttk.Frame(main_frame)
        self.pagination_frame.grid(row=2, column=0, pady=10)
        
        # Previous page button
        self.prev_button = ttk.Button(
            self.pagination_frame, 
            text="← Previous", 
            command=self.previous_page
        )
        self.prev_button.grid(row=0, column=0, padx=5)
        
        # Page info label
        self.page_label = ttk.Label(
            self.pagination_frame, 
            text="Page 1 of 1"
        )
        self.page_label.grid(row=0, column=1, padx=20)
        
        # Next page button
        self.next_button = ttk.Button(
            self.pagination_frame, 
            text="Next →", 
            command=self.next_page
        )
        self.next_button.grid(row=0, column=2, padx=5)
        
        # Items per page selector
        ttk.Label(self.pagination_frame, text="Items per page:").grid(
            row=0, column=3, padx=(20, 5)
        )
        self.items_per_page_var = tk.StringVar(value="10")
        items_per_page_combo = ttk.Combobox(
            self.pagination_frame,
            textvariable=self.items_per_page_var,
            values=["5", "10", "20", "50", "100"],
            width=5,
            state="readonly"
        )
        items_per_page_combo.grid(row=0, column=4, padx=5)
        items_per_page_combo.bind('<<ComboboxSelected>>', self.on_items_per_page_change)

    def setup_buttons_frame(self, main_frame):
        """Create and configure the buttons frame"""
        buttons_frame = ttk.Frame(main_frame)
        buttons_frame.grid(row=3, column=0, pady=10)
        
        # Delete Selected button
        self.delete_button = ttk.Button(
            buttons_frame,
            text="Delete Selected",
            command=self.delete_selected_products,
            state='disabled'
        )
        self.delete_button.grid(row=0, column=0, padx=5)
        
        # Edit button
        self.edit_button = ttk.Button(
            buttons_frame,
            text="Edit Product",
            command=self.show_edit_product_dialog,
            state='disabled'  # Enable only when one product selected
        )
        self.edit_button.grid(row=0, column=1, padx=5)
        
        # Upload Image button
        self.upload_image_button = ttk.Button(
            buttons_frame,
            text="Upload Images",
            command=self.show_image_upload_dialog,
            state='disabled'
        )
        self.upload_image_button.grid(row=0, column=2, padx=5)
        
        # Add Product button
        self.add_product_button = ttk.Button(
            buttons_frame,
            text="Add Product",
            command=self.show_add_product_dialog
        )
        self.add_product_button.grid(row=0, column=3, padx=5)
        
        # Refresh button
        self.refresh_button = ttk.Button(
            buttons_frame,
            text="Refresh Data",
            command=self.fetch_products
        )
        self.refresh_button.grid(row=0, column=4, padx=5)

    def fetch_products(self):
        """Fetch products from the API with pagination"""
        logging.info(f'Fetching products from API - Page {self.current_page}')
        try:
            self.refresh_button.config(state='disabled')
            
            # Build API URL and parameters
            base_url = 'http://localhost:5000/api/products'
            params = {
                'page': self.current_page,
                'limit': self.items_per_page
            }
            
            logging.info(f'API Request Details:')
            logging.info(f'  Endpoint: {base_url}')
            logging.info(f'  Method: GET')
            logging.info(f'  Parameters: {params}')
            
            # Make the request
            response = requests.get(base_url, params=params)
            
            # Log response details
            logging.info(f'API Response Details:')
            logging.info(f'  Status Code: {response.status_code}')
            logging.info(f'  Response Time: {response.elapsed.total_seconds():.3f} seconds')
            logging.info(f'  Content Type: {response.headers.get("content-type", "Not specified")}')
            
            if response.status_code == 200:
                data = response.json()
                products = data['products']
                
                # Log pagination details
                logging.info(f'Pagination Details:')
                logging.info(f'  Total Products: {data.get("total", "Not specified")}')
                logging.info(f'  Current Page: {data.get("currentPage", self.current_page)}')
                logging.info(f'  Total Pages: {data.get("totalPages", "Not specified")}')
                logging.info(f'  Items Per Page: {self.items_per_page}')
                
                # Log product summary
                logging.info(f'Products Summary:')
                logging.info(f'  Products Retrieved: {len(products)}')
                categories = set(p.get('category', 'Unknown') for p in products)
                logging.info(f'  Categories Present: {", ".join(categories)}')
                price_range = {
                    'min': min(p.get('price', float('inf')) for p in products),
                    'max': max(p.get('price', 0) for p in products)
                }
                logging.info(f'  Price Range: ${price_range["min"]:.2f} - ${price_range["max"]:.2f}')
                
                # Log individual products (limited to first 3 for brevity)
                logging.debug('First 3 Products Details:')
                for idx, product in enumerate(products[:3], 1):
                    logging.debug(f'  Product {idx}:')
                    logging.debug(f'    ID: {product.get("_id", "Not specified")}')
                    logging.debug(f'    Name: {product.get("name", "Not specified")}')
                    logging.debug(f'    Category: {product.get("category", "Not specified")}')
                    logging.debug(f'    Price: ${product.get("price", 0):.2f}')
                    logging.debug(f'    Stock: {product.get("stock", 0)}')
                    logging.debug(f'    Rating: {product.get("reviewStats", {}).get("averageRating", 0):.1f}')
                
                self.total_pages = data['totalPages']
                logging.info(f'Successfully fetched and processed product data')
                
                self.update_ui(products)
                self.update_pagination_controls()
            else:
                error_msg = f'Failed to fetch products: {response.status_code}'
                logging.error(error_msg)
                logging.error(f'Response Content: {response.text}')
                messagebox.showerror("Error", error_msg)
            
        except requests.RequestException as e:
            error_msg = f'Connection error: {str(e)}'
            logging.error(error_msg, exc_info=True)
            logging.error(f'Request Details:')
            logging.error(f'  URL: {base_url}')
            logging.error(f'  Parameters: {params}')
            messagebox.showerror("Error", error_msg)
        except Exception as e:
            error_msg = f'Unexpected error: {str(e)}'
            logging.error(error_msg, exc_info=True)
            messagebox.showerror("Error", error_msg)
        finally:
            self.refresh_button.config(state='normal')
            logging.info('Product fetch operation completed')

    def update_pagination_controls(self):
        """Update pagination controls state"""
        logging.debug('Updating pagination controls')
        # Update page label
        self.page_label.config(text=f"Page {self.current_page} of {self.total_pages}")
        
        # Update button states
        self.prev_button.config(state='normal' if self.current_page > 1 else 'disabled')
        self.next_button.config(state='normal' if self.current_page < self.total_pages else 'disabled')

    def next_page(self):
        """Go to next page"""
        logging.info('Moving to next page')
        if self.current_page < self.total_pages:
            self.current_page += 1
            self.fetch_products()

    def previous_page(self):
        """Go to previous page"""
        logging.info('Moving to previous page')
        if self.current_page > 1:
            self.current_page -= 1
            self.fetch_products()

    def on_items_per_page_change(self, event):
        """Handle changes to items per page"""
        logging.info('Items per page changed')
        self.items_per_page = int(self.items_per_page_var.get())
        self.current_page = 1  # Reset to first page
        self.fetch_products()

    def update_ui(self, products):
        """Update the UI with fetched products"""
        logging.info('Updating UI with fetched products')
        try:
            # Clear existing items
            logging.debug('Clearing existing items from treeview')
            for item in self.tree.get_children():
                self.tree.delete(item)
            
            # Update summary statistics
            logging.debug('Calculating summary statistics')
            total_products = len(products)
            total_stock = sum(p['stock'] for p in products)
            avg_price = sum(Decimal(str(p['price'])) for p in products) / total_products if total_products > 0 else 0
            
            logging.debug('Updating summary labels')
            self.total_products_label.config(text=f"Total Products: {total_products}")
            self.total_stock_label.config(text=f"Total Stock: {total_stock}")
            self.avg_price_label.config(text=f"Average Price: ${avg_price:.2f}")
            
            # Add products to treeview
            logging.debug('Adding products to treeview')
            for product in products:
                rating = product.get('reviewStats', {}).get('averageRating', 0)
                rating_display = "★" * int(rating) + "☆" * (5 - int(rating))
                
                # Create a hidden column to store the full MongoDB ObjectId
                item = self.tree.insert("", tk.END, values=(
                    product['_id'],  # Hidden full MongoDB ObjectId
                    str(product['_id'])[-6:],  # Displayed shortened ID
                    product['name'],
                    product['category'],
                    f"${product['price']:.2f}",
                    f"${product['originalPrice']:.2f}" if product.get('originalPrice') else "-",
                    product['stock'],
                    ", ".join(product.get('sizes', [])) or "-",
                    f"{rating_display} ({rating:.1f})",
                    product.get('reviewStats', {}).get('totalReviews', 0)
                ))
            
            logging.info('UI update completed successfully')
            
        except Exception as e:
            error_msg = f'Error updating UI: {str(e)}'
            logging.error(error_msg, exc_info=True)
            messagebox.showerror("Error", error_msg)

    def show_add_product_dialog(self):
        """Show dialog for adding a new product"""
        logging.info('Showing add product dialog')
        try:
            # Create a new top-level window
            dialog = tk.Toplevel(self.root)
            dialog.title("Add New Product")
            dialog.geometry("500x700")
            dialog.transient(self.root)
            
            # Main container with padding
            main_container = ttk.Frame(dialog, padding="20")
            main_container.pack(fill=tk.BOTH, expand=True)
            
            # Title
            title_frame = ttk.Frame(main_container)
            title_frame.pack(fill=tk.X, pady=(0, 20))
            ttk.Label(
                title_frame,
                text="Add New Product",
                font=('Helvetica', 14, 'bold')
            ).pack()
            
            # Product Information Section
            info_frame = ttk.LabelFrame(main_container, text="Product Information", padding="10")
            info_frame.pack(fill=tk.X, pady=(0, 15))
            
            # Create form fields
            fields = {}
            
            # Name field
            name_frame = ttk.Frame(info_frame)
            name_frame.pack(fill=tk.X, pady=5)
            ttk.Label(name_frame, text="Name *", width=15).pack(side=tk.LEFT)
            fields['name'] = ttk.Entry(name_frame)
            fields['name'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Category field with predefined options
            category_frame = ttk.Frame(info_frame)
            category_frame.pack(fill=tk.X, pady=5)
            ttk.Label(category_frame, text="Category *", width=15).pack(side=tk.LEFT)
            categories = ["EDC Gear", "Tools", "Pens", "Accessories", "Bundles", "Other"]
            fields['category'] = ttk.Combobox(category_frame, values=categories, state="readonly")
            fields['category'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Has Sizes checkbox
            has_sizes_frame = ttk.Frame(info_frame)
            has_sizes_frame.pack(fill=tk.X, pady=5)
            ttk.Label(has_sizes_frame, text="Has Sizes", width=15).pack(side=tk.LEFT)
            has_sizes_var = tk.BooleanVar(value=False)
            ttk.Checkbutton(
                has_sizes_frame,
                variable=has_sizes_var,
                command=lambda: toggle_size_frame(has_sizes_var.get())
            ).pack(side=tk.LEFT, padx=(10, 0))
            
            # Size Selection frame (for clothing/wearable items)
            size_frame = ttk.Frame(info_frame)
            
            def toggle_size_frame(show):
                """Toggle visibility of size selection frame"""
                if show:
                    size_frame.pack(fill=tk.X, pady=5)
                else:
                    size_frame.pack_forget()
            
            # Initially hide size frame
            toggle_size_frame(False)
            
            ttk.Label(size_frame, text="Sizes", width=15).pack(side=tk.LEFT)
            
            # Create a frame for the checkboxes
            sizes_checkbox_frame = ttk.Frame(size_frame)
            sizes_checkbox_frame.pack(side=tk.LEFT, fill=tk.X, padx=(10, 0))
            
            # Available sizes
            available_sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
            size_vars = {}
            
            # Create checkboxes for each size
            for i, size in enumerate(available_sizes):
                var = tk.BooleanVar()
                size_vars[size] = var
                ttk.Checkbutton(
                    sizes_checkbox_frame,
                    text=size,
                    variable=var
                ).grid(row=0, column=i, padx=5)
            
            fields['sizes'] = size_vars  # Add to fields dictionary
            
            # Description field
            description_frame = ttk.Frame(info_frame)
            description_frame.pack(fill=tk.X, pady=5)
            ttk.Label(description_frame, text="Description *", width=15).pack(side=tk.LEFT)
            fields['description'] = tk.Text(description_frame, height=4, wrap=tk.WORD)
            fields['description'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Pricing Section
            pricing_frame = ttk.LabelFrame(main_container, text="Pricing", padding="10")
            pricing_frame.pack(fill=tk.X, pady=(0, 15))
            
            # Price field
            price_frame = ttk.Frame(pricing_frame)
            price_frame.pack(fill=tk.X, pady=5)
            ttk.Label(price_frame, text="Price ($) *", width=15).pack(side=tk.LEFT)
            fields['price'] = ttk.Entry(price_frame)
            fields['price'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Original Price field
            original_price_frame = ttk.Frame(pricing_frame)
            original_price_frame.pack(fill=tk.X, pady=5)
            ttk.Label(original_price_frame, text="Original Price ($)", width=15).pack(side=tk.LEFT)
            fields['originalPrice'] = ttk.Entry(original_price_frame)
            fields['originalPrice'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Inventory Section
            inventory_frame = ttk.LabelFrame(main_container, text="Inventory", padding="10")
            inventory_frame.pack(fill=tk.X, pady=(0, 15))
            
            # Stock field
            stock_frame = ttk.Frame(inventory_frame)
            stock_frame.pack(fill=tk.X, pady=5)
            ttk.Label(stock_frame, text="Stock *", width=15).pack(side=tk.LEFT)
            fields['stock'] = ttk.Entry(stock_frame)
            fields['stock'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Add Images Section after Inventory Section
            images_frame = ttk.LabelFrame(main_container, text="Images", padding="10")
            images_frame.pack(fill=tk.X, pady=(0, 15))
            
            # Existing Images List
            existing_images_frame = ttk.Frame(images_frame)
            existing_images_frame.pack(fill=tk.X, pady=5)
            
            ttk.Label(existing_images_frame, text="Current Images:").pack(anchor=tk.W)
            
            # Listbox for existing images
            existing_images_list = tk.Listbox(existing_images_frame, height=4)
            existing_images_list.pack(fill=tk.X, expand=True)
            
            # Populate existing images
            for image in product.get('images', []):
                existing_images_list.insert(tk.END, f"Image {image.get('order', 0) + 1}")
            
            # Image control buttons
            image_controls_frame = ttk.Frame(images_frame)
            image_controls_frame.pack(fill=tk.X, pady=5)
            
            def move_image_up():
                sel = existing_images_list.curselection()
                if sel and sel[0] > 0:
                    idx = sel[0]
                    # Swap images in product data
                    product['images'][idx], product['images'][idx-1] = \
                        product['images'][idx-1], product['images'][idx]
                    # Update display
                    existing_images_list.delete(0, tk.END)
                    for image in product['images']:
                        existing_images_list.insert(tk.END, f"Image {image.get('order', 0) + 1}")
                    existing_images_list.selection_set(idx-1)

            def move_image_down():
                sel = existing_images_list.curselection()
                if sel and sel[0] < existing_images_list.size() - 1:
                    idx = sel[0]
                    # Swap images in product data
                    product['images'][idx], product['images'][idx+1] = \
                        product['images'][idx+1], product['images'][idx]
                    # Update display
                    existing_images_list.delete(0, tk.END)
                    for image in product['images']:
                        existing_images_list.insert(tk.END, f"Image {image.get('order', 0) + 1}")
                    existing_images_list.selection_set(idx+1)

            def delete_image():
                sel = existing_images_list.curselection()
                if sel:
                    idx = sel[0]
                    if messagebox.askyesno("Confirm Delete", "Delete selected image?"):
                        # Remove from product data
                        del product['images'][idx]
                        # Update display
                        existing_images_list.delete(idx)

            # Image control buttons
            ttk.Button(
                image_controls_frame,
                text="Move Up",
                command=move_image_up
            ).pack(side=tk.LEFT, padx=5)
            
            ttk.Button(
                image_controls_frame,
                text="Move Down",
                command=move_image_down
            ).pack(side=tk.LEFT, padx=5)
            
            ttk.Button(
                image_controls_frame,
                text="Delete",
                command=delete_image
            ).pack(side=tk.LEFT, padx=5)

            # New Images Section
            new_images_frame = ttk.Frame(images_frame)
            new_images_frame.pack(fill=tk.X, pady=5)
            
            ttk.Label(new_images_frame, text="New Images:").pack(anchor=tk.W)
            
            # List for new images
            new_images_list = tk.Listbox(new_images_frame, height=4)
            new_images_list.pack(fill=tk.X, expand=True)

            def add_new_images():
                files = filedialog.askopenfilenames(
                    title="Select Images",
                    filetypes=[("Image files", "*.png *.jpg *.jpeg *.gif *.bmp")]
                )
                for file in files:
                    new_images_list.insert(tk.END, os.path.basename(file))
                    self.selected_images.append(file)

            def remove_new_image():
                sel = new_images_list.curselection()
                if sel:
                    idx = sel[0]
                    new_images_list.delete(idx)
                    self.selected_images.pop(idx)

            # New images buttons
            new_images_buttons = ttk.Frame(images_frame)
            new_images_buttons.pack(fill=tk.X, pady=5)
            
            ttk.Button(
                new_images_buttons,
                text="Add New Images",
                command=add_new_images
            ).pack(side=tk.LEFT, padx=5)
            
            ttk.Button(
                new_images_buttons,
                text="Remove Selected",
                command=remove_new_image
            ).pack(side=tk.LEFT, padx=5)

            def upload_images():
                uploaded_urls = []
                for image_path in self.selected_images:
                    try:
                        # Add timestamp to upload request
                        result = cloudinary.uploader.upload(
                            image_path,
                            timestamp=int(time.time())  # Add current timestamp
                        )
                        uploaded_urls.append({
                            'url': result['secure_url']
                        })
                    except Exception as e:
                        logging.error(f"Failed to upload image {image_path}: {str(e)}")
                        raise e
                return uploaded_urls

            def submit():
                """Handle form submission"""
                try:
                    # Validate fields
                    errors = self.validate_fields(fields)
                    if errors:
                        messagebox.showerror("Validation Error", "\n".join(errors))
                        return
                    
                    # Upload images first
                    image_urls = []
                    if self.selected_images:
                        image_urls = upload_images()

                    # Collect data
                    data = {
                        'name': fields['name'].get().strip(),
                        'category': fields['category'].get(),
                        'description': fields['description'].get("1.0", tk.END).strip(),
                        'price': float(fields['price'].get()),
                        'stock': int(fields['stock'].get())
                    }
                    
                    # Add optional fields
                    if fields['originalPrice'].get().strip():
                        data['originalPrice'] = float(fields['originalPrice'].get())
                    if has_sizes_var.get():
                        data['sizes'] = [size for size, var in fields['sizes'].items() if var.get()]

                    # Create product
                    response = requests.post(
                        f'{API_BASE_URL}/products',
                        json=data
                    )

                    if response.status_code == 201:
                        product_data = response.json()
                        
                        # If we have images, add them to the product
                        if image_urls:
                            image_response = requests.post(
                                f'{API_BASE_URL}/products/{product_data["_id"]}/images',
                                json={'images': image_urls}
                            )
                            
                            if not image_response.ok:
                                logging.error(f"Failed to add images: {image_response.text}")
                                messagebox.showwarning(
                                    "Warning",
                                    "Product created but failed to add images"
                                )

                        messagebox.showinfo("Success", "Product added successfully!")
                        dialog.destroy()
                        self.fetch_products()
                    else:
                        messagebox.showerror("Error", f"Failed to add product: {response.text}")

                except Exception as e:
                    logging.error(f"Error adding product: {str(e)}", exc_info=True)
                    messagebox.showerror("Error", f"Failed to add product: {str(e)}")
            
            # Buttons frame
            buttons_frame = ttk.Frame(main_container)
            buttons_frame.pack(fill=tk.X, pady=(0, 10))
            
            # Cancel button
            ttk.Button(
                buttons_frame,
                text="Cancel",
                command=dialog.destroy
            ).pack(side=tk.RIGHT, padx=5)
            
            # Submit button
            ttk.Button(
                buttons_frame,
                text="Add Product",
                command=submit,
                style="Accent.TButton"  # Custom style for primary action
            ).pack(side=tk.RIGHT)
            
            # Create custom style for the primary button
            style = ttk.Style()
            style.configure("Accent.TButton", background="#007bff")
            
            # Center the dialog on the screen
            dialog.update_idletasks()
            width = dialog.winfo_width()
            height = dialog.winfo_height()
            x = (dialog.winfo_screenwidth() // 2) - (width // 2)
            y = (dialog.winfo_screenheight() // 2) - (height // 2)
            dialog.geometry(f'{width}x{height}+{x}+{y}')
            
            # Make dialog modal
            dialog.grab_set()
            dialog.focus_set()
            
        except Exception as e:
            logging.error(f"Error showing add product dialog: {str(e)}", exc_info=True)
            messagebox.showerror("Error", f"Failed to show add product dialog: {str(e)}")

    def on_select(self, event):
        """Handle selection changes"""
        self.selected_items = set(self.tree.selection())
        # Enable/disable buttons based on selection
        has_selection = len(self.selected_items) > 0
        single_selection = len(self.selected_items) == 1
        
        self.delete_button.config(state='normal' if has_selection else 'disabled')
        self.upload_image_button.config(state='normal' if single_selection else 'disabled')
        self.edit_button.config(state='normal' if single_selection else 'disabled')
        
        logging.debug(f'Selected items: {len(self.selected_items)}')

    def delete_selected_products(self):
        """Delete selected products"""
        if not self.selected_items:
            return

        # Confirm deletion
        count = len(self.selected_items)
        if not messagebox.askyesno(
            "Confirm Deletion",
            f"Are you sure you want to delete {count} selected product{'s' if count > 1 else ''}?"
        ):
            return

        logging.info(f'Attempting to delete {count} products')
        
        success_count = 0
        failed_ids = []

        try:
            for item_id in self.selected_items:
                # Get the full MongoDB ObjectId from the hidden column
                values = self.tree.item(item_id)['values']
                mongo_id = values[0]  # Get the full MongoDB ObjectId from first column
                
                logging.debug(f'Deleting product with MongoDB ID: {mongo_id}')
                
                try:
                    response = requests.delete(
                        f'{self.api_base_url}/products/{mongo_id}',
                        timeout=5
                    )
                    
                    if response.status_code == 200:
                        success_count += 1
                        logging.info(f'Successfully deleted product {mongo_id}')
                    else:
                        failed_ids.append(mongo_id)
                        logging.error(
                            f'Failed to delete product {mongo_id}. '
                            f'Status: {response.status_code}. '
                            f'Response: {response.text}'
                        )
                
                except requests.RequestException as e:
                    failed_ids.append(mongo_id)
                    logging.error(f'Error deleting product {mongo_id}: {str(e)}')

            # Show result message
            if success_count == count:
                messagebox.showinfo(
                    "Success",
                    f"Successfully deleted {success_count} product{'s' if success_count > 1 else ''}"
                )
            elif success_count > 0:
                messagebox.showwarning(
                    "Partial Success",
                    f"Deleted {success_count} product{'s' if success_count > 1 else ''}, "
                    f"but failed to delete {len(failed_ids)} product{'s' if len(failed_ids) > 1 else ''}"
                )
            else:
                messagebox.showerror(
                    "Error",
                    "Failed to delete any products"
                )

            # Refresh the product list
            self.fetch_products()
            
        except Exception as e:
            error_msg = f'Error during bulk deletion: {str(e)}'
            logging.error(error_msg, exc_info=True)
            messagebox.showerror("Error", error_msg)
        
        finally:
            # Clear selection
            self.selected_items.clear()
            self.delete_button.config(state='disabled')

    def show_edit_product_dialog(self):
        """Show dialog for editing an existing product"""
        if not self.selected_items or len(self.selected_items) > 1:
            messagebox.showwarning("Warning", "Please select exactly one product to edit")
            return
        
        try:
            # Get selected product data
            item_id = list(self.selected_items)[0]
            values = self.tree.item(item_id)['values']
            product_id = values[0]  # MongoDB ID from first column
            
            # Fetch full product data
            response = requests.get(f'{self.api_base_url}/products/{product_id}')
            if not response.ok:
                raise Exception(f"Failed to fetch product: {response.text}")
            
            product = response.json()
            
            # Create edit dialog
            dialog = tk.Toplevel(self.root)
            dialog.title("Edit Product")
            dialog.geometry("500x700")
            dialog.transient(self.root)
            
            # Main container with padding
            main_container = ttk.Frame(dialog, padding="20")
            main_container.pack(fill=tk.BOTH, expand=True)
            
            # Create form fields
            fields = {}
            
            # Name field
            name_frame = ttk.Frame(main_container)
            name_frame.pack(fill=tk.X, pady=5)
            ttk.Label(name_frame, text="Name *", width=15).pack(side=tk.LEFT)
            fields['name'] = ttk.Entry(name_frame)
            fields['name'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Category field with predefined options
            category_frame = ttk.Frame(main_container)
            category_frame.pack(fill=tk.X, pady=5)
            ttk.Label(category_frame, text="Category *", width=15).pack(side=tk.LEFT)
            categories = ["EDC Gear", "Tools", "Pens", "Accessories", "Bundles", "Other"]
            fields['category'] = ttk.Combobox(category_frame, values=categories, state="readonly")
            fields['category'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Has Sizes checkbox
            has_sizes_frame = ttk.Frame(main_container)
            has_sizes_frame.pack(fill=tk.X, pady=5)
            ttk.Label(has_sizes_frame, text="Has Sizes", width=15).pack(side=tk.LEFT)
            has_sizes_var = tk.BooleanVar(value=False)
            ttk.Checkbutton(
                has_sizes_frame,
                variable=has_sizes_var,
                command=lambda: toggle_size_frame(has_sizes_var.get())
            ).pack(side=tk.LEFT, padx=(10, 0))
            
            # Size Selection frame (for clothing/wearable items)
            size_frame = ttk.Frame(main_container)
            
            def toggle_size_frame(show):
                """Toggle visibility of size selection frame"""
                if show:
                    size_frame.pack(fill=tk.X, pady=5)
                else:
                    size_frame.pack_forget()
            
            # Initially hide size frame
            toggle_size_frame(False)
            
            ttk.Label(size_frame, text="Sizes", width=15).pack(side=tk.LEFT)
            
            # Create a frame for the checkboxes
            sizes_checkbox_frame = ttk.Frame(size_frame)
            sizes_checkbox_frame.pack(side=tk.LEFT, fill=tk.X, padx=(10, 0))
            
            # Available sizes
            available_sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
            size_vars = {}
            
            # Create checkboxes for each size
            for i, size in enumerate(available_sizes):
                var = tk.BooleanVar()
                size_vars[size] = var
                ttk.Checkbutton(
                    sizes_checkbox_frame,
                    text=size,
                    variable=var
                ).grid(row=0, column=i, padx=5)
            
            fields['sizes'] = size_vars  # Add to fields dictionary
            
            # Description field
            description_frame = ttk.Frame(main_container)
            description_frame.pack(fill=tk.X, pady=5)
            ttk.Label(description_frame, text="Description *", width=15).pack(side=tk.LEFT)
            fields['description'] = tk.Text(description_frame, height=4, wrap=tk.WORD)
            fields['description'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Pricing Section
            pricing_frame = ttk.LabelFrame(main_container, text="Pricing", padding="10")
            pricing_frame.pack(fill=tk.X, pady=(0, 15))
            
            # Price field
            price_frame = ttk.Frame(pricing_frame)
            price_frame.pack(fill=tk.X, pady=5)
            ttk.Label(price_frame, text="Price ($) *", width=15).pack(side=tk.LEFT)
            fields['price'] = ttk.Entry(price_frame)
            fields['price'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Original Price field
            original_price_frame = ttk.Frame(pricing_frame)
            original_price_frame.pack(fill=tk.X, pady=5)
            ttk.Label(original_price_frame, text="Original Price ($)", width=15).pack(side=tk.LEFT)
            fields['originalPrice'] = ttk.Entry(original_price_frame)
            fields['originalPrice'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Inventory Section
            inventory_frame = ttk.LabelFrame(main_container, text="Inventory", padding="10")
            inventory_frame.pack(fill=tk.X, pady=(0, 15))
            
            # Stock field
            stock_frame = ttk.Frame(inventory_frame)
            stock_frame.pack(fill=tk.X, pady=5)
            ttk.Label(stock_frame, text="Stock *", width=15).pack(side=tk.LEFT)
            fields['stock'] = ttk.Entry(stock_frame)
            fields['stock'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Populate fields with existing data
            fields['name'].insert(0, product['name'])
            fields['category'].set(product['category'])
            fields['description'].insert("1.0", product['description'])
            fields['price'].insert(0, str(product['price']))
            if product.get('originalPrice'):
                fields['originalPrice'].insert(0, str(product['originalPrice']))
            fields['stock'].insert(0, str(product['stock']))
            
            # Set size checkboxes if product has sizes
            if product.get('sizes'):
                has_sizes_var.set(True)
                for size, var in fields['sizes'].items():
                    var.set(size in product['sizes'])
            
            # Images Section
            images_frame = ttk.LabelFrame(main_container, text="Images", padding="10")
            images_frame.pack(fill=tk.X, pady=(0, 15))
            
            # Existing Images List
            existing_images_frame = ttk.Frame(images_frame)
            existing_images_frame.pack(fill=tk.X, pady=5)
            
            ttk.Label(existing_images_frame, text="Current Images:").pack(anchor=tk.W)
            
            # Listbox for existing images
            existing_images_list = tk.Listbox(existing_images_frame, height=4)
            existing_images_list.pack(fill=tk.X, expand=True)
            
            # Populate existing images
            for image in product.get('images', []):
                existing_images_list.insert(tk.END, f"Image {image.get('order', 0) + 1}")
            
            # Image control buttons
            image_controls_frame = ttk.Frame(images_frame)
            image_controls_frame.pack(fill=tk.X, pady=5)
            
            def move_image_up():
                sel = existing_images_list.curselection()
                if sel and sel[0] > 0:
                    idx = sel[0]
                    # Swap images in product data
                    product['images'][idx], product['images'][idx-1] = \
                        product['images'][idx-1], product['images'][idx]
                    # Update display
                    existing_images_list.delete(0, tk.END)
                    for image in product['images']:
                        existing_images_list.insert(tk.END, f"Image {image.get('order', 0) + 1}")
                    existing_images_list.selection_set(idx-1)

            def move_image_down():
                sel = existing_images_list.curselection()
                if sel and sel[0] < existing_images_list.size() - 1:
                    idx = sel[0]
                    # Swap images in product data
                    product['images'][idx], product['images'][idx+1] = \
                        product['images'][idx+1], product['images'][idx]
                    # Update display
                    existing_images_list.delete(0, tk.END)
                    for image in product['images']:
                        existing_images_list.insert(tk.END, f"Image {image.get('order', 0) + 1}")
                    existing_images_list.selection_set(idx+1)

            def delete_image():
                sel = existing_images_list.curselection()
                if sel:
                    idx = sel[0]
                    if messagebox.askyesno("Confirm Delete", "Delete selected image?"):
                        # Remove from product data
                        del product['images'][idx]
                        # Update display
                        existing_images_list.delete(idx)

            # Image control buttons
            ttk.Button(
                image_controls_frame,
                text="Move Up",
                command=move_image_up
            ).pack(side=tk.LEFT, padx=5)
            
            ttk.Button(
                image_controls_frame,
                text="Move Down",
                command=move_image_down
            ).pack(side=tk.LEFT, padx=5)
            
            ttk.Button(
                image_controls_frame,
                text="Delete",
                command=delete_image
            ).pack(side=tk.LEFT, padx=5)

            # New Images Section
            new_images_frame = ttk.Frame(images_frame)
            new_images_frame.pack(fill=tk.X, pady=5)
            
            ttk.Label(new_images_frame, text="New Images:").pack(anchor=tk.W)
            
            # List for new images
            new_images_list = tk.Listbox(new_images_frame, height=4)
            new_images_list.pack(fill=tk.X, expand=True)

            def add_new_images():
                files = filedialog.askopenfilenames(
                    title="Select Images",
                    filetypes=[("Image files", "*.png *.jpg *.jpeg *.gif *.bmp")]
                )
                for file in files:
                    new_images_list.insert(tk.END, os.path.basename(file))
                    self.selected_images.append(file)

            def remove_new_image():
                sel = new_images_list.curselection()
                if sel:
                    idx = sel[0]
                    new_images_list.delete(idx)
                    self.selected_images.pop(idx)

            # New images buttons
            new_images_buttons = ttk.Frame(images_frame)
            new_images_buttons.pack(fill=tk.X, pady=5)
            
            ttk.Button(
                new_images_buttons,
                text="Add New Images",
                command=add_new_images
            ).pack(side=tk.LEFT, padx=5)
            
            ttk.Button(
                new_images_buttons,
                text="Remove Selected",
                command=remove_new_image
            ).pack(side=tk.LEFT, padx=5)

            def upload_images():
                uploaded_urls = []
                for image_path in self.selected_images:
                    try:
                        # Add timestamp to upload request
                        result = cloudinary.uploader.upload(
                            image_path,
                            timestamp=int(time.time())  # Add current timestamp
                        )
                        uploaded_urls.append({
                            'url': result['secure_url']
                        })
                    except Exception as e:
                        logging.error(f"Failed to upload image {image_path}: {str(e)}")
                        raise e
                return uploaded_urls

            def submit():
                try:
                    # Validate fields
                    errors = self.validate_fields(fields)
                    if errors:
                        messagebox.showerror("Validation Error", "\n".join(errors))
                        return
                    
                    # Handle image reordering if changed
                    if product.get('images'):
                        reorder_response = requests.patch(
                            f'{self.api_base_url}/products/{product_id}/images/reorder',
                            json={
                                'imageOrders': [
                                    {'id': img['_id'], 'order': idx}
                                    for idx, img in enumerate(product['images'])
                                ]
                            }
                        )
                        if not reorder_response.ok:
                            logging.error(f"Failed to reorder images: {reorder_response.text}")

                    # Upload any new images
                    if self.selected_images:
                        image_urls = upload_images()
                        if image_urls:
                            image_response = requests.post(
                                f'{self.api_base_url}/products/{product_id}/images',
                                json={'images': image_urls}
                            )
                            if not image_response.ok:
                                logging.error(f"Failed to add new images: {image_response.text}")

                    # Collect data
                    data = {
                        'name': fields['name'].get().strip(),
                        'category': fields['category'].get(),
                        'description': fields['description'].get("1.0", tk.END).strip(),
                        'price': float(fields['price'].get()),
                        'stock': int(fields['stock'].get())
                    }
                    
                    # Add optional fields
                    if fields['originalPrice'].get().strip():
                        data['originalPrice'] = float(fields['originalPrice'].get())
                    if has_sizes_var.get():
                        data['sizes'] = [size for size, var in fields['sizes'].items() if var.get()]
                    
                    # Update product
                    response = requests.put(
                        f'{self.api_base_url}/products/{product_id}',
                        json=data
                    )
                    
                    if response.ok:
                        messagebox.showinfo("Success", "Product updated successfully!")
                        dialog.destroy()
                        self.fetch_products()
                    else:
                        messagebox.showerror("Error", f"Failed to update product: {response.text}")
                    
                except Exception as e:
                    logging.error(f"Error updating product: {str(e)}", exc_info=True)
                    messagebox.showerror("Error", f"Failed to update product: {str(e)}")
            
            # Buttons frame
            buttons_frame = ttk.Frame(main_container)
            buttons_frame.pack(fill=tk.X, pady=(0, 10))
            
            # Cancel button
            ttk.Button(
                buttons_frame,
                text="Cancel",
                command=dialog.destroy
            ).pack(side=tk.RIGHT, padx=5)
            
            # Submit button
            ttk.Button(
                buttons_frame,
                text="Update Product",
                command=submit,
                style="Accent.TButton"  # Custom style for primary action
            ).pack(side=tk.RIGHT)
            
            # Create custom style for the primary button
            style = ttk.Style()
            style.configure("Accent.TButton", background="#007bff")
            
            # Center the dialog on the screen
            dialog.update_idletasks()
            width = dialog.winfo_width()
            height = dialog.winfo_height()
            x = (dialog.winfo_screenwidth() // 2) - (width // 2)
            y = (dialog.winfo_screenheight() // 2) - (height // 2)
            dialog.geometry(f'{width}x{height}+{x}+{y}')
            
            # Make dialog modal
            dialog.grab_set()
            dialog.focus_set()
            
        except Exception as e:
            logging.error(f"Error showing edit dialog: {str(e)}", exc_info=True)
            messagebox.showerror("Error", f"Failed to show edit dialog: {str(e)}")

    def show_image_upload_dialog(self):
        """Show dialog for uploading images to an existing product"""
        if not self.selected_items or len(self.selected_items) > 1:
            messagebox.showwarning("Warning", "Please select exactly one product to add images")
            return
        
        try:
            # Get selected product data
            item_id = list(self.selected_items)[0]
            values = self.tree.item(item_id)['values']
            product_id = values[0]  # MongoDB ID from first column
            
            dialog = tk.Toplevel(self.root)
            dialog.title("Upload Images")
            dialog.geometry("500x400")
            dialog.transient(self.root)
            
            # Main container
            main_container = ttk.Frame(dialog, padding="20")
            main_container.pack(fill=tk.BOTH, expand=True)
            
            # Image preview frame
            preview_frame = ttk.Frame(main_container)
            preview_frame.pack(fill=tk.X, pady=5)
            
            # List to store image paths and previews
            image_listbox = tk.Listbox(preview_frame, height=10)
            image_listbox.pack(fill=tk.BOTH, expand=True)
            
            def add_images():
                files = filedialog.askopenfilenames(
                    title="Select Images",
                    filetypes=[("Image files", "*.png *.jpg *.jpeg *.gif *.bmp")]
                )
                for file in files:
                    image_listbox.insert(tk.END, os.path.basename(file))
                    self.selected_images.append(file)

            def remove_selected_image():
                selection = image_listbox.curselection()
                if selection:
                    idx = selection[0]
                    image_listbox.delete(idx)
                    self.selected_images.pop(idx)

            def upload_images():
                uploaded_urls = []
                for image_path in self.selected_images:
                    try:
                        result = cloudinary.uploader.upload(
                            image_path,
                            timestamp=int(time.time())
                        )
                        uploaded_urls.append({
                            'url': result['secure_url']
                        })
                    except Exception as e:
                        logging.error(f"Failed to upload image {image_path}: {str(e)}")
                        raise e
                return uploaded_urls

            def submit():
                try:
                    if not self.selected_images:
                        messagebox.showwarning("Warning", "Please select images to upload")
                        return
                    
                    # Upload images
                    image_urls = upload_images()
                    
                    # Add images to product
                    response = requests.post(
                        f'{self.api_base_url}/products/{product_id}/images',
                        json={'images': image_urls}
                    )
                    
                    if response.ok:
                        messagebox.showinfo("Success", "Images uploaded successfully!")
                        dialog.destroy()
                        self.fetch_products()  # Refresh product list
                    else:
                        messagebox.showerror("Error", f"Failed to add images: {response.text}")
                    
                except Exception as e:
                    logging.error(f"Error uploading images: {str(e)}", exc_info=True)
                    messagebox.showerror("Error", f"Failed to upload images: {str(e)}")

            # Buttons frame
            buttons_frame = ttk.Frame(main_container)
            buttons_frame.pack(fill=tk.X, pady=10)
            
            ttk.Button(
                buttons_frame,
                text="Add Images",
                command=add_images
            ).pack(side=tk.LEFT, padx=5)
            
            ttk.Button(
                buttons_frame,
                text="Remove Selected",
                command=remove_selected_image
            ).pack(side=tk.LEFT, padx=5)
            
            # Submit/Cancel frame
            submit_frame = ttk.Frame(main_container)
            submit_frame.pack(fill=tk.X, pady=(10, 0))
            
            ttk.Button(
                submit_frame,
                text="Cancel",
                command=dialog.destroy
            ).pack(side=tk.RIGHT, padx=5)
            
            ttk.Button(
                submit_frame,
                text="Upload",
                command=submit,
                style="Accent.TButton"
            ).pack(side=tk.RIGHT, padx=5)
            
            # Center dialog
            dialog.update_idletasks()
            width = dialog.winfo_width()
            height = dialog.winfo_height()
            x = (dialog.winfo_screenwidth() // 2) - (width // 2)
            y = (dialog.winfo_screenheight() // 2) - (height // 2)
            dialog.geometry(f'{width}x{height}+{x}+{y}')
            
            # Make dialog modal
            dialog.grab_set()
            dialog.focus_set()
            
        except Exception as e:
            logging.error(f"Error showing image upload dialog: {str(e)}", exc_info=True)
            messagebox.showerror("Error", f"Failed to show image upload dialog: {str(e)}")

    def validate_fields(self, fields):
        """Validate form fields"""
        errors = []
        
        # Required fields
        if not fields['name'].get().strip():
            errors.append("Name is required")
        if not fields['category'].get():
            errors.append("Category is required")
        if not fields['description'].get("1.0", tk.END).strip():
            errors.append("Description is required")
        
        # Numeric validations
        try:
            price = float(fields['price'].get())
            if price <= 0:
                errors.append("Price must be greater than 0")
        except ValueError:
            errors.append("Price must be a valid number")
        
        try:
            if fields['originalPrice'].get().strip():
                original_price = float(fields['originalPrice'].get())
                if original_price <= 0:
                    errors.append("Original price must be greater than 0")
        except ValueError:
            errors.append("Original price must be a valid number")
        
        try:
            stock = int(fields['stock'].get())
            if stock < 0:
                errors.append("Stock cannot be negative")
        except ValueError:
            errors.append("Stock must be a valid number")
        
        return errors

def main():
    try:
        log_filename = setup_logging()
        logging.info('Starting Product Dashboard application')
        
        root = tk.Tk()
        app = ProductDashboard(root)
        
        logging.info(f'Application initialized. Log file: {log_filename}')
        logging.info('Starting main loop')
        
        root.mainloop()
        
    except Exception as e:
        logging.critical(f'Critical error in main: {str(e)}', exc_info=True)
        messagebox.showerror("Critical Error", f"Application failed to start: {str(e)}")
    finally:
        logging.info('Application shutting down')

if __name__ == "__main__":
    main() 