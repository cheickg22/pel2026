from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.http import HttpResponse
from django.core.files.storage import default_storage
from payments.models import Payment, AgencySettings, Receipt
from payments.serializers import AgencySettingsSerializer, ReceiptSerializer
from pilgrims.models import Pilgrim
from datetime import datetime
import os


class PaymentViewSet(viewsets.ViewSet):
    """ViewSet pour les paiements"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Liste tous les paiements"""
        payments = Payment.objects.all().order_by('-payment_date')
        # Convertir en dict pour response
        data = []
        for payment in payments:
            data.append({
                'id': str(payment.id),
                'pilgrim_id': payment.pilgrim_id,
                'amount': payment.amount,
                'payment_mode': payment.payment_mode,
                'payment_date': payment.payment_date,
                'description': payment.description,
                'reference_number': payment.reference_number,
            })
        return Response(data)
    
    def create(self, request):
        """Créé un nouveau paiement"""
        from dateutil import parser as date_parser
        from pilgrims.models import Pilgrim
        from treasury.models import Treasury, TransactionType
        
        data = request.data
        
        # Parser la date correctement
        payment_date_str = data.get('payment_date')
        if payment_date_str:
            payment_date = date_parser.parse(payment_date_str)
        else:
            payment_date = datetime.utcnow()
        
        # Vérifier que le pèlerin existe
        pilgrim_id = data.get('pilgrim_id')
        try:
            pilgrim = Pilgrim.objects.get(id=pilgrim_id)
        except Pilgrim.DoesNotExist:
            return Response(
                {"detail": "Pèlerin non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Créer le paiement
        payment = Payment(
            pilgrim_id=pilgrim_id,
            amount=float(data.get('amount')),
            payment_mode=data.get('payment_mode'),
            payment_date=payment_date,
            description=data.get('description', ''),
            reference_number=data.get('reference_number', ''),
        )
        payment.save()
        
        # Mettre à jour le total payé du pèlerin
        pilgrim.total_paid += payment.amount
        pilgrim.save()  # Le save() du modèle Pilgrim recalcule automatiquement remaining_amount et payment_status
        
        # Créer une transaction de trésorerie (INCOME)
        Treasury(
            transaction_type=TransactionType.INCOME.value,
            amount=payment.amount,
            description=f"Paiement de {pilgrim.first_name} {pilgrim.last_name} - {data.get('description', 'Paiement pèlerinage')}",
            reference_id=str(payment.id),
            reference_type='payment'
        ).save()
        
        return Response({
            'id': str(payment.id),
            'pilgrim_id': payment.pilgrim_id,
            'amount': payment.amount,
            'payment_mode': payment.payment_mode,
            'payment_date': payment.payment_date,
            'description': payment.description,
            'reference_number': payment.reference_number,
        }, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, pk=None):
        """Détail d'un paiement"""
        try:
            payment = Payment.objects.get(id=pk)
            return Response({
                'id': str(payment.id),
                'pilgrim_id': payment.pilgrim_id,
                'amount': payment.amount,
                'payment_mode': payment.payment_mode,
                'payment_date': payment.payment_date,
                'description': payment.description,
                'reference_number': payment.reference_number,
                'created_at': payment.created_at,
                'updated_at': payment.updated_at,
            })
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Paiement non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def update(self, request, pk=None):
        """Modifier un paiement (admin uniquement)"""
        try:
            payment = Payment.objects.get(id=pk)
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Paiement non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data
        old_pilgrim_id = payment.pilgrim_id
        old_amount = payment.amount
        
        # Vérifier si le pèlerin a changé et qu'il existe
        new_pilgrim_id = data.get('pilgrim_id', payment.pilgrim_id)
        try:
            new_pilgrim = Pilgrim.objects.get(id=new_pilgrim_id)
        except Pilgrim.DoesNotExist:
            return Response(
                {"detail": "Pèlerin non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Mettre à jour les champs
        if 'amount' in data:
            payment.amount = float(data['amount'])
        if 'payment_mode' in data:
            payment.payment_mode = data['payment_mode']
        if 'payment_date' in data:
            payment.payment_date = datetime.fromisoformat(data['payment_date'].replace('Z', '+00:00'))
        if 'description' in data:
            payment.description = data['description']
        if 'reference_number' in data:
            payment.reference_number = data['reference_number']
        if 'pilgrim_id' in data:
            payment.pilgrim_id = str(new_pilgrim_id)
        
        payment.save()
        
        # Recalculer les totaux de l'ancien pèlerin
        if old_pilgrim_id != payment.pilgrim_id:
            try:
                old_pilgrim = Pilgrim.objects.get(id=old_pilgrim_id)
                old_payments = Payment.objects.filter(pilgrim_id=str(old_pilgrim.id))
                old_total_paid = sum([p.amount for p in old_payments])
                old_pilgrim.total_paid = old_total_paid
                old_pilgrim.remaining_amount = old_pilgrim.total_cost - old_total_paid
                
                if old_total_paid == 0:
                    old_pilgrim.payment_status = 'pending'
                elif old_total_paid >= old_pilgrim.total_cost:
                    old_pilgrim.payment_status = 'completed'
                else:
                    old_pilgrim.payment_status = 'partial'
                
                old_pilgrim.save()
            except:
                pass
        
        # Recalculer les totaux du nouveau pèlerin
        new_payments = Payment.objects.filter(pilgrim_id=str(new_pilgrim.id))
        new_total_paid = sum([p.amount for p in new_payments])
        new_pilgrim.total_paid = new_total_paid
        new_pilgrim.remaining_amount = new_pilgrim.total_cost - new_total_paid
        
        if new_total_paid == 0:
            new_pilgrim.payment_status = 'pending'
        elif new_total_paid >= new_pilgrim.total_cost:
            new_pilgrim.payment_status = 'completed'
        else:
            new_pilgrim.payment_status = 'partial'
        
        new_pilgrim.save()
        
        return Response({
            'id': str(payment.id),
            'pilgrim_id': payment.pilgrim_id,
            'amount': payment.amount,
            'payment_mode': payment.payment_mode,
            'payment_date': payment.payment_date,
            'description': payment.description,
            'reference_number': payment.reference_number,
            'created_at': payment.created_at,
            'updated_at': payment.updated_at,
        })
    
    def destroy(self, request, pk=None):
        """Supprimer un paiement (admin uniquement)"""
        try:
            payment = Payment.objects.get(id=pk)
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Paiement non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        pilgrim_id = payment.pilgrim_id
        
        # Supprimer le paiement
        payment.delete()
        
        # Recalculer les totaux du pèlerin
        try:
            pilgrim = Pilgrim.objects.get(id=pilgrim_id)
            payments = Payment.objects.filter(pilgrim_id=str(pilgrim.id))
            total_paid = sum([p.amount for p in payments])
            
            pilgrim.total_paid = total_paid
            pilgrim.remaining_amount = pilgrim.total_cost - total_paid
            
            if total_paid == 0:
                pilgrim.payment_status = 'pending'
            elif total_paid >= pilgrim.total_cost:
                pilgrim.payment_status = 'completed'
            else:
                pilgrim.payment_status = 'partial'
            
            pilgrim.save()
        except:
            pass
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques des paiements pour le dashboard"""
        payments = Payment.objects.all()
        
        # Calculer le total collecté
        total_collected = sum([p.amount for p in payments])
        
        # Nombre total de paiements
        total_payments = payments.count()
        
        # Statistiques par mode de paiement
        payment_modes = {}
        for payment in payments:
            mode = payment.payment_mode
            if mode not in payment_modes:
                payment_modes[mode] = {'count': 0, 'amount': 0}
            payment_modes[mode]['count'] += 1
            payment_modes[mode]['amount'] += payment.amount
        
        return Response({
            'total_collected': total_collected,
            'total_payments': total_payments,
            'payment_modes': payment_modes,
        })


class AgencySettingsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def list(self, request):
        """Récupère les paramètres de l'agence"""
        settings = AgencySettings.get_settings()
        serializer = AgencySettingsSerializer(settings)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[])
    def public(self, request):
        """Récupère les paramètres publics de l'agence (sans authentification)"""
        settings = AgencySettings.get_settings()
        return Response({
            'name': settings.name,
            'tagline': settings.tagline,
            'logo': settings.logo,
            'primary_color': settings.primary_color,
            'secondary_color': settings.secondary_color,
            'sidebar_color': settings.sidebar_color,
        })

    def update(self, request, pk=None):
        """Met à jour les paramètres de l'agence"""
        settings = AgencySettings.get_settings()
        
        # Créer un dictionnaire mutable pour les données (sans copier les fichiers)
        data = {}
        for key in request.data.keys():
            if key not in request.FILES:
                data[key] = request.data[key]
        
        # Gérer l'upload du logo
        if 'logo' in request.FILES:
            logo_file = request.FILES['logo']
            
            # Valider que c'est une image
            allowed_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
            file_ext = os.path.splitext(logo_file.name)[1].lower()
            if file_ext not in allowed_extensions:
                return Response(
                    {"detail": f"Format de fichier non supporté. Formats acceptés: {', '.join(allowed_extensions)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Supprimer ancien logo
            if settings.logo and default_storage.exists(settings.logo):
                default_storage.delete(settings.logo)
            # Sauvegarder nouveau
            file_name = f"agency/logo_{logo_file.name}"
            file_path = default_storage.save(file_name, logo_file)
            data['logo'] = file_path
        
        # Gérer l'upload de la signature
        if 'signature' in request.FILES:
            signature_file = request.FILES['signature']
            
            # Valider que c'est une image
            allowed_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
            file_ext = os.path.splitext(signature_file.name)[1].lower()
            if file_ext not in allowed_extensions:
                return Response(
                    {"detail": f"Format de fichier non supporté. Formats acceptés: {', '.join(allowed_extensions)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Supprimer ancienne signature
            if settings.signature and default_storage.exists(settings.signature):
                default_storage.delete(settings.signature)
            # Sauvegarder nouvelle
            file_name = f"agency/signature_{signature_file.name}"
            file_path = default_storage.save(file_name, signature_file)
            data['signature'] = file_path
        
        serializer = AgencySettingsSerializer(settings, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def upload_logo(self, request):
        """Upload du logo séparément"""
        if 'file' not in request.FILES:
            return Response(
                {"detail": "Aucun fichier fourni"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        settings = AgencySettings.get_settings()
        logo_file = request.FILES['file']
        
        # Supprimer ancien logo
        if settings.logo and default_storage.exists(settings.logo):
            default_storage.delete(settings.logo)
        
        # Sauvegarder nouveau
        file_name = f"agency/logo_{logo_file.name}"
        file_path = default_storage.save(file_name, logo_file)
        
        settings.logo = file_path
        settings.save()
        
        return Response({"logo": file_path})

    @action(detail=False, methods=['post'])
    def upload_signature(self, request):
        """Upload de la signature séparément"""
        if 'file' not in request.FILES:
            return Response(
                {"detail": "Aucun fichier fourni"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        settings = AgencySettings.get_settings()
        signature_file = request.FILES['file']
        
        # Supprimer ancienne signature
        if settings.signature and default_storage.exists(settings.signature):
            default_storage.delete(settings.signature)
        
        # Sauvegarder nouvelle
        file_name = f"agency/signature_{signature_file.name}"
        file_path = default_storage.save(file_name, signature_file)
        
        settings.signature = file_path
        settings.save()
        
        return Response({"signature": file_path})


class ReceiptViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Liste tous les reçus"""
        receipts = Receipt.objects.all().order_by('-created_at')
        serializer = ReceiptSerializer(receipts, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Détail d'un reçu"""
        try:
            receipt = Receipt.objects.get(id=pk)
            serializer = ReceiptSerializer(receipt)
            return Response(serializer.data)
        except Receipt.DoesNotExist:
            return Response(
                {"detail": "Reçu non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Génère un reçu pour un paiement"""
        from payments.models import Payment
        
        payment_id = request.data.get('payment_id')
        if not payment_id:
            return Response(
                {"detail": "payment_id requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            payment = Payment.objects.get(id=payment_id)
            pilgrim = Pilgrim.objects.get(id=payment.pilgrim_id)
        except (Payment.DoesNotExist, Pilgrim.DoesNotExist):
            return Response(
                {"detail": "Paiement ou pèlerin non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier si un reçu existe déjà pour ce paiement
        existing_receipt = Receipt.objects(payment=payment).first()
        if existing_receipt:
            serializer = ReceiptSerializer(existing_receipt)
            return Response(serializer.data)
        
        # Créer le reçu
        receipt = Receipt()
        receipt.receipt_number = Receipt.generate_receipt_number()
        receipt.payment = payment
        receipt.pilgrim = pilgrim
        receipt.amount = payment.amount
        receipt.payment_mode = payment.payment_mode
        receipt.payment_date = payment.payment_date
        receipt.description = payment.description or f"Paiement pour pèlerinage"
        
        # Capturer les informations financières du pèlerin (snapshot)
        receipt.total_cost = pilgrim.total_cost
        receipt.total_paid = pilgrim.total_paid
        receipt.remaining_amount = pilgrim.remaining_amount
        
        receipt.pilgrim_name = f"{pilgrim.first_name} {pilgrim.last_name}"
        receipt.pilgrim_email = pilgrim.email
        receipt.pilgrim_phone = pilgrim.phone
        receipt.issued_by_id = str(request.user.id)
        receipt.issued_by_name = f"{request.user.first_name} {request.user.last_name}" if request.user.first_name else request.user.username
        receipt.save()
        
        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Télécharge le reçu en PDF"""
        try:
            receipt = Receipt.objects.get(id=pk)
        except Receipt.DoesNotExist:
            return Response(
                {"detail": "Reçu non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Générer le PDF
        from payments.utils import generate_receipt_pdf
        pdf_buffer = generate_receipt_pdf(receipt)
        
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="recu_{receipt.receipt_number}.pdf"'
        return response

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un reçu"""
        try:
            receipt = Receipt.objects.get(id=pk)
        except Receipt.DoesNotExist:
            return Response(
                {"detail": "Reçu non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if receipt.is_cancelled:
            return Response(
                {"detail": "Ce reçu est déjà annulé"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', 'Aucune raison spécifiée')
        
        receipt.is_cancelled = True
        receipt.cancelled_at = datetime.utcnow()
        receipt.cancelled_reason = reason
        receipt.save()
        
        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data)
