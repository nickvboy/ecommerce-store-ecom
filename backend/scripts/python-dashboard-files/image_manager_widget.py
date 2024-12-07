import sys
import os
import logging
import requests
import cloudinary
import cloudinary.uploader
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QFileDialog, QMessageBox,
    QScrollArea, QFrame, QGridLayout
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QPixmap, QImage
import urllib.request
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

class ImageThumbnail(QFrame):
    clicked = pyqtSignal()
    delete_clicked = pyqtSignal()
    move_up_clicked = pyqtSignal()
    move_down_clicked = pyqtSignal()
    
    def __init__(self, image_url, parent=None):
        super().__init__(parent)
        self.image_url = image_url
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout()
        self.setFrameStyle(QFrame.Shape.Box | QFrame.Shadow.Raised)
        
        # Image display
        image_label = QLabel()
        image_label.setFixedSize(150, 150)
        image_label.setScaledContents(True)
        
        # Load and display image
        try:
            if self.image_url.startswith(('http://', 'https://')):
                data = urllib.request.urlopen(self.image_url).read()
                image = QImage()
                image.loadFromData(data)
            else:
                image = QImage(self.image_url)
            
            pixmap = QPixmap.fromImage(image)
            image_label.setPixmap(pixmap)
        except Exception as e:
            logger.error(f"Error loading image {self.image_url}: {e}")
            image_label.setText("Error loading image")
        
        # Buttons
        button_layout = QHBoxLayout()
        
        up_button = QPushButton("↑")
        down_button = QPushButton("↓")
        delete_button = QPushButton("×")
        
        up_button.clicked.connect(self.move_up_clicked.emit)
        down_button.clicked.connect(self.move_down_clicked.emit)
        delete_button.clicked.connect(self.delete_clicked.emit)
        
        button_layout.addWidget(up_button)
        button_layout.addWidget(down_button)
        button_layout.addWidget(delete_button)
        
        layout.addWidget(image_label)
        layout.addLayout(button_layout)
        self.setLayout(layout)

