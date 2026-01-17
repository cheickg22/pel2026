"""
Pagination personnalisée pour l'API
"""
from rest_framework.pagination import PageNumberPagination


class CustomPageNumberPagination(PageNumberPagination):
    """
    Pagination avec page_size configurable via paramètre query
    """
    page_size = 20  # Taille par défaut
    page_size_query_param = 'page_size'  # Permet de changer via ?page_size=100
    max_page_size = 1000  # Limite maximale pour éviter les abus
