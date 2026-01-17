"""
Serializers pour la billetterie
"""
from rest_framework import serializers
from tickets.models import Ticket, TicketPayment, TicketStatus, TicketType


class TicketSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    pilgrim_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    # Informations client (si pas un pèlerin)
    customer_first_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    customer_last_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    customer_phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    customer_email = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    # Nom du client (calculé)
    customer_name = serializers.SerializerMethodField()
    
    ticket_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    ticket_type = serializers.ChoiceField(
        choices=[t.value for t in TicketType],
        default=TicketType.ROUND_TRIP.value
    )
    
    # Vol aller
    outbound_flight = serializers.CharField(required=False, allow_blank=True)
    outbound_date = serializers.DateTimeField(required=False, allow_null=True)
    outbound_departure = serializers.CharField(required=False, allow_blank=True)
    outbound_arrival = serializers.CharField(required=False, allow_blank=True)
    
    # Vol retour
    return_flight = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    return_date = serializers.DateTimeField(required=False, allow_null=True)
    return_departure = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    return_arrival = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    # Tarifs
    ticket_price = serializers.FloatField(default=0.0)
    agency_fee = serializers.FloatField(default=0.0)
    total_amount = serializers.FloatField(read_only=True)
    
    amount_paid = serializers.FloatField(default=0.0)
    remaining_amount = serializers.FloatField(read_only=True)
    
    # Statut
    status = serializers.ChoiceField(
        choices=[s.value for s in TicketStatus],
        default=TicketStatus.RESERVED.value
    )
    
    # Compagnie
    airline = serializers.CharField(required=False, allow_blank=True)
    airline_code = serializers.CharField(required=False, allow_blank=True)
    
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    created_by = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    issued_at = serializers.DateTimeField(read_only=True, allow_null=True)
    cancelled_at = serializers.DateTimeField(read_only=True, allow_null=True)
    cancellation_reason = serializers.CharField(read_only=True, allow_null=True)
    
    def get_customer_name(self, obj):
        """Retourne le nom du client (pèlerin ou client externe)"""
        return obj.get_customer_name()
    
    def validate(self, data):
        """Validation : soit pilgrim_id soit customer_first_name + customer_last_name"""
        pilgrim_id = data.get('pilgrim_id')
        customer_first_name = data.get('customer_first_name')
        customer_last_name = data.get('customer_last_name')
        
        if not pilgrim_id and not (customer_first_name and customer_last_name):
            raise serializers.ValidationError(
                "Vous devez soit sélectionner un pèlerin, soit fournir le nom et prénom du client"
            )
        
        return data
    
    def create(self, validated_data):
        """Créer un nouveau billet"""
        from pilgrims.models import Pilgrim
        
        # Gérer la référence au pèlerin si fournie
        pilgrim_id = validated_data.pop('pilgrim_id', None)
        if pilgrim_id:
            try:
                pilgrim = Pilgrim.objects.get(id=pilgrim_id)
                validated_data['pilgrim'] = pilgrim
            except Pilgrim.DoesNotExist:
                raise serializers.ValidationError({"pilgrim_id": "Pèlerin non trouvé"})
        
        ticket = Ticket(**validated_data)
        ticket.save()
        return ticket
    
    def update(self, instance, validated_data):
        """Mettre à jour un billet"""
        from pilgrims.models import Pilgrim
        
        # Gérer la référence au pèlerin si modifiée
        pilgrim_id = validated_data.pop('pilgrim_id', None)
        if pilgrim_id:
            try:
                pilgrim = Pilgrim.objects.get(id=pilgrim_id)
                instance.pilgrim = pilgrim
            except Pilgrim.DoesNotExist:
                raise serializers.ValidationError({"pilgrim_id": "Pèlerin non trouvé"})
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class TicketPaymentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    ticket_id = serializers.CharField(source='ticket.id', read_only=True)
    
    amount = serializers.FloatField(required=True)
    payment_date = serializers.DateTimeField(required=False)
    payment_mode = serializers.CharField(default='cash')
    reference_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    created_by = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    
    def create(self, validated_data):
        """Créer un paiement de billet"""
        payment = TicketPayment(**validated_data)
        payment.save()
        return payment
