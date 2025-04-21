import express from 'express';
import cors from 'cors';
import db from './database.js';

const app = express();

// Configure CORS for both development and production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com', 'https://www.your-production-domain.com']
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.exec('SELECT * FROM products')[0]?.values.map(row => ({
      id: row[0],
      name: row[1],
      price: row[2],
      image: row[3],
      unit: row[4]
    })) || [];
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get all orders (admin only)
app.get('/api/orders', (req, res) => {
  try {
    const result = db.exec(`
      SELECT 
        o.*,
        p.name as product_name,
        p.unit,
        p.image as product_image
      FROM orders o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
    `);

    const orders = result[0]?.values.map(order => ({
      id: order[0],
      customer_name: order[1],
      contact_number: order[2],
      delivery_address: order[3],
      product_id: order[4],
      quantity: order[5],
      status: order[6],
      created_at: order[7],
      total_price: order[8],
      product_name: order[9],
      unit: order[10],
      product_image: order[11]
    })) || [];

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Place an order
app.post('/api/orders', (req, res) => {
  const { customer_name, contact_number, delivery_address, product_id, quantity } = req.body;
  
  try {
    // Get product price for total calculation
    const result = db.exec('SELECT price FROM products WHERE id = ?', [product_id]);
    const product = result[0]?.values[0];
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const total_price = product[0] * quantity;

    db.run(`
      INSERT INTO orders (
        customer_name, 
        contact_number, 
        delivery_address, 
        product_id, 
        quantity,
        total_price
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [customer_name, contact_number, delivery_address, product_id, quantity, total_price]);

    const orderId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];

    // Get the complete order details
    const orderResult = db.exec(`
      SELECT 
        o.*,
        p.name as product_name,
        p.unit
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `, [orderId]);

    const order = orderResult[0]?.values[0];
    res.json({
      id: order[0],
      customer_name: order[1],
      contact_number: order[2],
      delivery_address: order[3],
      product_id: order[4],
      quantity: order[5],
      status: order[6],
      created_at: order[7],
      total_price: order[8],
      product_name: order[9],
      unit: order[10]
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order status with product details
app.get('/api/orders/:id', (req, res) => {
  try {
    const result = db.exec(`
      SELECT 
        o.*,
        p.name as product_name,
        p.unit,
        p.image as product_image
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `, [req.params.id]);

    if (result[0]?.values[0]) {
      const order = result[0].values[0];
      res.json({
        id: order[0],
        customer_name: order[1],
        contact_number: order[2],
        delivery_address: order[3],
        product_id: order[4],
        quantity: order[5],
        status: order[6],
        created_at: order[7],
        total_price: order[8],
        product_name: order[9],
        unit: order[10],
        product_image: order[11]
      });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (admin only)
app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  try {
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    
    const result = db.exec(`
      SELECT 
        o.*,
        p.name as product_name,
        p.unit
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `, [req.params.id]);

    if (result[0]?.values[0]) {
      const order = result[0].values[0];
      res.json({
        id: order[0],
        customer_name: order[1],
        contact_number: order[2],
        delivery_address: order[3],
        product_id: order[4],
        quantity: order[5],
        status: order[6],
        created_at: order[7],
        total_price: order[8],
        product_name: order[9],
        unit: order[10]
      });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Add new product (admin only)
app.post('/api/products', (req, res) => {
  const { name, price, image, unit } = req.body;
  try {
    db.run(
      'INSERT INTO products (name, price, image, unit) VALUES (?, ?, ?, ?)',
      [name, price, image, unit]
    );
    
    const productId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    const result = db.exec('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (result[0]?.values[0]) {
      const product = result[0].values[0];
      res.json({
        id: product[0],
        name: product[1],
        price: product[2],
        image: product[3],
        unit: product[4]
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product (admin only)
app.put('/api/products/:id', (req, res) => {
  const { name, price, image, unit } = req.body;
  try {
    db.run(
      'UPDATE products SET name = ?, price = ?, image = ?, unit = ? WHERE id = ?',
      [name, price, image, unit, req.params.id]
    );
    
    const result = db.exec('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (result[0]?.values[0]) {
      const product = result[0].values[0];
      res.json({
        id: product[0],
        name: product[1],
        price: product[2],
        image: product[3],
        unit: product[4]
      });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', (req, res) => {
  try {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});