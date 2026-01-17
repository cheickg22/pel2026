from mongoengine import Document, StringField, DateTimeField, FloatField, DynamicField
from datetime import datetime
from enum import Enum


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class Treasury(Document):
    transaction_type = StringField(choices=[(t.value, t.value) for t in TransactionType], required=True)
    amount = FloatField(required=True)
    description = StringField(required=True)
    reference_id = StringField()
    reference_type = StringField()
    
    current_balance = FloatField(default=0.0)
    
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'treasury',
        'indexes': ['transaction_type', '-created_at', 'reference_id']
    }

    def __str__(self):
        return f"{self.transaction_type}: {self.amount}"


class TreasuryBalance(Document):
    total_income = FloatField(default=0.0)
    total_expenses = FloatField(default=0.0)
    current_balance = FloatField(default=0.0)
    
    last_updated = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'treasury_balance'
    }

    def calculate_balance(self):
        self.current_balance = self.total_income - self.total_expenses
        return self.current_balance

    def __str__(self):
        return f"Balance: {self.current_balance}"
