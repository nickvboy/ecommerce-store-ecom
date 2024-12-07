import sys
import os
import logging
import traceback
import subprocess
import threading
import requests
import json
import pandas as pd
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QPushButton, QLabel, QLineEdit, QTextEdit, QComboBox, 
    QTableWidget, QTableWidgetItem, QHeaderView, QSpinBox,
    QMessageBox, QFileDialog, QProgressDialog, QFrame,
    QSplitter, QStatusBar, QGroupBox, QFormLayout, QDoubleSpinBox,
    QScrollArea, QGridLayout
)
from PyQt6.QtCore import Qt, pyqtSignal, QThread, QDateTime, QMimeData, QPoint, QTimer
from PyQt6.QtGui import (
    QColor, QPalette, QFont, QDragEnterEvent, QDropEvent, QPixmap, 
    QImage, QDrag, QCursor
)
import base64
import csv
import time
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from pathlib import Path
import tempfile

# Load environment variables
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

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

class ImageTracker:
    def __init__(self):
        # Change the path to be in the same directory as the script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.tracker_file = os.path.join(current_dir, 'product_images.json')
        self.image_data = self.load_tracker()
    
    def load_tracker(self):
        try:
            if os.path.exists(self.tracker_file):
                with open(self.tracker_file, 'r') as f:
                    return json.load(f)
            return {'products': {}, 'metadata': {'last_updated': None}}
        except Exception as e:
            logger.error(f"Error loading image tracker: {e}")
            return {'products': {}, 'metadata': {'last_updated': None}}
    
    def save_tracker(self):
        try:
            # Update metadata
            self.image_data['metadata']['last_updated'] = QDateTime.currentDateTime().toString(Qt.DateFormat.ISODate)
            
            # No need to create directories since we're saving in the current directory
            with open(self.tracker_file, 'w') as f:
                json.dump(self.image_data, f, indent=2)
                
            logger.info(f"Image tracker saved to {self.tracker_file}")
        except Exception as e:
            logger.error(f"Error saving image tracker: {e}")
    
    def update_product_images(self, product_id, image_urls):
        """Update product images with order information"""
        try:
            # Create image entries with order information
            image_entries = [
                {
                    'url': url,
                    'order': idx,
                    'added_at': QDateTime.currentDateTime().toString(Qt.DateFormat.ISODate)
                }
                for idx, url in enumerate(image_urls)
            ]
            
            # Update or create product entry
            if product_id not in self.image_data['products']:
                self.image_data['products'][product_id] = {
                    'images': image_entries,
                    'created_at': QDateTime.currentDateTime().toString(Qt.DateFormat.ISODate),
                    'updated_at': QDateTime.currentDateTime().toString(Qt.DateFormat.ISODate)
                }
            else:
                self.image_data['products'][product_id]['images'] = image_entries
                self.image_data['products'][product_id]['updated_at'] = QDateTime.currentDateTime().toString(Qt.DateFormat.ISODate)
            
            self.save_tracker()
            logger.info(f"Updated images for product {product_id}")
            return True
        except Exception as e:
            logger.error(f"Error updating product images: {e}")
            return False
    
    def get_product_images(self, product_id):
        """
        Get product images maintaining order
        """
        try:
            product_data = self.image_data['products'].get(product_id, {})
            if not product_data:
                return []
            
            # Sort images by order and return URLs
            images = sorted(product_data.get('images', []), key=lambda x: x['order'])
            return [img['url'] for img in images]
        except Exception as e:
            logger.error(f"Error retrieving product images: {e}")
            return []

class ImagePreviewWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.image_labels = []
        self.setup_ui()
        
    def setup_ui(self):
        self.layout = QGridLayout()
        self.setLayout(self.layout)
        self.setMinimumHeight(200)
        
    def clear_previews(self):
        for label in self.image_labels:
            self.layout.removeWidget(label)
            label.deleteLater()
        self.image_labels.clear()
        
    def load_image_from_url(self, url):
        try:
            response = requests.get(url)
            image_data = response.content
            pixmap = QPixmap()
            pixmap.loadFromData(image_data)
            return pixmap.scaled(150, 150, Qt.AspectRatioMode.KeepAspectRatio)
        except Exception as e:
            logger.error(f"Error loading image from URL {url}: {e}")
            return None
            
    def update_previews(self, image_urls):
        self.clear_previews()
        row, col = 0, 0
        max_cols = 4  # Show 4 images per row
        
        for url in image_urls:
            label = QLabel()
            label.setFixedSize(150, 150)
            label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            label.setStyleSheet("""
                QLabel {
                    border: 1px solid #ccc;
                    background-color: #f9f9f9;
                    padding: 5px;
                }
            """)
            
            # Load image in the background
            def load_image(label=label, url=url):
                pixmap = self.load_image_from_url(url)
                if pixmap:
                    label.setPixmap(pixmap)
                else:
                    label.setText("Failed to load")
            
            # Start loading in a separate thread
            thread = threading.Thread(target=load_image)
            thread.start()
            
            self.layout.addWidget(label, row, col)
            self.image_labels.append(label)
            
            col += 1
            if col >= max_cols:
                col = 0
                row += 1

