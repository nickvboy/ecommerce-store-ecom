import customtkinter as ctk
from api_client import APIClient

class ProductForm(ctk.CTkFrame):
    def __init__(self, master, on_product_added, **kwargs):
        super().__init__(master, **kwargs)
        self.api_client = APIClient()
        self.on_product_added = on_product_added
        
        # Title
        self.title = ctk.CTkLabel(self, text="Add New Product", font=("Arial", 20, "bold"))
        self.title.pack(pady=10)
        
        # Form fields
        # Name
        self.name_label = ctk.CTkLabel(self, text="Product Name:")
        self.name_label.pack(pady=5)
        self.name_entry = ctk.CTkEntry(self, width=300)
        self.name_entry.pack()
        
        # Price
        self.price_label = ctk.CTkLabel(self, text="Price ($):")
        self.price_label.pack(pady=5)
        self.price_entry = ctk.CTkEntry(self, width=300)
        self.price_entry.pack()
        
        # Description
        self.desc_label = ctk.CTkLabel(self, text="Description:")
        self.desc_label.pack(pady=5)
        self.desc_entry = ctk.CTkTextbox(self, width=300, height=100)
        self.desc_entry.pack()
        
        # Category
        self.category_label = ctk.CTkLabel(self, text="Category:")
        self.category_label.pack(pady=5)
        self.category_entry = ctk.CTkEntry(self, width=300)
        self.category_entry.pack()
        
        # Stock
        self.stock_label = ctk.CTkLabel(self, text="Stock:")
        self.stock_label.pack(pady=5)
        self.stock_entry = ctk.CTkEntry(self, width=300)
        self.stock_entry.pack()
        
        # Submit button
        self.submit_btn = ctk.CTkButton(self, text="Add Product", command=self.submit_product)
        self.submit_btn.pack(pady=20)
        
        # Status message
        self.status_label = ctk.CTkLabel(self, text="")
        self.status_label.pack(pady=10)
    
    def submit_product(self):
        try:
            product_data = {
                "name": self.name_entry.get(),
                "price": float(self.price_entry.get()),
                "description": self.desc_entry.get("1.0", "end-1c"),
                "category": self.category_entry.get(),
                "countInStock": int(self.stock_entry.get())
            }
            
            response = self.api_client.create_product(product_data)
            
            if response:
                self.status_label.configure(text="Product added successfully!", text_color="green")
                self.clear_form()
                self.on_product_added()
            else:
                self.status_label.configure(text="Failed to add product", text_color="red")
        
        except ValueError as e:
            self.status_label.configure(text="Please check your input values", text_color="red")
    
    def clear_form(self):
        self.name_entry.delete(0, "end")
        self.price_entry.delete(0, "end")
        self.desc_entry.delete("1.0", "end")
        self.category_entry.delete(0, "end")
        self.stock_entry.delete(0, "end") 