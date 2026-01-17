"""
Views pour la billetterie
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from tickets.models import Ticket, TicketPayment, TicketStatus
from tickets.serializers import TicketSerializer, TicketPaymentSerializer
from pilgrims.models import Pilgrim
from datetime import datetime


class TicketViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des billets"""
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer par statut si demandé"""
        queryset = Ticket.objects.all()
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        pilgrim_id = self.request.query_params.get('pilgrim_id')
        if pilgrim_id:
            queryset = queryset.filter(pilgrim=pilgrim_id)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Créer un nouveau billet"""
        data = request.data.copy()
        
        # Récupérer le pèlerin
        pilgrim_id = data.get('pilgrim_id')
        if not pilgrim_id:
            return Response(
                {"detail": "pilgrim_id requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            pilgrim = Pilgrim.objects.get(id=pilgrim_id)
        except Pilgrim.DoesNotExist:
            return Response(
                {"detail": "Pèlerin non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Créer le billet
        ticket = Ticket()
        ticket.pilgrim = pilgrim
        ticket.ticket_number = data.get('ticket_number', '')
        ticket.ticket_type = data.get('ticket_type', 'round_trip')
        
        # Vol aller
        ticket.outbound_flight = data.get('outbound_flight', '')
        if data.get('outbound_date'):
            ticket.outbound_date = datetime.fromisoformat(data['outbound_date'].replace('Z', '+00:00'))
        ticket.outbound_departure = data.get('outbound_departure', '')
        ticket.outbound_arrival = data.get('outbound_arrival', '')
        
        # Vol retour
        ticket.return_flight = data.get('return_flight', '')
        if data.get('return_date'):
            ticket.return_date = datetime.fromisoformat(data['return_date'].replace('Z', '+00:00'))
        ticket.return_departure = data.get('return_departure', '')
        ticket.return_arrival = data.get('return_arrival', '')
        
        # Tarifs
        ticket.ticket_price = float(data.get('ticket_price', 0))
        ticket.agency_fee = float(data.get('agency_fee', 0))
        ticket.amount_paid = float(data.get('amount_paid', 0))
        
        # Compagnie
        ticket.airline = data.get('airline', '')
        ticket.airline_code = data.get('airline_code', '')
        
        ticket.notes = data.get('notes', '')
        ticket.created_by = str(request.user.id)
        ticket.save()
        
        serializer = self.get_serializer(ticket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Mettre à jour un billet"""
        try:
            ticket = Ticket.objects.get(id=kwargs['pk'])
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "Billet non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data
        
        # Mettre à jour les champs
        if 'ticket_number' in data:
            ticket.ticket_number = data['ticket_number']
        if 'ticket_type' in data:
            ticket.ticket_type = data['ticket_type']
        
        # Vol aller
        if 'outbound_flight' in data:
            ticket.outbound_flight = data['outbound_flight']
        if 'outbound_date' in data and data['outbound_date']:
            ticket.outbound_date = datetime.fromisoformat(data['outbound_date'].replace('Z', '+00:00'))
        if 'outbound_departure' in data:
            ticket.outbound_departure = data['outbound_departure']
        if 'outbound_arrival' in data:
            ticket.outbound_arrival = data['outbound_arrival']
        
        # Vol retour
        if 'return_flight' in data:
            ticket.return_flight = data['return_flight']
        if 'return_date' in data and data['return_date']:
            ticket.return_date = datetime.fromisoformat(data['return_date'].replace('Z', '+00:00'))
        if 'return_departure' in data:
            ticket.return_departure = data['return_departure']
        if 'return_arrival' in data:
            ticket.return_arrival = data['return_arrival']
        
        # Tarifs
        if 'ticket_price' in data:
            ticket.ticket_price = float(data['ticket_price'])
        if 'agency_fee' in data:
            ticket.agency_fee = float(data['agency_fee'])
        
        # Compagnie
        if 'airline' in data:
            ticket.airline = data['airline']
        if 'airline_code' in data:
            ticket.airline_code = data['airline_code']
        
        if 'notes' in data:
            ticket.notes = data['notes']
        
        ticket.save()
        
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def issue(self, request, pk=None):
        """Émettre un billet (marquer comme émis)"""
        try:
            ticket = Ticket.objects.get(id=pk)
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "Billet non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if ticket.status != TicketStatus.CONFIRMED.value:
            return Response(
                {"detail": "Le billet doit être confirmé avant émission"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ticket.status = TicketStatus.ISSUED.value
        ticket.issued_at = datetime.utcnow()
        ticket.save()
        
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annuler un billet"""
        try:
            ticket = Ticket.objects.get(id=pk)
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "Billet non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        reason = request.data.get('reason', 'Annulation demandée')
        
        ticket.status = TicketStatus.CANCELLED.value
        ticket.cancelled_at = datetime.utcnow()
        ticket.cancellation_reason = reason
        ticket.save()
        
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques des billets"""
        total = Ticket.objects.count()
        reserved = Ticket.objects.filter(status=TicketStatus.RESERVED.value).count()
        confirmed = Ticket.objects.filter(status=TicketStatus.CONFIRMED.value).count()
        issued = Ticket.objects.filter(status=TicketStatus.ISSUED.value).count()
        cancelled = Ticket.objects.filter(status=TicketStatus.CANCELLED.value).count()
        
        # Calcul des revenus
        total_revenue = 0
        total_collected = 0
        
        for ticket in Ticket.objects.filter(status__ne=TicketStatus.CANCELLED.value):
            total_revenue += ticket.total_amount
            total_collected += ticket.amount_paid
        
        return Response({
            'total_tickets': total,
            'reserved': reserved,
            'confirmed': confirmed,
            'issued': issued,
            'cancelled': cancelled,
            'total_revenue': total_revenue,
            'total_collected': total_collected,
            'remaining': total_revenue - total_collected
        })
    
    @action(detail=True, methods=['post'])
    def add_payment(self, request, pk=None):
        """Ajouter un paiement pour un billet"""
        try:
            ticket = Ticket.objects.get(id=pk)
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "Billet non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        amount = float(request.data.get('amount', 0))
        if amount <= 0:
            return Response(
                {"detail": "Montant invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer le paiement
        payment = TicketPayment()
        payment.ticket = ticket
        payment.amount = amount
        payment.payment_mode = request.data.get('payment_mode', 'cash')
        payment.reference_number = request.data.get('reference_number', '')
        payment.description = request.data.get('description', '')
        payment.created_by = str(request.user.id)
        payment.save()
        
        # Mettre à jour le billet
        ticket.amount_paid += amount
        ticket.save()
        
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def payment_history(self, request, pk=None):
        """Historique des paiements d'un billet"""
        try:
            ticket = Ticket.objects.get(id=pk)
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "Billet non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        payments = TicketPayment.objects.filter(ticket=ticket).order_by('-payment_date')
        serializer = TicketPaymentSerializer(payments, many=True)
        return Response(serializer.data)


class TicketPaymentViewSet(viewsets.ModelViewSet):
    """ViewSet pour les paiements de billets"""
    serializer_class = TicketPaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TicketPayment.objects.all().order_by('-payment_date')
