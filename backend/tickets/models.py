"""
Modèles pour la gestion de la billetterie
"""
from mongoengine import Document, StringField, DateTimeField, FloatField, BooleanField, ReferenceField
from datetime import datetime
from enum import Enum


class TicketStatus(str, Enum):
    """Statut du billet"""
    RESERVED = "reserved"      # Réservé
    CONFIRMED = "confirmed"    # Confirmé/Payé
    ISSUED = "issued"          # Émis
    CANCELLED = "cancelled"    # Annulé


class TicketType(str, Enum):
    """Type de billet"""
    OUTBOUND = "outbound"      # Aller
    RETURN = "return"          # Retour
    ROUND_TRIP = "round_trip"  # Aller-Retour


class Ticket(Document):
    """Modèle pour les billets d'avion"""
    pilgrim = ReferenceField('Pilgrim', required=False)  # Optionnel - uniquement si client est un pèlerin
    
    # Informations client (si pas un pèlerin)
    customer_first_name = StringField()
    customer_last_name = StringField()
    customer_phone = StringField()
    customer_email = StringField()
    
    # Informations du billet
    ticket_number = StringField(unique=True, sparse=True)  # Numéro de billet (PNR)
    ticket_type = StringField(
        choices=[(t.value, t.value) for t in TicketType],
        default=TicketType.ROUND_TRIP.value
    )
    
    # Vol aller
    outbound_flight = StringField()  # Numéro de vol aller
    outbound_date = DateTimeField()
    outbound_departure = StringField()  # Aéroport de départ
    outbound_arrival = StringField()    # Aéroport d'arrivée
    
    # Vol retour (optionnel si aller simple)
    return_flight = StringField()
    return_date = DateTimeField()
    return_departure = StringField()
    return_arrival = StringField()
    
    # Informations tarifaires
    ticket_price = FloatField(default=0.0)  # Prix du billet
    agency_fee = FloatField(default=0.0)     # Frais d'agence
    total_amount = FloatField(default=0.0)   # Montant total (prix + frais)
    
    # Informations paiement
    amount_paid = FloatField(default=0.0)
    remaining_amount = FloatField(default=0.0)
    
    # Statut
    status = StringField(
        choices=[(s.value, s.value) for s in TicketStatus],
        default=TicketStatus.RESERVED.value
    )
    
    # Compagnie aérienne
    airline = StringField()
    airline_code = StringField()  # Code IATA (ex: ET pour Ethiopian Airlines)
    
    # Notes et remarques
    notes = StringField()
    
    # Métadonnées
    created_by = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    issued_at = DateTimeField()      # Date d'émission du billet
    cancelled_at = DateTimeField()
    cancellation_reason = StringField()

    meta = {
        'collection': 'tickets',
        'indexes': ['pilgrim', 'ticket_number', 'status', '-created_at']
    }

    def save(self, *args, **kwargs):
        """Calculs automatiques avant sauvegarde"""
        self.updated_at = datetime.utcnow()
        
        # Calculer le montant total
        self.total_amount = self.ticket_price + self.agency_fee
        
        # Calculer le reste à payer
        self.remaining_amount = self.total_amount - self.amount_paid
        
        # Mettre à jour le statut selon le paiement
        if self.amount_paid >= self.total_amount and self.status == TicketStatus.RESERVED.value:
            self.status = TicketStatus.CONFIRMED.value
        
        super().save(*args, **kwargs)

    def get_customer_name(self):
        """Retourne le nom du client (pèlerin ou client externe)"""
        if self.pilgrim:
            return f"{self.pilgrim.first_name} {self.pilgrim.last_name}"
        else:
            return f"{self.customer_first_name or ''} {self.customer_last_name or ''}".strip()
    
    def get_customer_phone(self):
        """Retourne le téléphone du client"""
        if self.pilgrim:
            return self.pilgrim.phone
        else:
            return self.customer_phone
    
    def get_customer_email(self):
        """Retourne l'email du client"""
        if self.pilgrim:
            return self.pilgrim.email
        else:
            return self.customer_email

    def __str__(self):
        return f"Billet {self.ticket_number or 'N/A'} - {self.get_customer_name()}"


class TicketPayment(Document):
    """Paiements pour les billets"""
    ticket = ReferenceField('Ticket', required=True)
    amount = FloatField(required=True)
    payment_date = DateTimeField(default=datetime.utcnow)
    payment_mode = StringField(default='cash')
    reference_number = StringField()
    description = StringField()
    
    created_by = StringField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'ticket_payments',
        'indexes': ['ticket', '-payment_date']
    }

    def __str__(self):
        return f"Paiement {self.amount} - {self.ticket}"
