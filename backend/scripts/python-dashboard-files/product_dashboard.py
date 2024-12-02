import customtkinter as ctk
from api_client import APIClient
from product_form import ProductForm
import tkinter as tk
from tkinter import messagebox

class MultiSelectListbox(ctk.CTkScrollableFrame):
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.grid_columnconfigure(0, weight=1)
        self.selected_indices = set()
        self.items = []
        self.item_frames = []
        self.last_selected = None
        
        # Bind keyboard events to the frame
        self.bind('<Control-a>', self.select_all)
    
    def clear(self):
        for frame in self.item_frames:
            frame.destroy()
        self.items = []
        self.item_frames = []
        self.selected_indices = set()
        self.last_selected = None
    
    def on_item_click(self, index, event=None):
        if event and event.state & 0x4:  # Control key
            if index in self.selected_indices:
                self.selected_indices.remove(index)
            else:
                self.selected_indices.add(index)
            self.last_selected = index
        elif event and event.state & 0x1:  # Shift key
            if self.last_selected is not None:
                start = min(self.last_selected, index)
                end = max(self.last_selected, index)
                self.selected_indices.update(range(start, end + 1))
        else:  # No modifier key
            self.selected_indices = {index}
            self.last_selected = index
        
        self.update_selection()
        # Trigger selection changed event
        self.event_generate("<<SelectionChanged>>")
    
    def select_all(self, event=None):
        self.selected_indices = set(range(len(self.items)))
        self.update_selection()
        self.event_generate("<<SelectionChanged>>")
    
    def update_selection(self):
        for i, frame in enumerate(self.item_frames):
            if i in self.selected_indices:
                frame.configure(fg_color=("#185abc", "#185abc"))
            else:
                frame.configure(fg_color="transparent")
    
    def add_item(self, product, index):
        try:
            # Create item frame
            item_frame = ctk.CTkFrame(self, corner_radius=0, fg_color="transparent")
            item_frame.grid(row=index, column=0, sticky="ew", padx=5, pady=(0, 5))
            item_frame.grid_columnconfigure(0, weight=1)
            self.item_frames.append(item_frame)
            
            # Store the product data
            self.items.append(product)
            
            # Create product info
            name = product.get('name', 'N/A')
            price = f"Price: ${float(product.get('price', 0)):.2f}"
            stock = f"Stock: {product.get('countInStock', 0)}"
            
            # Create labels
            name_label = ctk.CTkLabel(
                item_frame,
                text=name,
                anchor="w",
                font=("Arial", 12, "bold")
            )
            name_label.grid(row=0, column=0, padx=10, pady=(5, 0), sticky="w")
            
            price_label = ctk.CTkLabel(
                item_frame,
                text=price,
                anchor="w"
            )
            price_label.grid(row=1, column=0, padx=10, pady=(0, 0), sticky="w")
            
            stock_label = ctk.CTkLabel(
                item_frame,
                text=stock,
                anchor="w"
            )
            stock_label.grid(row=2, column=0, padx=10, pady=(0, 5), sticky="w")
            
            # Bind click events to the entire frame and all labels
            for widget in [item_frame, name_label, price_label, stock_label]:
                widget.bind('<Button-1>', lambda e, idx=index: self.on_item_click(idx, e))
                widget.bind('<Control-Button-1>', lambda e, idx=index: self.on_item_click(idx, e))
                widget.bind('<Shift-Button-1>', lambda e, idx=index: self.on_item_click(idx, e))
            
        except Exception as e:
            print(f"Error adding product: {e}")
    
    def get_selected_items(self):
        return [self.items[i] for i in self.selected_indices]

class ProductDashboard(ctk.CTkFrame):
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.api_client = APIClient()
        
        # Configure grid
        self.grid_columnconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)
        
        # Left side - Product List
        self.list_frame = ctk.CTkFrame(self)
        self.list_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
        self.list_frame.grid_columnconfigure(0, weight=1)
        self.list_frame.grid_rowconfigure(1, weight=1)
        
        # Title and controls
        self.header_frame = ctk.CTkFrame(self.list_frame, fg_color="transparent")
        self.header_frame.grid(row=0, column=0, sticky="ew", padx=10, pady=10)
        self.header_frame.grid_columnconfigure(1, weight=1)
        
        # Title
        self.list_title = ctk.CTkLabel(
            self.header_frame,
            text="Products",
            font=("Arial", 20, "bold")
        )
        self.list_title.grid(row=0, column=0, padx=5)
        
        # Selection info
        self.selection_label = ctk.CTkLabel(
            self.header_frame,
            text="",
            font=("Arial", 12)
        )
        self.selection_label.grid(row=0, column=1, padx=5)
        
        # Delete button
        self.delete_btn = ctk.CTkButton(
            self.header_frame,
            text="Delete Selected",
            command=self.delete_selected,
            width=120,
            fg_color="#d92638",  # Red color for delete
            hover_color="#b51f2d"  # Darker red for hover
        )
        self.delete_btn.grid(row=0, column=2, padx=5)
        
        # Product list
        self.product_list = MultiSelectListbox(self.list_frame, width=800, height=500)
        self.product_list.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="nsew")
        
        # Bind selection changed event
        self.product_list.bind("<<SelectionChanged>>", self.update_selection_info)
        
        # Refresh button
        self.refresh_btn = ctk.CTkButton(
            self.list_frame,
            text="Refresh Products",
            command=self.refresh_products,
            width=200
        )
        self.refresh_btn.grid(row=2, column=0, padx=10, pady=10)
        
        # Right side - Product Form
        self.form_frame = ProductForm(self, self.on_product_added)
        self.form_frame.grid(row=0, column=1, padx=10, pady=10, sticky="n")
        
        # Load initial products
        self.refresh_products()
    
    def update_selection_info(self, event=None):
        selected = len(self.product_list.selected_indices)
        if selected > 0:
            self.selection_label.configure(text=f"{selected} item{'s' if selected > 1 else ''} selected")
            self.delete_btn.configure(state="normal")
        else:
            self.selection_label.configure(text="")
            self.delete_btn.configure(state="disabled")
    
    def delete_selected(self):
        selected_items = self.product_list.get_selected_items()
        if not selected_items:
            return
        
        # Track success and failures
        success = 0
        failed = 0
        
        # Delete each selected item
        for product in selected_items:
            product_id = product.get('_id')
            if not product_id:
                print(f"No _id found in product data: {product}")
                failed += 1
                continue
                
            print(f"Attempting to delete product with ID: {product_id}")
            if self.api_client.delete_product(product_id):
                success += 1
            else:
                failed += 1
        
        # Refresh the list
        self.refresh_products()
    
    def refresh_products(self):
        self.product_list.clear()
        products = self.api_client.get_products()
        
        if not products:
            no_products_frame = ctk.CTkFrame(self.product_list, corner_radius=0, fg_color="transparent")
            no_products_frame.grid(row=0, column=0, sticky="ew", padx=5, pady=5)
            ctk.CTkLabel(
                no_products_frame,
                text="No products found.\nPlease add some products.",
                font=("Arial", 12)
            ).grid(row=0, column=0, padx=10, pady=10)
            return
            
        for index, product in enumerate(products):
            try:
                if isinstance(product, dict):
                    self.product_list.add_item(product, index)
            except Exception as e:
                print(f"Error displaying product: {str(e)}")
                continue
    
    def on_product_added(self):
        self.refresh_products() 