class ApiClient:
    def __init__(self, base_url="http://localhost:5001/api"):
        self.base_url = base_url
        self.image_tracker = ImageTracker()
    
    def get_categories(self):
        try:
            response = requests.get(f"{self.base_url}/categories")
            if response.ok:
                return response.json()
            return []
        except Exception as e:
            print(f"Error fetching categories: {e}")
            return []
    
    def get_products(self, page=1, limit=1000):
        try:
            response = requests.get(f"{self.base_url}/products", params={
                'page': page,
                'limit': limit
            })
            if response.ok:
                data = response.json()
                return data.get('products', [])
            return []
        except Exception as e:
            print(f"Error fetching products: {e}")
            return []
    
    def get_product_by_id(self, product_id):
        try:
            response = requests.get(f"{self.base_url}/products/{product_id}")
            if response.ok:
                return response.json()
            return None
        except Exception as e:
            print(f"Error fetching product {product_id}: {e}")
            return None
    
    def upload_images(self, image_paths):
        """Upload images to Cloudinary and return the URLs"""
        uploaded_urls = []
        try:
            for path in image_paths:
                if os.path.exists(path):  # Only upload if it's a local file
                    logger.info(f"Uploading image: {path}")
                    response = cloudinary.uploader.upload(path)
                    url = response['secure_url']
                    uploaded_urls.append(url)
                    logger.info(f"Successfully uploaded to: {url}")
                elif path.startswith('http'):  # If it's already a URL, keep it
                    uploaded_urls.append(path)
            return uploaded_urls
        except Exception as e:
            logger.error(f"Error uploading images to Cloudinary: {e}")
            logger.error(traceback.format_exc())
            return []
    
    def update_product_images(self, product_id, image_paths):
        """Update product images, handling both local files and existing URLs"""
        try:
            # First clear existing images
            response = requests.delete(f"{self.base_url}/products/{product_id}/images")
            if not response.ok:
                logger.error(f"Failed to clear existing images: {response.text}")
                return False
            
            logger.info(f"Cleared existing images for product {product_id}")
            
            # Upload any new local images to Cloudinary
            new_urls = self.upload_images(image_paths)
            
            if new_urls:
                # Create image orders with current sequence
                image_data = {
                    'images': [
                        {'url': url, 'order': idx} 
                        for idx, url in enumerate(new_urls)
                    ]
                }
                
                # Add new images using dedicated endpoint
                response = requests.post(
                    f"{self.base_url}/products/{product_id}/images",
                    json=image_data
                )
                
                if response.ok:
                    # Update local tracker
                    self.image_tracker.update_product_images(product_id, new_urls)
                    logger.info(f"Successfully updated images for product {product_id}")
                    return True
                else:
                    logger.error(f"Failed to update product images: {response.text}")
                    return False
                
            return True  # Return true if no images to update
        except Exception as e:
            logger.error(f"Error updating product images: {e}")
            return False
    
    def create_product(self, product_data):
        try:
            # Extract images for separate handling
            image_paths = product_data.pop('images', [])
            
            # First create the product without images
            response = requests.post(f"{self.base_url}/products", json=product_data)
            
            if response.ok:
                result = response.json()
                product_id = result['_id']
                
                # Handle image uploads if present
                if image_paths:
                    success = self.update_product_images(product_id, image_paths)
                    if not success:
                        logger.error(f"Failed to upload images for new product {product_id}")
                
                return result
            return None
        except Exception as e:
            logger.error(f"Error creating product: {e}")
            return None
    
    def update_product(self, product_id, product_data):
        try:
            # Extract images for separate handling
            image_paths = product_data.pop('images', [])
            logger.info(f"Updating product {product_id} with images: {image_paths}")
            
            # First update the product without images
            response = requests.put(f"{self.base_url}/products/{product_id}", 
                                json=product_data)
            
            if response.ok:
                result = response.json()
                
                # Handle images if present
                if image_paths is not None:  # Changed condition to handle empty lists
                    logger.info("Processing images for update...")
                    
                    # First clear existing images
                    clear_response = requests.delete(f"{self.base_url}/products/{product_id}/images")
                    if not clear_response.ok:
                        logger.error(f"Failed to clear existing images: {clear_response.text}")
                        return None
                    
                    final_urls = []
                    
                    # Process each image path
                    for path in image_paths:
                        if path.startswith('http'):  # It's an existing URL
                            logger.info(f"Using existing URL: {path}")
                            final_urls.append(path)
                        elif os.path.exists(path):  # It's a new local file
                            try:
                                logger.info(f"Uploading new image: {path}")
                                response = cloudinary.uploader.upload(path)
                                new_url = response['secure_url']
                                final_urls.append(new_url)
                                logger.info(f"Successfully uploaded to: {new_url}")
                            except Exception as e:
                                logger.error(f"Failed to upload image {path}: {e}")
                    
                    if final_urls:
                        logger.info(f"Updating product with {len(final_urls)} images")
                        # Create image orders with current sequence
                        image_data = {
                            'images': [
                                {'url': url, 'order': idx} 
                                for idx, url in enumerate(final_urls)
                            ]
                        }
                        
                        # Update images
                        img_response = requests.post(
                            f"{self.base_url}/products/{product_id}/images",
                            json=image_data
                        )
                        
                        if img_response.ok:
                            logger.info("Successfully updated product images")
                            # Update local tracker with new image set
                            self.image_tracker.update_product_images(product_id, final_urls)
                        else:
                            logger.error(f"Failed to update images: {img_response.text}")
                    else:
                        # If no images to update, clear the local tracker for this product
                        self.image_tracker.update_product_images(product_id, [])
                        logger.warning("No valid images to update")
                
                return result
            return None
            
        except Exception as e:
            logger.error(f"Error updating product {product_id}: {e}")
            logger.error(traceback.format_exc())
            return None
    
    def delete_products(self, product_ids):
        deleted = []
        for product_id in product_ids:
            try:
                response = requests.delete(f"{self.base_url}/products/{product_id}")
                if response.ok:
                    deleted.append(product_id)
            except Exception as e:
                print(f"Error deleting product {product_id}: {e}")
        return deleted
    
    def reorder_product_images(self, product_id, image_orders):
        """Reorder product images using the dedicated endpoint"""
        try:
            # Format the request body
            request_body = {
                'imageOrders': image_orders
            }
            
            response = requests.patch(
                f"{self.base_url}/products/{product_id}/images/reorder",
                json=request_body
            )
            
            if response.ok:
                # Get the ordered URLs
                ordered_urls = [img['url'] for img in image_orders]
                # Update local tracker
                self.image_tracker.update_product_images(product_id, ordered_urls)
                logger.info(f"Successfully reordered images for product {product_id}")
                return True
            else:
                logger.error(f"Failed to reorder images: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Error reordering images for product {product_id}: {e}")
            return False
    
    def get_product_preview_images(self, product_id):
        """Get preview images for a product"""
        try:
            # First check local tracker
            local_images = self.image_tracker.get_product_images(product_id)
            if local_images:
                return local_images
            
            # If not in tracker, fetch from API
            product = self.get_product_by_id(product_id)
            if product and 'images' in product:
                # Sort images by order before extracting URLs
                sorted_images = sorted(product['images'], key=lambda x: x.get('order', 0))
                image_urls = [img['url'] for img in sorted_images]
                
                # Update local tracker
                if image_urls:
                    self.image_tracker.update_product_images(product_id, image_urls)
                return image_urls
            return []
        except Exception as e:
            logger.error(f"Error fetching preview images for product {product_id}: {e}")
            return []

class ConsoleWidget(QTextEdit):
    def __init__(self):
        super().__init__()
        self.setup_ui()
        
    def setup_ui(self):
        # Set read-only and styling
        self.setReadOnly(True)
        self.setStyleSheet("""
            QTextEdit {
                background-color: #1e1e1e;
                color: #ffffff;
                font-family: 'Consolas', 'Courier New', monospace;
                font-size: 12px;
                padding: 5px;
            }
        """)
        
    def log(self, message, level="INFO"):
        # Get current timestamp
        timestamp = QDateTime.currentDateTime().toString("yyyy-MM-dd HH:mm:ss")
        
        # Color coding based on level
        color = {
            "INFO": "#ffffff",    # White
            "SUCCESS": "#4caf50", # Green
            "WARNING": "#ffc107", # Yellow
            "ERROR": "#f44336"    # Red
        }.get(level.upper(), "#ffffff")
        
        # Format the message with HTML
        formatted_message = f'<span style="color: #888888">[{timestamp}]</span> <span style="color: {color}">{message}</span>'
        
        # Append the message
        self.append(formatted_message)
        
        # Scroll to bottom
        self.verticalScrollBar().setValue(self.verticalScrollBar().maximum())

class ProductTableWidget(QTableWidget):
    def __init__(self):
        super().__init__()
        self.setup_ui()
        
    def setup_ui(self):
        # Set up table properties
        self.setColumnCount(6)
        self.setHorizontalHeaderLabels(['ID', 'Name', 'Price', 'Stock', 'Category', 'Actions'])
        self.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        self.horizontalHeader().setSectionResizeMode(4, QHeaderView.ResizeMode.Stretch)
        self.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.setSelectionMode(QTableWidget.SelectionMode.SingleSelection)
        
        # Add double click handler
        self.cellDoubleClicked.connect(self.handle_double_click)
        
        # Set column widths
        self.setColumnWidth(0, 200)  # ID
        self.setColumnWidth(2, 100)  # Price
        self.setColumnWidth(3, 80)   # Stock
        self.setColumnWidth(5, 100)  # Actions
        
        # Connect selection change signal
        self.itemSelectionChanged.connect(self.on_selection_changed)
    
    def on_selection_changed(self):
        self.selection_changed_signal.emit()
    
    def populate_products(self, products):
        self.setRowCount(0)
        for product in products:
            row = self.rowCount()
            self.insertRow(row)
            
            # Add product data
            self.setItem(row, 0, QTableWidgetItem(product['_id']))
            self.setItem(row, 1, QTableWidgetItem(product['name']))
            self.setItem(row, 2, QTableWidgetItem(f"${product['price']:.2f}"))
            self.setItem(row, 3, QTableWidgetItem(str(product['stock'])))
            self.setItem(row, 4, QTableWidgetItem(product['category'].get('name', 'N/A')))
            
            # Add edit button
            edit_btn = QPushButton("Edit")
            edit_btn.clicked.connect(lambda checked, p=product: self.edit_clicked.emit(p))
            self.setCellWidget(row, 5, edit_btn)
            
            # Set background color based on whether product has images
            if product.get('images') and len(product['images']) > 0:
                for col in range(self.columnCount()):
                    item = self.item(row, col)
                    if item:  # Skip cells with widgets (like the edit button)
                        item.setBackground(QColor(200, 255, 200))  # Light green
    
    def get_selected_products(self):
        selected_rows = set(item.row() for item in self.selectedItems())
        selected_products = []
        for row in selected_rows:
            product_id = self.item(row, 0).text()
            selected_products.append(product_id)
        return selected_products
    
    def handle_double_click(self, row, column):
        """Handle double click on table row"""
        product_id = self.item(row, 0).text()
        product = {
            '_id': product_id,
            'name': self.item(row, 1).text(),
            'price': float(self.item(row, 2).text().replace('$', '')),
            'stock': int(self.item(row, 3).text()),
            'category': self.item(row, 4).text()
        }
        self.edit_clicked.emit(product)
    
    # Signals
    selection_changed_signal = pyqtSignal()
    edit_clicked = pyqtSignal(dict)

