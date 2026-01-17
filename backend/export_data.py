#!/usr/bin/env python
"""Script pour exporter les données MongoDB en JSON"""

import os
import sys
import django
import json
from datetime import datetime

# Configuration de Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from pilgrims.models import Pilgrim
from payments.models import Payment
from expenses.models import Expense
from receipts.models import AgencySettings

def serialize_document(doc):
    """Convertir un document MongoEngine en dict sérialisable"""
    data = doc.to_mongo().to_dict()
    # Convertir ObjectId en string
    if '_id' in data:
        data['_id'] = str(data['_id'])
    # Convertir les dates en ISO format
    for key, value in data.items():
        if isinstance(value, datetime):
            data[key] = value.isoformat()
    return data

def export_all_data():
    """Exporter toutes les données"""
    export_data = {
        'pilgrims': [],
        'payments': [],
        'expenses': [],
        'agency_settings': None,
        'export_date': datetime.now().isoformat()
    }
    
    # Exporter les pèlerins
    print("📊 Export des pèlerins...")
    pilgrims = Pilgrim.objects.all()
    for pilgrim in pilgrims:
        export_data['pilgrims'].append(serialize_document(pilgrim))
    print(f"   ✅ {len(export_data['pilgrims'])} pèlerins exportés")
    
    # Exporter les paiements
    print("💳 Export des paiements...")
    payments = Payment.objects.all()
    for payment in payments:
        export_data['payments'].append(serialize_document(payment))
    print(f"   ✅ {len(export_data['payments'])} paiements exportés")
    
    # Exporter les dépenses
    print("📝 Export des dépenses...")
    expenses = Expense.objects.all()
    for expense in expenses:
        export_data['expenses'].append(serialize_document(expense))
    print(f"   ✅ {len(export_data['expenses'])} dépenses exportées")
    
    # Exporter les paramètres de l'agence
    print("⚙️  Export des paramètres agence...")
    try:
        settings = AgencySettings.objects.first()
        if settings:
            export_data['agency_settings'] = serialize_document(settings)
            print(f"   ✅ Paramètres agence exportés")
        else:
            print(f"   ⚠️  Aucun paramètre agence trouvé")
    except Exception as e:
        print(f"   ⚠️  Erreur: {e}")
    
    # Sauvegarder dans un fichier
    output_file = 'data_export.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Export terminé ! Fichier créé: {output_file}")
    print(f"📦 Taille du fichier: {os.path.getsize(output_file) / 1024:.2f} KB")
    
    return output_file

if __name__ == '__main__':
    try:
        export_all_data()
    except Exception as e:
        print(f"❌ Erreur lors de l'export: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
