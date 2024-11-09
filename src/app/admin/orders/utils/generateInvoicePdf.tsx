// src/app/admin/orders/utils/generateInvoicePdf.tsx

import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
  pdf,

} from '@react-pdf/renderer';
import { Order } from '../types'; // Ensure the path is correct
import { formatCurrency } from '@/lib/formatters';






// Register a custom font
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/fonts/Roboto-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/Roboto-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 100,
  },
  companyDetails: {
    textAlign: 'right',
  },
  customerDetails: {
    marginBottom: 20,
  },
  orderDetails: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 8,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  tableCol: {
    flex: 1,
  },
  tableCell: {
    fontSize: 10,
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totals: {
    width: '50%',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 10,
    color: '#777',
  },
});

// Helper function to safely parse dates
const parseDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  const parsedDate = new Date(date);
  return isNaN(parsedDate.getTime()) ? 'N/A' : parsedDate.toLocaleDateString();
};

// InvoiceDocument Component
const InvoiceDocument: React.FC<{ order: Order }> = ({ order }) => {

  // Destructure and provide default values
  const {
    id = 'N/A',
    user,
    orderItems = [],
    pricePaidInCents = 0,
    status = 'N/A',
    createdAt='N/A',
    isDelivery = false,
    deliveryDate='N/A',
    deliveryTime = 'N/A',
    recipientName = 'N/A',
    deliveryAddress = 'N/A',
    deliveryInstructions = 'N/A',
    postalCode = 'N/A',
    updatedAt='N/A',
  } = order;

  const userName = user?.name || 'N/A';
  const userEmail = user?.email || 'N/A';

  // Calculate totals
  const subtotal = pricePaidInCents / 100;
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            src="/logo.png" // Ensure this image exists in the public folder
            style={styles.logo}
          />
          <View style={styles.companyDetails}>
            <Text>Company Name</Text>
            <Text>1234 Street Address</Text>
            <Text>City, State, ZIP</Text>
            <Text>Email: info@company.com</Text>
            <Text>Phone: (123) 456-7890</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.customerDetails}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
            Invoice To:
          </Text>
          <Text>{recipientName}</Text>
          <Text>{deliveryAddress}</Text>
          <Text>{postalCode}</Text>
          <Text>{userEmail}</Text>
        </View>

        {/* Order Details */}
        <View style={styles.orderDetails}>
          <Text>Invoice #: {id}</Text>
          <Text>Order Date: {parseDate(createdAt)}</Text>
          <Text>Status: {status}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCol, { flex: 2 }, styles.tableCell]}>
            Item
          </Text>
          <Text style={[styles.tableCol, styles.tableCell]}>Quantity</Text>
          <Text style={[styles.tableCol, styles.tableCell]}>Price</Text>
          <Text style={[styles.tableCol, styles.tableCell]}>Subtotal</Text>
        </View>
        {orderItems.length > 0 ? (
          order.orderItems.map((item) => {
            // Destructure item properties with defaults
            const {
              id: itemId = 'N/A',
              quantity = 0,
              product,
              description = 'N/A',
              productId = 'N/A',
              subtotalInCents = 0,
            } = item;

            // Determine item name
            const itemName =
              product?.name ||
              productId ||
              description ||
              'Item';

            // Calculate price per unit
            const pricePerUnit =
              quantity > 0 ? subtotalInCents / 100 / quantity : 0;

            const subtotal = subtotalInCents / 100;

            return (
              <View key={itemId} style={styles.tableRow}>
                <Text style={[styles.tableCol, { flex: 2 }, styles.tableCell]}>
                  {itemName}
                </Text>
                <Text style={[styles.tableCol, styles.tableCell]}>
                  {quantity}
                </Text>
                <Text style={[styles.tableCol, styles.tableCell]}>
                  {formatCurrency(pricePerUnit)}
                </Text>
                <Text style={[styles.tableCol, styles.tableCell]}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2 }, styles.tableCell]}>
              No items
            </Text>
            <Text style={[styles.tableCol, styles.tableCell]}>-</Text>
            <Text style={[styles.tableCol, styles.tableCell]}>-</Text>
            <Text style={[styles.tableCol, styles.tableCell]}>-</Text>
          </View>
        )}

        {/* Total Amount */}
        <View style={styles.totalsContainer}>
          <View style={styles.totals}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>Subtotal:</Text>
              <Text>{formatCurrency(subtotal)}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>Tax (13%):</Text>
              <Text>{formatCurrency(tax)}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>Total:</Text>
              <Text>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Thank you for your business!</Text>
      </Page>
    </Document>
  );
};
const Mydoc: React.FC<{ order: Order }> = ({ order }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            src="/logo.png" // Ensure this image exists in the public folder
            style={styles.logo}
          />
          <View style={styles.companyDetails}>
            <Text>Company Name</Text>
            <Text>1234 Street Address</Text>
            <Text>City, State, ZIP</Text>
            <Text>Email: info@company.com</Text>
            <Text>Phone: (123) 456-7890</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.customerDetails}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
            Invoice To:
          </Text>
          <Text>{order.recipientName}</Text>
          <Text>{order.deliveryAddress}</Text>
          <Text>{order.postalCode}</Text>
          <Text>{order.user?.email}</Text>
        </View>

        {/* Order Details */}
        <View style={styles.orderDetails}>
          <Text>Invoice #: {order.id}</Text>
          <Text>Order Date: {parseDate(order.createdAt)}</Text>
          <Text>Status: {order.status}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCol, { flex: 2 }, styles.tableCell]}>
            Item
          </Text>
          <Text style={[styles.tableCol, styles.tableCell]}>Quantity</Text>
          <Text style={[styles.tableCol, styles.tableCell]}>Price</Text>
          <Text style={[styles.tableCol, styles.tableCell]}>Subtotal</Text>
        </View>
        {order.orderItems.length > 0 ? (
          order.orderItems.map((item) => {
            // Destructure item properties with defaults
            const {
              id: itemId = 'N/A',
              quantity = 0,
              product,
              description = 'N/A',
              productId = 'N/A',
              subtotalInCents = 0,
            } = item;

            // Determine item name
            const itemName =
              product?.name ||
              productId ||
              description ||
              'Item';

            // Calculate price per unit
            const pricePerUnit =
              quantity > 0 ? subtotalInCents / 100 / quantity : 0;

            const subtotal = subtotalInCents / 100;

            return (
              <View key={itemId} style={styles.tableRow}>
                <Text style={[styles.tableCol, { flex: 2 }, styles.tableCell]}>
                  {itemName}
                </Text>
                <Text style={[styles.tableCol, styles.tableCell]}>
                  {quantity}
                </Text>
                <Text style={[styles.tableCol, styles.tableCell]}>
                  {formatCurrency(pricePerUnit)}
                </Text>
                <Text style={[styles.tableCol, styles.tableCell]}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2 }, styles.tableCell]}>
              No items
            </Text>
            <Text style={[styles.tableCol, styles.tableCell]}>-</Text>
            <Text style={[styles.tableCol, styles.tableCell]}>-</Text>
            <Text style={[styles.tableCol, styles.tableCell]}>-</Text>
          </View>
        )}

        {/* Total Amount */}
        <View style={styles.totalsContainer}>
          <View style={styles.totals}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>Subtotal:</Text>
              <Text>{formatCurrency(order.pricePaidInCents / 100)}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>Tax (13%):</Text>
              <Text>{formatCurrency(order.pricePaidInCents * 0.13 / 100)}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>Total:</Text>
              <Text>{formatCurrency(order.pricePaidInCents * 1.13 / 100)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Thank you for your business!</Text>
      </Page>
    </Document>
);





/**
 * Generates a PDF invoice for a given order and triggers a download in the browser.
 *
 * @param {Order} order - The order data for which to generate the invoice.
 */
export const generateInvoicePdf = async (order: Order): Promise<void> => {
  try {
    // Create the PDF document element with the order prop
    const documentElement = <InvoiceDocument order={order} />;

    // Generate a PDF blob from the document element
    const pdfBlob = await pdf(documentElement).toBlob();

    // Create a URL for the PDF blob
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Create a temporary anchor element to facilitate the download
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = `Invoice-${order.id}.pdf`;

    // Append the anchor to the document body and trigger a click to start the download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up by removing the anchor and revoking the object URL
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(pdfUrl);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    alert('Failed to generate invoice. Please try again.');
  }
};
