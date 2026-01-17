from django.urls import path, include
from rest_framework.routers import DefaultRouter
from pilgrims.views import PilgrimViewSet

router = DefaultRouter()
router.register(r'', PilgrimViewSet, basename='pilgrim')

urlpatterns = [
    path('', include(router.urls)),
]