class ImageCache:
    _instance = None
    _cache = {}
    _loading = set()  # Track URLs currently being loaded

    @classmethod
    def instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_image(self, url):
        # Return immediately if cached
        if url in self._cache:
            return self._cache.get(url)
        
        # Start async load if not already loading
        if url not in self._loading:
            self._loading.add(url)
            threading.Thread(target=self._load_image, args=(url,), daemon=True).start()
        
        return None

    def _load_image(self, url):
        try:
            response = requests.get(url)
            if response.ok:
                pixmap = QPixmap()
                pixmap.loadFromData(response.content)
                self._cache[url] = pixmap
        except Exception as e:
            logger.error(f"Error caching image {url}: {e}")
        finally:
            self._loading.remove(url)

class ImageThumbnail(QLabel):
    removed = pyqtSignal(str)  # Signal emitted when thumbnail is removed
    reordered = pyqtSignal(str, int)  # Signal emitted when thumbnail is reordered (image_url, new_index)
    
    def __init__(self, image_url, index, is_local=False):
        super().__init__()
        self.image_url = image_url
        self.index = index
        self.is_local = is_local
        self.loading_timer = None
        self.setFixedSize(100, 100)
        self.setStyleSheet("""
            QLabel {
                background-color: #2d2d2d;
                border: 1px solid #3d3d3d;
                border-radius: 5px;
                padding: 2px;
            }
            QLabel:hover {
                border: 1px solid #0d47a1;
            }
        """)
        self.setCursor(QCursor(Qt.CursorShape.OpenHandCursor))
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.setAcceptDrops(True)  # Enable drop events
        self.start_loading()

    def start_loading(self):
        if self.is_local:
            self.load_local_image()
        else:
            self.setText("Loading...")
            # Start periodic check for cached image
            self.loading_timer = QTimer()
            self.loading_timer.timeout.connect(self.check_cached_image)
            self.loading_timer.start(100)  # Check every 100ms

    def load_local_image(self):
        pixmap = QPixmap(self.image_url)
        if not pixmap.isNull():
            self.set_image(pixmap)
        else:
            self.setText("Failed")

    def check_cached_image(self):
        pixmap = ImageCache.instance().get_image(self.image_url)
        if pixmap:
            self.set_image(pixmap)
            self.loading_timer.stop()
            self.loading_timer = None

    def set_image(self, pixmap):
        scaled_pixmap = pixmap.scaled(90, 90, Qt.AspectRatioMode.KeepAspectRatio,
                                    Qt.TransformationMode.SmoothTransformation)
        self.setPixmap(scaled_pixmap)

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.RightButton:
            self.removed.emit(self.image_url)
        elif event.button() == Qt.MouseButton.LeftButton:
            self.setCursor(QCursor(Qt.CursorShape.ClosedHandCursor))
            drag = QDrag(self)
            mime_data = QMimeData()
            mime_data.setText(self.image_url)
            drag.setMimeData(mime_data)
            
            # Create a pixmap for drag feedback
            pixmap = self.pixmap()
            if pixmap:
                scaled_pixmap = pixmap.scaled(50, 50, Qt.AspectRatioMode.KeepAspectRatio, 
                                            Qt.TransformationMode.SmoothTransformation)
                drag.setPixmap(scaled_pixmap)
                drag.setHotSpot(QPoint(25, 25))
            
            drag.exec(Qt.DropAction.MoveAction)
            self.setCursor(QCursor(Qt.CursorShape.OpenHandCursor))
            
    def dragEnterEvent(self, event):
        if event.mimeData().hasText():
            event.acceptProposedAction()
            
    def dragMoveEvent(self, event):
        if event.mimeData().hasText():
            event.acceptProposedAction()
            
    def dropEvent(self, event):
        if event.mimeData().hasText():
            source_url = event.mimeData().text()
            if source_url != self.image_url:  # Don't reorder if dropped on itself
                self.reordered.emit(source_url, self.index)
            event.acceptProposedAction()

class ImageUploadWidget(QWidget):
    images_updated = pyqtSignal(list)  # Signal emitted when images are added/removed/reordered
    image_reordered = pyqtSignal(list)  # New signal for reordering existing product images
    
    def __init__(self):
        super().__init__()
        self.image_urls = []  # Store URLs or file paths
        self.is_local = {}  # Track which images are local files
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(10)
        
        # Add button container at the top
        button_container = QHBoxLayout()
        
        # Add clear button
        self.clear_btn = QPushButton("Clear All Images")
        self.clear_btn.clicked.connect(self.clear_images)
        self.clear_btn.setStyleSheet("""
            QPushButton {
                background-color: #d32f2f;  /* Red color */
            }
            QPushButton:hover {
                background-color: #f44336;
            }
            QPushButton:pressed {
                background-color: #b71c1c;
            }
        """)
        button_container.addWidget(self.clear_btn)
        button_container.addStretch()  # Push button to the left
        
        layout.addLayout(button_container)
        
        # Drop area
        self.drop_area = QLabel("Drop images here or click to upload")
        self.drop_area.setMinimumHeight(80)
        self.drop_area.setStyleSheet("""
            QLabel {
                background-color: #2d2d2d;
                border: 2px dashed #3d3d3d;
                border-radius: 5px;
                color: #888888;
                font-size: 14px;
            }
            QLabel:hover {
                border-color: #0d47a1;
                color: #ffffff;
            }
        """)
        self.drop_area.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.drop_area.setAcceptDrops(True)
        self.drop_area.dragEnterEvent = self.dragEnterEvent
        self.drop_area.dropEvent = self.dropEvent
        self.drop_area.mousePressEvent = self.open_file_dialog
        
        layout.addWidget(self.drop_area)
        
        # Thumbnails scroll area
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setMinimumHeight(120)
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOn)
        self.scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        
        self.thumbnail_container = QWidget()
        self.thumbnail_layout = QHBoxLayout(self.thumbnail_container)
        self.thumbnail_layout.setSpacing(5)
        self.thumbnail_layout.setContentsMargins(5, 5, 5, 5)
        self.thumbnail_layout.addStretch()
        
        self.scroll_area.setWidget(self.thumbnail_container)
        layout.addWidget(self.scroll_area)
        layout.addStretch()
    
    def clear_images(self):
        """Clear all images after confirmation"""
        if self.image_urls:
            reply = QMessageBox.question(
                self,
                "Confirm Clear",
                "Are you sure you want to clear all images?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
                QMessageBox.StandardButton.No
            )
            
            if reply == QMessageBox.StandardButton.Yes:
                self.image_urls.clear()
                self.is_local.clear()
                self.update_thumbnails()
                self.images_updated.emit(self.image_urls)
    
    def dragEnterEvent(self, event):
        if event.mimeData().hasUrls() or event.mimeData().hasText():
            event.acceptProposedAction()
            
    def dragMoveEvent(self, event):
        if event.mimeData().hasUrls() or event.mimeData().hasText():
            event.acceptProposedAction()
            
    def dropEvent(self, event):
        if event.mimeData().hasUrls():
            # Handle new images being dropped
            file_paths = []
            for url in event.mimeData().urls():
                file_path = url.toLocalFile()
                if file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                    file_paths.append(file_path)
            
            if file_paths:
                self.add_images(file_paths)
                event.acceptProposedAction()
        elif event.mimeData().hasText():
            # Handle reordering
            source_path = event.mimeData().text()
            if source_path in self.image_urls:
                # Calculate the drop index based on the mouse position
                drop_pos = event.position().x()
                drop_index = 0
                
                # Find the index where the image should be inserted
                for i in range(self.thumbnail_layout.count() - 1):  # -1 to exclude the stretch
                    widget = self.thumbnail_layout.itemAt(i).widget()
                    if widget:
                        widget_center = widget.x() + widget.width() / 2
                        if drop_pos > widget_center:
                            drop_index = i + 1
                
                self.reorder_image(source_path, drop_index)
                event.acceptProposedAction()
            
    def open_file_dialog(self, event):
        file_paths, _ = QFileDialog.getOpenFileNames(
            self,
            "Select Images",
            "",
            "Images (*.png *.jpg *.jpeg *.gif *.bmp)"
        )
        
        if file_paths:
            self.add_images(file_paths)
            
    def add_images(self, file_paths):
        """Add new images from local files"""
        for file_path in file_paths:
            if file_path not in self.image_urls:
                logger.info(f"Adding new image: {file_path}")
                self.image_urls.append(file_path)
                self.is_local[file_path] = True  # Mark as local file
        self.update_thumbnails()
        self.images_updated.emit(self.image_urls)
        
    def update_thumbnails(self):
        """Update the thumbnail display"""
        # Clear existing thumbnails
        while self.thumbnail_layout.count() > 1:
            item = self.thumbnail_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        
        # Add thumbnails for each image
        for i, image_url in enumerate(self.image_urls):
            is_local = self.is_local.get(image_url, False)
            thumbnail = ImageThumbnail(image_url, i, is_local)
            thumbnail.removed.connect(self.remove_image)
            thumbnail.reordered.connect(self.reorder_image)
            self.thumbnail_layout.insertWidget(i, thumbnail)
            
        # Process events to keep UI responsive
        QApplication.processEvents()
    
    def remove_image(self, image_url):
        if image_url in self.image_urls:
            self.image_urls.remove(image_url)
            self.update_thumbnails()
            self.images_updated.emit(self.image_urls)
            
    def reorder_image(self, image_url, new_index):
        """Handle image reordering"""
        if image_url in self.image_urls:
            old_index = self.image_urls.index(image_url)
            if old_index != new_index:
                # Remove from old position and insert at new position
                self.image_urls.insert(new_index, self.image_urls.pop(old_index))
                # Update thumbnails to reflect new order
                self.update_thumbnails()
                
                # Emit different signals based on whether images are local or remote
                if any(self.is_local.get(url, False) for url in self.image_urls):
                    # For new products or local images
                    self.images_updated.emit(self.image_urls)
                else:
                    # For existing products with remote URLs
                    self.image_reordered.emit(self.image_urls)
                
                logger.info(f"Reordered image from position {old_index} to {new_index}")
    
    def set_images(self, image_urls):
        """Set images from URLs (for existing products)"""
        logger.info(f"Setting images: {image_urls}")
        self.image_urls = image_urls.copy() if image_urls else []
        self.is_local = {url: False for url in self.image_urls}  # Mark all as remote URLs
        self.update_thumbnails()
        self.images_updated.emit(self.image_urls)
    
    def get_local_paths(self):
        """Get list of local file paths only"""
        return [path for path in self.image_urls if self.is_local.get(path, False)]

