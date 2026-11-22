'use client'

import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { ProductForm } from './ProductForm'
import { Product } from '@/types/product.types'

export interface ProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

export function ProductModal({ open, onOpenChange, product }: ProductModalProps) {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={product ? 'Ubah Data Barang' : 'Tambah Barang Baru'}
      description="Data barang akan tersimpan ke master dan dapat langsung dipilih saat membuat faktur invoice."
    >
      {open && (
        <ProductForm
          key={product?.id || 'new-product-modal'}
          product={product}
          onSuccess={() => onOpenChange(false)}
        />
      )}
    </ResponsiveModal>
  )
}
