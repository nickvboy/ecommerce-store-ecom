import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import requests
import json
import pandas as pd
from PIL import Image, ImageTk
from io import BytesIO
from urllib.request import urlopen
import os
import logging
import traceback
import sys
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from abc import ABC, abstractmethod

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('product_manager.log')
    ]
)

logger = logging.getLogger(__name__)

# Data Models
@dataclass
class Category:
    id: str
    name: str

@dataclass
class Product:
    id: str
    name: str
    price: float
    stock: int
    description: str
    category: Category

# API Client
class APIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Tuple[bool, Any]:
        try:
            url = f"{self.base_url}/{endpoint}"
            response = requests.request(method, url, json=data)
            return response.ok, response.json() if response.ok else response.text
        except Exception as e:
            logger.error(f"API request failed: {str(e)}")
            return False, str(e)
    
    def get_products(self, page: int, limit: int) -> Tuple[bool, Dict]:
        return self._make_request('GET', f"products?page={page}&limit={limit}")
    
    def get_categories(self) -> Tuple[bool, List[Dict]]:
        return self._make_request('GET', "categories")
    
    def create_product(self, product_data: Dict) -> Tuple[bool, Dict]:
        return self._make_request('POST', "products", product_data)
    
    def delete_product(self, product_id: str) -> Tuple[bool, Any]:
        return self._make_request('DELETE', f"products/{product_id}")
    
    def create_category(self, category_data: Dict) -> Tuple[bool, Dict]:
        return self._make_request('POST', "categories", category_data)

# UI Components
class BaseFrame(ttk.Frame):
    def __init__(self, parent, api_client: APIClient):
        super().__init__(parent)
        self.api_client = api_client

