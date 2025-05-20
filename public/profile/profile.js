document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const elements = {
        profileName: document.getElementById('profile-name'),
        profileBio: document.getElementById('profile-bio'),
        friendsStat: document.getElementById('friends-stat'),
        profileContent: document.getElementById('profile-content'),
        navItems: document.querySelectorAll('.nav-item'),
        editProfileBtn: document.getElementById('edit-profile-btn'),
        editModal: document.getElementById('edit-modal'),
        closeBtn: document.querySelector('.close-btn'),
        profileForm: document.getElementById('profile-form'),
        editName: document.getElementById('edit-name'),
        editBio: document.getElementById('edit-bio'),
        editFriends: document.getElementById('edit-friends'),
        coverPhoto: document.getElementById('cover-photo'),
        editProfileImg: document.getElementById('edit-profile-img'),
        editCoverImg: document.getElementById('edit-cover-img'),
        profileImg: document.getElementById('profile-img'),
        editProfileImgUrl: document.getElementById('edit-profile-img-url'),
        editCoverImgUrl: document.getElementById('edit-cover-img-url'),
        previewProfileImg: document.getElementById('preview-profile-img'),
        previewCoverImg: document.getElementById('preview-cover-img'),
        postText: document.getElementById('post-text'),
        publishButton: document.getElementById('publish-button'),
        postsContainer: document.getElementById('posts-container'),
        postImageInput: document.getElementById('post-image'),
        imagePreview: document.getElementById('image-preview'),
        deleteImageBtn: document.getElementById('delete-image-btn'),
        imagePreviewContainer: document.getElementById('image-preview-container'),
        postsContainer: document.getElementById('posts-container'),
        friendsContainer: document.getElementById('friends-container'),
        friendProfile: document.getElementById('friend-profile'),
        navItems: document.querySelectorAll('.nav-item'),
    };

    // Datos iniciales del perfil
    const defaultProfile = {
        username: 'Juan Pérez',
        bio: 'Desarrollador web | Amante de la tecnología | Viajero',
        friendsCount: 1234,
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        coverImage: 'https://picsum.photos/800/300',
        posts: [
            {
                id: 1,
                content: '¡Hoy es un gran día para codear! #DesarrolloWeb #Programación',
                timestamp: new Date('2023-05-15T10:30:00').getTime(),
                likes: 24,
                isLiked: false,
                comments: [
                    {
                        id: 1,
                        userName: 'María García',
                        userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
                        text: '¡Totalmente de acuerdo!',
                        timestamp: new Date('2023-05-15T11:15:00').getTime()
                    }
                ],
                image: ''
            },
            {
                id: 2,
                content: 'Acabo de terminar mi último proyecto. ¡Miren lo que he creado!',
                timestamp: new Date('2023-05-10T15:45:00').getTime(),
                likes: 56,
                isLiked: true,
                comments: [],
                image: ''
            }
        ]
    };

    // Cargar datos del perfil
    let currentProfile;
    try {
        const savedData = localStorage.getItem('profileData');
        currentProfile = savedData ? JSON.parse(savedData) : {...defaultProfile};
        
        // Validar estructura de datos
        if (!Array.isArray(currentProfile.posts)) {
            currentProfile.posts = [...defaultProfile.posts];
        }
        
        // Inicializar propiedades si no existen
        currentProfile.posts.forEach(post => {
            post.comments = Array.isArray(post.comments) ? post.comments : [];
            post.isLiked = typeof post.isLiked === 'boolean' ? post.isLiked : false;
        });
    } catch (e) {
        console.error("Error al cargar perfil:", e);
        currentProfile = {...defaultProfile};
    }

    let selectedImage = null;

    // Función para guardar datos
    function saveProfileData() {
        localStorage.setItem('profileData', JSON.stringify(currentProfile));
    }

    // Mostrar datos del perfil
    function displayProfileData() {
        elements.profileName.textContent = currentProfile.username;
        elements.profileBio.textContent = currentProfile.bio;
        elements.friendsStat.querySelector('.stat-number').textContent = currentProfile.friendsCount.toLocaleString();
        elements.profileImg.src = currentProfile.profileImage;
        elements.previewProfileImg.src = currentProfile.profileImage;
        elements.coverPhoto.style.backgroundImage = `url(${currentProfile.coverImage})`;
        elements.previewCoverImg.style.backgroundImage = `url(${currentProfile.coverImage})`;
        displayPosts();
    }

    // Mostrar publicaciones
    function displayPosts() {
        if (!elements.postsContainer) return;
        
        elements.postsContainer.innerHTML = '';
        
        const sortedPosts = [...currentProfile.posts].sort((a, b) => b.timestamp - a.timestamp);
        
        sortedPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-container';
            postElement.dataset.postId = post.id;
            
            let postImageHTML = '';
            if (post.image) {
                postImageHTML = `
                    <div class="post-image-container">
                        <img src="${post.image}" alt="Imagen de publicación" class="post-image">
                    </div>
                `;
            }
            
            // Generar HTML de comentarios
            let commentsHTML = '';
            if (post.comments.length > 0) {
                commentsHTML = `
                    <div class="comments-container">
                        ${post.comments.map(comment => `
                            <div class="comment" data-comment-id="${comment.id}">
                                <img src="${comment.userImage || currentProfile.profileImage}" class="comment-user-img">
                                <div class="comment-content">
                                    <span class="comment-user">${comment.userName}</span>
                                    <span class="post-time">${formatDate(comment.timestamp)}</span>
                                    <p class="comment-text">${comment.text}</p>
                                    ${comment.userName === currentProfile.username ? 
                                        '<button class="delete-comment-btn">Eliminar</button>' : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="${currentProfile.profileImage}" alt="Usuario" class="post-user-img">
                    <div>
                        <span class="post-user-name">${currentProfile.username}</span>
                        <span class="post-time">${formatDate(post.timestamp)}</span>
                        <button class="delete-post-btn">Eliminar</button>
                    </div>
                </div>
                <div class="post-content">
                    ${post.content.replace(/\n/g, '<br>')}
                </div>
                ${postImageHTML}
                <div class="post-actions">
                    <div class="post-action like-btn" data-post-id="${post.id}">
                        <span class="like-icon">${post.isLiked ? '❤️' : '🤍'}</span>
                        <span class="like-count">${post.likes}</span>
                    </div>
                    <div class="post-action">
                        <span>💬 Comentar (${post.comments.length})</span>
                    </div>
                    <div class="post-action">
                        <span>↗ Compartir</span>
                    </div>
                </div>
                ${commentsHTML}
                <div class="comment-form">
                    <img src="${currentProfile.profileImage}" class="comment-user-img">
                    <input type="text" class="comment-input" placeholder="Escribe un comentario...">
                    <button class="comment-submit">Publicar</button>
                </div>
            `;
            
            elements.postsContainer.appendChild(postElement);
        });
        
        setupPostInteractions();
    }

    // Configurar interacciones de publicaciones
    function setupPostInteractions() {
        // Likes
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = parseInt(this.dataset.postId);
                toggleLike(postId);
            });
        });

        // Comentar
        document.querySelectorAll('.comment-submit').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = parseInt(this.closest('.post-container').dataset.postId);
                const commentInput = this.previousElementSibling;
                addComment(postId, commentInput.value);
                commentInput.value = '';
            });
        });

        // Comentar con Enter
        document.querySelectorAll('.comment-input').forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const postId = parseInt(this.closest('.post-container').dataset.postId);
                    addComment(postId, this.value);
                    this.value = '';
                }
            });
        });

        // Eliminar publicación
        document.querySelectorAll('.delete-post-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = parseInt(this.closest('.post-container').dataset.postId);
                if (confirm('¿Estás seguro de eliminar esta publicación?')) {
                    deletePost(postId);
                }
            });
        });

        // Eliminar comentario
        document.querySelectorAll('.delete-comment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const commentId = parseInt(this.closest('.comment').dataset.commentId);
                const postId = parseInt(this.closest('.post-container').dataset.postId);
                if (confirm('¿Estás seguro de eliminar este comentario?')) {
                    deleteComment(postId, commentId);
                }
            });
        });
    }

    // Alternar like
    function toggleLike(postId) {
        const post = currentProfile.posts.find(p => p.id === postId);
        if (!post) return;

        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
        saveProfileData();
        displayPosts();
    }

    // Añadir comentario
    function addComment(postId, text) {
        if (!text.trim()) return;

        const post = currentProfile.posts.find(p => p.id === postId);
        if (!post) return;

        const newComment = {
            id: Date.now(),
            userName: currentProfile.username,
            userImage: currentProfile.profileImage,
            text: text,
            timestamp: Date.now()
        };

        post.comments.push(newComment);
        saveProfileData();
        displayPosts();
    }

    // Eliminar publicación
    function deletePost(postId) {
        currentProfile.posts = currentProfile.posts.filter(post => post.id !== postId);
        saveProfileData();
        displayPosts();
    }

    // Eliminar comentario
    function deleteComment(postId, commentId) {
        const post = currentProfile.posts.find(p => p.id === postId);
        if (post) {
            post.comments = post.comments.filter(c => c.id !== commentId);
            saveProfileData();
            displayPosts();
        }
    }

    // Formatear fecha
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Ahora mismo';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
        
        if (date.toDateString() === now.toDateString()) {
            return `Hoy a las ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Ayer a las ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    // Manejar subida de imagen
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                selectedImage = event.target.result;
                elements.imagePreview.src = selectedImage;
                elements.imagePreview.style.display = 'block';
                elements.imagePreviewContainer.querySelector('.no-image-message').style.display = 'none';
                elements.deleteImageBtn.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    // Limpiar imagen seleccionada
    function clearImageSelection() {
        selectedImage = null;
        elements.imagePreview.src = '';
        elements.imagePreview.style.display = 'none';
        elements.postImageInput.value = '';
        elements.imagePreviewContainer.querySelector('.no-image-message').style.display = 'block';
        elements.deleteImageBtn.style.display = 'none';
    }

    // Crear nueva publicación
    function createPost() {
        const content = elements.postText.value.trim();
        if (!content && !selectedImage) {
            alert("Por favor escribe algo o selecciona una imagen para publicar.");
            return;
        }
        
        const newPost = {
            id: Date.now(),
            content: content,
            timestamp: Date.now(),
            likes: 0,
            isLiked: false,
            comments: [],
            image: selectedImage || ''
        };
        
        currentProfile.posts.push(newPost);
        saveProfileData();
        
        elements.postText.value = '';
        clearImageSelection();
        displayPosts();
    }

    // Manejo del modal de edición
    function openEditModal() {
        elements.editName.value = currentProfile.username;
        elements.editBio.value = currentProfile.bio;
        elements.editFriends.value = currentProfile.friendsCount;
        elements.editProfileImgUrl.value = '';
        elements.editCoverImgUrl.value = '';
        elements.editModal.style.display = 'flex';
    }

    function closeEditModal() {
        elements.editModal.style.display = 'none';
    }

    function saveProfileChanges() {
        // Procesar imagen de perfil
        let newProfileImage = currentProfile.profileImage;
        if (elements.editProfileImg.files[0]) {
            newProfileImage = URL.createObjectURL(elements.editProfileImg.files[0]);
        } else if (elements.editProfileImgUrl.value) {
            newProfileImage = elements.editProfileImgUrl.value;
        }
        
        // Procesar imagen de portada
        let newCoverImage = currentProfile.coverImage;
        if (elements.editCoverImg.files[0]) {
            newCoverImage = URL.createObjectURL(elements.editCoverImg.files[0]);
        } else if (elements.editCoverImgUrl.value) {
            newCoverImage = elements.editCoverImgUrl.value;
        }
        
        // Actualizar perfil
        currentProfile = {
            ...currentProfile,
            username: elements.editName.value,
            bio: elements.editBio.value,
            friendsCount: parseInt(elements.editFriends.value) || 0,
            profileImage: newProfileImage,
            coverImage: newCoverImage
        };

        saveProfileData();
        displayProfileData();
        closeEditModal();
    }

    // Configurar event listeners
   // En tu función de configuración de event listeners
function setupEventListeners() {
    // ... otros event listeners ...
    
    // Manejar cambio de pestañas
    elements.navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Remover clase active de todos los items
            elements.navItems.forEach(i => i.classList.remove('active'));
            
            // Agregar clase active al item clickeado
            this.classList.add('active');
            
            // Ocultar todas las secciones de contenido
            elements.postsContainer.style.display = 'none';
            elements.friendsContainer.style.display = 'none';
            elements.friendProfile.style.display = 'none';
            
            // Mostrar la sección correspondiente
            if (tab === 'posts') {
                elements.postsContainer.style.display = 'block';
            } else if (tab === 'friends') {
                elements.friendsContainer.style.display = 'block';
                displayFriends(); // Cargar lista de amigos
                displayFriendRequests(); // Cargar solicitudes
            }
        });
    });
    }

    // Configurar event listeners
