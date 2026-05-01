import { cookies } from 'next/headers'
import { prisma } from './db'
import { verifyToken } from './auth'
import { getCustomerRole, type AppUserRole } from './customer-role'

export interface CurrentUser {
  id: number
  phone: string
  name: string | null
  role: AppUserRole
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = cookies().get('suguly_session')?.value
  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded?.id) return null

  const customer = await prisma.customer.findUnique({
    where: { id: decoded.id },
    select: { id: true, phone: true, name: true },
  })

  if (!customer) return null

  const role = await getCustomerRole(customer.id)
  return { ...customer, role }
}
