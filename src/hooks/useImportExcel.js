import { useRef, useState } from 'react';
import api from '../api/axios';

export default function useImportExcel(endpoint, onSuccess, flash) {
  const inputRef              = useRef(null);
  const [loadExcel, setLoadExcel] = useState(false);

  // Ouvre l'explorateur de fichiers
  const ouvrirExplorateur = () => inputRef.current?.click();

  
  const handleFichier = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    const fd = new FormData();
    fd.append('file', file);

    setLoadExcel(true);
    try {
      const res = await api.post(endpoint, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      flash('success', res.data.message);
      onSuccess();
    } catch (err) {
      flash('danger', err.response?.data?.message || "Erreur lors de l'import.");
    } finally {
      setLoadExcel(false);
    }
  };

  return {
    inputRef,
    handleFichier,
    ouvrirExplorateur,
    loadExcel,
  };
}