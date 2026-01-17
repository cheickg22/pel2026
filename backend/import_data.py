#!/usr/bin/env python
"""Script pour importer les données JSON dans MongoDB"""

import os
import sys
import django
import json
from datetime import datetime
from bson import ObjectId

# Configuration de Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from pilgrims.models import Pilgrim
from payments.models import Payment, AgencySettings
from expenses.models import Expense

def parse_datetime(value):
    """Convertir une string ISO en datetime"""
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace('Z', '+00:00'))
        except:
            return value
    return value

def import_all_data(json_file):
    """Importer toutes les données depuis un fichier JSON"""
    
    if not os.path.exists(json_file):
        print(f"❌ Fichier non trouvé: {json_file}")
        return
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"📦 Fichier chargé: {json_file}")
    print(f"📅 Date d'export: {data.get('export_date', 'N/A')}")
    print(f"\n📊 Contenu:")
    print(f"   - {len(data.get('pilgrims', []))} pèlerins")
    print(f"   - {len(data.get('payments', []))} paiements")
    print(f"   - {len(data.get('expenses', []))} dépenses")
    print(f"   - Paramètres agence: {'Oui' if data.get('agency_settings') else 'Non'}")
    
    # Demander confirmation
    print("\n⚠️  ATTENTION: Cette opération va:")
    print("   1. Supprimer TOUTES les données existantes")
    print("   2. Importer les nouvelles données")
    response = input("\n❓ Continuer ? (tapez 'OUI' en majuscules pour confirmer): ")
    
    if response != 'OUI':
        print("❌ Import annulé")
        return
    
    # Supprimer les données existantes
    print("\n🗑️  Suppression des données existantes...")
    Pilgrim.objects.all().delete()
    print("   ✅ Pèlerins supprimés")
    Payment.objects.all().delete()
    print("   ✅ Paiements supprimés")
    Expense.objects.all().delete()
    print("   ✅ Dépenses supprimées")
    
    # Importer les pèlerins
    print("\n📊 Import des pèlerins...")
    for pilgrim_data in data.get('pilgrims', []):
        try:
            # Supprimer _id pour laisser MongoDB générer un nouveau
            if '_id' in pilgrim_data:
                del pilgrim_data['_id']
            
            # Convertir les dates
            for field in ['date_of_birth', 'departure_date', 'created_at', 'updated_at']:
                if field in pilgrim_data and pilgrim_data[field]:
                    pilgrim_data[field] = parse_datetime(pilgrim_data[field])
            
            pilgrim = Pilgrim(**pilgrim_data)
            pilgrim.save()
        except Exception as e:
            print(f"   ⚠️  Erreur pour {pilgrim_data.get('first_name', 'N/A')}: {e}")
    
    print(f"   ✅ {Pilgrim.objects.count()} pèlerins importés")
    
    # Importer les paiements
    print("\n💳 Import des paiements...")
    for payment_data in data.get('payments', []):
        try:
            if '_id' in payment_data:
                del payment_data['_id']
            
            # Convertir les dates
            for field in ['payment_date', 'validated_at', 'created_at', 'updated_at']:
                if field in payment_data and payment_data[field]:
                    payment_data[field] = parse_datetime(payment_data[field])
            
            payment = Payment(**payment_data)
            payment.save()
        except Exception as e:
            print(f"   ⚠️  Erreur pour paiement: {e}")
    
    print(f"   ✅ {Payment.objects.count()} paiements importés")
    
    # Importer les dépenses
    print("\n📝 Import des dépenses...")
    for expense_data in data.get('expenses', []):
        try:
            if '_id' in expense_data:
                del expense_data['_id']
            
            # Convertir les dates
            for field in ['expense_date', 'validated_at', 'created_at', 'updated_at']:
                if field in expense_data and expense_data[field]:
                    expense_data[field] = parse_datetime(expense_data[field])
            
            expense = Expense(**expense_data)
            expense.save()
        except Exception as e:
            print(f"   ⚠️  Erreur pour dépense: {e}")
    
    print(f"   ✅ {Expense.objects.count()} dépenses importées")
    
    # Importer les paramètres agence
    if data.get('agency_settings'):
        print("\n⚙️  Import des paramètres agence...")
        try:
            settings_data = data['agency_settings']
            if '_id' in settings_data:
                del settings_data['_id']
            
            # Supprimer les anciens paramètres
            AgencySettings.objects.all().delete()
            
            # Convertir les dates
            for field in ['created_at', 'updated_at']:
                if field in settings_data and settings_data[field]:
                    settings_data[field] = parse_datetime(settings_data[field])
            
            settings = AgencySettings(**settings_data)
            settings.save()
            print(f"   ✅ Paramètres agence importés")
        except Exception as e:
            print(f"   ⚠️  Erreur: {e}")
    
    print("\n✅ Import terminé avec succès !")
    print("\n📊 Résumé:")
    print(f"   - {Pilgrim.objects.count()} pèlerins")
    print(f"   - {Payment.objects.count()} paiements")
    print(f"   - {Expense.objects.count()} dépenses")

if __name__ == '__main__':
    import_file = 'data_export.json'
    if len(sys.argv) > 1:
        import_file = sys.argv[1]
    
    try:
        import_all_data(import_file)
    except Exception as e:
        print(f"❌ Erreur lors de l'import: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
