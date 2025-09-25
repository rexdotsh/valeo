export type Order = {
  id: string;
  name: string;
  quantity: string;
  status: 'delivered' | 'shipped' | 'processing' | 'scheduled';
  eta?: string; // ISO date string if upcoming
  placedAt: string; // ISO date string
};

export const orders: Array<Order> = [
  {
    id: 'ord_1001',
    name: 'Metformin 500mg',
    quantity: '60 tablets',
    status: 'delivered',
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'ord_1002',
    name: 'Ibuprofen 200mg',
    quantity: '24 tablets',
    status: 'shipped',
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'ord_1003',
    name: 'Vitamin D3 1000IU',
    quantity: '30 softgels',
    status: 'processing',
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'ord_1004',
    name: 'Amoxicillin 250mg',
    quantity: '21 capsules',
    status: 'scheduled',
    eta: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    placedAt: new Date().toISOString(),
  },
];

export function splitOrders(all: Array<Order>): {
  history: Array<Order>;
  upcoming: Array<Order>;
} {
  const upcoming: Array<Order> = [];
  const history: Array<Order> = [];
  for (const o of all) {
    if (
      o.status === 'scheduled' ||
      o.status === 'processing' ||
      o.status === 'shipped'
    ) {
      upcoming.push(o);
    } else {
      history.push(o);
    }
  }
  return { history, upcoming };
}
