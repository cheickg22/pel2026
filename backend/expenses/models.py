from mongoengine import Document, StringField, DateTimeField, FloatField, BooleanField, ListField
from datetime import datetime
from enum import Enum


class ExpenseType(str, Enum):
    ACCOMMODATION = "accommodation"
    TRANSPORTATION = "transportation"
    MEALS = "meals"
    VISA = "visa"
    INSURANCE = "insurance"
    GUIDE = "guide"
    PERMITS = "permits"
    OTHER = "other"


class ExpenseScope(str, Enum):
    GLOBAL = "global"
    INDIVIDUAL = "individual"


class Expense(Document):
    expense_type = StringField(choices=[(t.value, t.value) for t in ExpenseType], required=True)
    description = StringField(required=True)
    amount = FloatField(required=True)
    expense_date = DateTimeField(required=True)
    scope = StringField(choices=[(s.value, s.value) for s in ExpenseScope], default=ExpenseScope.GLOBAL.value)
    
    pilgrim_ids = ListField(StringField(), default=[])
    
    created_by = StringField()
    validated_by = StringField()
    is_validated = BooleanField(default=False)
    validated_at = DateTimeField()
    
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'expenses',
        'indexes': ['expense_type', 'expense_date', '-expense_date', 'scope', 'created_at']
    }

    def __str__(self):
        return f"{self.expense_type}: {self.amount} - {self.description}"
