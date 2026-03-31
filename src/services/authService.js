import api from '../api/axios';
const authService = {
  login:  (email, password)       => api.post(`/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`),
  register:(email, password, nomComplet, serviceId) => api.post(`/auth/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&nomComplet=${encodeURIComponent(nomComplet)}&serviceId=${serviceId}`),
  logout:()=> api.post('/auth/logout'),
  me: ()=> api.get('/auth/me'),
  changePassword: (ancien, nouveau) => api.put(`/auth/change-password?ancienMotDePasse=${ancien}&nouveauMotDePasse=${nouveau}`),
};
export default authService;