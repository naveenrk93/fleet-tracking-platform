import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:3001';

export const handlers = [
  // Vehicles
  http.get(`${API_BASE}/vehicles`, () => {
    return HttpResponse.json([
      {
        id: '1',
        registrationNumber: 'TN01AB1234',
        make: 'Tata',
        model: 'Ace',
        capacity: 1000,
        status: 'active',
      },
    ]);
  }),

  http.get(`${API_BASE}/vehicles/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      registrationNumber: 'TN01AB1234',
      make: 'Tata',
      model: 'Ace',
      capacity: 1000,
      status: 'active',
    });
  }),

  http.post(`${API_BASE}/vehicles`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '123',
      ...body,
    }, { status: 201 });
  }),

  // Drivers
  http.get(`${API_BASE}/drivers`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'John Doe',
        licenseNumber: 'DL1234567890',
        phone: '9876543210',
        status: 'available',
      },
    ]);
  }),

  http.post(`${API_BASE}/drivers`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '123',
      ...body,
    }, { status: 201 });
  }),

  // Orders
  http.get(`${API_BASE}/orders`, () => {
    return HttpResponse.json([
      {
        id: '1',
        orderNumber: 'ORD-001',
        customerId: '1',
        customerName: 'Test Customer',
        status: 'pending',
        totalAmount: 5000,
        items: [],
      },
    ]);
  }),

  http.get(`${API_BASE}/orders/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      orderNumber: 'ORD-001',
      customerId: '1',
      customerName: 'Test Customer',
      status: 'pending',
      totalAmount: 5000,
      items: [],
    });
  }),

  http.post(`${API_BASE}/orders`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '123',
      ...body,
    }, { status: 201 });
  }),

  http.patch(`${API_BASE}/orders/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      ...body,
    });
  }),

  // Deliveries
  http.get(`${API_BASE}/deliveries`, ({ request }) => {
    const url = new URL(request.url);
    const driverId = url.searchParams.get('driverId');
    
    return HttpResponse.json([
      {
        id: '1',
        orderId: '1',
        driverId: driverId || '1',
        status: 'in_transit',
        pickupLocation: { lat: 13.0827, lng: 80.2707 },
        dropLocation: { lat: 13.0869, lng: 80.2839 },
      },
    ]);
  }),

  http.patch(`${API_BASE}/deliveries/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      ...body,
    });
  }),

  // Vehicle Allocations
  http.get(`${API_BASE}/allocations`, () => {
    return HttpResponse.json([
      {
        id: '1',
        vehicleId: '1',
        driverId: '1',
        startDate: new Date().toISOString(),
        status: 'active',
      },
    ]);
  }),

  http.post(`${API_BASE}/allocations`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '123',
      ...body,
    }, { status: 201 });
  }),

  http.patch(`${API_BASE}/allocations/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      ...body,
    });
  }),

  // Hubs
  http.get(`${API_BASE}/hubs`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Main Hub',
        location: { lat: 13.0827, lng: 80.2707 },
        address: '123 Main St',
      },
    ]);
  }),

  // Terminals
  http.get(`${API_BASE}/terminals`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Terminal 1',
        location: { lat: 13.0827, lng: 80.2707 },
        hubId: '1',
      },
    ]);
  }),

  // Products
  http.get(`${API_BASE}/products`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Product 1',
        price: 100,
        sku: 'PROD-001',
      },
    ]);
  }),
];