function setupEventListeners() {
    // Botón de editar perfil
    if (elements.editProfileBtn) {
        elements.editProfileBtn.addEventListener('click', openEditModal);
    }

    // Botón de cerrar modal
    if (elements.closeBtn) {
        elements.closeBtn.addEventListener('click', closeEditModal);
    }

    // Formulario de perfil
    if (elements.profileForm) {
        elements.profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfileChanges();
        });
    }

    // Previsualización de imágenes de perfil
    if (elements.editProfileImgUrl) {
        elements.editProfileImgUrl.addEventListener('input', function() {
            elements.previewProfileImg.src = this.value || currentProfile.profileImage;
        });
    }

    // Previsualización de imágenes de portada
    if (elements.editCoverImgUrl) {
        elements.editCoverImgUrl.addEventListener('input', function() {
            elements.previewCoverImg.style.backgroundImage = `url(${this.value || currentProfile.coverImage})`;
        });
    }

    // Publicar nueva publicación
    if (elements.publishButton) {
        elements.publishButton.addEventListener('click', createPost);
    }

    // Subir imagen para publicación
    if (elements.postImageInput) {
        elements.postImageInput.addEventListener('change', handleImageUpload);
    }

    // Eliminar imagen seleccionada
    if (elements.deleteImageBtn) {
        elements.deleteImageBtn.addEventListener('click', clearImageSelection);
    }

    // Manejar cambio de pestañas
    elements.navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Remover clase active de todos los items
            elements.navItems.forEach(i => i.classList.remove('active'));
            
            // Agregar clase active al item clickeado
            this.classList.add('active');
            
            // Ocultar todas las secciones de contenido
            elements.postsContainer.style.display = 'none';
            elements.friendsContainer.style.display = 'none';
            elements.friendProfile.style.display = 'none';
            
            // Mostrar la sección correspondiente
            if (tab === 'posts') {
                elements.postsContainer.style.display = 'block';
            } else if (tab === 'friends') {
                elements.friendsContainer.style.display = 'block';
                // displayFriends(); // Si tienes esta función
                // displayFriendRequests(); // Si tienes esta función
            }
        });
    });
}

