from django.urls import path, include
from rest_framework.routers import DefaultRouter
from treasury.views import TreasuryViewSet

router = DefaultRouter()
router.register(r'', TreasuryViewSet, basename='treasury')

urlpatterns = [
    path('', include(router.urls)),
]
