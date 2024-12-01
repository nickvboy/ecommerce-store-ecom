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
        self.root.title("EDC Store Dashboard")
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
            style.configure("Active.TButton", background="#007bff")
            
            # Create main frame
            logging.debug('Creating main frame')
            main_frame = ttk.Frame(root, padding="10")
            main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
            
            # Create navigation frame for section buttons
            nav_frame = ttk.Frame(main_frame)
            nav_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
            
            # Products button (default active)
            self.products_button = ttk.Button(
                nav_frame,
                text="Products",
                command=self.show_products_section,
                style="Active.TButton"
            )
            self.products_button.grid(row=0, column=0, padx=5)
            
            # Users button
            self.users_button = ttk.Button(
                nav_frame,
                text="Users",
                command=self.show_users_section
            )
            self.users_button.grid(row=0, column=1, padx=5)
            
            # Create products frame
            self.products_frame = ttk.Frame(main_frame)
            self.products_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
            
            # Create users frame
            self.users_frame = ttk.Frame(main_frame)
            
            # Initialize all UI components for products
            self.setup_treeview(self.products_frame)
            self.add_scrollbar(self.products_frame)
            self.setup_summary_frame(self.products_frame)
            self.setup_pagination_frame(self.products_frame)
            self.setup_buttons_frame(self.products_frame)
            
            # Initialize all UI components for users
            self.setup_users_treeview(self.users_frame)
            
            # Configure grid weights
            self.configure_grid(main_frame)
            
            # Initially show products section
            self.current_section = 'products'
            self.show_products_section()
            
            # Initial data fetch
            logging.info('Performing initial data fetch')
            self.fetch_products()
            
        except Exception as e:
            logging.error(f'Error during initialization: {str(e)}', exc_info=True)
            messagebox.showerror("Initialization Error", f"Failed to initialize dashboard: {str(e)}")
    
    def setup_users_treeview(self, container):
        """Set up the users treeview widget"""
        logging.debug('Creating users treeview columns')
        self.users_tree = ttk.Treeview(container, columns=(
            "id",
            "name",
            "email",
            "role",
            "created_at",
            "orders_count",
            "addresses_count"
        ), show="headings", selectmode="extended")
        
        # Define column headings and widths
        columns_config = {
            "id": {"text": "ID", "width": 100},
            "name": {"text": "Name", "width": 200},
            "email": {"text": "Email", "width": 250},
            "role": {"text": "Role", "width": 100},
            "created_at": {"text": "Created At", "width": 150},
            "orders_count": {"text": "Orders", "width": 80},
            "addresses_count": {"text": "Addresses", "width": 80}
        }
        
        for col, config in columns_config.items():
            logging.debug(f'Configuring users column: {col}')
            self.users_tree.heading(col, text=config["text"])
            self.users_tree.column(col, width=config["width"])
        
        # Add scrollbar for users treeview
        users_scrollbar = ttk.Scrollbar(container, orient=tk.VERTICAL, command=self.users_tree.yview)
        self.users_tree.configure(yscrollcommand=users_scrollbar.set)
        
        self.users_tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        users_scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # Configure grid weights for users container
        container.columnconfigure(0, weight=1)
        container.rowconfigure(0, weight=1)
        
        # Bind selection event
        self.users_tree.bind('<<TreeviewSelect>>', self.on_user_select)
        
        # Add refresh button for users
        refresh_users_btn = ttk.Button(
            container,
            text="Refresh Users",
            command=self.fetch_users
        )
        refresh_users_btn.grid(row=1, column=0, pady=10)
    
    def show_products_section(self):
        """Show the products section"""
        self.current_section = 'products'
        self.users_frame.grid_remove()
        self.products_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        self.products_button.configure(style="Active.TButton")
        self.users_button.configure(style="TButton")
        self.fetch_products()
    
    def show_users_section(self):
        """Show the users section"""
        self.current_section = 'users'
        self.products_frame.grid_remove()
        self.users_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        self.users_button.configure(style="Active.TButton")
        self.products_button.configure(style="TButton")
        self.fetch_users()
    
    def fetch_users(self):
        """Fetch users from the API"""
        logging.info('Fetching users from API')
        try:
            # First get admin token
            login_data = {
                'email': 'admin@example.com',
                'password': 'admin123'
            }
            
            # Login to get token
            login_response = requests.post(f'{self.api_base_url}/users/login', json=login_data)
            if login_response.status_code != 200:
                error_msg = f'Failed to authenticate: {login_response.status_code}'
                logging.error(error_msg)
                if login_response.text:
                    logging.error(f'Response content: {login_response.text}')
                return
                
            # Store token for reuse
            self.admin_token = login_response.json().get('token')
            if not self.admin_token:
                logging.error('No token received from login')
                return
                
            # Fetch users with token
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            response = requests.get(f'{self.api_base_url}/users/admin/list', headers=headers)
            
            if response.status_code == 200:
                users = response.json()
                self.update_users_ui(users)
            elif response.status_code == 403:
                logging.error('Access denied. Admin privileges required.')
            else:
                error_msg = f'Failed to fetch users: {response.status_code}'
                logging.error(error_msg)
                if response.text:
                    logging.error(f'Response content: {response.text}')
                
        except requests.RequestException as e:
            error_msg = f'Connection error while fetching users: {str(e)}'
            logging.error(error_msg, exc_info=True)
        except Exception as e:
            error_msg = f'Unexpected error while fetching users: {str(e)}'
            logging.error(error_msg, exc_info=True)
    
    def update_users_ui(self, users):
        """Update the UI with fetched users"""
        logging.info('Updating UI with fetched users')
        try:
            # Clear existing items
            for item in self.users_tree.get_children():
                self.users_tree.delete(item)
            
            # Add users to treeview
            for user in users:
                created_at = datetime.fromisoformat(user['createdAt'].replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M')
                self.users_tree.insert("", tk.END, values=(
                    user['_id'],
                    user['name'],
                    user['email'],
                    user['role'],
                    created_at,
                    len(user.get('orders', [])),
                    len(user.get('addresses', []))
                ))
            
            logging.info('Users UI update completed successfully')
            
        except Exception as e:
            error_msg = f'Error updating users UI: {str(e)}'
            logging.error(error_msg, exc_info=True)
    
    def on_user_select(self, event):
        """Handle user selection"""
        selected_items = self.users_tree.selection()
        if not selected_items:
            return
        
        # Get the selected user's data
        user_id = self.users_tree.item(selected_items[0])['values'][0]
        self.show_user_details(user_id)
    
    def show_user_details(self, user_id):
        """Show detailed information about a user"""
        try:
            if not hasattr(self, 'admin_token'):
                logging.error('No admin token available. Please refresh the user list first.')
                return
                
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            response = requests.get(f'{self.api_base_url}/users/admin/{user_id}', headers=headers)
            
            if response.status_code == 200:
                user = response.json()
                
                # Create details window
                details_window = tk.Toplevel(self.root)
                details_window.title(f"User Details - {user['name']}")
                details_window.geometry("600x400")
                
                # Create main frame with padding
                main_frame = ttk.Frame(details_window, padding="20")
                main_frame.pack(fill=tk.BOTH, expand=True)
                
                # Basic Information
                info_frame = ttk.LabelFrame(main_frame, text="Basic Information", padding="10")
                info_frame.pack(fill=tk.X, pady=(0, 10))
                
                ttk.Label(info_frame, text=f"Name: {user['name']}").pack(anchor=tk.W)
                ttk.Label(info_frame, text=f"Email: {user['email']}").pack(anchor=tk.W)
                ttk.Label(info_frame, text=f"Role: {user['role']}").pack(anchor=tk.W)
                created_at = datetime.fromisoformat(user['createdAt'].replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M')
                ttk.Label(info_frame, text=f"Created: {created_at}").pack(anchor=tk.W)
                
                # Addresses
                if user.get('addresses'):
                    addresses_frame = ttk.LabelFrame(main_frame, text="Addresses", padding="10")
                    addresses_frame.pack(fill=tk.X, pady=(0, 10))
                    
                    for idx, addr in enumerate(user['addresses'], 1):
                        address_text = f"Address {idx}: {addr.get('street', '')}, {addr.get('city', '')}, "
                        address_text += f"{addr.get('state', '')}, {addr.get('zipCode', '')}, {addr.get('country', '')}"
                        if addr.get('isDefault'):
                            address_text += " (Default)"
                        ttk.Label(addresses_frame, text=address_text, wraplength=500).pack(anchor=tk.W, pady=2)
                
                # Orders
                if user.get('orders'):
                    orders_frame = ttk.LabelFrame(main_frame, text="Orders", padding="10")
                    orders_frame.pack(fill=tk.X, pady=(0, 10))
                    
                    orders_tree = ttk.Treeview(orders_frame, columns=("id", "date", "total", "status"), show="headings", height=5)
                    orders_tree.heading("id", text="Order ID")
                    orders_tree.heading("date", text="Date")
                    orders_tree.heading("total", text="Total")
                    orders_tree.heading("status", text="Status")
                    
                    orders_tree.column("id", width=100)
                    orders_tree.column("date", width=150)
                    orders_tree.column("total", width=100)
                    orders_tree.column("status", width=100)
                    
                    orders_tree.pack(fill=tk.X)
                    
                    for order in user['orders']:
                        order_date = datetime.fromisoformat(order['createdAt'].replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M')
                        orders_tree.insert("", tk.END, values=(
                            order['_id'],
                            order_date,
                            f"${order.get('totalAmount', 0):.2f}",
                            order.get('status', 'N/A')
                        ))
                
                # Center the window
                details_window.update_idletasks()
                width = details_window.winfo_width()
                height = details_window.winfo_height()
                x = (details_window.winfo_screenwidth() // 2) - (width // 2)
                y = (details_window.winfo_screenheight() // 2) - (height // 2)
                details_window.geometry(f'{width}x{height}+{x}+{y}')
                
            elif response.status_code == 403:
                logging.error('Access denied. Admin privileges required.')
            else:
                error_msg = f'Failed to fetch user details: {response.status_code}'
                logging.error(error_msg)
                if response.text:
                    logging.error(f'Response content: {response.text}')
                
        except Exception as e:
            error_msg = f"Error showing user details: {str(e)}"
            logging.error(error_msg, exc_info=True)
    
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
            if hasattr(self, 'refresh_button'):
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
            
        except requests.RequestException as e:
            error_msg = f'Connection error: {str(e)}'
            logging.error(error_msg, exc_info=True)
            logging.error(f'Request Details:')
            logging.error(f'  URL: {base_url}')
            logging.error(f'  Parameters: {params}')
        except Exception as e:
            error_msg = f'Unexpected error: {str(e)}'
            logging.error(error_msg, exc_info=True)
        finally:
            if hasattr(self, 'refresh_button'):
                self.refresh_button.config(state='normal')
            logging.info('Product fetch operation completed')

    def update_pagination_controls(self):
        """Update pagination controls state"""
        logging.debug('Updating pagination controls')
        try:
            if not all(hasattr(self, attr) for attr in ['page_label', 'prev_button', 'next_button']):
                logging.error('Pagination controls not initialized')
                return
                
            # Update page label
            self.page_label.config(text=f"Page {self.current_page} of {self.total_pages}")
            
            # Update button states
            self.prev_button.config(state='normal' if self.current_page > 1 else 'disabled')
            self.next_button.config(state='normal' if self.current_page < self.total_pages else 'disabled')
        except Exception as e:
            logging.error(f'Error updating pagination controls: {str(e)}', exc_info=True)

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
            if not hasattr(self, 'tree'):
                logging.error('Tree view not initialized')
                return
                
            # Clear existing items
            for item in self.tree.get_children():
                self.tree.delete(item)
            
            # Update summary statistics
            total_products = len(products)
            total_stock = sum(p['stock'] for p in products)
            avg_price = sum(Decimal(str(p['price'])) for p in products) / total_products if total_products > 0 else 0
            
            if hasattr(self, 'total_products_label'):
                self.total_products_label.config(text=f"Total Products: {total_products}")
            if hasattr(self, 'total_stock_label'):
                self.total_stock_label.config(text=f"Total Stock: {total_stock}")
            if hasattr(self, 'avg_price_label'):
                self.avg_price_label.config(text=f"Average Price: ${avg_price:.2f}")
            
            # Add products to treeview
            for product in products:
                rating = product.get('reviewStats', {}).get('averageRating', 0)
                rating_display = "★" * int(rating) + "☆" * (5 - int(rating))
                
                self.tree.insert("", tk.END, values=(
                    product['_id'],
                    str(product['_id'])[-6:],
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
            logging.error(f'Error updating UI: {str(e)}', exc_info=True)

    def show_add_product_dialog(self):
        """Show dialog for adding a new product"""
        logging.info('Showing add product dialog')
        self.selected_images = []
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
            
            # Images Section
            images_frame = ttk.LabelFrame(main_container, text="Images", padding="10")
            images_frame.pack(fill=tk.X, pady=(0, 15))
            
            # Preview area - using Canvas for scrolling
            preview_canvas = tk.Canvas(images_frame, height=150)
            preview_frame = ttk.Frame(preview_canvas)
            scrollbar = ttk.Scrollbar(images_frame, orient="horizontal", command=preview_canvas.xview)
            preview_canvas.configure(xscrollcommand=scrollbar.set)
            
            # Pack the canvas and scrollbar
            scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
            preview_canvas.pack(side=tk.TOP, fill=tk.X, expand=True)
            
            # Create a window inside the canvas for the preview frame
            canvas_frame = preview_canvas.create_window((0, 0), window=preview_frame, anchor="nw")
            
            # Configure canvas scrolling
            def configure_scroll_region(event):
                preview_canvas.configure(scrollregion=preview_canvas.bbox("all"))
            preview_frame.bind("<Configure>", configure_scroll_region)
            
            def add_images():
                files = filedialog.askopenfilenames(
                    title="Select Images",
                    filetypes=[("Image files", "*.png *.jpg *.jpeg *.gif *.bmp")]
                )
                for file in files:
                    if file not in self.selected_images:
                        self.selected_images.append(file)
                        # Create and pack preview frame
                        preview = self.create_image_preview_frame(preview_frame, file)
                        preview.pack(side=tk.LEFT, padx=5, pady=5)
                        
                        # Add remove button for this specific image
                        def remove_this_image(f=file, p=preview):
                            self.selected_images.remove(f)
                            p.destroy()
                            preview_canvas.configure(scrollregion=preview_canvas.bbox("all"))
                        
                        remove_btn = ttk.Button(
                            preview,
                            text="×",
                            width=2,
                            command=remove_this_image
                        )
                        remove_btn.place(x=0, y=0)
                        
                        # Update scroll region after adding new image
                        preview_canvas.configure(scrollregion=preview_canvas.bbox("all"))
            
            # Add Image Button - Now add_images is defined
            add_image_btn = ttk.Button(
                images_frame,
                text="Add Images",
                command=add_images,
                style="Accent.TButton"
            )
            add_image_btn.pack(side=tk.TOP, pady=(0, 10))
            
            def submit():
                try:
                    # Validate fields
                    errors = self.validate_fields(fields)
                    if errors:
                        messagebox.showerror("Validation Error", "\n".join(errors))
                        return

                    # Prepare product data (without images)
                    product_data = {
                        'name': fields['name'].get(),
                        'category': fields['category'].get(),
                        'description': fields['description'].get("1.0", tk.END).strip(),
                        'price': float(fields['price'].get()),
                        'stock': int(fields['stock'].get()),
                        'sizes': [size for size, var in fields['sizes'].items() if var.get()],
                        'images': []  # Start with empty images array
                    }

                    # Add optional fields if they exist
                    if fields['originalPrice'].get().strip():
                        product_data['originalPrice'] = float(fields['originalPrice'].get())

                    # Create product first
                    response = requests.post(
                        f'{self.api_base_url}/products',
                        json=product_data
                    )
                    
                    if response.ok:
                        new_product = response.json()
                        dialog.destroy()
                        
                        # If there are selected images, show image upload dialog
                        if self.selected_images:
                            if messagebox.askyesno("Upload Images", 
                                "Product created successfully! Would you like to upload the selected images now?"):
                                self.upload_images_for_product(new_product['_id'], self.selected_images)
                        else:
                            messagebox.showinfo("Success", "Product added successfully!")
                        
                        self.fetch_products()  # Refresh product list
                    else:
                        messagebox.showerror("Error", f"Failed to add product: {response.text}")
                    
                except Exception as e:
                    logging.error(f"Error submitting product: {str(e)}", exc_info=True)
                    messagebox.showerror("Error", f"Failed to submit product: {str(e)}")

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
            logging.error(f"Error showing add dialog: {str(e)}", exc_info=True)
            messagebox.showerror("Error", f"Failed to show add dialog: {str(e)}")

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
        # Clear selected images at the start
        self.selected_images = []
        
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
            
            # Description field
            description_frame = ttk.Frame(main_container)
            description_frame.pack(fill=tk.X, pady=5)
            ttk.Label(description_frame, text="Description *", width=15).pack(side=tk.LEFT)
            fields['description'] = tk.Text(description_frame, height=4, wrap=tk.WORD)
            fields['description'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
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
            
            # Materials Section
            materials_frame = ttk.LabelFrame(main_container, text="Materials", padding="10")
            materials_frame.pack(fill=tk.X, pady=(0, 15))
            
            # Body Material
            body_material_frame = ttk.Frame(materials_frame)
            body_material_frame.pack(fill=tk.X, pady=5)
            ttk.Label(body_material_frame, text="Body Material", width=15).pack(side=tk.LEFT)
            fields['body_material'] = ttk.Entry(body_material_frame)
            fields['body_material'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Bolt Material
            bolt_material_frame = ttk.Frame(materials_frame)
            bolt_material_frame.pack(fill=tk.X, pady=5)
            ttk.Label(bolt_material_frame, text="Bolt Material", width=15).pack(side=tk.LEFT)
            fields['bolt_material'] = ttk.Entry(bolt_material_frame)
            fields['bolt_material'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Pen Clip Material
            clip_material_frame = ttk.Frame(materials_frame)
            clip_material_frame.pack(fill=tk.X, pady=5)
            ttk.Label(clip_material_frame, text="Pen Clip Material", width=15).pack(side=tk.LEFT)
            fields['clip_material'] = ttk.Entry(clip_material_frame)
            fields['clip_material'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Ink Refill Section
            ink_frame = ttk.LabelFrame(main_container, text="Ink Refill", padding="10")
            ink_frame.pack(fill=tk.X, pady=(0, 15))
            
            # Ink Type
            ink_type_frame = ttk.Frame(ink_frame)
            ink_type_frame.pack(fill=tk.X, pady=5)
            ttk.Label(ink_type_frame, text="Ink Type", width=15).pack(side=tk.LEFT)
            fields['ink_type'] = ttk.Entry(ink_type_frame)
            fields['ink_type'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))
            
            # Compatible Refills
            compatible_frame = ttk.Frame(ink_frame)
            compatible_frame.pack(fill=tk.X, pady=5)
            ttk.Label(compatible_frame, text="Compatible With", width=15).pack(side=tk.LEFT)
            fields['compatible_refills'] = ttk.Entry(compatible_frame)
            fields['compatible_refills'].pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(10, 0))

            # Populate materials and ink fields if they exist
            if product.get('specifications', {}).get('materials'):
                for material in product['specifications']['materials']:
                    if 'Body:' in material['name']:
                        fields['body_material'].insert(0, material['description'])
                    elif 'Bolt:' in material['name']:
                        fields['bolt_material'].insert(0, material['description'])
                    elif 'Pen Clip:' in material['name']:
                        fields['clip_material'].insert(0, material['description'])
                    elif 'Ink Type:' in material['name']:
                        fields['ink_type'].insert(0, material['description'])
                    elif 'Compatible:' in material['name']:
                        fields['compatible_refills'].insert(0, material['description'])

            def submit():
                try:
                    # Validate fields
                    errors = self.validate_fields(fields)
                    if errors:
                        messagebox.showerror("Validation Error", "\n".join(errors))
                        return
                    
                    # Prepare materials data
                    materials = [
                        {'name': 'Body:', 'description': fields['body_material'].get().strip()},
                        {'name': 'Bolt:', 'description': fields['bolt_material'].get().strip()},
                        {'name': 'Pen Clip:', 'description': fields['clip_material'].get().strip()},
                        {'name': 'Ink Type:', 'description': fields['ink_type'].get().strip()},
                        {'name': 'Compatible:', 'description': fields['compatible_refills'].get().strip()}
                    ]
                    
                    # Filter out empty materials
                    materials = [m for m in materials if m['description']]
                    
                    # Prepare product data
                    product_data = {
                        'name': fields['name'].get(),
                        'category': fields['category'].get(),
                        'description': fields['description'].get("1.0", tk.END).strip(),
                        'price': float(fields['price'].get()),
                        'stock': int(fields['stock'].get()),
                        'sizes': [size for size, var in fields['sizes'].items() if var.get()],
                        'specifications': {
                            'materials': materials
                        }
                    }

                    # Add optional fields if they exist
                    if fields['originalPrice'].get().strip():
                        product_data['originalPrice'] = float(fields['originalPrice'].get())

                    # Make API request
                    response = requests.put(
                        f'{self.api_base_url}/products/{product_id}',
                        json=product_data
                    )
                    
                    if response.ok:
                        messagebox.showinfo("Success", "Product updated successfully!")
                        dialog.destroy()
                        self.fetch_products()  # Refresh product list
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
        # Clear any previously selected images
        self.selected_images = []
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
                """Upload selected images to Cloudinary"""
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

    def create_thumbnail(self, image_path, size=(100, 100)):
        """Create a thumbnail from an image path"""
        try:
            # Open and resize image
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                # Resize maintaining aspect ratio
                img.thumbnail(size)
                # Convert to PhotoImage for tkinter
                photo = ImageTk.PhotoImage(img)
                return photo
        except Exception as e:
            logging.error(f"Error creating thumbnail: {str(e)}")
            return None

    def create_image_preview_frame(self, container, image_path):
        """Create a frame containing image thumbnail and filename"""
        preview_frame = ttk.Frame(container)
        
        # Create thumbnail
        thumbnail = self.create_thumbnail(image_path)
        if thumbnail:
            # Store reference to prevent garbage collection
            preview_frame.thumbnail = thumbnail
            # Create and pack image label
            img_label = ttk.Label(preview_frame, image=thumbnail)
            img_label.pack(side=tk.TOP)
        
        # Add filename label
        filename_label = ttk.Label(
            preview_frame, 
            text=os.path.basename(image_path),
            wraplength=100  # Wrap long filenames
        )
        filename_label.pack(side=tk.BOTTOM)
        
        return preview_frame

    def upload_images_for_product(self, product_id, image_paths):
        """Upload images for a specific product"""
        try:
            uploaded_urls = []
            for image_path in image_paths:
                try:
                    result = cloudinary.uploader.upload(
                        image_path,
                        timestamp=int(time.time())
                    )
                    uploaded_urls.append({
                        'url': result['secure_url'],
                        'order': len(uploaded_urls)
                    })
                except Exception as e:
                    logging.error(f"Failed to upload image {image_path}: {str(e)}")
                    raise e

            if uploaded_urls:
                # Add images to product
                response = requests.post(
                    f'{self.api_base_url}/products/{product_id}/images',
                    json={'images': uploaded_urls}
                )
                
                if response.ok:
                    messagebox.showinfo("Success", "Images uploaded successfully!")
                else:
                    messagebox.showerror("Error", f"Failed to add images to product: {response.text}")
            
            self.selected_images = []  # Clear selected images
            self.fetch_products()  # Refresh product list
            
        except Exception as e:
            logging.error(f"Error uploading images: {str(e)}", exc_info=True)
            messagebox.showerror("Error", f"Failed to upload images: {str(e)}")

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