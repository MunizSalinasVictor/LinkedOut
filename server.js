require('dotenv').config({ path: 'idk.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Inicializar Express
const app = express();

// Configuración desde variables de entorno
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Middlewares esenciales
app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  message: 'Demasiadas peticiones, intenta más tarde'
});
app.use('/api/auth/', limiter);

// Configuración de Multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Conexión a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  });

// Definición de rutas (aquí van tus rutas)
const authRouter = express.Router();

// Ejemplo de ruta básica (deberás completar con tu lógica)
authRouter.post('/register', [
  body('username').isLength({ min: 4 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  // Tu lógica de registro aquí
});

app.use('/api/auth', authRouter);

// Archivos estáticos (para tu frontend)
app.use(express.static(path.join(__dirname, '')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta catch-all para SPA (debe ir al final)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '', 'index.html'));
});


// Esquemas de MongoDB
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  profileImage: {
    type: String,
    default: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  bio: String,
  friends: {
    type: Number,
    default: 0
  },
  profileImg: String,
  coverImg: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  imageUrl: String,
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    text: String,
    userName: String,
    userImage: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Post = mongoose.model('Post', postSchema);

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

// Ruta raíz para evitar "Cannot GET /"
app.get('/', (req, res) => {
  res.send(`
    <h1>LinkedOut API</h1>
    <p>Servidor en funcionamiento</p>
    <p><strong>Endpoints disponibles:</strong></p>
    <ul>
      <li>POST /api/auth/register</li>
      <li>POST /api/auth/login</li>
      <li>GET /api/profile</li>
    </ul>
  `);
});

// Para SPA (Single Page Application): redirige todas las rutas al index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas de autenticación
app.post('/api/auth/register', [
  body('username')
    .trim()
    .isLength({ min: 4 }).withMessage('Mínimo 4 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Solo letras, números y _'),
  body('email')
    .trim()
    .isEmail().withMessage('Email no válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Mínimo 6 caracteres')
    .matches(/[A-Z]/).withMessage('Debe tener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('Debe tener al menos un número')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const errors = [];
      if (existingUser.username === username)
        errors.push({ param: 'username', msg: 'Nombre de usuario en uso' });
      if (existingUser.email === email)
        errors.push({ param: 'email', msg: 'Email en uso' });

      return res.status(400).json({ success: false, errors });
    }

    const user = await User.create({ username, email, password });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    // Crear perfil por defecto
    await Profile.create({
      userId: user._id,
      name: username,
      bio: 'Nuevo usuario',
      profileImg: user.profileImage
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Registro exitoso',
      token,
      user: userResponse
    });

  } catch (err) {
    console.error('Error en el registro:', err);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: err.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: userResponse
    });
    
  } catch (err) {
    console.error('Error en el login:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Rutas de perfil
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.put('/api/profile', authenticate, async (req, res) => {
  try {
    const { name, bio, friends, profileImg, coverImg } = req.body;
    
    let profile = await Profile.findOne({ userId: req.userId });
    
    if (!profile) {
      profile = new Profile({ 
        userId: req.userId,
        name,
        bio,
        friends,
        profileImg,
        coverImg
      });
    } else {
      profile.name = name || profile.name;
      profile.bio = bio || profile.bio;
      profile.friends = friends || profile.friends;
      profile.profileImg = profileImg || profile.profileImg;
      profile.coverImg = coverImg || profile.coverImg;
    }
    
    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// Rutas de publicaciones
app.get('/api/posts', authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    console.error('Error al obtener publicaciones:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.post('/api/posts', authenticate, async (req, res) => {
  try {
    const { text, imageUrl } = req.body;
    
    if (!text && !imageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere texto o imagen' 
      });
    }
    
    const post = new Post({ 
      text, 
      imageUrl,
      userId: req.userId
    });
    
    await post.save();
    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error('Error al crear publicación:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.post('/api/posts/:id/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Publicación no encontrada' 
      });
    }
    
    res.json({ success: true, post });
  } catch (err) {
    console.error('Error al dar like:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.post('/api/posts/:id/comments', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere texto' 
      });
    }
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    const comment = {
      text,
      userName: user.username,
      userImage: user.profileImage
    };
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: comment } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Publicación no encontrada' 
      });
    }
    
    res.json({ success: true, comment });
  } catch (err) {
    console.error('Error al comentar:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.delete('/api/posts/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Publicación no encontrada' 
      });
    }
    
    res.json({ success: true, message: 'Publicación eliminada' });
  } catch (err) {
    console.error('Error al eliminar publicación:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.delete('/api/posts/:postId/comments/:commentId', authenticate, async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { 
        _id: req.params.postId, 
        'comments._id': req.params.commentId,
        'comments.userName': req.user.username
      },
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comentario no encontrado o no autorizado' 
      });
    }
    
    res.json({ success: true, post });
  } catch (err) {
    console.error('Error al eliminar comentario:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// Rutas de upload
app.post('/api/upload/:type', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se subió ningún archivo' 
      });
    }
    
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // Actualizar perfil según el tipo de imagen
    if (req.params.type === 'profile') {
      await User.findByIdAndUpdate(req.userId, { profileImage: imageUrl });
    } else if (req.params.type === 'cover') {
      await Profile.findOneAndUpdate(
        { userId: req.userId }, 
        { coverImg: imageUrl }
      );
    }
    
    res.json({ 
      success: true, 
      imageUrl,
      message: 'Imagen subida correctamente'
    });
  } catch (err) {
    console.error('Error al subir imagen:', err);
    res.status(500).json({ success: false, message: 'Error al subir imagen' });
  }
});

// Endpoints para verificación
app.get('/api/auth/check-username', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ 
        available: false, 
        error: 'Nombre de usuario requerido' 
      });
    }

    const user = await User.findOne({ username });
    res.json({ 
      available: !user,
      error: user ? 'Nombre de usuario en uso' : null
    });
  } catch (err) {
    console.error('Error verificando username:', err);
    res.status(500).json({ 
      available: false, 
      error: 'Error del servidor' 
    });
  }
});

app.get('/api/auth/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ 
        available: false, 
        error: 'Email requerido' 
      });
    }

    const user = await User.findOne({ email });
    res.json({ 
      available: !user,
      error: user ? 'Email ya registrado' : null
    });
  } catch (err) {
    console.error('Error verificando email:', err);
    res.status(500).json({ 
      available: false, 
      error: 'Error del servidor' 
    });
  }
});

// Ruta para verificar token
app.get('/api/auth/verify', authenticate, (req, res) => {
    res.json({ success: true, message: 'Token válido' });
});

// Iniciar servidor (solo una instancia)
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('📁 Frontend servido desde: .html/');
});

