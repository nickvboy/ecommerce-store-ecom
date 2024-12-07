import sys
import os
import json
import logging
import requests
import cloudinary
import cloudinary.uploader
import subprocess
import time
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QListWidget, QFileDialog, QMessageBox,
    QScrollArea, QFrame, QGridLayout, QStatusBar
)
from PyQt6.QtCore import Qt, pyqtSignal, QProcess, QTimer
from PyQt6.QtGui import QPixmap, QImage
from PIL import Image
import io
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

class ProductImageDashboard(QMainWindow):
    def __init__(self):
        super().__init__()
        self.api_client = ApiClient()
        self.current_product = None
        self.image_urls = []
        self.db_process = None
        self.server_running = False
        self.retry_timer = QTimer()
        self.retry_timer.timeout.connect(self.check_server_status)
        
        # Verify Cloudinary configuration
        if not all([os.getenv('CLOUDINARY_CLOUD_NAME'),
                   os.getenv('CLOUDINARY_API_KEY'),
                   os.getenv('CLOUDINARY_API_SECRET')]):
            logger.error("Missing Cloudinary configuration")
            QMessageBox.critical(self, "Error", "Missing Cloudinary configuration in .env file")
            sys.exit(1)
            
        self.setup_ui()
        
    def setup_ui(self):
        self.setWindowTitle("Product Image Dashboard")
        self.setMinimumSize(800, 600)
        
        # Main widget and layout
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QHBoxLayout(main_widget)
        
        # Left panel - Product list and DB control
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        
        # DB Control button
        self.db_button = QPushButton("Start DB")
        self.db_button.clicked.connect(self.toggle_db)
        left_layout.addWidget(self.db_button)
        
        # Products header with refresh button
        products_header = QHBoxLayout()
        products_header.addWidget(QLabel("Products"))
        
        self.refresh_button = QPushButton("🔄 Refresh")
        self.refresh_button.clicked.connect(self.load_products)
        self.refresh_button.setEnabled(False)  # Disabled until server is running
        products_header.addWidget(self.refresh_button)
        
        left_layout.addLayout(products_header)
        
        self.product_list = QListWidget()
        self.product_list.itemClicked.connect(self.load_product_images)
        left_layout.addWidget(self.product_list)
        
        # Right panel - Image management
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        
        # Image upload button
        self.upload_button = QPushButton("Add Images")
        self.upload_button.clicked.connect(self.add_images)
        self.upload_button.setEnabled(False)  # Disabled until server is running
        
        # Image grid
        scroll_area = QScrollArea()
        scroll_widget = QWidget()
        self.image_grid = QGridLayout(scroll_widget)
        scroll_area.setWidget(scroll_widget)
        scroll_area.setWidgetResizable(True)
        
        right_layout.addWidget(self.upload_button)
        right_layout.addWidget(scroll_area)
        
        # Add panels to main layout
        layout.addWidget(left_panel, 1)
        layout.addWidget(right_panel, 2)
        
        # Add status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("Server not running. Click 'Start DB' to begin.")
        
    def toggle_db(self):
        if not self.server_running:
            self.start_db()
        else:
            self.stop_db()
            
    def kill_process_on_port(self, port):
        """Kill any process running on the specified port"""
        try:
            if os.name == 'nt':  # Windows
                # Find process using the port
                result = subprocess.run(['netstat', '-ano', '|', 'findstr', f':{port}'], 
                                     shell=True, 
                                     capture_output=True, 
                                     text=True)
                if result.stdout:
                    # Extract PID from the last column
                    pid = result.stdout.strip().split()[-1]
                    try:
                        # Kill the process
                        subprocess.run(['taskkill', '/F', '/PID', pid], check=True)
                        logger.info(f"Killed process {pid} on port {port}")
                        time.sleep(1)  # Wait for process to fully terminate
                    except subprocess.CalledProcessError:
                        logger.warning(f"Failed to kill process {pid}")
            else:  # Unix/Linux/Mac
                subprocess.run(['lsof', '-ti', f':{port}', '|', 'xargs', 'kill', '-9'], 
                             shell=True)
                time.sleep(1)  # Wait for process to fully terminate
        except Exception as e:
            logger.error(f"Error killing process on port {port}: {e}")

    def start_db(self):
        try:
            # Kill any existing process on port 5001
            self.kill_process_on_port(5001)
            
            # Get the current script directory and navigate to backend
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.abspath(os.path.join(current_dir, '..', '..'))
            
            logger.info(f"Starting server in directory: {backend_dir}")
            
            self.db_process = QProcess()
            self.db_process.setWorkingDirectory(backend_dir)
            
            # Connect process signals
            self.db_process.started.connect(self.handle_server_started)
            self.db_process.finished.connect(self.handle_server_stopped)
            self.db_process.errorOccurred.connect(self.handle_db_error)
            
            # Set up process environment
            env = QProcess.systemEnvironment()
            if os.name == 'nt':  # Windows
                npm_cmd = "npm.cmd"
            else:
                npm_cmd = "npm"
            
            # Start the process
            self.db_process.start(npm_cmd, ["run", "dev"])
            
            # Connect to process output
            self.db_process.readyReadStandardOutput.connect(
                lambda: logger.info(str(self.db_process.readAllStandardOutput(), 'utf-8').strip())
            )
            self.db_process.readyReadStandardError.connect(
                lambda: logger.error(str(self.db_process.readAllStandardError(), 'utf-8').strip())
            )
            
            self.status_bar.showMessage("Starting server...")
            self.db_button.setEnabled(False)  # Disable button while starting
            
            # Start checking server status
            self.retry_timer.start(1000)  # Check every second
            
        except Exception as e:
            logger.error(f"Failed to start database: {e}")
            QMessageBox.critical(self, "Error", f"Failed to start database: {str(e)}")
            self.db_button.setEnabled(True)
            
    def stop_db(self):
        if self.db_process and self.db_process.state() == QProcess.ProcessState.Running:
            self.db_process.terminate()
            if not self.db_process.waitForFinished(5000):  # Wait up to 5 seconds
                self.db_process.kill()  # Force kill if not terminated
            
            self.server_running = False
            self.upload_button.setEnabled(False)
            self.db_button.setText("Start DB")
            self.status_bar.showMessage("Server stopped")
            self.product_list.clear()
            
    def check_server_status(self):
        """Check if the server is running and responding"""
        try:
            logger.info("Checking server status...")
            response = requests.get(f"{self.api_client.base_url}/products", timeout=2)
            
            if response.ok and not self.server_running:
                logger.info("Server is now running")
                self.handle_server_started()
                self.retry_timer.stop()
            elif not response.ok and self.server_running:
                logger.error(f"Server returned error: {response.status_code}")
                self.handle_server_stopped()
        except requests.exceptions.ConnectionError:
            logger.warning("Server not responding yet...")
            if self.server_running:
                self.handle_server_stopped()
        except Exception as e:
            logger.error(f"Error checking server status: {e}")
            if self.server_running:
                self.handle_server_stopped()
                
    def handle_server_started(self):
        self.server_running = True
        self.db_button.setEnabled(True)
        self.db_button.setText("Stop DB")
        self.upload_button.setEnabled(True)
        self.refresh_button.setEnabled(True)
        self.status_bar.showMessage("Server running")
        self.load_products()
        
    def handle_server_stopped(self):
        self.server_running = False
        self.db_button.setEnabled(True)
        self.db_button.setText("Start DB")
        self.upload_button.setEnabled(False)
        self.refresh_button.setEnabled(False)
        self.status_bar.showMessage("Server not running")
        self.product_list.clear()
        
    def handle_db_error(self, error):
        error_messages = {
            QProcess.ProcessError.FailedToStart: "Failed to start the database process",
            QProcess.ProcessError.Crashed: "Database process crashed",
            QProcess.ProcessError.Timedout: "Process timed out",
            QProcess.ProcessError.WriteError: "Write error occurred",
            QProcess.ProcessError.ReadError: "Read error occurred",
            QProcess.ProcessError.UnknownError: "Unknown error occurred"
        }
        error_msg = error_messages.get(error, "An error occurred with the database process")
        self.status_bar.showMessage(f"Error: {error_msg}")
        QMessageBox.critical(self, "Database Error", error_msg)
        self.db_button.setEnabled(True)
        
    def load_products(self):
        if not self.server_running:
            logger.warning("Cannot load products - server not running")
            return
            
        try:
            self.status_bar.showMessage("Loading products...")
            self.refresh_button.setEnabled(False)
            
            products = self.api_client.get_products()
            self.product_list.clear()
            
            if not products:
                logger.warning("No products found")
                self.status_bar.showMessage("No products found")
            else:
                for product in products:
                    item_text = f"{product.get('name', 'Unnamed')} (ID: {product.get('_id', 'No ID')})"
                    logger.debug(f"Adding product: {item_text}")
                    self.product_list.addItem(item_text)
                self.status_bar.showMessage(f"Loaded {len(products)} products")
                
        except Exception as e:
            logger.error(f"Error loading products: {e}")
            self.status_bar.showMessage("Error loading products")
        finally:
            if self.server_running:
                self.refresh_button.setEnabled(True)
            
    def closeEvent(self, event):
        # Stop the database process when closing the application
        self.stop_db()
        event.accept()
        
    def load_product_images(self, item):
        product_id = item.text().split("ID: ")[1].rstrip(")")
        self.current_product = product_id
        
        # Clear existing images
        self.clear_image_grid()
        
        # Load product images
        images = self.api_client.get_product_preview_images(product_id)
        self.image_urls = images
        self.update_image_grid()
        
    def clear_image_grid(self):
        while self.image_grid.count():
            item = self.image_grid.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
                
    def update_image_grid(self):
        self.clear_image_grid()
        
        for i, url in enumerate(self.image_urls):
            thumbnail = ImageThumbnail(url)
            thumbnail.delete_clicked.connect(lambda u=url: self.delete_image(u))
            thumbnail.move_up_clicked.connect(lambda u=url: self.move_image_up(u))
            thumbnail.move_down_clicked.connect(lambda u=url: self.move_image_down(u))
            
            row = i // 4
            col = i % 4
            self.image_grid.addWidget(thumbnail, row, col)
            
    def add_images(self):
        if not self.current_product:
            QMessageBox.warning(self, "Warning", "Please select a product first")
            return
            
        file_dialog = QFileDialog()
        file_dialog.setFileMode(QFileDialog.FileMode.ExistingFiles)
        file_dialog.setNameFilter("Images (*.png *.jpg *.jpeg)")
        
        if file_dialog.exec():
            filenames = file_dialog.selectedFiles()
            try:
                # Upload images
                uploaded_urls = self.api_client.upload_images(filenames)
                if uploaded_urls:
                    # Add new images to product
                    self.image_urls.extend(uploaded_urls)
                    success = self.api_client.update_product_images(
                        self.current_product,
                        self.image_urls
                    )
                    if success:
                        self.update_image_grid()
                    else:
                        raise Exception("Failed to update product images")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to upload images: {str(e)}")
                
    def delete_image(self, url):
        if url in self.image_urls:
            self.image_urls.remove(url)
            success = self.api_client.update_product_images(
                self.current_product,
                self.image_urls
            )
            if success:
                self.update_image_grid()
            else:
                QMessageBox.critical(self, "Error", "Failed to delete image")
                
    def move_image_up(self, url):
        idx = self.image_urls.index(url)
        if idx > 0:
            self.image_urls[idx], self.image_urls[idx-1] = self.image_urls[idx-1], self.image_urls[idx]
            success = self.api_client.update_product_images(
                self.current_product,
                self.image_urls
            )
            if success:
                self.update_image_grid()
            else:
                QMessageBox.critical(self, "Error", "Failed to reorder images")
                
    def move_image_down(self, url):
        idx = self.image_urls.index(url)
        if idx < len(self.image_urls) - 1:
            self.image_urls[idx], self.image_urls[idx+1] = self.image_urls[idx+1], self.image_urls[idx]
            success = self.api_client.update_product_images(
                self.current_product,
                self.image_urls
            )
            if success:
                self.update_image_grid()
            else:
                QMessageBox.critical(self, "Error", "Failed to reorder images")

