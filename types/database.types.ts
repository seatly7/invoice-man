/**
 * Kontrak Skema Database Supabase PostgreSQL
 * Mengacu langsung ke PRD.md (Section 3: Skema Database PostgreSQL)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      invoice_settings: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_address: string | null
          business_phone: string | null
          business_email: string | null
          tax_id: string | null // NPWP
          logo_url: string | null // path di Supabase Storage (bukan URL publik)
          invoice_prefix: string // default: 'INV'
          last_invoice_number: number // check >= 0, default: 0
          default_tax_rate: number // check >= 0, default: 0
          footer_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          tax_id?: string | null
          logo_url?: string | null
          invoice_prefix?: string
          last_invoice_number?: number
          default_tax_rate?: number
          footer_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          tax_id?: string | null
          logo_url?: string | null
          invoice_prefix?: string
          last_invoice_number?: number
          default_tax_rate?: number
          footer_note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          sku: string
          name: string
          unit: string // default: 'pcs'
          price: number // numeric(15,2), check >= 0
          description: string | null
          is_active: boolean // default: true (soft delete)
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sku: string
          name: string
          unit?: string
          price?: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sku?: string
          name?: string
          unit?: string
          price?: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          invoice_number: string
          customer_name: string
          customer_phone: string | null
          customer_email: string | null
          customer_address: string | null
          issue_date: string // date
          due_date: string | null // date
          subtotal: number // numeric(15,2), check >= 0
          discount_amount: number // numeric(15,2), check >= 0
          tax_rate: number // numeric(5,2), check >= 0
          tax_amount: number // numeric(15,2), check >= 0
          grand_total: number // numeric(15,2), check >= 0
          notes: string | null
          status: InvoiceStatus // 'draft' | 'issued' | 'paid' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          invoice_number: string
          customer_name: string
          customer_phone?: string | null
          customer_email?: string | null
          customer_address?: string | null
          issue_date?: string
          due_date?: string | null
          subtotal?: number
          discount_amount?: number
          tax_rate?: number
          tax_amount?: number
          grand_total?: number
          notes?: string | null
          status?: InvoiceStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          invoice_number?: string
          customer_name?: string
          customer_phone?: string | null
          customer_email?: string | null
          customer_address?: string | null
          issue_date?: string
          due_date?: string | null
          subtotal?: number
          discount_amount?: number
          tax_rate?: number
          tax_amount?: number
          grand_total?: number
          notes?: string | null
          status?: InvoiceStatus
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_id: string | null
          item_name: string
          unit: string // default: 'pcs'
          qty: number // numeric(12,2), check > 0
          unit_price: number // numeric(15,2), check >= 0
          line_total: number // GENERATED ALWAYS AS (qty * unit_price) STORED
          sort_order: number // default: 0
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          product_id?: string | null
          item_name: string
          unit?: string
          qty?: number
          unit_price?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          product_id?: string | null
          item_name?: string
          unit?: string
          qty?: number
          unit_price?: number
          sort_order?: number
          created_at?: string
        }
      }
    }
    Functions: {
      generate_invoice_number: {
        Args: {
          p_user_id: string
        }
        Returns: string
      }
    }
  }
}
