require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// DATOS EN MEMORIA
// =======================

const users = [
  {
    id: 1,
    nombre: "Admin",
    email: "admin@unisabana.edu.co",
    password: "1234",
    role: "admin",
    carrera: "Administración",
    reputacion: 5
  },
  {
    id: 2,
    nombre: "Vendedor",
    email: "vendedor@unisabana.edu.co",
    password: "1234",
    role: "vendedor",
    carrera: "Ingeniería",
    reputacion: 4.8
  },
  {
    id: 3,
    nombre: "Comprador",
    email: "comprador@unisabana.edu.co",
    password: "1234",
    role: "comprador",
    carrera: "Economía",
    reputacion: 0
  }
];

const products = [
  {
    id: 1,
    nombre: "Calculadora Casio",
    descripcion:
      "Calculadora científica para clases de cálculo y estadística.",
    precio: 75000,
    categoria: "Tecnología",
    estado: "Usado",
    imagen:
      "https://images.unsplash.com/photo-1616627986870-1c57f8f5383f?auto=format&fit=crop&w=900&q=80",
    vendedorId: 2,
    stock: 1,
    activo: true
  }
];

const orders = [];
const reviews = [];
const messages = [];
const notifications = [];

// =======================
// HOME
// =======================

app.get("/", (req, res) => {
  res.send("Marketplace Backend funcionando");
});

// =======================
// AUTH
// =======================

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email y password obligatorios"
    });
  }

  if (!email.endsWith("@unisabana.edu.co")) {
    return res.status(403).json({
      message: "Solo se permite correo institucional"
    });
  }

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Credenciales inválidas"
    });
  }

  return res.status(200).json({
    message: "Login exitoso",
    user
  });
});

app.post("/api/auth/register", (req, res) => {
  const { nombre, email, password, role, carrera } = req.body;

  if (!nombre || !email || !password || !role) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios"
    });
  }

  if (!email.endsWith("@unisabana.edu.co")) {
    return res.status(403).json({
      message: "Debe usar correo institucional"
    });
  }

  const existingUser = users.find((u) => u.email === email);

  if (existingUser) {
    return res.status(409).json({
      message: "El usuario ya existe"
    });
  }

  const newUser = {
    id: users.length + 1,
    nombre,
    email,
    password,
    role,
    carrera: carrera || "",
    reputacion: 0
  };

  users.push(newUser);

  return res.status(201).json({
    message: "Usuario registrado exitosamente",
    user: newUser
  });
});

// =======================
// PERFIL
// =======================

app.put("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({
      message: "Usuario no encontrado"
    });
  }

  const { nombre, email, password, role, carrera } = req.body;

  user.nombre = nombre || user.nombre;
  user.email = email || user.email;
  user.password = password || user.password;
  user.role = role || user.role;
  user.carrera = carrera || user.carrera;

  return res.status(200).json({
    message: "Perfil actualizado correctamente",
    user
  });
});

// =======================
// PRODUCTOS
// =======================

app.get("/api/products", (req, res) => {
  const activeProducts = products.filter((p) => p.activo);

  return res.status(200).json(activeProducts);
});

app.get("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const product = products.find((p) => p.id === id && p.activo);

  if (!product) {
    return res.status(404).json({
      message: "Producto no encontrado"
    });
  }

  return res.status(200).json(product);
});

app.post("/api/products", (req, res) => {
  const {
    nombre,
    descripcion,
    precio,
    categoria,
    estado,
    imagen,
    vendedorId,
    stock
  } = req.body;

  if (
    !nombre ||
    !descripcion ||
    !precio ||
    !categoria ||
    !estado
  ) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios"
    });
  }

  const newProduct = {
    id: products.length + 1,
    nombre,
    descripcion,
    precio: Number(precio),
    categoria,
    estado,
    imagen:
      imagen ||
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    vendedorId,
    stock: Number(stock || 1),
    activo: true
  };

  products.push(newProduct);

  return res.status(201).json({
    message: "Producto creado correctamente",
    product: newProduct
  });
});

