import customtkinter as ctk
from product_dashboard import ProductDashboard

class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Configure window
        self.title("E-Commerce Dashboard")
        self.geometry("1200x800")
        
        # Set the theme
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Initialize the product dashboard
        self.product_dashboard = ProductDashboard(self)
        self.product_dashboard.pack(fill="both", expand=True, padx=20, pady=20)

if __name__ == "__main__":
    app = App()
    app.mainloop() 