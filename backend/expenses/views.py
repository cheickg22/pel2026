from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from expenses.models import Expense
from expenses.serializers import ExpenseSerializer
from treasury.models import Treasury, TransactionType
from django.utils import timezone


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        expense_type = self.request.query_params.get('type')
        scope = self.request.query_params.get('scope')
        queryset = Expense.objects()
        if expense_type:
            queryset = queryset.filter(expense_type=expense_type)
        if scope:
            queryset = queryset.filter(scope=scope)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expense_data = serializer.validated_data
        expense_data['created_by'] = request.user.username
        expense = Expense(**expense_data).save()
        
        Treasury.objects.create(
            transaction_type=TransactionType.EXPENSE.value,
            amount=request.data['amount'],
            description=request.data['description'],
            reference_id=str(expense.id),
            reference_type='expense'
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
            expense = Expense.objects.get(id=kwargs['pk'])
            serializer = self.get_serializer(expense)
            return Response(serializer.data)
        except Expense.DoesNotExist:
            return Response({"detail": "Expense not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        expenses = self.get_queryset()
        total_expenses = sum(e.amount for e in expenses)
        expense_count = expenses.count()
        
        by_type = {}
        for exp in expenses:
            if exp.expense_type not in by_type:
                by_type[exp.expense_type] = 0
            by_type[exp.expense_type] += exp.amount
        
        return Response({
            'total_expenses': total_expenses,
            'expense_count': expense_count,
            'by_type': by_type,
        })

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        try:
            expense = Expense.objects.get(id=pk)
            expense.is_validated = True
            expense.validated_by = request.user.username
            expense.validated_at = timezone.now()
            expense.save()
            serializer = self.get_serializer(expense)
            return Response(serializer.data)
        except Expense.DoesNotExist:
            return Response({"detail": "Expense not found"}, status=status.HTTP_404_NOT_FOUND)
