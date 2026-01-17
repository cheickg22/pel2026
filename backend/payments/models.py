from mongoengine import Document, StringField, DateTimeField, FloatField, ReferenceField, BooleanField
from datetime import datetime


class Payment(Document):
    """Modèle de paiement"""
    pilgrim_id = StringField(required=True)
    amount = FloatField(required=True)
    payment_mode = StringField(required=True)  # cash, card, bank_transfer, mobile_money, check
    payment_date = DateTimeField(required=True)
    description = StringField()
    reference_number = StringField()
    
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'payments',
        'indexes': ['pilgrim_id', '-payment_date', '-created_at']
    }
    
    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Payment {self.id} - {self.amount} FCFA"


class AgencySettings(Document):
    """Configuration de l'agence pour les reçus"""
    name = StringField(required=True, default="Agence de Pèlerinage")
    tagline = StringField(default="Gestion Hadj & Omra")  # Slogan/sous-titre
    address = StringField()
    phone = StringField()
    email = StringField()
    website = StringField()
    
    # Logo et signature
    logo = StringField()  # Chemin vers le fichier logo
    signature = StringField()  # Chemin vers le fichier signature
    
    # Responsable
    responsible_name = StringField(default="Le Responsable")
    responsible_title = StringField(default="Directeur Général")
    
    # Informations légales
    registration_number = StringField()  # Numéro d'enregistrement
    tax_id = StringField()  # Numéro fiscal
    
    # Template settings
    receipt_prefix = StringField(default="REC")  # Préfixe des numéros de reçu
    
    # Personnalisation des couleurs
    primary_color = StringField(default="#4f46e5")  # Couleur principale (indigo-600)
    secondary_color = StringField(default="#6366f1")  # Couleur secondaire (indigo-500)
    sidebar_color = StringField(default="#1e1b4b")  # Couleur sidebar (indigo-950)
    
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'agency_settings',
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        """Récupère ou crée les paramètres de l'agence"""
        settings = cls.objects.first()
        if not settings:
            settings = cls()
            settings.save()
        return settings


class Receipt(Document):
    """Reçu de paiement"""
    receipt_number = StringField(required=True, unique=True)
    payment = ReferenceField('Payment', required=True)  # Référence au paiement
    pilgrim = ReferenceField('Pilgrim', required=True)  # Référence au pèlerin
    
    # Informations du reçu
    amount = FloatField(required=True)  # Montant de ce paiement
    payment_mode = StringField(required=True)
    payment_date = DateTimeField(required=True)
    description = StringField()
    
    # Informations financières du pèlerin (snapshot au moment de la génération)
    total_cost = FloatField(default=0.0)  # Coût total du pèlerinage
    total_paid = FloatField(default=0.0)  # Total payé après ce paiement
    remaining_amount = FloatField(default=0.0)  # Reliquat restant
    
    # Informations pèlerin (snapshot au moment de la génération)
    pilgrim_name = StringField(required=True)
    pilgrim_email = StringField()
    pilgrim_phone = StringField()
    
    # Métadonnées
    issued_by_id = StringField()  # ID de l'utilisateur qui a généré le reçu
    issued_by_name = StringField()  # Nom de l'utilisateur qui a généré le reçu
    issued_at = DateTimeField(default=datetime.utcnow)
    
    # Statut
    is_cancelled = BooleanField(default=False)
    cancelled_at = DateTimeField()
    cancelled_reason = StringField()
    
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'receipts',
        'indexes': ['receipt_number', 'payment', 'pilgrim', '-created_at']
    }

    @classmethod
    def generate_receipt_number(cls):
        """Génère un numéro de reçu unique"""
        settings = AgencySettings.get_settings()
        prefix = settings.receipt_prefix
        
        # Trouver le dernier numéro
        last_receipt = cls.objects.order_by('-created_at').first()
        
        if last_receipt and last_receipt.receipt_number.startswith(prefix):
            # Extraire le numéro et incrémenter
            try:
                last_number = int(last_receipt.receipt_number.replace(prefix, '').replace('-', ''))
                new_number = last_number + 1
            except:
                new_number = 1
        else:
            new_number = 1
        
        # Format: REC-YYYYMMDD-XXXX
        date_str = datetime.now().strftime('%Y%m%d')
        return f"{prefix}-{date_str}-{new_number:04d}"

    def __str__(self):
        return f"{self.receipt_number} - {self.pilgrim_name}"
