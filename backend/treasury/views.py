from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from treasury.models import Treasury, TreasuryBalance, TransactionType
from treasury.serializers import TreasurySerializer, TreasuryBalanceSerializer


class TreasuryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TreasurySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        transaction_type = self.request.query_params.get('type')
        queryset = Treasury.objects()
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        return queryset.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        try:
            transaction = Treasury.objects.get(id=kwargs['pk'])
            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
        except Treasury.DoesNotExist:
            return Response({"detail": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def balance(self, request):
        try:
            balance = TreasuryBalance.objects.first()
            if not balance:
                balance = TreasuryBalance().save()
                balance.reload()
            
            income = Treasury.objects(transaction_type=TransactionType.INCOME.value).sum('amount')
            expenses = Treasury.objects(transaction_type=TransactionType.EXPENSE.value).sum('amount')
            
            balance.total_income = income or 0
            balance.total_expenses = expenses or 0
            balance.calculate_balance()
            balance.save()
            
            serializer = TreasuryBalanceSerializer(balance)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        income = sum(t.amount for t in Treasury.objects(transaction_type=TransactionType.INCOME.value))
        expenses = sum(t.amount for t in Treasury.objects(transaction_type=TransactionType.EXPENSE.value))
        
        return Response({
            'total_income': income,
            'total_expenses': expenses,
            'balance': income - expenses,
            'income_count': Treasury.objects(transaction_type=TransactionType.INCOME.value).count(),
            'expense_count': Treasury.objects(transaction_type=TransactionType.EXPENSE.value).count(),
        })
