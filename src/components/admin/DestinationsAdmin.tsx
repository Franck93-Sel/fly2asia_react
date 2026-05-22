import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Pencil, Trash2, Plus, Image as ImageIcon, Loader2, X, GripVertical } from 'lucide-react';

interface ProgramDay {
  day: number;
  title: string;
  description: string;
}

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  short_description: string;
  price: number;
  duration_days: number;
  image_url: string;
  gallery_urls: string[];
  highlights: string[];
  program: ProgramDay[];
  is_featured: boolean;
}

const emptyForm = {
  name: '',
  country: '',
  description: '',
  short_description: '',
  price: 0,
  duration_days: 0,
  is_featured: false,
  image_url: '',
  gallery_urls: [] as string[],
  highlights: [] as string[],
  program: [] as ProgramDay[],
};

export function DestinationsAdmin() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  // ── Highlights helpers ──────────────────────────────────────────
  const [newHighlight, setNewHighlight] = useState('');

  const addHighlight = () => {
    const trimmed = newHighlight.trim();
    if (!trimmed) return;
    setFormData(f => ({ ...f, highlights: [...f.highlights, trimmed] }));
    setNewHighlight('');
  };

  const removeHighlight = (index: number) => {
    setFormData(f => ({ ...f, highlights: f.highlights.filter((_, i) => i !== index) }));
  };

  // ── Program helpers ─────────────────────────────────────────────
  const addProgramDay = () => {
    const nextDay = formData.program.length + 1;
    setFormData(f => ({
      ...f,
      program: [...f.program, { day: nextDay, title: '', description: '' }],
    }));
  };

  const updateProgramDay = (index: number, field: keyof ProgramDay, value: string | number) => {
    setFormData(f => ({
      ...f,
      program: f.program.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    }));
  };

  const removeProgramDay = (index: number) => {
    setFormData(f => ({
      ...f,
      program: f.program
        .filter((_, i) => i !== index)
        .map((d, i) => ({ ...d, day: i + 1 })),
    }));
  };

  // ── Data fetching ───────────────────────────────────────────────
  useEffect(() => { fetchDestinations(); }, []);

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      alert('Erreur lors du chargement des destinations');
    } finally {
      setLoading(false);
    }
  };

  // ── CRUD ────────────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la destination "${name}" ?`)) return;
    try {
      const { error } = await supabase.from('destinations').delete().eq('id', id);
      if (error) throw error;
      fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleEdit = (destination: Destination) => {
    setFormData({
      name: destination.name,
      country: destination.country,
      description: destination.description,
      short_description: destination.short_description,
      price: destination.price,
      duration_days: destination.duration_days,
      is_featured: destination.is_featured,
      image_url: destination.image_url,
      gallery_urls: destination.gallery_urls || [],
      highlights: destination.highlights || [],
      program: destination.program || [],
    });
    setEditingId(destination.id);
    setImageFile(null);
    setGalleryFiles([]);
    setNewHighlight('');
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setGalleryFiles([]);
    setNewHighlight('');
    setIsFormOpen(true);
  };

  // ── Image upload ────────────────────────────────────────────────
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('destination_images')
      .upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage
      .from('destination_images')
      .getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upload main image if changed
      let finalImageUrl = formData.image_url;
      if (imageFile) finalImageUrl = await uploadImage(imageFile);
      if (!finalImageUrl) throw new Error('Une image principale est requise.');

      // Upload gallery images
      let finalGalleryUrls = [...formData.gallery_urls];
      if (galleryFiles.length > 0) {
        const uploaded = await Promise.all(galleryFiles.map(uploadImage));
        finalGalleryUrls = [...finalGalleryUrls, ...uploaded];
      }

      const payload = {
        ...formData,
        image_url: finalImageUrl,
        gallery_urls: finalGalleryUrls,
      };

      if (editingId) {
        const { error } = await supabase.from('destinations').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('destinations').insert([payload]);
        if (error) throw error;
      }

      setIsFormOpen(false);
      fetchDestinations();
    } catch (error: any) {
      console.error('Error saving destination:', error);
      alert(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const removeGalleryUrl = (index: number) => {
    setFormData(f => ({ ...f, gallery_urls: f.gallery_urls.filter((_, i) => i !== index) }));
  };

  // ── Render ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-teal-500 pb-2 inline-block">Destinations</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {/* ── FORM ── */}
      {isFormOpen && (
        <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {editingId ? 'Modifier la destination' : 'Nouvelle destination'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Section 1 : Infos de base ── */}
            <section>
              <h4 className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-3">Informations générales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input required type="text" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <input required type="text" value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                  <input required type="number" min="0" value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée (jours)</label>
                  <input required type="number" min="1" value={formData.duration_days}
                    onChange={e => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description courte (carte liste)</label>
                <input required type="text" value={formData.short_description}
                  onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description complète</label>
                <textarea required rows={4} value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              </div>
              <div className="flex items-center mt-4">
                <input type="checkbox" id="featured" checked={formData.is_featured}
                  onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">Afficher en vedette sur la page d'accueil</label>
              </div>
            </section>

            {/* ── Section 2 : Image principale ── */}
            <section>
              <h4 className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-3">Image principale</h4>
              <input
                type="file" accept="image/*"
                onChange={e => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              {formData.image_url && !imageFile && (
                <div className="mt-2 relative inline-block">
                  <img src={formData.image_url} alt="Actuelle" className="h-20 w-32 object-cover rounded-md" />
                  <span className="absolute -top-2 -right-2 bg-gray-100 text-xs px-2 rounded-full border">Actuelle</span>
                </div>
              )}
              {imageFile && (
                <p className="mt-1 text-sm text-teal-600">✓ Nouveau fichier sélectionné : {imageFile.name}</p>
              )}
            </section>

            {/* ── Section 3 : Galerie photos ── */}
            <section>
              <h4 className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-3">Galerie photos</h4>

              {/* Existing saved gallery URLs */}
              {formData.gallery_urls.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.gallery_urls.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`Galerie ${i + 1}`} className="h-20 w-28 object-cover rounded-md border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeGalleryUrl(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        title="Supprimer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload new gallery images */}
              <input
                type="file" accept="image/*" multiple
                onChange={e => {
                  if (e.target.files) setGalleryFiles(Array.from(e.target.files));
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              {galleryFiles.length > 0 && (
                <p className="mt-1 text-sm text-teal-600">✓ {galleryFiles.length} nouveau(x) fichier(s) sélectionné(s)</p>
              )}
            </section>

            {/* ── Section 4 : Points forts (highlights) ── */}
            <section>
              <h4 className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-3">Points forts</h4>

              <div className="space-y-2 mb-3">
                {formData.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                    <span className="flex-1 text-sm text-gray-700">{h}</span>
                    <button type="button" onClick={() => removeHighlight(i)} className="text-red-400 hover:text-red-600 transition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {formData.highlights.length === 0 && (
                  <p className="text-sm text-gray-400 italic">Aucun point fort ajouté.</p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={e => setNewHighlight(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(); } }}
                  placeholder="Ex : Visite du temple d'Uluwatu"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={addHighlight}
                  className="flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-3 py-2 rounded-lg text-sm hover:bg-teal-100 transition"
                >
                  <Plus className="h-4 w-4" /> Ajouter
                </button>
              </div>
            </section>

            {/* ── Section 5 : Programme du séjour ── */}
            <section>
              <h4 className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-3">Programme du séjour</h4>

              <div className="space-y-3 mb-3">
                {formData.program.map((day, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-teal-600 uppercase bg-teal-50 px-2 py-1 rounded">Jour {day.day}</span>
                      <button type="button" onClick={() => removeProgramDay(i)} className="text-red-400 hover:text-red-600 transition">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Titre du jour</label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={e => updateProgramDay(i, 'title', e.target.value)}
                          placeholder="Ex : Arrivée à Bali"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={day.description}
                          onChange={e => updateProgramDay(i, 'description', e.target.value)}
                          placeholder="Décrivez les activités du jour..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {formData.program.length === 0 && (
                  <p className="text-sm text-gray-400 italic">Aucun jour de programme ajouté.</p>
                )}
              </div>

              <button
                type="button"
                onClick={addProgramDay}
                className="flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 px-4 py-2 rounded-lg text-sm hover:bg-teal-100 transition"
              >
                <Plus className="h-4 w-4" /> Ajouter un jour
              </button>
            </section>

            {/* ── Actions ── */}
            <div className="flex gap-4 pt-2 border-t border-gray-200">
              <button
                disabled={saving} type="submit"
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                disabled={saving} type="button" onClick={() => setIsFormOpen(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Annuler
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom & Pays</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Galerie</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {destinations.map(dest => (
              <tr key={dest.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {dest.image_url ? (
                    <img src={dest.image_url} alt={dest.name} className="h-10 w-16 object-cover rounded-md" />
                  ) : (
                    <div className="h-10 w-16 bg-gray-200 flex items-center justify-center rounded-md">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{dest.name}</div>
                  <div className="text-sm text-gray-500">{dest.country}</div>
                  {dest.is_featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">Vedette</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dest.price} €</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dest.duration_days} jours</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dest.gallery_urls?.length > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                      {dest.gallery_urls.length} photo{dest.gallery_urls.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => handleEdit(dest)} className="text-blue-600 hover:text-blue-900" title="Modifier">
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(dest.id, dest.name)} className="text-red-600 hover:text-red-900" title="Supprimer">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {destinations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aucune destination trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