class ImageManagerWidget(QWidget):
    images_updated = pyqtSignal(list)  # Emitted when images are changed
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.api_base_url = os.getenv('API_BASE_URL', 'http://localhost:5001/api')
        self.image_urls = []
        self.current_product_id = None
        self.setup_ui()
        
        # Verify Cloudinary configuration
        if not all([os.getenv('CLOUDINARY_CLOUD_NAME'),
                   os.getenv('CLOUDINARY_API_KEY'),
                   os.getenv('CLOUDINARY_API_SECRET')]):
            logger.error("Missing Cloudinary configuration")
            QMessageBox.critical(self, "Error", "Missing Cloudinary configuration in .env file")
        
    def setup_ui(self):
        layout = QVBoxLayout(self)
        
        # Controls
        controls_layout = QHBoxLayout()
        
        self.add_button = QPushButton("Add Images")
        self.add_button.clicked.connect(self.add_images)
        
        self.clear_button = QPushButton("Clear All")
        self.clear_button.clicked.connect(self.clear_images)
        
        controls_layout.addWidget(self.add_button)
        controls_layout.addWidget(self.clear_button)
        
        # Image grid in scroll area
        scroll_area = QScrollArea()
        scroll_widget = QWidget()
        self.image_grid = QGridLayout(scroll_widget)
        scroll_area.setWidget(scroll_widget)
        scroll_area.setWidgetResizable(True)
        
        layout.addLayout(controls_layout)
        layout.addWidget(scroll_area)
        
    def set_product(self, product_id):
        """Set the current product and load its images"""
        self.current_product_id = product_id
        self.load_product_images()
        
    def load_product_images(self):
        """Load images for the current product"""
        if not self.current_product_id:
            return
            
        try:
            response = requests.get(f"{self.api_base_url}/products/{self.current_product_id}")
            if response.ok:
                product = response.json()
                if 'images' in product:
                    sorted_images = sorted(product['images'], key=lambda x: x.get('order', 0))
                    self.image_urls = [img['url'] for img in sorted_images]
                    self.update_image_grid()
        except Exception as e:
            logger.error(f"Error loading product images: {e}")
            QMessageBox.critical(self, "Error", f"Failed to load product images: {str(e)}")
            
    def update_image_grid(self):
        """Update the grid display with current images"""
        # Clear existing grid
        while self.image_grid.count():
            item = self.image_grid.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
                
        # Add thumbnails
        for i, url in enumerate(self.image_urls):
            thumbnail = ImageThumbnail(url)
            thumbnail.delete_clicked.connect(lambda u=url: self.delete_image(u))
            thumbnail.move_up_clicked.connect(lambda u=url: self.move_image_up(u))
            thumbnail.move_down_clicked.connect(lambda u=url: self.move_image_down(u))
            
            row = i // 4
            col = i % 4
            self.image_grid.addWidget(thumbnail, row, col)
            
    def add_images(self):
        """Add new images through file dialog"""
        if not self.current_product_id:
            QMessageBox.warning(self, "Warning", "No product selected")
            return
            
        file_dialog = QFileDialog()
        file_dialog.setFileMode(QFileDialog.FileMode.ExistingFiles)
        file_dialog.setNameFilter("Images (*.png *.jpg *.jpeg)")
        
        if file_dialog.exec():
            filenames = file_dialog.selectedFiles()
            try:
                # Verify Cloudinary configuration before upload
                if not all([os.getenv('CLOUDINARY_CLOUD_NAME'),
                           os.getenv('CLOUDINARY_API_KEY'),
                           os.getenv('CLOUDINARY_API_SECRET')]):
                    raise Exception("Missing Cloudinary configuration in .env file")
                
                # Upload to Cloudinary
                uploaded_urls = []
                for path in filenames:
                    if os.path.exists(path):
                        logger.info(f"Uploading image: {path}")
                        response = cloudinary.uploader.upload(path)
                        url = response['secure_url']
                        uploaded_urls.append(url)
                        logger.info(f"Successfully uploaded to: {url}")
                
                if uploaded_urls:
                    # Add new images to product
                    self.image_urls.extend(uploaded_urls)
                    self.update_product_images()
            except Exception as e:
                logger.error(f"Error uploading images: {e}")
                QMessageBox.critical(self, "Error", f"Failed to upload images: {str(e)}")
                
    def update_product_images(self):
        """Update product with current image order"""
        if not self.current_product_id:
            return
            
        try:
            # First clear existing images
            response = requests.delete(
                f"{self.api_base_url}/products/{self.current_product_id}/images"
            )
            if not response.ok:
                raise Exception("Failed to clear existing images")
                
            # Create image objects with order
            images = [{'url': url, 'order': i} for i, url in enumerate(self.image_urls)]
            
            # Update product with new images
            response = requests.post(
                f"{self.api_base_url}/products/{self.current_product_id}/images",
                json={'images': images}
            )
            
            if response.ok:
                self.update_image_grid()
                self.images_updated.emit(self.image_urls)
            else:
                raise Exception(f"Failed to update images: {response.status_code}")
        except Exception as e:
            logger.error(f"Error updating product images: {e}")
            QMessageBox.critical(self, "Error", f"Failed to update images: {str(e)}")
            
    def clear_images(self):
        """Clear all images from the product"""
        if not self.current_product_id:
            return
            
        reply = QMessageBox.question(
            self, 
            "Confirm Clear",
            "Are you sure you want to clear all images?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            try:
                response = requests.delete(
                    f"{self.api_base_url}/products/{self.current_product_id}/images"
                )
                if response.ok:
                    self.image_urls = []
                    self.update_image_grid()
                    self.images_updated.emit(self.image_urls)
                else:
                    raise Exception(f"Failed to clear images: {response.status_code}")
            except Exception as e:
                logger.error(f"Error clearing images: {e}")
                QMessageBox.critical(self, "Error", f"Failed to clear images: {str(e)}")
                
    def delete_image(self, url):
        """Delete a single image"""
        if url in self.image_urls:
            self.image_urls.remove(url)
            self.update_product_images()
            
    def move_image_up(self, url):
        """Move an image up in the order"""
        idx = self.image_urls.index(url)
        if idx > 0:
            self.image_urls[idx], self.image_urls[idx-1] = self.image_urls[idx-1], self.image_urls[idx]
            self.update_product_images()
            
    def move_image_down(self, url):
        """Move an image down in the order"""
        idx = self.image_urls.index(url)
        if idx < len(self.image_urls) - 1:
            self.image_urls[idx], self.image_urls[idx+1] = self.image_urls[idx+1], self.image_urls[idx]
            self.update_product_images()

def main():
    # Load environment variables
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(env_path)
    
    app = QApplication(sys.argv)
    widget = ImageManagerWidget()
    widget.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 