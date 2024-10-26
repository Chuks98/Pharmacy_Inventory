from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

# Get categories
@api_view(['GET'])
def get_categories(request):
    try:
        categories = Category.objects.all()  # Fetch all categories from the database
        serializer = CategorySerializer(categories, many=True)  # Serialize the data
        return Response(serializer.data, status=status.HTTP_200_OK)  # Return the serialized data
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
        # Create a serializer instance with the request data
        serializer = ProductSerializer(data=request.data)
        
        if serializer.is_valid():
            product = serializer.save()
            
            # image_url = request.build_absolute_uri(product.image.url) if product.image else None
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Return validation errors if the serializer is not valid
        print("Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



# Get products by categries
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

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
