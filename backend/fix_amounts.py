#!/usr/bin/env python
"""Script pour corriger les montants des pèlerins et recalculer les totaux"""

import os
import sys
import django

# Configuration de Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from pilgrims.models import Pilgrim
from payments.models import Payment

def fix_pilgrim_amounts():
    """Corriger les montants des pèlerins et recalculer les totaux"""
    
    # Montant standard du pèlerinage
    STANDARD_COST = 4675000.0
    
    print("🔧 Correction des montants des pèlerins...\n")
    
    pilgrims = Pilgrim.objects.all()
    total_pilgrims = pilgrims.count()
    
    print(f"Total pèlerins trouvés: {total_pilgrims}\n")
    
    fixed_count = 0
    
    for pilgrim in pilgrims:
        # Recalculer le total payé à partir des paiements
        payments = Payment.objects.filter(pilgrim_id=str(pilgrim.id))
        total_paid = sum([p.amount for p in payments])
        
        # Vérifier si les montants sont incorrects
        needs_fix = False
        
        if pilgrim.total_cost != STANDARD_COST:
            print(f"⚠️  {pilgrim.first_name} {pilgrim.last_name}")
            print(f"   Total cost incorrect: {pilgrim.total_cost} → {STANDARD_COST}")
            needs_fix = True
        
        if pilgrim.total_paid != total_paid:
            print(f"⚠️  {pilgrim.first_name} {pilgrim.last_name}")
            print(f"   Total paid incorrect: {pilgrim.total_paid} → {total_paid}")
            needs_fix = True
        
        remaining = STANDARD_COST - total_paid
        
        if pilgrim.remaining_amount != remaining:
            if not needs_fix:
                print(f"⚠️  {pilgrim.first_name} {pilgrim.last_name}")
            print(f"   Remaining incorrect: {pilgrim.remaining_amount} → {remaining}")
            needs_fix = True
        
        # Recalculer le statut de paiement
        if total_paid == 0:
            payment_status = 'pending'
        elif total_paid >= STANDARD_COST:
            payment_status = 'completed'
        else:
            payment_status = 'partial'
        
        if pilgrim.payment_status != payment_status:
            if not needs_fix:
                print(f"⚠️  {pilgrim.first_name} {pilgrim.last_name}")
            print(f"   Status incorrect: {pilgrim.payment_status} → {payment_status}")
            needs_fix = True
        
        # Appliquer les corrections
        if needs_fix:
            pilgrim.total_cost = STANDARD_COST
            pilgrim.total_paid = total_paid
            pilgrim.remaining_amount = remaining
            pilgrim.payment_status = payment_status
            pilgrim.save()
            
            print(f"   ✅ Corrigé")
            print(f"   Total: {STANDARD_COST:,.0f} | Payé: {total_paid:,.0f} | Reste: {remaining:,.0f}")
            print()
            fixed_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ Correction terminée !")
    print(f"   {fixed_count} pèlerins corrigés sur {total_pilgrims}")
    print(f"{'='*60}\n")
    
    # Afficher un résumé
    print("📊 Résumé après correction:\n")
    
    pending = Pilgrim.objects.filter(payment_status='pending').count()
    partial = Pilgrim.objects.filter(payment_status='partial').count()
    completed = Pilgrim.objects.filter(payment_status='completed').count()
    
    print(f"   En attente (0 payé): {pending}")
    print(f"   Partiellement payé: {partial}")
    print(f"   Complètement payé: {completed}")
    print()
    
    total_expected = total_pilgrims * STANDARD_COST
    total_collected = sum([p.total_paid for p in Pilgrim.objects.all()])
    total_remaining = total_expected - total_collected
    
    print(f"   Total attendu: {total_expected:,.0f} FCFA")
    print(f"   Total collecté: {total_collected:,.0f} FCFA")
    print(f"   Total restant: {total_remaining:,.0f} FCFA")
    print()

if __name__ == '__main__':
    try:
        fix_pilgrim_amounts()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