app.put("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({
      message: "Producto no encontrado"
    });
  }

  const {
    nombre,
    descripcion,
    precio,
    categoria,
    estado,
    imagen,
    stock
  } = req.body;

  product.nombre = nombre || product.nombre;
  product.descripcion = descripcion || product.descripcion;
  product.precio = precio ? Number(precio) : product.precio;
  product.categoria = categoria || product.categoria;
  product.estado = estado || product.estado;
  product.imagen = imagen || product.imagen;
  product.stock = stock ? Number(stock) : product.stock;

  return res.status(200).json({
    message: "Producto actualizado correctamente",
    product
  });
});

app.delete("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({
      message: "Producto no encontrado"
    });
  }

  product.activo = false;

  return res.status(200).json({
    message: "Producto eliminado correctamente"
  });
});

// =======================
// BUSCAR
// =======================

app.get("/api/products/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  const result = products.filter(
    (p) =>
      p.activo &&
      (
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
      )
  );

  return res.status(200).json(result);
});

// =======================
// FILTRAR
// =======================

app.get("/api/products/filter", (req, res) => {
  const { category, condition, maxPrice } = req.query;

  let result = products.filter((p) => p.activo);

  if (category) {
    result = result.filter((p) => p.categoria === category);
  }

  if (condition) {
    result = result.filter((p) => p.estado === condition);
  }

  if (maxPrice) {
    result = result.filter((p) => p.precio <= Number(maxPrice));
  }

  return res.status(200).json(result);
});

// =======================
// ÓRDENES
// =======================

app.post("/api/orders", (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !items || items.length === 0) {
    return res.status(400).json({
      message: "Datos inválidos"
    });
  }

  let total = 0;

  items.forEach((item) => {
    const product = products.find(
      (p) => p.id === item.productId
    );

    if (product) {
      total += product.precio * item.quantity;
    }
  });

  const newOrder = {
    id: orders.length + 1,
    userId,
    items,
    total,
    status: "Confirmada",
    fecha: new Date().toISOString()
  };

  orders.push(newOrder);

  return res.status(201).json({
    message: "Compra realizada correctamente",
    order: newOrder
  });
});

app.get("/api/orders/history/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);

  const userOrders = orders.filter(
    (order) => order.userId === userId
  );

  return res.status(200).json(userOrders);
});

// =======================
// RESEÑAS
// =======================

app.post("/api/reviews", (req, res) => {
  const { sellerId, buyerId, rating, comment } = req.body;

  if (!sellerId || !buyerId || !rating || !comment) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios"
    });
  }

  const newReview = {
    id: reviews.length + 1,
    sellerId,
    buyerId,
    rating,
    comment
  };

  reviews.push(newReview);

  return res.status(201).json({
    message: "Reseña creada correctamente",
    review: newReview
  });
});

app.get("/api/reviews/:sellerId", (req, res) => {
  const sellerId = parseInt(req.params.sellerId);

  const sellerReviews = reviews.filter(
    (review) => review.sellerId === sellerId
  );

  return res.status(200).json(sellerReviews);
});

// =======================
// CHAT
// =======================

app.post("/api/messages", (req, res) => {
  const { productId, fromUserId, toUserId, text } = req.body;

  if (!productId || !fromUserId || !toUserId || !text) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios"
    });
  }

  const newMessage = {
    id: messages.length + 1,
    productId,
    fromUserId,
    toUserId,
    text,
    fecha: new Date().toISOString()
  };

  messages.push(newMessage);

  return res.status(201).json({
    message: "Mensaje enviado correctamente",
    data: newMessage
  });
});

app.get("/api/messages/:productId", (req, res) => {
  const productId = parseInt(req.params.productId);

  const productMessages = messages.filter(
    (message) => message.productId === productId
  );

  return res.status(200).json(productMessages);
});

// =======================
// NOTIFICACIONES
// =======================

app.get("/api/notifications/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);

  const userNotifications = notifications.filter(
    (notification) => notification.userId === userId
  );

  return res.status(200).json(userNotifications);
});

// =======================
// ADMIN
// =======================

app.get("/api/admin/dashboard", (req, res) => {
  return res.status(200).json({
    users: users.length,
    products: products.filter((p) => p.activo).length,
    orders: orders.length,
    reviews: reviews.length,
    messages: messages.length
  });
});

// =======================
// SERVER
// =======================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
