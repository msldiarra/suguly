import { prisma } from './db'

export type AppUserRole = 'CUSTOMER' | 'SHOPPER' | 'ADMIN'

export async function getCustomerRole(customerId: number): Promise<AppUserRole> {
  const rows = await prisma.$queryRaw<Array<{ role: string }>>`
    SELECT role
    FROM "Customer"
    WHERE id = ${customerId}
    LIMIT 1
  `

  const role = rows[0]?.role
  if (role === 'SHOPPER' || role === 'ADMIN') return role
  return 'CUSTOMER'
}