class ProductListFrame(BaseFrame):
    def __init__(self, parent, api_client: APIClient, on_selection_change=None):
        super().__init__(parent, api_client)
        self.on_selection_change = on_selection_change
        self.current_page = 1
        self.total_pages = 1
        self.page_size = 10
        self.setup_ui()
        
    def setup_ui(self):
        # Create Treeview
        columns = ('ID', 'Name', 'Price', 'Stock', 'Category')
        self.tree = ttk.Treeview(self, columns=columns, show='headings', selectmode='extended')
        
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=100)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(self, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Pagination Frame
        pagination_frame = ttk.Frame(self)
        
        # Page size selector
        ttk.Label(pagination_frame, text="Items per page:").pack(side=tk.LEFT, padx=5)
        self.page_size_var = tk.StringVar(value=str(self.page_size))
        page_size_combo = ttk.Combobox(
            pagination_frame,
            textvariable=self.page_size_var,
            values=['5', '10', '20', '50', '100'],
            width=5
        )
        page_size_combo.pack(side=tk.LEFT, padx=5)
        
        # Navigation buttons
        self.first_page_btn = ttk.Button(pagination_frame, text="<<", command=self.first_page)
        self.prev_page_btn = ttk.Button(pagination_frame, text="<", command=self.prev_page)
        self.page_info = ttk.Label(pagination_frame, text="Page 1 of 1")
        self.next_page_btn = ttk.Button(pagination_frame, text=">", command=self.next_page)
        self.last_page_btn = ttk.Button(pagination_frame, text=">>", command=self.last_page)
        
        for widget in (self.first_page_btn, self.prev_page_btn, self.page_info,
                      self.next_page_btn, self.last_page_btn):
            widget.pack(side=tk.LEFT, padx=2)
        
        # Selection info
        self.selection_label = ttk.Label(self, text="")
        
        # Layout
        self.tree.grid(row=0, column=0, sticky='nsew')
        scrollbar.grid(row=0, column=1, sticky='ns')
        pagination_frame.grid(row=1, column=0, columnspan=2, pady=5)
        self.selection_label.grid(row=2, column=0, sticky='w', pady=5)
        
        # Bindings
        self.tree.bind('<<TreeviewSelect>>', self.on_selection)
        page_size_combo.bind('<<ComboboxSelected>>', self.on_page_size_change)
        
    def load_products(self):
        success, data = self.api_client.get_products(self.current_page, self.page_size)
        if success:
            self.update_product_list(data)
        else:
            messagebox.showerror("Error", f"Failed to load products: {data}")
    
    def update_product_list(self, data: Dict):
        self.tree.delete(*self.tree.get_children())
        self.total_pages = int(data.get('totalPages', 1))
        self.current_page = int(data.get('currentPage', 1))
        
        for product in data.get('products', []):
            self.tree.insert('', tk.END, values=(
                product['_id'],
                product['name'],
                f"${product['price']}",
                product['stock'],
                product.get('category', {}).get('name', 'N/A')
            ))
        
        self.update_pagination_controls()
        self.update_selection_info()
    
    def update_pagination_controls(self):
        self.page_info.config(text=f"Page {self.current_page} of {self.total_pages}")
        self.first_page_btn.config(state='normal' if self.current_page > 1 else 'disabled')
        self.prev_page_btn.config(state='normal' if self.current_page > 1 else 'disabled')
        self.next_page_btn.config(state='normal' if self.current_page < self.total_pages else 'disabled')
        self.last_page_btn.config(state='normal' if self.current_page < self.total_pages else 'disabled')
    
    def update_selection_info(self):
        selected = len(self.tree.selection())
        total = len(self.tree.get_children())
        self.selection_label.config(text=f"Selected: {selected} of {total} products")
        if self.on_selection_change:
            self.on_selection_change(self.tree.selection())
    
    def on_selection(self, event=None):
        self.update_selection_info()
    
    def on_page_size_change(self, event=None):
        try:
            new_size = int(self.page_size_var.get())
            if new_size != self.page_size:
                self.page_size = new_size
                self.current_page = 1
                self.load_products()
        except ValueError:
            messagebox.showerror("Error", "Invalid page size value")
    
    def first_page(self): self.goto_page(1)
    def prev_page(self): self.goto_page(self.current_page - 1)
    def next_page(self): self.goto_page(self.current_page + 1)
    def last_page(self): self.goto_page(self.total_pages)
    
    def goto_page(self, page: int):
        if 1 <= page <= self.total_pages and page != self.current_page:
            self.current_page = page
            self.load_products()

class ProductFormFrame(BaseFrame):
    def __init__(self, parent, api_client: APIClient, on_product_added=None):
        super().__init__(parent, api_client)
        self.on_product_added = on_product_added
        self.categories = {}
        self.setup_ui()
        self.load_categories()
    
    def setup_ui(self):
        # Create form fields
        fields = [
            ("Name:", "name_entry", ttk.Entry),
            ("Price:", "price_entry", ttk.Entry),
            ("Stock:", "stock_entry", ttk.Entry),
            ("Description:", "description_text", lambda p: tk.Text(p, width=40, height=4)),
            ("Category:", "category_var", lambda p: ttk.Combobox(p, textvariable=tk.StringVar()))
        ]
        
        for i, (label_text, attr_name, widget_class) in enumerate(fields):
            ttk.Label(self, text=label_text).grid(row=i, column=0, pady=5)
            widget = widget_class(self)
            widget.grid(row=i, column=1, pady=5)
            setattr(self, attr_name, widget)
        
        # Add Product Button
        ttk.Button(self, text="Add Product", command=self.add_product).grid(
            row=len(fields), column=0, columnspan=2, pady=10
        )
    
    def load_categories(self):
        success, categories = self.api_client.get_categories()
        if success:
            self.categories = {cat['name']: cat['_id'] for cat in categories}
            self.category_var['values'] = list(self.categories.keys())
        else:
            messagebox.showerror("Error", f"Failed to load categories: {categories}")
    
    def add_product(self):
        try:
            product_data = {
                "name": self.name_entry.get().strip(),
                "price": float(self.price_entry.get()),
                "stock": int(self.stock_entry.get()),
                "description": self.description_text.get("1.0", tk.END).strip(),
                "category": self.categories[self.category_var.get()]
            }
            
            if not all(product_data.values()):
                raise ValueError("All fields are required")
            
            success, result = self.api_client.create_product(product_data)
            if success:
                messagebox.showinfo("Success", "Product added successfully")
                self.clear_form()
                if self.on_product_added:
                    self.on_product_added()
            else:
                raise ValueError(f"Failed to add product: {result}")
                
        except Exception as e:
            messagebox.showerror("Error", str(e))
    
    def clear_form(self):
        self.name_entry.delete(0, tk.END)
        self.price_entry.delete(0, tk.END)
        self.stock_entry.delete(0, tk.END)
        self.description_text.delete("1.0", tk.END)
        self.category_var.set('')

class CSVUploader:
    def __init__(self, api_client: APIClient, parent_window: tk.Tk):
        self.api_client = api_client
        self.parent_window = parent_window
        self.categories_cache = {}
    
    def upload_csv(self, on_complete=None):
        file_path = filedialog.askopenfilename(filetypes=[("CSV files", "*.csv")])
        if not file_path:
            return
        
        try:
            df = pd.read_csv(file_path)
            required_columns = ['name', 'price', 'stock', 'description', 'category']
            
            if not all(col in df.columns for col in required_columns):
                raise ValueError(f"CSV must contain columns: {', '.join(required_columns)}")
            
            # Pre-load categories
            self._load_categories()
            
            progress_window = self._create_progress_window()
            self._process_csv_rows(df, progress_window)
            
            if on_complete:
                on_complete()
                
        except Exception as e:
            logger.error(f"CSV upload failed: {str(e)}")
            logger.error(traceback.format_exc())
            messagebox.showerror("Error", f"Failed to process CSV: {str(e)}")
    
    def _load_categories(self):
        success, categories = self.api_client.get_categories()
        if success:
            self.categories_cache = {cat['name']: cat['_id'] for cat in categories}
        else:
            raise ValueError("Failed to load categories")
    
    def _create_progress_window(self) -> tk.Toplevel:
        window = tk.Toplevel(self.parent_window)
        window.title("Upload Progress")
        window.geometry("300x150")
        window.transient(self.parent_window)
        window.grab_set()
        
        progress_var = tk.DoubleVar()
        progress_bar = ttk.Progressbar(window, variable=progress_var, maximum=100)
        progress_bar.pack(pady=20, padx=10, fill=tk.X)
        
        status_label = ttk.Label(window, text="Starting upload...")
        status_label.pack(pady=10)
        
        return window
    
    def _process_csv_rows(self, df: pd.DataFrame, progress_window: tk.Toplevel):
        total_rows = len(df)
        success_count = 0
        fail_count = 0
        
        progress_var = progress_window.children['!progressbar']['variable']
        status_label = progress_window.children['!label']
        
        for index, row in df.iterrows():
            try:
                progress = (index + 1) / total_rows * 100
                progress_var.set(progress)
                status_label.config(text=f"Processing: {row['name']}")
                progress_window.update()
                
                if self._process_single_row(row):
                    success_count += 1
                else:
                    fail_count += 1
                    
            except Exception as e:
                fail_count += 1
                logger.error(f"Error processing row {index + 1}: {str(e)}")
                
            self.parent_window.after(100)  # Prevent API overwhelming
        
        progress_window.destroy()
        self._show_results(success_count, fail_count, total_rows)
    
    def _process_single_row(self, row: pd.Series) -> bool:
        try:
            # Handle category
            category_name = str(row['category']).strip()
            category_id = self._get_or_create_category(category_name)
            
            if not category_id:
                return False
            
            # Create product
            product_data = {
                "name": str(row['name']).strip(),
                "price": float(row['price']),
                "stock": int(row['stock']),
                "description": str(row['description']).strip(),
                "category": category_id
            }
            
            success, _ = self.api_client.create_product(product_data)
            return success
            
        except Exception as e:
            logger.error(f"Error processing product {row.get('name')}: {str(e)}")
            return False
    
    def _get_or_create_category(self, category_name: str) -> Optional[str]:
        # Check cache first
        if category_name in self.categories_cache:
            return self.categories_cache[category_name]
            
        # Create new category
        success, result = self.api_client.create_category({"name": category_name})
        if success:
            category_id = result['_id']
            self.categories_cache[category_name] = category_id
            return category_id
        return None
    
    def _show_results(self, success_count: int, fail_count: int, total_rows: int):
        messagebox.showinfo(
            "Upload Complete",
            f"Upload completed!\n"
            f"Successful: {success_count}\n"
            f"Failed: {fail_count}\n"
            f"Total processed: {total_rows}"
        )

class ProductManager:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Product Manager")
        self.root.geometry("1200x800")
        
        self.api_client = APIClient("http://localhost:5000/api")
        self.setup_ui()
        self.bind_shortcuts()
    
    def setup_ui(self):
        # Main container
        main_container = ttk.Frame(self.root, padding="10")
        main_container.grid(row=0, column=0, sticky='nsew')
        
        # Toolbar
        self.create_toolbar(main_container)
        
        # Product list
        self.product_list = ProductListFrame(
            main_container,
            self.api_client,
            on_selection_change=self.update_delete_button_state
        )
        self.product_list.grid(row=1, column=0, sticky='nsew')
        
        # Product form
        self.product_form = ProductFormFrame(
            main_container,
            self.api_client,
            on_product_added=self.refresh_products
        )
        self.product_form.grid(row=1, column=1, sticky='n', padx=5)
        
        # CSV Uploader
        self.csv_uploader = CSVUploader(self.api_client, self.root)
    
    def create_toolbar(self, parent):
        toolbar = ttk.Frame(parent)
        toolbar.grid(row=0, column=0, columnspan=2, sticky='ew', pady=(0, 10))
        
        # Left side buttons
        left_buttons = ttk.Frame(toolbar)
        left_buttons.pack(side=tk.LEFT)
        
        ttk.Button(left_buttons, text="Refresh Products",
                  command=self.refresh_products).pack(side=tk.LEFT, padx=5)
        
        ttk.Button(left_buttons, text="Upload Products from CSV",
                  command=self.upload_csv).pack(side=tk.LEFT, padx=5)
        
        # Right side buttons
        right_buttons = ttk.Frame(toolbar)
        right_buttons.pack(side=tk.RIGHT)
        
        self.delete_btn = ttk.Button(
            right_buttons,
            text="Delete Selected",
            command=self.delete_selected_products,
            state='disabled'
        )
        self.delete_btn.pack(side=tk.RIGHT, padx=5)
        
        ttk.Button(right_buttons, text="Clear All Products",
                  command=self.clear_all_products).pack(side=tk.RIGHT, padx=5)
    
    def bind_shortcuts(self):
        self.root.bind('<Control-a>', lambda e: self.product_list.tree.selection_set(
            self.product_list.tree.get_children()
        ))
        self.root.bind('<Delete>', lambda e: self.delete_selected_products())
    
    def refresh_products(self):
        self.product_list.load_products()
        self.product_form.load_categories()
    
    def upload_csv(self):
        self.csv_uploader.upload_csv(on_complete=self.refresh_products)
    
    def update_delete_button_state(self, selection):
        self.delete_btn.config(state='normal' if selection else 'disabled')
    
    def delete_selected_products(self):
        selected_items = self.product_list.tree.selection()
        if not selected_items:
            return
        
        if not messagebox.askyesno("Confirm Delete",
                                  f"Delete {len(selected_items)} selected products?"):
            return
        
        success = 0
        failed = 0
        
        progress_window = tk.Toplevel(self.root)
        progress_window.title("Deleting Products")
        progress_window.geometry("300x150")
        progress_window.transient(self.root)
        progress_window.grab_set()
        
        progress_var = tk.DoubleVar()
        progress_bar = ttk.Progressbar(
            progress_window,
            variable=progress_var,
            maximum=100
        )
        progress_bar.pack(pady=20, padx=10, fill=tk.X)
        
        status_label = ttk.Label(progress_window, text="Starting deletion...")
        status_label.pack(pady=10)
        
        total = len(selected_items)
        
        for index, item in enumerate(selected_items):
            product_id = self.product_list.tree.item(item)['values'][0]
            
            progress = (index + 1) / total * 100
            progress_var.set(progress)
            status_label.config(text=f"Deleting product {index + 1} of {total}")
            progress_window.update()
            
            success_flag, result = self.api_client.delete_product(product_id)
            if success_flag:
                success += 1
            else:
                failed += 1
                logger.error(f"Failed to delete product {product_id}: {result}")
        
        progress_window.destroy()
        messagebox.showinfo(
            "Delete Results",
            f"Successfully deleted: {success}\nFailed to delete: {failed}"
        )
        self.refresh_products()
    
    def clear_all_products(self):
        if not messagebox.askyesno("Confirm Clear All",
                                  "Delete ALL products? This cannot be undone!"):
            return
        
        success, data = self.api_client.get_products(1, 1000)
        if not success:
            messagebox.showerror("Error", f"Failed to get products: {data}")
            return
        
        products = data.get('products', [])
        if not products:
            messagebox.showinfo("Info", "No products to delete")
            return
        
        progress_window = tk.Toplevel(self.root)
        progress_window.title("Clearing All Products")
        progress_window.geometry("300x150")
        progress_window.transient(self.root)
        progress_window.grab_set()
        
        progress_var = tk.DoubleVar()
        progress_bar = ttk.Progressbar(
            progress_window,
            variable=progress_var,
            maximum=100
        )
        progress_bar.pack(pady=20, padx=10, fill=tk.X)
        
        status_label = ttk.Label(progress_window, text="Starting deletion...")
        status_label.pack(pady=10)
        
        success = 0
        failed = 0
        total = len(products)
        
        for index, product in enumerate(products):
            progress = (index + 1) / total * 100
            progress_var.set(progress)
            status_label.config(text=f"Deleting product {index + 1} of {total}")
            progress_window.update()
            
            success_flag, result = self.api_client.delete_product(product['_id'])
            if success_flag:
                success += 1
            else:
                failed += 1
                logger.error(f"Failed to delete product {product['_id']}: {result}")
        
        progress_window.destroy()
        messagebox.showinfo(
            "Clear All Results",
            f"Successfully deleted: {success}\nFailed to delete: {failed}"
        )
        self.refresh_products()

if __name__ == "__main__":
    root = tk.Tk()
    app = ProductManager(root)
    root.mainloop() 