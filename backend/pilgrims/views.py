from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from pilgrims.models import Pilgrim
from pilgrims.serializers import PilgrimSerializer
from django.core.files.storage import default_storage
from django.conf import settings
import os


class PilgrimViewSet(viewsets.ModelViewSet):
    serializer_class = PilgrimSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        if self.request.query_params.get('is_archived') == 'true':
            return Pilgrim.objects.filter(is_archived=True)
        return Pilgrim.objects.filter(is_archived=False)

    def create(self, request, *args, **kwargs):
        # Créer un dictionnaire mutable pour les données (sans copier les fichiers)
        data = {}
        for key in request.data.keys():
            if key not in request.FILES:
                data[key] = request.data[key]
        
        # Gérer l'upload du fichier passeport
        if 'passport_file' in request.FILES:
            passport_file = request.FILES['passport_file']
            # Créer un nom de fichier unique
            email = data.get('email', 'unknown')
            file_name = f"passports/{email}_{passport_file.name}"
            file_path = default_storage.save(file_name, passport_file)
            data['passport_file'] = file_path
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        pilgrim = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        try:
            pilgrim = Pilgrim.objects.get(id=kwargs['pk'])
            
            # Créer un dictionnaire mutable pour les données (sans copier les fichiers)
            data = {}
            for key in request.data.keys():
                if key not in request.FILES:
                    data[key] = request.data[key]
            
            # Gérer l'upload du nouveau fichier passeport
            if 'passport_file' in request.FILES:
                # Supprimer l'ancien fichier si existe
                if pilgrim.passport_file and default_storage.exists(pilgrim.passport_file):
                    default_storage.delete(pilgrim.passport_file)
                
                passport_file = request.FILES['passport_file']
                email = data.get('email', pilgrim.email if pilgrim.email else 'unknown')
                file_name = f"passports/{email}_{passport_file.name}"
                file_path = default_storage.save(file_name, passport_file)
                data['passport_file'] = file_path
            
            serializer = self.get_serializer(pilgrim, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Pilgrim.DoesNotExist:
            return Response({"detail": "Pilgrim not found"}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, *args, **kwargs):
        try:
            pilgrim = Pilgrim.objects.get(id=kwargs['pk'])
            pilgrim.is_archived = True
            pilgrim.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Pilgrim.DoesNotExist:
            return Response({"detail": "Pilgrim not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        pilgrims = self.get_queryset()
        total_pilgrims = pilgrims.count()
        paid_pilgrims = sum(1 for p in pilgrims if p.payment_status == 'paid')
        pending_pilgrims = total_pilgrims - paid_pilgrims
        
        return Response({
            'total_pilgrims': total_pilgrims,
            'paid_pilgrims': paid_pilgrims,
            'pending_pilgrims': pending_pilgrims,
        })

    @action(detail=True, methods=['get'])
    def payment_history(self, request, pk=None):
        from payments.models import Payment
        try:
            pilgrim = Pilgrim.objects.get(id=pk)
            payments = Payment.objects(pilgrim_id=str(pilgrim.id))
            from payments.serializers import PaymentSerializer
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data)
        except Pilgrim.DoesNotExist:
            return Response({"detail": "Pilgrim not found"}, status=status.HTTP_404_NOT_FOUND)
