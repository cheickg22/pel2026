from rest_framework import serializers
from expenses.models import Expense, ExpenseType, ExpenseScope


class ExpenseSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    expense_type = serializers.ChoiceField(choices=[t.value for t in ExpenseType])
    description = serializers.CharField()
    amount = serializers.FloatField()
    expense_date = serializers.DateTimeField()
    scope = serializers.ChoiceField(choices=[s.value for s in ExpenseScope], default=ExpenseScope.GLOBAL.value)
    
    pilgrim_ids = serializers.ListField(child=serializers.CharField(), default=[])
    
    created_by = serializers.CharField(read_only=True)
    validated_by = serializers.CharField(read_only=True)
    is_validated = serializers.BooleanField(default=False)
    validated_at = serializers.DateTimeField(read_only=True)
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        return Expense(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
