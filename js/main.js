document.addEventListener('DOMContentLoaded', function() {
   // Elementos del DOM
   const profileUsername = document.getElementById('profileUsername');
   const profileEmail = document.getElementById('profileEmail');
   const logoutBtn = document.getElementById('logoutBtn');

   // Si no hay usuario autenticado, redirigir al login
   if (!checkAuth()) {
       window.location.href = 'login.html';
       return;
   }

   // Mostrar información del usuario
   const user = getCurrentUser();
   profileUsername.textContent = user.username;
   profileEmail.textContent = user.email;
   
   // Manejar cierre de sesión
   logoutBtn.addEventListener('click', function() {
       logoutUser();
   });
});