#!/usr/bin/env python
"""
Script d'import des pèlerins réels
Supprime les données de test et insère les pèlerins réels
"""

import os
import sys
import django

# Configuration Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from pilgrims.models import Pilgrim
from payments.models import Payment
from treasury.models import Treasury
from datetime import datetime

# Liste des pèlerins réels
PILGRIMS_DATA = [
    {"first_name": "M'Bamoussa", "last_name": "SAKILIBA"},
    {"first_name": "Djimé", "last_name": "MARIKO"},
    {"first_name": "Alassane", "last_name": "MARIKO"},
    {"first_name": "Abdoulaye", "last_name": "KEITA"},
    {"first_name": "Moussa", "last_name": "DIABATE"},
    {"first_name": "Salimata", "last_name": "BAGAYOKO"},
    {"first_name": "Mariam", "last_name": "BAMBA"},
    {"first_name": "Fatoumata", "last_name": "MAIGA"},
    {"first_name": "Mamoutou", "last_name": "MAIGA"},
    {"first_name": "Lailah", "last_name": "KOUNTA"},
    {"first_name": "Najma", "last_name": "SOUMBA"},
    {"first_name": "Kady", "last_name": "SAMAKE"},
    {"first_name": "Hama Fanta", "last_name": "SAMAKE"},
    {"first_name": "Aminata", "last_name": "DIALLO"},
    {"first_name": "Bafil M Diop", "last_name": "TOURE"},
    {"first_name": "Ounaf", "last_name": "BALAYIRA"},
    {"first_name": "Kadiatou", "last_name": "KONATE"},
    {"first_name": "Aby", "last_name": "TOURE"},
    {"first_name": "Sadiyo", "last_name": "SAMAKE"},
    {"first_name": "Moufida", "last_name": "DIATE"},
    {"first_name": "Massira", "last_name": "DIARTE"},
    {"first_name": "Djénéba", "last_name": "DIAKITE"},
    {"first_name": "Abdine", "last_name": "KOUNTA"},
    {"first_name": "Soumaya", "last_name": "TRAORE"},
    {"first_name": "Aliou", "last_name": "DIARRA"},
    {"first_name": "Aminata", "last_name": "DIARTE"},
    {"first_name": "Djelika", "last_name": "SOGORE"},
    {"first_name": "Kadiatou", "last_name": "SAMAKE"},
    {"first_name": "Younousse", "last_name": "SYLLA"},
    {"first_name": "Kothembo", "last_name": "SAMAKE"},
    {"first_name": "Djita Djibril", "last_name": "DJAGMO"},
    {"first_name": "Roukiatou", "last_name": "SAMAKO"},
    {"first_name": "Issou", "last_name": "TOULEBA"},
    {"first_name": "Bintou", "last_name": "KAMARA"},
    {"first_name": "Diaba", "last_name": "DIANE"},
    {"first_name": "Kambire Abo", "last_name": "DIENE"},
    {"first_name": "Oumar", "last_name": "KONATE"},
    {"first_name": "Idrissa", "last_name": "TRAORE"},
    {"first_name": "Mamadou Abo", "last_name": "KONTA"},
    {"first_name": "Soumaila", "last_name": "TOULEMA"},
    {"first_name": "Djénéba", "last_name": "DIABO"},
    {"first_name": "Maïmouna", "last_name": "TRAORE"},
]

def clear_database():
    """Supprime toutes les données de test"""
    print("=== NETTOYAGE DE LA BASE DE DONNÉES ===\n")
    
    # Supprimer les transactions de trésorerie
    treasury_count = Treasury.objects.count()
    Treasury.objects.delete()
    print(f"✅ {treasury_count} transactions de trésorerie supprimées")
    
    # Supprimer les paiements
    payment_count = Payment.objects.count()
    Payment.objects.delete()
    print(f"✅ {payment_count} paiements supprimés")
    
    # Supprimer les pèlerins
    pilgrim_count = Pilgrim.objects.count()
    Pilgrim.objects.delete()
    print(f"✅ {pilgrim_count} pèlerins supprimés")
    
    print(f"\n📊 Total: {treasury_count + payment_count + pilgrim_count} documents supprimés\n")

def import_pilgrims():
    """Import les pèlerins réels"""
    print("=== IMPORT DES PÈLERINS RÉELS ===\n")
    
    created_count = 0
    errors = []
    
    for data in PILGRIMS_DATA:
        try:
            pilgrim = Pilgrim(
                first_name=data['first_name'],
                last_name=data['last_name'],
                gender='male',  # Valeur par défaut, à modifier si nécessaire
                total_cost=4675000.0,  # Coût standard Hajj 2026
            )
            pilgrim.save()
            created_count += 1
            print(f"✅ {created_count:2d}. {pilgrim.first_name} {pilgrim.last_name}")
            
        except Exception as e:
            error_msg = f"❌ Erreur pour {data['first_name']} {data['last_name']}: {e}"
            errors.append(error_msg)
            print(error_msg)
    
    print(f"\n📊 RÉSUMÉ:")
    print(f"   - Pèlerins créés: {created_count}/{len(PILGRIMS_DATA)}")
    if errors:
        print(f"   - Erreurs: {len(errors)}")
        print("\n⚠️  ERREURS:")
        for error in errors:
            print(f"   {error}")
    else:
        print(f"   - Erreurs: 0")
        print(f"\n✅ IMPORT RÉUSSI!")

def main():
    print("\n" + "="*60)
    print("  IMPORT DES PÈLERINS RÉELS - HAJJ 2026")
    print("="*60 + "\n")
    
    # Confirmation
    print("⚠️  ATTENTION: Cette opération va:")
    print("   1. Supprimer TOUTES les données existantes (pèlerins, paiements, trésorerie)")
    print("   2. Importer les 42 pèlerins réels")
    print()
    
    response = input("Voulez-vous continuer? (oui/non): ").strip().lower()
    
    if response not in ['oui', 'o', 'yes', 'y']:
        print("\n❌ Opération annulée")
        return
    
    print()
    
    # Nettoyage
    clear_database()
    
    # Import
    import_pilgrims()
    
    print("\n" + "="*60)
    print("  FIN DE L'IMPORT")
    print("="*60 + "\n")

if __name__ == '__main__':
    main()
