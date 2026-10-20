// Safe ERP Context Provider for KTA AI Assistant
// Fetches authorized, read-only data from existing backend APIs with strict prompt-injection guardrails

import { godownApi } from './core-api';
import { productApi } from './core-api';
import { stockApi } from './stock-api';
import { supplierApi, customerApi } from './parties-api';
import { transportBillApi } from './transport-api';

export interface ErpContextSummary {
  hasLiveData: boolean;
  statusMessage: string;
  contextText: string;
}

/**
 * Checks if the user is authenticated in the ERP
 */
export function isErpAuthenticated(): boolean {
  try {
    return Boolean(
      sessionStorage.getItem('kta_auth_username') &&
        sessionStorage.getItem('kta_auth_password')
    );
  } catch {
    return false;
  }
}

/**
 * Clean and escape untrusted text to prevent prompt injection
 */
function sanitizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[<>{}\\]/g, ' ')
    .slice(0, 150)
    .trim();
}

/**
 * Detects if the user query is asking about ERP data
 */
export function isErpRelatedQuery(query: string): boolean {
  const lower = query.toLowerCase();
  const keywords = [
    'godown',
    'warehouse',
    'stock',
    'inventory',
    'product',
    'item',
    'supplier',
    'customer',
    'transport',
    'bill',
    'lr',
    'balance',
    'shortage',
    'alert',
    'low stock',
    'kanpur',
    'lucknow',
    'agra',
    'varanasi',
    'prayagraj',
    'jhansi',
    'sales',
    'purchase',
    'expense',
    'report',
  ];
  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Safely fetches live ERP context for grounded AI answers
 */
export async function getSafeErpContext(userQuery: string): Promise<ErpContextSummary> {
  if (!isErpAuthenticated()) {
    return {
      hasLiveData: false,
      statusMessage: 'Not signed in. AI is running in general assistant mode (no live ERP data).',
      contextText: '',
    };
  }

  const query = userQuery.toLowerCase();
  const sections: string[] = [];
  let fetchedAny = false;

  try {
    // 1. Godowns (if query mentions godowns, warehouses, locations, transfers)
    if (
      query.includes('godown') ||
      query.includes('warehouse') ||
      query.includes('location') ||
      query.includes('city') ||
      query.includes('transfer')
    ) {
      try {
        const godowns = await godownApi.getAll();
        if (godowns && godowns.length > 0) {
          fetchedAny = true;
          const list = godowns
            .map(
              (g) =>
                `- ${sanitizeText(g.name)} (${sanitizeText(g.code)}): ${sanitizeText(g.city)}, ${sanitizeText(g.state)} [Status: ${g.active ? 'Active' : 'Inactive'}]`
            )
            .join('\n');
          sections.push(`### Registered Godowns (${godowns.length} total):\n${list}`);
        }
      } catch {
        // Backend endpoint unavailable or unauthorized
      }
    }

    // 2. Stock / Low Stock Alerts
    if (
      query.includes('stock') ||
      query.includes('inventory') ||
      query.includes('alert') ||
      query.includes('low') ||
      query.includes('quantity') ||
      query.includes('balance')
    ) {
      try {
        const lowStock = await stockApi.getLowStockAlerts();
        if (lowStock && lowStock.length > 0) {
          fetchedAny = true;
          const alerts = lowStock
            .slice(0, 15)
            .map(
              (s) =>
                `- ${sanitizeText(s.productName)} (SKU: ${sanitizeText(s.productSku)}) at ${sanitizeText(s.godownName)}: Available ${s.availableQuantity} ${sanitizeText(s.unit)} (Reorder Level: ${s.reorderLevel ?? 'N/A'})`
            )
            .join('\n');
          sections.push(`### Low Stock Alerts (${lowStock.length} items):\n${alerts}`);
        } else {
          sections.push('### Low Stock Status: No low-stock items detected in active balances.');
        }
      } catch {
        // Stock API error
      }
    }

    // 3. Products
    if (
      query.includes('product') ||
      query.includes('item') ||
      query.includes('price') ||
      query.includes('sku') ||
      query.includes('catalog')
    ) {
      try {
        const products = await productApi.getActive();
        if (products && products.length > 0) {
          fetchedAny = true;
          const sample = products
            .slice(0, 15)
            .map(
              (p) =>
                `- ${sanitizeText(p.name)} [SKU: ${sanitizeText(p.sku)}] Category: ${sanitizeText(p.categoryName || 'General')} | Buy: ₹${p.purchasePrice} | Sell: ₹${p.sellingPrice} | GST: ${p.gstRate}%`
            )
            .join('\n');
          sections.push(
            `### Active Products (showing ${Math.min(products.length, 15)} of ${products.length}):\n${sample}`
          );
        }
      } catch {
        // Product API error
      }
    }

    // 4. Transport Bills (Overdue & Needs Review)
    if (
      query.includes('transport') ||
      query.includes('bill') ||
      query.includes('lr') ||
      query.includes('overdue') ||
      query.includes('freight')
    ) {
      try {
        const [needsReview, overdue] = await Promise.all([
          transportBillApi.getNeedsReview().catch(() => []),
          transportBillApi.getOverdue().catch(() => []),
        ]);

        if (needsReview.length > 0 || overdue.length > 0) {
          fetchedAny = true;
          let billText = '';
          if (needsReview.length > 0) {
            billText += `Transport Bills Needing Review (${needsReview.length}):\n` +
              needsReview
                .slice(0, 10)
                .map(
                  (b) =>
                    `- Bill #${sanitizeText(b.billNumber)} (${sanitizeText(b.transporterName)}): Total ₹${b.totalAmount}, Due ₹${b.balanceDue} [Confidence: ${b.extractionConfidence ? Math.round(b.extractionConfidence * 100) + '%' : 'Manual'}]`
                )
                .join('\n') + '\n';
          }
          if (overdue.length > 0) {
            billText += `Overdue Transport Bills (${overdue.length}):\n` +
              overdue
                .slice(0, 10)
                .map(
                  (b) =>
                    `- Bill #${sanitizeText(b.billNumber)} (${sanitizeText(b.transporterName)}): Due date ${b.dueDate || 'N/A'}, Balance: ₹${b.balanceDue}`
                )
                .join('\n');
          }
          sections.push(`### Transport Bills Status:\n${billText.trim()}`);
        }
      } catch {
        // Transport API error
      }
    }

    // 5. Suppliers / Customers
    if (query.includes('supplier') || query.includes('vendor')) {
      try {
        const suppliers = await supplierApi.getActive();
        if (suppliers && suppliers.length > 0) {
          fetchedAny = true;
          const list = suppliers
            .slice(0, 10)
            .map(
              (s) =>
                `- ${sanitizeText(s.name)} (${sanitizeText(s.code)}): ${sanitizeText(s.city)}, Phone: ${sanitizeText(s.phone || 'N/A')}, Outstanding: ₹${s.balance}`
            )
            .join('\n');
          sections.push(`### Active Suppliers (${suppliers.length}):\n${list}`);
        }
      } catch {
        // Supplier API error
      }
    }

    if (query.includes('customer') || query.includes('client')) {
      try {
        const customers = await customerApi.getActive();
        if (customers && customers.length > 0) {
          fetchedAny = true;
          const list = customers
            .slice(0, 10)
            .map(
              (c) =>
                `- ${sanitizeText(c.name)} (${sanitizeText(c.code)}): ${sanitizeText(c.city)}, Phone: ${sanitizeText(c.phone || 'N/A')}, Balance: ₹${c.balance}`
            )
            .join('\n');
          sections.push(`### Active Customers (${customers.length}):\n${list}`);
        }
      } catch {
        // Customer API error
      }
    }

    // If query was generally about ERP or inventory overview and nothing specific matched yet
    if (!fetchedAny && (query.includes('summary') || query.includes('overview') || query.includes('status'))) {
      try {
        const godowns = await godownApi.getAll().catch(() => []);
        const lowStock = await stockApi.getLowStockAlerts().catch(() => []);
        if (godowns.length > 0 || lowStock.length > 0) {
          fetchedAny = true;
          sections.push(
            `### High-Level ERP Overview:\n- Active Godowns: ${godowns.length} (Kanpur, Lucknow, Agra, Varanasi, Prayagraj, Jhansi)\n- Low Stock Alerts: ${lowStock.length} items flagged`
          );
        }
      } catch {
        // Overview fallback
      }
    }

    if (fetchedAny) {
      return {
        hasLiveData: true,
        statusMessage: 'Live ERP data connected (authorized session)',
        contextText: sections.join('\n\n'),
      };
    }

    return {
      hasLiveData: false,
      statusMessage: 'No specific live ERP records were needed for this question.',
      contextText: '',
    };
  } catch (err) {
    return {
      hasLiveData: false,
      statusMessage: 'ERP backend data could not be fetched (offline or unauthenticated).',
      contextText: '',
    };
  }
}
