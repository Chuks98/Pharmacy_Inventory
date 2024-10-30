from datetime import timedelta
from django.utils import timezone
from decimal import Decimal, InvalidOperation
from pymongo import MongoClient
from django.conf import settings
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

client = MongoClient(settings.DATABASES['default']['CLIENT']['host'])
db = client['Inventory']  # Replace with your actual database name


# Get categories
@api_view(['GET'])
def get_categories(request):
    try:
        categories = Category.objects.all()  # Fetch all categories from the database
        serializer = CategorySerializer(categories, many=True)  # Serialize the data
        return Response(serializer.data, status=status.HTTP_200_OK)  # Return the serialized data
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# Get all products
@api_view(['GET'])
def get_products(request):
    try:
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)  # Serialize the data
        print(serializer.data)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Create Category
@api_view(['POST'])
def create_category(request):
    serializer = CategorySerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    elif IntegrityError:
        return Response(status=status.HTTP_409_CONFLICT)
    else:
        print(serializer.errors)  # Log the errors for debugging
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Create Product
@api_view(['POST'])
def create_product(request):
    if request.method == 'POST':
        print("AT LEAST GOT HERE")
        
        # Use request.data to access parsed JSON data
        product_name = request.data.get('name')

        # Check if a product with the same name already exists
        if Product.objects.filter(name=product_name).exists():
            return Response({'error': 'Product already exists'}, status=status.HTTP_409_CONFLICT)
        
        # Initialize serializer with request data
        serializer = ProductSerializer(data=request.data)
        
        # Check if data is valid
        if serializer.is_valid():
            try:
                # Try to save the product
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            except Exception as e:
                # Handle save errors and return a readable error message
                print("Error Saving Data:", e)
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Return validation errors if data is invalid
        print("Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



# Get products by categries
@api_view(['GET'])
def get_products_by_category(request):
    category_id = request.GET.get('category_id')
    if category_id:
        products = Product.objects.filter(category_id=category_id)
    else:
        products = Product.objects.all()

    serializer = ProductSerializer(products, many=True)
    print(serializer.data)
    return Response(serializer.data)


# Get a Product By Id
@api_view(['GET'])
def get_product_by_id(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if product is None:
        return JsonResponse({"error": "Product not found"}, status=404)

    serializer = ProductSerializer(product, many=False)
    return JsonResponse(serializer.data)



# Update Product
@api_view(['PATCH'])
def update_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    serializer = ProductSerializer(instance=product, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    print("Serializer Errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Delete Product
@api_view(['DELETE'])
def delete_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)  # Retrieve the product or return 404 if not found
    product.delete()  # Delete the product from the database
    return Response(status=status.HTTP_204_NO_CONTENT)



# Save pending Order
@api_view(['POST'])
def save_pending_order(request):
    try:
        data = request.data
        
        # Extract main purchase data
        purchase_code = data.get('purchaseCode')
        ordered_items = data.get('orderedItems', [])

        # Check if purchaseCode already exists in the database
        if db.pending_orders.find_one({"purchaseCode": purchase_code}):
            return JsonResponse({"error": "Order with this purchase code already exists."}, status=409)

        # Format the order document
        order_document = {
            "purchaseCode": purchase_code,
            "orderedItems": ordered_items,
            "createdAt": timezone.now()
        }
        
        # Insert the order document into MongoDB
        result = db.pending_orders.insert_one(order_document)
        
        return JsonResponse({"message": "Order saved successfully", "orderId": str(result.inserted_id)}, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)



# Code to get pending orders
@api_view(['GET'])
def get_pending_orders(request):
    try:
        # Fetch all pending orders from the database and sort by date_sold in descending order
        pending_orders = list(db.pending_orders.find({}).sort("createdAt", -1))

        # Format the response to exclude the MongoDB-specific '_id' field
        for order in pending_orders:
            order['id'] = str(order['_id'])  # Convert ObjectId to string
            del order['_id']  # Remove MongoDB's default _id field

        return JsonResponse(pending_orders, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)




# Delete pending orders
@api_view(['DELETE'])
def delete_pending_order(request, purchase_code):
    try:
        # Find and delete the order with the given purchase code
        result = db.pending_orders.delete_one({"purchaseCode": purchase_code})

        if result.deleted_count == 1:
            return JsonResponse({"message": "Order deleted successfully"}, status=204)
        else:
            return JsonResponse({"error": "Order not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)



@api_view(['POST'])
def save_completed_orders(request):
    try:
        data = request.data
        
        # Extract data from the request
        purchase_code = data.get('purchaseCode')
        ordered_items = data.get('orderedItems', [])
        payment_type = data.get('paymentType')
        total_amount = Decimal(data.get('totalAmount', "0"))  # Ensure it's a Decimal
        user_type = data.get('userType')
        date_sold = data.get('date_sold')

        # Process each item in ordered_items
        for item in ordered_items:
            price = item.get('price', "0")
            # Clean the price string to remove any unwanted characters
            price_str = str(price).replace('“', '').replace('”', '').strip()

            # Convert the price to Decimal, ensuring it's a valid decimal number
            try:
                item['price'] = Decimal(price_str) if price_str else Decimal('0')
                print(f"Processed price for item: {item['price']}")  # Debugging output
            except InvalidOperation:
                return JsonResponse({"error": f"Invalid price format: {price_str}"}, status=400)

        # Iterate through ordered items and update product quantities
        for item in ordered_items:
            product_id = item.get('id')  # Assuming orderedItems have an 'id' field
            ordered_quantity = item.get('quantity', 0)
            print(f"Product ID: {product_id}, Ordered Quantity: {ordered_quantity}")
            
            # Fetch product from Product model based on ID
            try:
                product = Product.objects.get(id=product_id)  # Use get() to retrieve the product
                print(f"Retrieved product: {product.id}, Current Quantity: {product.availableQuantity}")
            except Product.DoesNotExist:
                return JsonResponse({"error": f"Product with ID {product_id} not found."}, status=404)

            # Check stock availability
            if product.availableQuantity < ordered_quantity:
                return JsonResponse({"error": f"Not enough stock for product ID {product_id}."}, status=400)

            # Prepare data for ProductSerializer
            product_data = {
                'id': product.id,
                'price': item['price'],
                'availableQuantity': product.availableQuantity - ordered_quantity,
            }

            # Validate and update the product using ProductSerializer
            serializer = ProductSerializer(product, data=product_data, partial=True)
            if serializer.is_valid():
                serializer.save()  # Save updated product
            else:
                return JsonResponse({"error": serializer.errors}, status=400)

        # Create the completed order document for MongoDB
        completed_order_document = {
            "purchaseCode": purchase_code,
            "soldItems": ordered_items,
            "paymentType": payment_type,
            "totalAmount": float(total_amount),  # Convert Decimal to float for JSON response
            "userType": user_type,
            "date_sold": date_sold or timezone.now().isoformat()
        }

        # Convert any remaining Decimal values to float or str in ordered_items
        for item in ordered_items:
            item['price'] = float(item['price'])

        print("Order document ready for saving:", completed_order_document)

        # Save the completed order to the completed_orders collection in MongoDB
        result = db.completed_orders.insert_one(completed_order_document)
        
        return JsonResponse({"message": "Order completed successfully", "orderId": str(result.inserted_id)}, status=201)

    except Exception as e:
        print(f"Error occurred: {e}")
        return JsonResponse({"error": str(e)}, status=400)
    



# Code to get completed Orders
@api_view(['GET'])
def get_completed_orders(request):
    try:
        # Fetch all completed orders from the database and sort by date_sold in descending order
        completed_orders = list(db.completed_orders.find({}).sort("date_sold", -1))

        # Format the response to exclude the MongoDB-specific '_id' field
        for order in completed_orders:
            order['id'] = str(order['_id'])  # Convert ObjectId to string
            del order['_id']  # Remove MongoDB's default _id field

        return JsonResponse(completed_orders, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)




# Get total sales for dashboard view
@api_view(['GET'])
def get_total_sales(request):
    try:
        # Initialize total sales
        total_sales = Decimal('0.0')

        # Fetch all completed orders
        completed_orders = db.completed_orders.find()

        # Sum up the total amounts for each completed order
        for order in completed_orders:
            total_amount = Decimal(str(order.get('totalAmount', '0')))
            total_sales += total_amount

        # Return the total sales as JSON
        return JsonResponse({'totalSales': float(total_sales)}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)



# Get total products number
@api_view(['GET'])
def get_total_products_quantity(request):
    try:
        # Calculate the total quantity of available products
        total_quantity = Product.objects.aggregate(total_quantity=Sum('availableQuantity'))['total_quantity'] or 0

        # You can also include other relevant data if needed
        total_products_count = Product.objects.count()  # Count total products

        return JsonResponse({
            'success': True,
            'total_quantity': total_quantity,
            'total_products_count': total_products_count,
            'message': 'Total quantity and count retrieved successfully.'
        })
    
    except Exception as e:
        # Handle any unexpected errors gracefully
        return JsonResponse({
            'success': False,
            'error': str(e),
            'message': 'An error occurred while fetching the total quantity.'
        })
    


@api_view(['GET'])
def get_low_stock_items(request, threshold):
    try:
        low_stock_items = Product.objects.filter(availableQuantity__lt=threshold)
        
        # You can include additional fields if necessary, such as name and availableQuantity
        low_stock_data = low_stock_items.values('id', 'name', 'availableQuantity')
        
        return JsonResponse({
            'success': True,
            'low_stock_items': list(low_stock_data),
            'message': 'Low stock items retrieved successfully.'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'message': 'An error occurred while fetching low stock items.'
        })
    



# Get products expiring withing 30 days
@api_view(['GET'])
def get_expiring_products(request):
    try:
        # Get the current date and the date 30 days from now
        current_date = timezone.now()
        expiry_date_limit = current_date + timedelta(days=30)

        # Filter products that are expiring within the next 30 days
        expiring_products = Product.objects.filter(expiry_date__gte=current_date, expiry_date__lt=expiry_date_limit)

        # Prepare the response data
        expiring_data = expiring_products.values('id', 'name', 'expiry_date')

        return JsonResponse({
            'success': True,
            'expiring_products': list(expiring_data),
            'message': 'Expiring products retrieved successfully.'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'message': 'An error occurred while fetching expiring products.'
        })
    




# Get total sales for dashboard view
@api_view(['GET'])
def get_pending_orders_number(request):
    try:
        # Fetch all completed orders
        pending_orders_db = db.pending_orders.find()

        pending_orders = pending_orders_db.count()
        print(pending_orders)
        # Return the total sales as JSON
        return JsonResponse({'pending_orders': pending_orders}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)




# Get total sales for dashboard view
@api_view(['GET'])
def get_completed_orders_number(request):
    try:
        # Fetch all completed orders
        completed_orders_db = db.completed_orders.find()

        completed_orders = completed_orders_db.count()
        print(completed_orders)
        # Return the total sales as JSON
        return JsonResponse({'completed_orders': completed_orders}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)