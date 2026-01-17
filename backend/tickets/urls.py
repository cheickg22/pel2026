"""
URLs pour la billetterie
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from tickets.views import TicketViewSet, TicketPaymentViewSet

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'ticket-payments', TicketPaymentViewSet, basename='ticket-payment')

urlpatterns = [
    path('', include(router.urls)),
]
