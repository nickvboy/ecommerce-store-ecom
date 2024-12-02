import requests
import os
from dotenv import load_dotenv

class APIClient:
    def __init__(self):
        load_dotenv()
        self.base_url = os.getenv('API_BASE_URL', 'http://localhost:5000/api')
        print(f"API Base URL: {self.base_url}")

    def get_products(self):
        try:
            print("\nFetching products...")
            response = requests.get(f"{self.base_url}/products")
            print(f"Response status code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("\nRaw API Response:")
                print(data)
                
                # If it's a dictionary with a products key
                if isinstance(data, dict) and 'products' in data:
                    return data['products']
                # If it's a list directly
                elif isinstance(data, list):
                    return data
                # If it's a dictionary without a products key
                elif isinstance(data, dict):
                    # Return all values as a list
                    return [data]
                else:
                    print(f"Unexpected response format: {data}")
                    return []
            return []
        except Exception as e:
            print(f"Error fetching products: {str(e)}")
            return []

    def create_product(self, product_data):
        try:
            print(f"\nCreating product with data: {product_data}")
            response = requests.post(
                f"{self.base_url}/products",
                json=product_data
            )
            print(f"Create product response status: {response.status_code}")
            print(f"Create product response: {response.text}")
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                print(f"Error creating product. Status code: {response.status_code}")
                print(f"Response: {response.text}")
                return None
        except Exception as e:
            print(f"Error creating product: {str(e)}")
            return None

    def delete_product(self, product_id):
        try:
            print(f"\nDeleting product with ID: {product_id}")
            response = requests.delete(f"{self.base_url}/products/{product_id}")
            print(f"Delete response status: {response.status_code}")
            
            if response.status_code in [200, 204]:
                print("Product deleted successfully")
                return True
            else:
                print(f"Error deleting product. Status code: {response.status_code}")
                if response.text:
                    print(f"Response: {response.text}")
                return False
        except Exception as e:
            print(f"Error deleting product: {str(e)}")
            return False