class ProductFormWidget(QWidget):
    product_added = pyqtSignal()
    product_updated = pyqtSignal()
    
    def __init__(self, api_client, console_widget):
        super().__init__()
        self.api_client = api_client
        self.console = console_widget
        self.current_product = None
        self.is_original_price_auto = True  # Track if original price is auto-calculated
        self.setup_ui()
        self.load_categories()
        
        # Connect the new reorder signal
        self.image_upload.image_reordered.connect(self.handle_image_reorder)

    def handle_image_reorder(self, reordered_urls):
        """Handle reordering of images for existing products"""
        if self.current_product and self.current_product.get('_id'):
            # Create image orders with new sequence
            image_orders = [
                {'url': url, 'order': idx} 
                for idx, url in enumerate(reordered_urls)
            ]
            
            # Call API to update order
            success = self.api_client.reorder_product_images(
                self.current_product['_id'], 
                image_orders
            )
            
            if success:
                self.console.log("Image order updated successfully", "SUCCESS")
            else:
                self.console.log("Failed to update image order", "ERROR")
                # Refresh the product to restore original order
                self.set_edit_mode(self.current_product)
    
    def load_categories(self):
        try:
            categories = self.api_client.get_categories()
            self.category_input.clear()
            if categories:
                for category in categories:
                    self.category_input.addItem(category.get('name', ''), category.get('_id'))
        except Exception as e:
            print(f"Error loading categories: {e}")
    
    def setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(10)
        
        # Form title
        self.title_label = QLabel("Add New Product")
        self.title_label.setStyleSheet("font-size: 16px; font-weight: bold;")
        layout.addWidget(self.title_label)
        
        # Scroll area for form
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setStyleSheet("""
            QScrollArea { 
                border: none;
                background: transparent;
            }
            QWidget#FormContainer {
                background: transparent;
            }
        """)
        
        form_container = QWidget()
        form_container.setObjectName("FormContainer")
        form_layout = QFormLayout(form_container)
        form_layout.setSpacing(10)
        form_layout.setContentsMargins(0, 0, 0, 0)
        
        self.name_input = QLineEdit()
        self.description_input = QTextEdit()
        self.description_input.setMinimumHeight(100)
        
        # Price input with markup controls
        price_container = QWidget()
        price_layout = QHBoxLayout(price_container)
        price_layout.setContentsMargins(0, 0, 0, 0)
        
        self.price_input = QDoubleSpinBox()
        self.price_input.setMaximum(99999.99)
        self.price_input.valueChanged.connect(self.update_original_price)
        
        markup_label = QLabel("Markup %:")
        self.markup_input = QDoubleSpinBox()
        self.markup_input.setMaximum(1000.00)
        self.markup_input.setValue(40.0)  # Default 40% markup
        self.markup_input.valueChanged.connect(self.update_original_price)
        
        price_layout.addWidget(self.price_input)
        price_layout.addWidget(markup_label)
        price_layout.addWidget(self.markup_input)
        
        # Original price input with auto-calculation
        original_price_container = QWidget()
        original_price_layout = QHBoxLayout(original_price_container)
        original_price_layout.setContentsMargins(0, 0, 0, 0)
        
        self.original_price_input = QDoubleSpinBox()
        self.original_price_input.setMaximum(99999.99)
        self.original_price_input.valueChanged.connect(self.handle_original_price_change)
        
        original_price_layout.addWidget(self.original_price_input)
        
        self.stock_input = QSpinBox()
        self.stock_input.setMaximum(999999)
        self.category_input = QComboBox()
        
        # Image upload widget
        self.image_upload = ImageUploadWidget()
        
        form_layout.addRow("Name:", self.name_input)
        form_layout.addRow("Description:", self.description_input)
        form_layout.addRow("Price:", price_container)
        form_layout.addRow("Original Price:", original_price_container)
        form_layout.addRow("Stock:", self.stock_input)
        form_layout.addRow("Category:", self.category_input)
        form_layout.addRow("Images:", self.image_upload)
        
        scroll_area.setWidget(form_container)
        layout.addWidget(scroll_area, 1)
        
        # Buttons
        button_layout = QHBoxLayout()
        self.submit_btn = QPushButton("Add Product")
        self.submit_btn.clicked.connect(self.submit_product)
        self.clear_btn = QPushButton("Clear Form")
        self.clear_btn.clicked.connect(self.clear_form)
        
        button_layout.addWidget(self.submit_btn)
        button_layout.addWidget(self.clear_btn)
        layout.addLayout(button_layout)
        
        # Add stretch to push everything to the top
        layout.addStretch()
    
    def update_original_price(self):
        """Calculate original price based on price and markup percentage"""
        if self.is_original_price_auto:
            price = self.price_input.value()
            markup = self.markup_input.value() / 100.0
            if markup != 0:
                original_price = price * (1 + markup)
                self.original_price_input.setValue(original_price)
    
    def handle_original_price_change(self):
        """Handle manual changes to original price"""
        self.is_original_price_auto = False
        
        # Calculate and update actual markup percentage
        price = self.price_input.value()
        original_price = self.original_price_input.value()
        
        if original_price > 0:
            actual_markup = ((price - original_price) / original_price) * 100
            self.markup_input.setValue(actual_markup)
    
    def set_edit_mode(self, product):
        """Set the form to edit mode and populate with product data"""
        try:
            self.current_product = product
            self.title_label.setText("Edit Product")
            self.submit_btn.setText("Update Product")
            
            # Fill form with product data
            self.name_input.setText(product.get('name', ''))
            self.description_input.setPlainText(product.get('description', ''))
            
            # Handle price values safely
            try:
                price = float(product.get('price', 0))
                self.price_input.setValue(price)
                
                if 'originalPrice' in product and product['originalPrice'] is not None:
                    original_price = float(product['originalPrice'])
                    self.original_price_input.setValue(original_price)
                    
                    # Calculate and set markup
                    if original_price > 0:
                        markup = ((price - original_price) / original_price) * 100
                        self.markup_input.setValue(markup)
                        self.is_original_price_auto = False
                else:
                    self.is_original_price_auto = True
                    self.update_original_price()
            except (TypeError, ValueError):
                self.price_input.setValue(0)
                self.original_price_input.setValue(0)
                self.is_original_price_auto = True
            
            # Handle stock value safely
            try:
                self.stock_input.setValue(int(product.get('stock', 0)))
            except (TypeError, ValueError):
                self.stock_input.setValue(0)
            
            # Set category
            category_id = product.get('category')
            if category_id:
                category_index = self.category_input.findData(category_id)
                if category_index >= 0:
                    self.category_input.setCurrentIndex(category_index)
            
            # Load and display existing images
            if product.get('_id'):
                image_urls = self.api_client.get_product_preview_images(product['_id'])
                if image_urls:
                    self.image_upload.set_images(image_urls)
                else:
                    self.image_upload.set_images([])
            
        except Exception as e:
            logger.error(f"Error in set_edit_mode: {str(e)}")
            logger.error(traceback.format_exc())
    
    def set_add_mode(self):
        self.current_product = None
        self.title_label.setText("Add New Product")
        self.submit_btn.setText("Add Product")
        self.clear_form()
    
    def clear_form(self):
        self.name_input.clear()
        self.description_input.clear()
        self.price_input.setValue(0)
        self.original_price_input.setValue(0)
        self.stock_input.setValue(0)
        self.category_input.setCurrentIndex(0)
        self.image_upload.set_images([])  # Clear images
    
    def submit_product(self):
        try:
            product_data = {
                'name': self.name_input.text(),
                'description': self.description_input.toPlainText(),
                'price': self.price_input.value(),
                'originalPrice': self.original_price_input.value(),
                'stock': self.stock_input.value(),
                'category': self.category_input.currentData(),
                'images': self.image_upload.image_urls  # Use the direct image_urls attribute
            }
            
            if self.current_product:  # Update existing product
                product_id = self.current_product['_id']
                logger.info(f"Updating product {product_id} with images: {product_data['images']}")
                response = self.api_client.update_product(product_id, product_data)
                if response:
                    self.console.log(f"Product updated: {response['name']}", "SUCCESS")
                    self.product_updated.emit()
                    self.set_add_mode()
            else:  # Add new product
                response = self.api_client.create_product(product_data)
                if response:
                    self.console.log(f"Product created: {response['name']}", "SUCCESS")
                    self.product_added.emit()
                    self.clear_form()
                
        except Exception as e:
            self.console.log(f"Error submitting product: {str(e)}", "ERROR")
            logger.error(f"Product submission error: {str(e)}")
            logger.error(traceback.format_exc())
    
    # Signals
    product_added = pyqtSignal()
    product_updated = pyqtSignal()

