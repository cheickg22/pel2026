from rest_framework import serializers
from pilgrims.models import Pilgrim, Gender, PaymentStatus


class PilgrimSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    passport_number = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    passport_file = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    gender = serializers.ChoiceField(choices=[g.value for g in Gender], required=False, default='male')
    profession = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    date_of_birth = serializers.DateTimeField(required=False, allow_null=True, input_formats=['%Y-%m-%d', '%Y-%m-%dT%H:%M', '%Y-%m-%dT%H:%M:%S', 'iso-8601'])
    place_of_birth = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city_of_departure = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    departure_date = serializers.DateTimeField(required=False, allow_null=True, input_formats=['%Y-%m-%d', '%Y-%m-%dT%H:%M', '%Y-%m-%dT%H:%M:%S', 'iso-8601'])
    
    total_cost = serializers.FloatField(default=0.0, required=False)
    total_paid = serializers.FloatField(default=0.0, required=False)
    remaining_amount = serializers.FloatField(read_only=True)
    payment_status = serializers.CharField(read_only=True)
    
    is_archived = serializers.BooleanField(default=False, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    def validate_date_of_birth(self, value):
        """Convertir chaîne vide en None"""
        if value == '' or value is None:
            return None
        return value
    
    def validate_departure_date(self, value):
        """Convertir chaîne vide en None"""
        if value == '' or value is None:
            return None
        return value

    def create(self, validated_data):
        # Nettoyer les valeurs vides avant création
        cleaned_data = {k: v for k, v in validated_data.items() if v not in ('', None)}
        pilgrim = Pilgrim(**cleaned_data)
        pilgrim.save()
        return pilgrim

    def update(self, instance, validated_data):
        # Nettoyer les valeurs vides avant mise à jour
        for attr, value in validated_data.items():
            if value not in ('', None):
                setattr(instance, attr, value)
        instance.save()
        return instance
