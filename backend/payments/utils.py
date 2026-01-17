"""
Utilitaires pour la génération de reçus PDF
"""
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfgen import canvas
from django.conf import settings
from django.core.files.storage import default_storage
import os


def generate_receipt_pdf(receipt):
    """
    Génère un PDF de reçu moderne avec logo et signature - optimisé pour une page
    """
    from payments.models import AgencySettings
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, 
                           rightMargin=1.5*cm, leftMargin=1.5*cm,
                           topMargin=1.5*cm, bottomMargin=1.5*cm)
    
    # Récupérer les paramètres de l'agence
    agency = AgencySettings.get_settings()
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Style personnalisés - tailles réduites pour compacité
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#1e3a8a'),
        spaceAfter=15,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=13,
        textColor=colors.HexColor('#2563eb'),
        spaceAfter=8,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=4,
    )
    
    small_style = ParagraphStyle(
        'SmallStyle',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#6b7280'),
        alignment=TA_CENTER,
    )
    
    # Contenu du document
    story = []
    
    # En-tête compact avec logo si disponible
    header_data = []
    if agency.logo and default_storage.exists(agency.logo):
        try:
            logo_path = os.path.join(settings.MEDIA_ROOT, agency.logo)
            if os.path.exists(logo_path) and logo_path.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                logo = Image(logo_path, width=2*cm, height=2*cm)
                header_data.append([logo, Paragraph(f"<b>{agency.name}</b>", heading_style)])
            else:
                header_data.append(['', Paragraph(f"<b>{agency.name}</b>", heading_style)])
        except Exception as e:
            print(f"Erreur chargement logo: {e}")
            header_data.append(['', Paragraph(f"<b>{agency.name}</b>", heading_style)])
    else:
        header_data.append(['', Paragraph(f"<b>{agency.name}</b>", heading_style)])
    
    if header_data:
        header_table = Table(header_data, colWidths=[2.5*cm, 15*cm])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (0,0), (0,0), 'LEFT'),
            ('ALIGN', (1,0), (1,0), 'CENTER'),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 0.3*cm))
    
    # Informations agence compactes
    if agency.address or agency.phone or agency.email:
        agency_info = []
        if agency.address:
            agency_info.append(agency.address)
        if agency.phone:
            agency_info.append(f"Tél: {agency.phone}")
        if agency.email:
            agency_info.append(f"Email: {agency.email}")
        
        story.append(Paragraph(" | ".join(agency_info), small_style))
        story.append(Spacer(1, 0.2*cm))
    
    # Ligne de séparation
    line_data = [['']]
    line_table = Table(line_data, colWidths=[17.5*cm])
    line_table.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,0), 2, colors.HexColor('#2563eb')),
    ]))
    story.append(line_table)
    story.append(Spacer(1, 0.3*cm))
    
    # Titre du reçu
    story.append(Paragraph("REÇU DE PAIEMENT", title_style))
    story.append(Spacer(1, 0.2*cm))
    
    # Numéro et date du reçu - sur une ligne
    receipt_info_data = [
        [Paragraph(f"<b>N° de Reçu:</b> {receipt.receipt_number}", normal_style), 
         Paragraph(f"<b>Date:</b> {receipt.payment_date.strftime('%d/%m/%Y')}", ParagraphStyle('RightAlign', parent=normal_style, alignment=TA_RIGHT))]
    ]
    
    receipt_info_table = Table(receipt_info_data, colWidths=[9*cm, 8.5*cm])
    receipt_info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eff6ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#2563eb')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(receipt_info_table)
    story.append(Spacer(1, 0.4*cm))
    
    # Informations du pèlerin - compact
    story.append(Paragraph("Informations du Pèlerin", heading_style))
    pilgrim_data = [
        [Paragraph("<b>Nom:</b>", normal_style), 
         Paragraph(receipt.pilgrim_name, normal_style)],
    ]
    if receipt.pilgrim_email:
        pilgrim_data.append(
            [Paragraph("<b>Email:</b>", normal_style), 
             Paragraph(receipt.pilgrim_email, normal_style)]
        )
    if receipt.pilgrim_phone:
        pilgrim_data.append(
            [Paragraph("<b>Tél:</b>", normal_style), 
             Paragraph(receipt.pilgrim_phone, normal_style)]
        )
    
    pilgrim_table = Table(pilgrim_data, colWidths=[3*cm, 14.5*cm])
    pilgrim_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(pilgrim_table)
    story.append(Spacer(1, 0.4*cm))
    
    # Détails du paiement
    story.append(Paragraph("Détails du Paiement", heading_style))
    
    payment_mode_labels = {
        'cash': 'Espèces',
        'card': 'Carte',
        'bank_transfer': 'Virement',
        'check': 'Chèque',
        'mobile_money': 'Mobile Money',
    }
    
    # Tableau détails paiement + résumé financier combinés - compact
    payment_data = [
        [Paragraph("<b>Description</b>", normal_style),
         Paragraph("<b>Mode</b>", normal_style),
         Paragraph("<b>Montant</b>", normal_style)],
        [Paragraph(receipt.description or "Paiement pèlerinage", normal_style),
         Paragraph(payment_mode_labels.get(receipt.payment_mode, receipt.payment_mode), normal_style),
         Paragraph(f"<b>{receipt.amount:,.0f} FCFA</b>", normal_style)],
    ]
    
    payment_table = Table(payment_data, colWidths=[7.5*cm, 4.5*cm, 5.5*cm])
    payment_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2563eb')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#d1d5db')),
        ('TOPPADDING', (0,1), (-1,-1), 6),
        ('BOTTOMPADDING', (0,1), (-1,-1), 6),
    ]))
    story.append(payment_table)
    story.append(Spacer(1, 0.3*cm))
    
    # Résumé financier compact
    financial_summary_data = [
        [Paragraph("<b>Coût total</b>", normal_style),
         Paragraph(f"{receipt.total_cost:,.0f} FCFA", ParagraphStyle('FinancialAmount', parent=normal_style, alignment=TA_RIGHT))],
        [Paragraph("<b>Total payé</b>", normal_style),
         Paragraph(f"<font color='#10b981'>{receipt.total_paid:,.0f} FCFA</font>", ParagraphStyle('PaidAmount', parent=normal_style, alignment=TA_RIGHT))],
        [Paragraph("<b>Reliquat</b>", normal_style),
         Paragraph(f"<font color='#ef4444'>{receipt.remaining_amount:,.0f} FCFA</font>", ParagraphStyle('RemainingAmount', parent=normal_style, alignment=TA_RIGHT))],
    ]
    
    financial_summary_table = Table(financial_summary_data, colWidths=[11.5*cm, 6*cm])
    financial_summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f9fafb')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#d1d5db')),
        ('LINEBELOW', (0,0), (-1,1), 1, colors.HexColor('#e5e7eb')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(financial_summary_table)
    story.append(Spacer(1, 0.4*cm))
    
    # Total de ce versement - compact
    total_data = [[Paragraph("<b>MONTANT DE CE VERSEMENT</b>", ParagraphStyle('TotalLabel', parent=normal_style, fontSize=12, textColor=colors.white)), 
                   Paragraph(f"<b>{receipt.amount:,.0f} FCFA</b>", ParagraphStyle('TotalAmount', parent=normal_style, fontSize=14, textColor=colors.white, alignment=TA_RIGHT))]]
    
    total_table = Table(total_data, colWidths=[11.5*cm, 6*cm])
    total_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#10b981')),
        ('ALIGN', (0,0), (0,0), 'LEFT'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(total_table)
    story.append(Spacer(1, 0.6*cm))
    
    # Signature - alignée à droite avec signature au-dessus du nom
    signature_elements = []
    
    # Charger la signature si disponible
    if agency.signature and default_storage.exists(agency.signature):
        try:
            signature_path = os.path.join(settings.MEDIA_ROOT, agency.signature)
            if os.path.exists(signature_path) and signature_path.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                signature_img = Image(signature_path, width=3*cm, height=1.5*cm)
                signature_elements.append(signature_img)
        except Exception as e:
            print(f"Erreur chargement signature: {e}")
    
    # Ajouter nom et titre centrés
    signature_elements.append(Paragraph(f"<b>{agency.responsible_name}</b>", 
                                       ParagraphStyle('SignatureName', parent=normal_style, alignment=TA_CENTER, fontSize=11)))
    signature_elements.append(Paragraph(agency.responsible_title, 
                                       ParagraphStyle('SignatureTitle', parent=small_style, alignment=TA_CENTER)))
    
    # Créer tableau avec colonne vide à gauche et signature à droite
    signature_data = [['']]
    for elem in signature_elements:
        signature_data.append(['', elem])
    
    signature_table = Table(signature_data, colWidths=[11*cm, 6.5*cm])
    signature_table.setStyle(TableStyle([
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
        ('VALIGN', (1,0), (1,-1), 'MIDDLE'),
        ('TOPPADDING', (1,0), (1,-1), 2),
        ('BOTTOMPADDING', (1,0), (1,-1), 2),
    ]))
    story.append(signature_table)
    story.append(Spacer(1, 0.4*cm))
    
    # Pied de page - compact
    footer_text = "Ce reçu atteste du paiement reçu. Merci pour votre confiance."
    if receipt.is_cancelled:
        footer_text = f"<b><font color='red'>REÇU ANNULÉ - {receipt.cancelled_reason}</font></b>"
    
    story.append(Paragraph(footer_text, small_style))
    
    if agency.registration_number or agency.tax_id:
        footer_info = []
        if agency.registration_number:
            footer_info.append(f"N° enreg.: {agency.registration_number}")
        if agency.tax_id:
            footer_info.append(f"N° Fiscal: {agency.tax_id}")
        story.append(Paragraph(" | ".join(footer_info), ParagraphStyle('Footer', parent=small_style, fontSize=8)))
    
    # Construire le PDF
    doc.build(story)
    
    buffer.seek(0)
    return buffer