class DatabaseWorker(QThread):
    finished = pyqtSignal(bool, str)
    progress = pyqtSignal(str)
    
    def __init__(self, backend_dir, is_windows):
        super().__init__()
        self.backend_dir = backend_dir
        self.is_windows = is_windows
        self.commands = []
        
    def set_commands(self, commands):
        self.commands = commands
        
    def run(self):
        try:
            for cmd in self.commands:
                self.progress.emit(f"Running {cmd if isinstance(cmd, str) else ' '.join(cmd)}...\n")
                
                if self.is_windows:
                    result = subprocess.run(
                        cmd,
                        cwd=self.backend_dir,
                        shell=True,
                        capture_output=True,
                        text=True
                    )
                else:
                    result = subprocess.run(
                        cmd if isinstance(cmd, list) else cmd.split(),
                        cwd=self.backend_dir,
                        capture_output=True,
                        text=True
                    )
                
                if result.stdout:
                    self.progress.emit(result.stdout)
                if result.stderr:
                    self.progress.emit(f"Error: {result.stderr}\n")
                    
                if result.returncode != 0:
                    raise Exception(f"Command failed: {cmd}")
                    
            self.finished.emit(True, "Operation completed successfully")
        except Exception as e:
            self.finished.emit(False, str(e))

class FrontendWorker(QThread):
    progress = pyqtSignal(str)
    status_changed = pyqtSignal(bool)  # True if running, False if stopped
    
    def __init__(self, frontend_dir):
        super().__init__()
        self.frontend_dir = frontend_dir
        self.process = None
        self.running = False
        
    def run(self):
        try:
            self.running = True
            self.status_changed.emit(True)
            
            if os.name == 'nt':  # Windows
                self.process = subprocess.Popen(
                    'npm run dev',
                    cwd=self.frontend_dir,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1,
                    universal_newlines=True
                )
            else:  # Unix/Linux/Mac
                self.process = subprocess.Popen(
                    ['npm', 'run', 'dev'],
                    cwd=self.frontend_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1,
                    universal_newlines=True
                )
            
            # Monitor process output
            while self.running and self.process and self.process.poll() is None:
                output = self.process.stdout.readline()
                if output:
                    self.progress.emit(f"[Frontend] {output}")
                error = self.process.stderr.readline()
                if error:
                    self.progress.emit(f"[Frontend Error] {error}")
                    
        except Exception as e:
            self.progress.emit(f"[Frontend Error] Failed to start frontend: {str(e)}\n")
        finally:
            self.running = False
            self.status_changed.emit(False)
            
    def stop(self):
        self.running = False
        if self.process:
            if os.name == 'nt':  # Windows
                subprocess.run(['taskkill', '/F', '/T', '/PID', str(self.process.pid)])
            else:
                self.process.terminate()
                self.process.wait(timeout=5)
            self.process = None

