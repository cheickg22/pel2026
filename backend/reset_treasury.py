#!/usr/bin/env python
"""Script pour réinitialiser la trésorerie"""

import os
import sys
import django

# Configuration de Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from treasury.models import Treasury, TransactionType
from payments.models import Payment
from expenses.models import Expense
from pilgrims.models import Pilgrim

def reset_treasury():
    """Réinitialiser la trésorerie"""
    
    print("🔄 Réinitialisation de la trésorerie...\n")
    
    # Supprimer toutes les transactions existantes
    print("🗑️  Suppression des anciennes transactions...")
    old_count = Treasury.objects.count()
    Treasury.objects.all().delete()
    print(f"   ✅ {old_count} transactions supprimées\n")
    
    # Recréer les transactions depuis les paiements
    print("💳 Recréation des transactions de paiements...")
    payments = Payment.objects.all()
    payment_count = 0
    payment_total = 0
    
    for payment in payments:
        try:
            # Récupérer le pèlerin pour la description
            try:
                pilgrim = Pilgrim.objects.get(id=payment.pilgrim_id)
                description = f"Paiement de {pilgrim.first_name} {pilgrim.last_name}"
                if payment.description:
                    description += f" - {payment.description}"
                else:
                    description += " - Paiement pèlerinage"
            except Pilgrim.DoesNotExist:
                description = payment.description or "Paiement pèlerinage"
            
            Treasury.objects.create(
                transaction_type=TransactionType.INCOME.value,
                amount=payment.amount,
                description=description,
                reference_id=str(payment.id),
                reference_type='payment',
                created_at=payment.created_at
            )
            payment_count += 1
            payment_total += payment.amount
        except Exception as e:
            print(f"   ⚠️  Erreur pour paiement {payment.id}: {e}")
    
    print(f"   ✅ {payment_count} transactions de paiements créées")
    print(f"   💰 Total encaissé: {payment_total:,.0f} FCFA\n")
    
    # Recréer les transactions depuis les dépenses
    print("📝 Recréation des transactions de dépenses...")
    expenses = Expense.objects.all()
    expense_count = 0
    expense_total = 0
    
    for expense in expenses:
        try:
            Treasury.objects.create(
                transaction_type=TransactionType.EXPENSE.value,
                amount=expense.amount,
                description=expense.description,
                reference_id=str(expense.id),
                reference_type='expense',
                created_at=expense.created_at
            )
            expense_count += 1
            expense_total += expense.amount
        except Exception as e:
            print(f"   ⚠️  Erreur pour dépense {expense.id}: {e}")
    
    print(f"   ✅ {expense_count} transactions de dépenses créées")
    print(f"   💸 Total dépensé: {expense_total:,.0f} FCFA\n")
    
    # Calculer le solde final
    balance = payment_total - expense_total
    
    print(f"{'='*60}")
    print(f"✅ Réinitialisation terminée !")
    print(f"{'='*60}")
    print(f"\n📊 Résumé de la trésorerie:\n")
    print(f"   Paiements:  {payment_count} transactions → {payment_total:,.0f} FCFA")
    print(f"   Dépenses:   {expense_count} transactions → {expense_total:,.0f} FCFA")
    print(f"   {'─'*50}")
    print(f"   Solde:      {balance:,.0f} FCFA")
    print()

if __name__ == '__main__':
    try:
        # Demander confirmation
        print("\n⚠️  ATTENTION: Cette opération va:")
        print("   1. Supprimer TOUTES les transactions de trésorerie")
        print("   2. Les recréer à partir des paiements et dépenses existants")
        print()
        response = input("❓ Continuer ? (tapez 'OUI' en majuscules pour confirmer): ")
        
        if response != 'OUI':
            print("❌ Opération annulée")
            sys.exit(0)
        
        print()
        reset_treasury()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
