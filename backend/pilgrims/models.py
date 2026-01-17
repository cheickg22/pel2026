from mongoengine import Document, StringField, DateTimeField, IntField, FloatField, BooleanField, ListField, EmbeddedDocument, EmbeddedDocumentField, EmailField, URLField, DynamicField
from datetime import datetime
from enum import Enum


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class Pilgrim(Document):
    first_name = StringField(required=True)
    last_name = StringField(required=True)
    email = EmailField()
    phone = StringField()
    passport_number = StringField(unique=True, sparse=True)
    passport_file = StringField()  # Chemin vers le fichier passeport
    gender = StringField(choices=[(g.value, g.value) for g in Gender], default=Gender.MALE.value)
    profession = StringField()
    date_of_birth = DateTimeField()
    place_of_birth = StringField()
    city_of_departure = StringField()
    departure_date = DateTimeField()
    
    total_cost = FloatField(default=0.0)
    total_paid = FloatField(default=0.0)
    remaining_amount = FloatField(default=0.0)
    payment_status = StringField(default=PaymentStatus.PENDING.value)
    
    is_archived = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'pilgrims',
        'indexes': ['email', 'passport_number', 'created_at', '-created_at']
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        self.remaining_amount = self.total_cost - self.total_paid
        if self.remaining_amount <= 0:
            self.payment_status = PaymentStatus.PAID.value
        else:
            self.payment_status = PaymentStatus.PENDING.value
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