class ProductManager(QMainWindow):
    def __init__(self):
        super().__init__()
        self.api_client = ApiClient()
        self.backend_process = None
        self.db_worker = None
        self.frontend_worker = None
        self.setup_ui()
        
    def setup_ui(self):
        self.setWindowTitle("Product Manager")
        self.setGeometry(100, 100, 1920, 1080)
        
        # Define SVG icons as variables
        up_arrow_svg = """
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 0L7.4641 6H0.535898L4 0Z" fill="white"/>
            </svg>
        """
        
        down_arrow_svg = """
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8L0.535898 2L7.4641 2L4 8Z" fill="white"/>
            </svg>
        """
        
        # Convert SVGs to base64 for use in QSS
        up_arrow_base64 = base64.b64encode(up_arrow_svg.encode()).decode()
        down_arrow_base64 = base64.b64encode(down_arrow_svg.encode()).decode()
        
        # Set dark theme with embedded icons
        self.setStyleSheet(f"""
            QMainWindow, QWidget {{
                background-color: #1e1e1e;
                color: #ffffff;
            }}
            QGroupBox {{
                background-color: #2d2d2d;
                border: 1px solid #3d3d3d;
                border-radius: 5px;
                margin-top: 1ex;
                padding: 10px;
            }}
            QGroupBox::title {{
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 3px 0 3px;
                color: #ffffff;
            }}
            QPushButton {{
                background-color: #0d47a1;
                color: white;
                border: none;
                padding: 5px 15px;
                border-radius: 3px;
                min-width: 80px;
                min-height: 25px;
            }}
            QPushButton:hover {{
                background-color: #1565c0;
            }}
            QPushButton:pressed {{
                background-color: #0a3d91;
            }}
            QPushButton:disabled {{
                background-color: #666666;
            }}
            QLabel {{
                color: #ffffff;
            }}
            QLineEdit, QTextEdit {{
                background-color: #2d2d2d;
                color: #ffffff;
                border: 1px solid #3d3d3d;
                border-radius: 3px;
                padding: 5px;
                selection-background-color: #0d47a1;
            }}
            QLineEdit:focus, QTextEdit:focus {{
                border: 1px solid #0d47a1;
            }}
            QSpinBox, QDoubleSpinBox {{
                background-color: #2d2d2d;
                color: #ffffff;
                border: 1px solid #3d3d3d;
                border-radius: 3px;
                padding: 5px 20px 5px 5px;
                min-height: 20px;
            }}
            QSpinBox::up-button, QDoubleSpinBox::up-button {{
                background-color: transparent;
                border: none;
                subcontrol-origin: border;
                subcontrol-position: top right;
                width: 20px;
                height: 10px;
                margin-right: 2px;
            }}
            QSpinBox::down-button, QDoubleSpinBox::down-button {{
                background-color: transparent;
                border: none;
                subcontrol-origin: border;
                subcontrol-position: bottom right;
                width: 20px;
                height: 10px;
                margin-right: 2px;
            }}
            QSpinBox::up-arrow, QDoubleSpinBox::up-arrow {{
                image: url(data:image/svg+xml;base64,{up_arrow_base64});
                width: 8px;
                height: 8px;
            }}
            QSpinBox::down-arrow, QDoubleSpinBox::down-arrow {{
                image: url(data:image/svg+xml;base64,{down_arrow_base64});
                width: 8px;
                height: 8px;
            }}
            QSpinBox::up-button:hover, QDoubleSpinBox::up-button:hover,
            QSpinBox::down-button:hover, QDoubleSpinBox::down-button:hover {{
                background-color: rgba(255, 255, 255, 0.1);
            }}
            QComboBox {{
                background-color: #2d2d2d;
                color: #ffffff;
                border: 1px solid #3d3d3d;
                border-radius: 3px;
                padding: 5px 20px 5px 5px;
                min-height: 20px;
            }}
            QComboBox::drop-down {{
                border: none;
                width: 20px;
                background-color: transparent;
            }}
            QComboBox::down-arrow {{
                image: url(data:image/svg+xml;base64,{down_arrow_base64});
                width: 8px;
                height: 8px;
            }}
            QComboBox:hover {{
                border: 1px solid #4d4d4d;
            }}
            QComboBox:focus {{
                border: 1px solid #0d47a1;
            }}
            QComboBox::drop-down:hover {{
                background-color: rgba(255, 255, 255, 0.1);
            }}
            QComboBox QAbstractItemView {{
                background-color: #2d2d2d;
                color: #ffffff;
                selection-background-color: #0d47a1;
                selection-color: #ffffff;
                border: 1px solid #3d3d3d;
            }}
            QTableWidget {{
                background-color: #2d2d2d;
                alternate-background-color: #353535;
                color: #ffffff;
                gridline-color: #3d3d3d;
                border: 1px solid #3d3d3d;
                border-radius: 5px;
            }}
            QHeaderView::section {{
                background-color: #2d2d2d;
                color: #ffffff;
                padding: 5px;
                border: 1px solid #3d3d3d;
            }}
            QTableWidget::item:selected {{
                background-color: #0d47a1;
            }}
            QScrollBar:vertical {{
                background-color: #2d2d2d;
                width: 12px;
                margin: 0;
            }}
            QScrollBar::handle:vertical {{
                background-color: #666666;
                min-height: 20px;
                border-radius: 6px;
                margin: 2px;
            }}
            QScrollBar::add-line:vertical,
            QScrollBar::sub-line:vertical {{
                height: 0px;
            }}
            QScrollBar:horizontal {{
                background-color: #2d2d2d;
                height: 12px;
                margin: 0;
            }}
            QScrollBar::handle:horizontal {{
                background-color: #666666;
                min-width: 20px;
                border-radius: 6px;
                margin: 2px;
            }}
            QScrollBar::add-line:horizontal,
            QScrollBar::sub-line:horizontal {{
                width: 0px;
            }}
            QScrollBar::add-page:vertical,
            QScrollBar::sub-page:vertical,
            QScrollBar::add-page:horizontal,
            QScrollBar::sub-page:horizontal {{
                background: none;
            }}
        """)
        
        # Create central widget and main layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setSpacing(10)
        main_layout.setContentsMargins(10, 10, 10, 10)
        
        # Controls container
        controls_container = QWidget()
        controls_container.setFixedHeight(100)  # Fixed height for controls
        controls_layout = QHBoxLayout(controls_container)
        controls_layout.setSpacing(10)
        controls_layout.setContentsMargins(0, 0, 0, 0)
        
        # Backend controls
        backend_group = QGroupBox("Backend Controls")
        backend_layout = QHBoxLayout()
        backend_layout.setSpacing(10)
        backend_layout.setContentsMargins(10, 10, 10, 10)
        
        self.status_label = QLabel("Backend Status: Not Running")
        self.start_backend_btn = QPushButton("Start Backend")
        self.start_backend_btn.clicked.connect(self.toggle_backend)
        self.seed_db_btn = QPushButton("Seed Database")
        self.seed_db_btn.clicked.connect(self.seed_database)
        
        backend_layout.addWidget(self.status_label)
        backend_layout.addWidget(self.start_backend_btn)
        backend_layout.addWidget(self.seed_db_btn)
        backend_group.setLayout(backend_layout)
        
        # Frontend controls
        frontend_group = QGroupBox("Frontend Controls")
        frontend_layout = QHBoxLayout()
        frontend_layout.setSpacing(10)
        frontend_layout.setContentsMargins(10, 10, 10, 10)
        
        self.frontend_status_label = QLabel("Frontend Status: Not Running")
        self.start_frontend_btn = QPushButton("Start Frontend")
        self.start_frontend_btn.clicked.connect(self.toggle_frontend)
        
        frontend_layout.addWidget(self.frontend_status_label)
        frontend_layout.addWidget(self.start_frontend_btn)
        frontend_group.setLayout(frontend_layout)
        
        # Add groups to controls layout
        controls_layout.addWidget(backend_group, stretch=1)
        controls_layout.addWidget(frontend_group, stretch=1)
        
        # Add controls container to main layout
        main_layout.addWidget(controls_container)
        
        # Toolbar
        toolbar_container = QWidget()
        toolbar_container.setFixedHeight(50)  # Fixed height for toolbar
        toolbar_layout = QHBoxLayout(toolbar_container)
        toolbar_layout.setSpacing(10)
        toolbar_layout.setContentsMargins(0, 0, 0, 0)
        
        refresh_btn = QPushButton("Refresh Products")
        refresh_btn.clicked.connect(self.refresh_products)
        upload_btn = QPushButton("Upload Products from CSV")
        upload_btn.clicked.connect(self.upload_csv)
        self.edit_selected_btn = QPushButton("Edit Selected")
        self.edit_selected_btn.clicked.connect(self.edit_selected_product)
        self.edit_selected_btn.setEnabled(False)
        clear_btn = QPushButton("Clear All Products")
        clear_btn.clicked.connect(self.clear_all_products)
        self.delete_btn = QPushButton("Delete Selected")
        self.delete_btn.clicked.connect(self.delete_selected_products)
        self.delete_btn.setEnabled(False)
        
        toolbar_layout.addWidget(refresh_btn)
        toolbar_layout.addWidget(upload_btn)
        toolbar_layout.addStretch()
        toolbar_layout.addWidget(self.edit_selected_btn)
        toolbar_layout.addWidget(self.delete_btn)
        toolbar_layout.addWidget(clear_btn)
        
        main_layout.addWidget(toolbar_container)
        
        # Content area
        content_splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Left side (product list and console)
        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)
        left_layout.setSpacing(10)
        left_layout.setContentsMargins(0, 0, 0, 0)
        
        # Product list
        self.product_table = ProductTableWidget()
        self.product_table.edit_clicked.connect(self.edit_product)
        self.product_table.selection_changed_signal.connect(self.update_button_states)
        left_layout.addWidget(self.product_table)
        
        # Console
        self.console = ConsoleWidget()
        left_layout.addWidget(self.console)
        
        # Right side (product form)
        self.product_form = ProductFormWidget(self.api_client, self.console)
        self.product_form.product_added.connect(self.refresh_products)
        self.product_form.product_updated.connect(self.refresh_products)
        
        # Add widgets to splitter
        content_splitter.addWidget(left_widget)
        content_splitter.addWidget(self.product_form)
        content_splitter.setStretchFactor(0, 4)  # Left side gets 80% width
        content_splitter.setStretchFactor(1, 1)  # Right side gets 20% width
        
        main_layout.addWidget(content_splitter)
        
        # Status bar
        self.statusBar().showMessage("Ready")
        self.statusBar().setStyleSheet("color: white; background-color: #2d2d2d;")
        
        # Load initial data
        self.refresh_products()
        
    def toggle_backend(self):
        if self.backend_process is None or self.backend_process.poll() is not None:
            self.start_backend()
        else:
            self.stop_backend()
            
    def start_backend(self):
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.abspath(os.path.join(current_dir, '..', '..'))
            
            self.console.log("Starting backend server...", "INFO")
            self.console.log(f"Working directory: {backend_dir}", "INFO")
            
            if os.name == 'nt':  # Windows
                self.backend_process = subprocess.Popen(
                    'npm run dev',
                    cwd=backend_dir,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1,
                    universal_newlines=True
                )
            else:  # Unix/Linux/Mac
                self.backend_process = subprocess.Popen(
                    ['npm', 'run', 'dev'],
                    cwd=backend_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1,
                    universal_newlines=True
                )
            
            threading.Thread(target=self.monitor_backend, daemon=True).start()
            self.status_label.setText("Backend Status: Starting...")
            self.start_backend_btn.setText("Stop Backend")
            
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to start backend: {str(e)}")
            logger.error(f"Backend start error: {str(e)}")
            logger.error(traceback.format_exc())
            
    def stop_backend(self):
        if self.backend_process:
            try:
                if os.name == 'nt':  # Windows
                    subprocess.run(['taskkill', '/F', '/T', '/PID', str(self.backend_process.pid)])
                else:
                    self.backend_process.terminate()
                    self.backend_process.wait(timeout=5)
                
                self.backend_process = None
                self.status_label.setText("Backend Status: Stopped")
                self.start_backend_btn.setText("Start Backend")
                
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to stop backend: {str(e)}")
                
    def monitor_backend(self):
        while self.backend_process and self.backend_process.poll() is None:
            output = self.backend_process.stdout.readline()
            if output:
                self.console.log(f"[Backend] {output}", "INFO")
                logger.info(f"Backend: {output.strip()}")
            
            error = self.backend_process.stderr.readline()
            if error:
                self.console.log(f"[Error] {error}", "ERROR")
                logger.error(f"Backend Error: {error.strip()}")
                
    def refresh_products(self):
        try:
            products = self.api_client.get_products()
            self.product_table.populate_products(products)
            self.update_button_states()  # Update button states after refresh
            # Clear the form and set to add mode
            self.product_form.set_add_mode()
        except Exception as e:
            print(f"Error refreshing products: {e}")
    
    def update_button_states(self):
        selected_products = self.product_table.get_selected_products()
        selected_count = len(selected_products)
        self.delete_btn.setEnabled(selected_count > 0)
        self.edit_selected_btn.setEnabled(selected_count == 1)
        print(f"Selection changed: {selected_count} products selected")  # Debug print
    
    def delete_selected_products(self):
        selected_rows = sorted(set(item.row() for item in self.product_table.selectedItems()))
        if not selected_rows:
            return
            
        if QMessageBox.question(
            self,
            "Confirm Delete",
            f"Delete {len(selected_rows)} selected products?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        ) != QMessageBox.StandardButton.Yes:
            return
            
        progress = QProgressDialog("Deleting products...", "Cancel", 0, len(selected_rows), self)
        progress.setWindowModality(Qt.WindowModality.WindowModal)
        
        success = 0
        failed = 0
        
        for i, row in enumerate(selected_rows):
            product_id = self.product_table.item(row, 0).text()
            progress.setValue(i)
            
            if progress.wasCanceled():
                break
                
            success_flag, result = self.api_client.delete_product(product_id)
            if success_flag:
                success += 1
            else:
                failed += 1
                logger.error(f"Failed to delete product {product_id}: {result}")
                
        progress.setValue(len(selected_rows))
        
        QMessageBox.information(
            self,
            "Delete Results",
            f"Successfully deleted: {success}\nFailed to delete: {failed}"
        )
        
        self.refresh_products()
        
    def clear_all_products(self):
        reply = QMessageBox.question(
            self,
            "Confirm Delete",
            "Are you sure you want to delete ALL products?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            try:
                # Get all products
                products = self.api_client.get_products()
                
                if not products:
                    QMessageBox.information(self, "Info", "No products to delete.")
                    return
                
                # Create progress dialog
                progress = QProgressDialog("Deleting products...", "Cancel", 0, len(products), self)
                progress.setWindowModality(Qt.WindowModality.WindowModal)
                progress.setWindowTitle("Delete Progress")
                
                deleted_count = 0
                failed_count = 0
                
                # Delete products one by one
                for i, product in enumerate(products):
                    if progress.wasCanceled():
                        break
                    
                    progress.setValue(i)
                    QApplication.processEvents()  # Keep UI responsive
                    
                    try:
                        product_id = product['_id']
                        if self.api_client.delete_products([product_id]):
                            deleted_count += 1
                            print(f"Deleted product: {product['name']}")
                        else:
                            failed_count += 1
                            print(f"Failed to delete product: {product['name']}")
                        
                        # Add a small delay to prevent overwhelming the API
                        time.sleep(0.2)
                        
                    except Exception as e:
                        failed_count += 1
                        print(f"Error deleting product {product.get('name', 'Unknown')}: {e}")
                
                progress.setValue(len(products))
                
                # Show results
                QMessageBox.information(
                    self,
                    "Delete Complete",
                    f"Delete operation completed!\nDeleted: {deleted_count}\nFailed: {failed_count}\nTotal processed: {len(products)}"
                )
                
                # Refresh the product list
                self.refresh_products()
            
            except Exception as e:
                QMessageBox.critical(
                    self,
                    "Error",
                    f"Error clearing products: {str(e)}"
                )
    
    def upload_csv(self):
        try:
            file_path, _ = QFileDialog.getOpenFileName(
                self,
                "Select CSV File",
                "",
                "CSV Files (*.csv)"
            )
            
            if not file_path:
                return
                
            # Read CSV file with proper quote handling
            with open(file_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(
                    file,
                    quoting=csv.QUOTE_ALL,  # Changed to QUOTE_ALL to handle all quoted fields
                    quotechar='"',
                    skipinitialspace=True
                )
                
                rows = list(reader)
                
                # Create progress dialog
                progress = QProgressDialog("Uploading products...", "Cancel", 0, len(rows), self)
                progress.setWindowModality(Qt.WindowModality.WindowModal)
                progress.setWindowTitle("Upload Progress")
                
                successful = 0
                failed = 0
                failed_products = []
                
                self.console.log(f"Starting CSV upload from: {file_path}", "INFO")
                
                for i, row in enumerate(rows):
                    if progress.wasCanceled():
                        self.console.log("Upload cancelled by user", "WARNING")
                        break
                        
                    progress.setValue(i)
                    QApplication.processEvents()
                    
                    try:
                        # Clean and prepare product data
                        product_data = {
                            'name': row.get('name', '').strip(),
                            'description': row.get('description', '').strip(),
                            'price': float(row.get('price', '0').strip()),
                            'stock': int(row.get('stock', '0').strip()),
                            'category': row.get('category', '').strip()
                        }
                        
                        # Validate required fields
                        if not product_data['name']:
                            raise ValueError("Product name is required")
                        
                        # Find category ID by name
                        categories = self.api_client.get_categories()
                        category_id = None
                        for category in categories:
                            if category['name'].lower() == product_data['category'].lower():
                                category_id = category['_id']
                                break
                        
                        if not category_id:
                            error_msg = f"Category '{product_data['category']}' not found"
                            self.console.log(f"Failed to add {product_data['name']}: {error_msg}", "ERROR")
                            failed_products.append((product_data['name'], error_msg))
                            failed += 1
                            continue
                        
                        # Update product data with category ID
                        product_data['category'] = category_id
                        
                        # Add optional fields if present
                        if 'originalPrice' in row:
                            try:
                                product_data['originalPrice'] = float(row['originalPrice'].strip())
                            except (ValueError, AttributeError):
                                pass
                        
                        # Create product
                        response = self.api_client.create_product(product_data)
                        
                        if response:
                            successful += 1
                            self.console.log(f"Successfully added product: {product_data['name']}", "SUCCESS")
                        else:
                            error_msg = "API call failed"
                            self.console.log(f"Failed to add {product_data['name']}: {error_msg}", "ERROR")
                            failed_products.append((product_data['name'], error_msg))
                            failed += 1
                            
                    except ValueError as ve:
                        error_msg = f"Invalid data: {str(ve)}"
                        self.console.log(f"Failed to add {row.get('name', 'Unknown')}: {error_msg}", "ERROR")
                        failed_products.append((row.get('name', 'Unknown'), error_msg))
                        failed += 1
                    except Exception as e:
                        error_msg = str(e)
                        self.console.log(f"Failed to add {row.get('name', 'Unknown')}: {error_msg}", "ERROR")
                        failed_products.append((row.get('name', 'Unknown'), error_msg))
                        failed += 1
                
                progress.setValue(len(rows))
                
                # Log final summary
                self.console.log(f"Upload completed - Successful: {successful}, Failed: {failed}", "INFO")
                
                # Prepare detailed result message
                result_message = f"Upload completed!\n\nSuccessful: {successful}\nFailed: {failed}\nTotal processed: {len(rows)}"
                
                if failed_products:
                    result_message += "\n\nFailed Products Details:"
                    for product_name, error in failed_products:
                        result_message += f"\n• {product_name}: {error}"
                
                # Show results in a message box
                QMessageBox.information(self, "Upload Complete", result_message)
                
                # Refresh product list
                self.refresh_products()
                
        except Exception as e:
            error_msg = f"Error uploading CSV: {str(e)}"
            self.console.log(error_msg, "ERROR")
            QMessageBox.critical(self, "Error", error_msg)
    
    def seed_database(self):
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.abspath(os.path.join(current_dir, '..', '..'))
            
            self.console.log("\nSeeding database...\n", "INFO")
            self.console.log(f"Working directory: {backend_dir}", "INFO")
            
            # Create progress dialog
            self.progress_dialog = QProgressDialog("Seeding database...", None, 0, 0, self)
            self.progress_dialog.setWindowModality(Qt.WindowModality.WindowModal)
            self.progress_dialog.setAutoClose(False)
            self.progress_dialog.show()
            
            # Set up worker thread
            self.db_worker = DatabaseWorker(backend_dir, os.name == 'nt')
            
            # Connect signals
            self.db_worker.progress.connect(self.console.log)
            self.db_worker.finished.connect(self.on_seed_complete)
            
            # Set up commands
            commands = ['npm run clear']
            seed_commands = [
                'npm run seed:users',
                'npm run seed:categories',
                'npm run seed:products',
                'npm run seed:reviews',
                'npm run seed:images',
                'npm run seed:orders'
            ]
            commands.extend(seed_commands)
            
            if os.name != 'nt':  # Convert commands to list format for Unix
                commands = [cmd.split() for cmd in commands]
                
            self.db_worker.set_commands(commands)
            self.db_worker.start()
            
        except Exception as e:
            self.progress_dialog.close()
            error_msg = f"Failed to seed database: {str(e)}"
            self.console.log(f"Error: {error_msg}\n", "ERROR")
            QMessageBox.critical(self, "Error", error_msg)
            
    def on_seed_complete(self, success, message):
        self.progress_dialog.close()
        if success:
            self.console.log("\nDatabase seeded successfully!\n", "INFO")
            QMessageBox.information(self, "Success", "Database seeded successfully")
            self.refresh_products()
        else:
            error_msg = f"Failed to seed database: {message}"
            self.console.log(f"Error: {error_msg}\n", "ERROR")
            QMessageBox.critical(self, "Error", error_msg)
            
    def toggle_frontend(self):
        if not self.frontend_worker or not self.frontend_worker.running:
            self.start_frontend()
        else:
            self.stop_frontend()
            
    def start_frontend(self):
        try:
            # Get the absolute path to the frontend directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            frontend_dir = os.path.abspath(os.path.join(current_dir, '..', '..', '..'))
            
            self.console.log("Starting frontend server...", "INFO")
            self.console.log(f"Working directory: {frontend_dir}", "INFO")
            
            # Set up worker thread
            self.frontend_worker = FrontendWorker(frontend_dir)
            self.frontend_worker.progress.connect(lambda msg: self.console.log(msg, "INFO"))
            self.frontend_worker.status_changed.connect(self.update_frontend_status)
            self.frontend_worker.start()
            
            self.start_frontend_btn.setText("Stop Frontend")
            
        except Exception as e:
            error_msg = f"Failed to start frontend: {str(e)}"
            self.console.log(error_msg, "ERROR")
            QMessageBox.critical(self, "Error", error_msg)
            
    def stop_frontend(self):
        if self.frontend_worker:
            self.frontend_worker.stop()
            self.frontend_worker.wait()
            self.frontend_worker = None
            self.start_frontend_btn.setText("Start Frontend")
            self.frontend_status_label.setText("Frontend Status: Not Running")
            
    def update_frontend_status(self, is_running: bool):
        status = "Running" if is_running else "Not Running"
        self.frontend_status_label.setText(f"Frontend Status: {status}")
        
    def closeEvent(self, event):
        if self.db_worker and self.db_worker.isRunning():
            self.db_worker.terminate()
            self.db_worker.wait()
        if self.frontend_worker and self.frontend_worker.running:
            self.stop_frontend()
        self.stop_backend()
        event.accept()
    
    def edit_selected_product(self):
        selected_products = self.product_table.get_selected_products()
        if len(selected_products) == 1:
            product_id = selected_products[0]
            try:
                # Find the product in the current table data
                for row in range(self.product_table.rowCount()):
                    if self.product_table.item(row, 0).text() == product_id:
                        # Get the product data from the table
                        product = {
                            '_id': product_id,
                            'name': self.product_table.item(row, 1).text(),
                            'price': float(self.product_table.item(row, 2).text().replace('$', '')),
                            'stock': int(self.product_table.item(row, 3).text()),
                            'category': self.product_table.item(row, 4).text(),
                            'description': ''  # Will be fetched from API
                        }
                        
                        # Fetch full product details from API
                        try:
                            full_product = self.api_client.get_product_by_id(product_id)
                            if full_product:
                                product.update(full_product)
                        except Exception as e:
                            print(f"Error fetching full product details: {e}")
                        
                        self.product_form.set_edit_mode(product)
                        break
            except Exception as e:
                print(f"Error preparing product for edit: {e}")
    
    def edit_product(self, product):
        """Handle editing a product"""
        try:
            # Debug log the product being edited
            logger.info(f"Editing product: {product}")
            
            # If we only have basic data from the table, fetch full product details
            if product.get('_id') and not product.get('description'):
                full_product = self.api_client.get_product_by_id(product['_id'])
                if full_product:
                    # Merge the full product data while keeping any local changes
                    product.update(full_product)
                    logger.info(f"Fetched full product data: {product}")
            
            self.product_form.set_edit_mode(product)
        except Exception as e:
            logger.error(f"Error preparing product for edit: {e}")
            logger.error(traceback.format_exc())
    
    def update_button_states(self):
        selected_count = len(self.product_table.get_selected_products())
        self.delete_btn.setEnabled(selected_count > 0)
        self.edit_selected_btn.setEnabled(selected_count == 1)
        print(f"Selection changed: {selected_count} products selected")  # Debug print

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ProductManager()
    window.show()
    sys.exit(app.exec()) 