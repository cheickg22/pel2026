from rest_framework import serializers
from treasury.models import Treasury, TreasuryBalance, TransactionType


class TreasurySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    transaction_type = serializers.ChoiceField(choices=[t.value for t in TransactionType])
    amount = serializers.FloatField()
    description = serializers.CharField()
    reference_id = serializers.CharField(required=False, allow_blank=True)
    reference_type = serializers.CharField(required=False, allow_blank=True)
    
    current_balance = serializers.FloatField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        return Treasury(**validated_data).save()


class TreasuryBalanceSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    total_income = serializers.FloatField()
    total_expenses = serializers.FloatField()
    current_balance = serializers.FloatField(read_only=True)
    last_updated = serializers.DateTimeField(read_only=True)