class ApiClient:
    def __init__(self):
        self.base_url = os.getenv('API_BASE_URL', 'http://localhost:5001/api')
        logger.info(f"API Client initialized with base URL: {self.base_url}")
        
    def get_products(self):
        try:
            logger.info("Fetching products...")
            response = requests.get(f"{self.base_url}/products", params={
                'page': 1,
                'limit': 1000
            })
            logger.info(f"Products API response status: {response.status_code}")
            
            if response.ok:
                data = response.json()
                # Check if the response has the expected structure
                if isinstance(data, dict) and 'products' in data:
                    products = data['products']
                    logger.info(f"Successfully fetched {len(products)} products")
                    return products
                elif isinstance(data, list):
                    logger.info(f"Successfully fetched {len(data)} products")
                    return data
                else:
                    logger.error(f"Unexpected response format: {data}")
                    return []
            else:
                logger.error(f"Failed to fetch products: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            logger.error(f"Error fetching products: {e}")
            return []
            
    def get_product_preview_images(self, product_id):
        try:
            logger.info(f"Fetching images for product {product_id}")
            response = requests.get(f"{self.base_url}/products/{product_id}")
            logger.info(f"Product API response status: {response.status_code}")
            
            if response.ok:
                product = response.json()
                if product and 'images' in product:
                    sorted_images = sorted(product['images'], key=lambda x: x.get('order', 0))
                    image_urls = [img['url'] for img in sorted_images]
                    logger.info(f"Found {len(image_urls)} images for product {product_id}")
                    return image_urls
                else:
                    logger.warning(f"No images found for product {product_id}")
                    return []
            else:
                logger.error(f"Failed to fetch product {product_id}: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            logger.error(f"Error fetching preview images for product {product_id}: {e}")
            return []
            
    def upload_images(self, image_paths):
        uploaded_urls = []
        try:
            # Verify Cloudinary configuration before upload
            if not all([os.getenv('CLOUDINARY_CLOUD_NAME'),
                       os.getenv('CLOUDINARY_API_KEY'),
                       os.getenv('CLOUDINARY_API_SECRET')]):
                raise Exception("Missing Cloudinary configuration in .env file")
                
            for path in image_paths:
                if os.path.exists(path):
                    logger.info(f"Uploading image: {path}")
                    response = cloudinary.uploader.upload(path)
                    url = response['secure_url']
                    uploaded_urls.append(url)
                    logger.info(f"Successfully uploaded to: {url}")
            return uploaded_urls
        except Exception as e:
            logger.error(f"Error uploading images: {e}")
            raise
            
    def update_product_images(self, product_id, image_urls):
        try:
            logger.info(f"Updating images for product {product_id}")
            # First clear existing images
            response = requests.delete(f"{self.base_url}/products/{product_id}/images")
            if not response.ok:
                raise Exception(f"Failed to clear existing images: {response.status_code} - {response.text}")
                
            # Create image objects with order
            images = [{'url': url, 'order': i} for i, url in enumerate(image_urls)]
            
            # Update product with new images
            response = requests.post(
                f"{self.base_url}/products/{product_id}/images",
                json={'images': images}
            )
            
            if response.ok:
                logger.info(f"Successfully updated images for product {product_id}")
                return True
            else:
                raise Exception(f"Failed to update images: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Error updating product images: {e}")
            return False

def main():
    # Load environment variables
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(env_path)
    
    app = QApplication(sys.argv)
    window = ProductImageDashboard()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 