// Inicialización
function init() {
    setupEventListeners();
    displayProfileData();
    
    // Configuración inicial
    if (elements.imagePreview) {
        elements.imagePreview.style.display = 'none';
    }
    if (elements.deleteImageBtn) {
        elements.deleteImageBtn.style.display = 'none';
    }
    
    // Mostrar solo publicaciones al inicio
    if (elements.postsContainer) elements.postsContainer.style.display = 'block';
    if (elements.friendsContainer) elements.friendsContainer.style.display = 'none';
    if (elements.friendProfile) elements.friendProfile.style.display = 'none';
}

// Solo un listener DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);

    function initTabs() {
    // Mostrar solo publicaciones al inicio
    elements.postsContainer.style.display = 'block';
    elements.friendsContainer.style.display = 'none';
    elements.friendProfile.style.display = 'none';
    }

    // Llamar al inicializar
    document.addEventListener('DOMContentLoaded', function() {
        initTabs();
        // ... resto de tu inicialización
    });

    // Inicialización
    setupEventListeners();
    displayProfileData();
    
    // Configuración inicial
    elements.imagePreview.style.display = 'none';
    elements.deleteImageBtn.style.display = 'none';

    
    // Función para hacer requests autenticados
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('authToken');
<<<<<<< HEAD:profile/profile.js
=======

>>>>>>> 4b82a7d (Migración de archivos a carpeta public y limpieza del proyecto):public/profile/profile.js
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    
    if (response.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Ejemplo: Obtener datos del perfil
async function loadProfile() {
  try {
    const data = await fetchWithAuth('http://localhost:3001/api/profile');
    
    if (data.success) {
      // Actualizar la UI con los datos del perfil
      document.getElementById('profile-name').textContent = data.user.username;
      document.getElementById('profile-bio').textContent = data.user.profile?.bio || '';
      // ... otros campos del perfil
    } else {
      console.error('Error al cargar perfil:', data.message);
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error);
  }
}

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('profile.html')) {
    loadProfile();
  }
});


});

