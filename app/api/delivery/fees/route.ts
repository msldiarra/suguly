import { NextRequest, NextResponse } from 'next/server'
import { getDeliveryFee, QUARTIERS } from '@/lib/delivery'

export async function GET(req: NextRequest) {
  const quartier = req.nextUrl.searchParams.get('quartier')
  const express = req.nextUrl.searchParams.get('express') === 'true'

  if (!quartier) {
    return NextResponse.json({ quartiers: QUARTIERS })
  }

  const fee = getDeliveryFee(quartier, express)
  return NextResponse.json({ quartier, express, fee })
}
