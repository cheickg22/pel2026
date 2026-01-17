from rest_framework import serializers
from payments.models import AgencySettings, Receipt


class AgencySettingsSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=200)
    tagline = serializers.CharField(max_length=200, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    
    logo = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    signature = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    responsible_name = serializers.CharField(max_length=200)
    responsible_title = serializers.CharField(max_length=200)
    
    registration_number = serializers.CharField(required=False, allow_blank=True)
    tax_id = serializers.CharField(required=False, allow_blank=True)
    
    receipt_prefix = serializers.CharField(max_length=10)
    
    # Couleurs personnalisées
    primary_color = serializers.CharField(max_length=7, required=False)
    secondary_color = serializers.CharField(max_length=7, required=False)
    sidebar_color = serializers.CharField(max_length=7, required=False)
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        settings = AgencySettings(**validated_data)
        settings.save()
        return settings

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ReceiptSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    receipt_number = serializers.CharField(read_only=True)
    payment_id = serializers.CharField(source='payment.id', read_only=True)
    pilgrim_id = serializers.CharField(source='pilgrim.id', read_only=True)
    
    amount = serializers.FloatField()
    payment_mode = serializers.CharField()
    payment_date = serializers.DateTimeField()
    description = serializers.CharField(required=False, allow_blank=True)
    
    total_cost = serializers.FloatField(read_only=True)
    total_paid = serializers.FloatField(read_only=True)
    remaining_amount = serializers.FloatField(read_only=True)
    
    pilgrim_name = serializers.CharField()
    pilgrim_email = serializers.EmailField(required=False, allow_blank=True)
    pilgrim_phone = serializers.CharField(required=False, allow_blank=True)
    
    issued_by_id = serializers.CharField(read_only=True)
    issued_by_name = serializers.CharField(read_only=True)
    issued_at = serializers.DateTimeField(read_only=True)
    
    is_cancelled = serializers.BooleanField(read_only=True)
    cancelled_at = serializers.DateTimeField(read_only=True)
    cancelled_reason = serializers.CharField(read_only=True)
    
    created_at = serializers.DateTimeField(read_only=True)
