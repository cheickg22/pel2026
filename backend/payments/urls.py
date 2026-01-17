from django.urls import path, include
from rest_framework.routers import DefaultRouter
from payments.views import PaymentViewSet, AgencySettingsViewSet, ReceiptViewSet

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'agency-settings', AgencySettingsViewSet, basename='agency-settings')
router.register(r'receipts', ReceiptViewSet, basename='receipt')

urlpatterns = [
    path('', include(router.urls)),
]
